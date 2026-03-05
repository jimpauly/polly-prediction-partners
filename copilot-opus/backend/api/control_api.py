"""FastAPI control API for the Paulie's Prediction Partners frontend.

Bound to ``127.0.0.1`` only — local-access exclusively.  Provides
read-only state endpoints, agent / trading controls, semi-auto approval
workflow, reconciliation triggers, connection management, and a WebSocket
for real-time event streaming.

Security invariants:
  * Private key material is **never** returned or logged.
  * API key IDs are masked (last 4 characters shown).
  * Credentials received via ``/api/connection/connect`` are held in-memory
    only and never persisted to disk or logs.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Literal, Protocol

import structlog
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

log = structlog.get_logger(__name__)


# ---------------------------------------------------------------------------
# Protocols for injected services (loose coupling)
# ---------------------------------------------------------------------------


class ReconciliationServiceProtocol(Protocol):
    """Minimal contract for the reconciliation service."""

    async def trigger(self) -> dict[str, Any]: ...

    def status(self) -> dict[str, Any]: ...


# ---------------------------------------------------------------------------
# Pydantic request / response models
# ---------------------------------------------------------------------------


class AgentModeRequest(BaseModel):
    mode: Literal["auto", "semi-auto", "safe"]


class ConnectionRequest(BaseModel):
    environment: Literal["live", "demo"]
    api_key_id: str = Field(..., min_length=1)
    private_key_pem: str = Field(..., min_length=1)


class _EventEnvelope(BaseModel):
    type: str
    data: dict[str, Any]
    timestamp: str


class AgentModeResponse(BaseModel):
    agent_name: str
    mode: str


class TradingStatusResponse(BaseModel):
    trading_enabled: bool
    circuit_breaker_open: bool
    daily_pnl: str


class ConnectionStatusResponse(BaseModel):
    connected: bool
    environment: str
    api_key_id_masked: str


class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str


class ManualOrderRequest(BaseModel):
    ticker: str = Field(..., min_length=1)
    side: Literal["yes", "no"]
    action: Literal["buy", "sell"] = "buy"
    count_fp: str = "1.00"
    price_dollars: str = Field(..., min_length=1)


# ---------------------------------------------------------------------------
# WebSocket broadcast hub
# ---------------------------------------------------------------------------


class _EventBroadcaster:
    """Manages connected WebSocket clients and broadcasts JSON events."""

    def __init__(self) -> None:
        self._clients: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._clients.add(ws)
        log.info("ws_client_connected", total=len(self._clients))

    async def disconnect(self, ws: WebSocket) -> None:
        async with self._lock:
            self._clients.discard(ws)
        log.info("ws_client_disconnected", total=len(self._clients))

    async def broadcast(self, event_type: str, data: dict[str, Any]) -> None:
        envelope = _EventEnvelope(
            type=event_type,
            data=data,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        payload = envelope.model_dump_json()
        async with self._lock:
            stale: list[WebSocket] = []
            for ws in self._clients:
                try:
                    await ws.send_text(payload)
                except Exception:
                    stale.append(ws)
            for ws in stale:
                self._clients.discard(ws)

    @property
    def client_count(self) -> int:
        return len(self._clients)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _mask_api_key(api_key_id: str) -> str:
    """Return a masked version of *api_key_id* showing only the last 4 chars."""
    if len(api_key_id) <= 4:
        return "****"
    return "*" * (len(api_key_id) - 4) + api_key_id[-4:]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _json_safe(obj: Any) -> Any:
    """Best-effort conversion of Pydantic models / dicts to JSON-safe dicts."""
    if hasattr(obj, "model_dump"):
        return obj.model_dump(mode="json")
    return obj


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------


def create_api(
    state_cache: Any,
    execution_service: Any,
    risk_gateway: Any,
    reconciliation_service: ReconciliationServiceProtocol | None,
    config: Any,
) -> tuple[FastAPI, _EventBroadcaster]:
    """Build and return a ``(FastAPI, EventBroadcaster)`` pair.

    The caller is responsible for running the app via Uvicorn bound to
    ``127.0.0.1`` (enforced by *config.host*).

    Parameters
    ----------
    state_cache:
        :class:`backend.services.state_cache.StateCache` instance.
    execution_service:
        :class:`backend.services.execution_service.ExecutionService` instance.
    risk_gateway:
        :class:`backend.services.risk_gateway.RiskGateway` instance.
    reconciliation_service:
        Optional reconciliation service implementing ``trigger()`` / ``status()``.
    config:
        :class:`backend.config.Settings` instance.
    """

    app = FastAPI(
        title="Paulie's Control API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url=None,
    )

    # CORS: The backend binds to 127.0.0.1 only, preventing external access.
    # We allow broad origins so the frontend works from file://, Electron,
    # GitHub Pages, and local dev servers.  Methods are restricted to the
    # minimum needed (GET for reads, POST for writes).
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    broadcaster = _EventBroadcaster()

    # In-memory connection state (credentials never persisted)
    _conn_state: dict[str, Any] = {
        "connected": False,
        "environment": config.environment,
        "api_key_id": "",
    }

    # ==================================================================
    # State & Dashboard (read-only)
    # ==================================================================

    @app.get("/api/state/snapshot", tags=["state"])
    async def get_state_snapshot() -> dict[str, Any]:
        """Full state snapshot for the UI dashboard."""
        return state_cache.get_snapshot()

    @app.get("/api/state/markets", tags=["state"])
    async def get_markets() -> dict[str, Any]:
        """All cached markets."""
        markets = state_cache.get_markets()
        return {t: _json_safe(m) for t, m in markets.items()}

    @app.get("/api/state/market/{ticker}", tags=["state"])
    async def get_market(ticker: str) -> dict[str, Any]:
        """Single market by ticker."""
        market = state_cache.get_market(ticker)
        if market is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Market '{ticker}' not found",
            )
        return _json_safe(market)

    @app.get("/api/state/orderbook/{ticker}", tags=["state"])
    async def get_orderbook(ticker: str) -> dict[str, Any]:
        """Orderbook for a single ticker."""
        book = state_cache.get_orderbook(ticker)
        if book is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Orderbook for '{ticker}' not found",
            )
        return book

    @app.get("/api/state/balance", tags=["state"])
    async def get_balance() -> dict[str, Any]:
        """Current account balance."""
        return state_cache.get_balance()

    @app.get("/api/state/positions", tags=["state"])
    async def get_positions() -> dict[str, Any]:
        """All positions."""
        return state_cache.get_positions()

    @app.get("/api/state/orders", tags=["state"])
    async def get_orders() -> dict[str, Any]:
        """All orders."""
        orders = state_cache.get_orders()
        return {oid: _json_safe(o) for oid, o in orders.items()}

    @app.get("/api/state/fills", tags=["state"])
    async def get_fills() -> list[dict[str, Any]]:
        """Recent fills."""
        return [_json_safe(f) for f in state_cache.get_fills()]

    @app.get("/api/state/agents", tags=["state"])
    async def get_all_agents() -> dict[str, Any]:
        """All agent states."""
        agents = state_cache.get_all_agent_states()
        return {name: _json_safe(a) for name, a in agents.items()}

    @app.get("/api/state/agent/{name}", tags=["state"])
    async def get_agent(name: str) -> dict[str, Any]:
        """Single agent state by name."""
        agent = state_cache.get_agent_state(name)
        if agent is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent '{name}' not found",
            )
        return _json_safe(agent)

    @app.get("/api/state/risk-events", tags=["state"])
    async def get_risk_events() -> list[dict[str, Any]]:
        """Recent risk events."""
        return [_json_safe(e) for e in state_cache.get_risk_events()]

    @app.get("/api/state/exchange-status", tags=["state"])
    async def get_exchange_status() -> dict[str, Any]:
        """Exchange connectivity / health status."""
        return state_cache.get_exchange_status()

    # ==================================================================
    # Agent Controls
    # ==================================================================

    @app.post(
        "/api/agents/{name}/mode",
        tags=["agents"],
        response_model=AgentModeResponse,
    )
    async def set_agent_mode(name: str, body: AgentModeRequest) -> AgentModeResponse:
        """Set an agent's operating mode (auto / semi-auto / safe)."""
        agent = state_cache.get_agent_state(name)
        if agent is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent '{name}' not found",
            )
        updated = agent.model_copy(update={"mode": body.mode})
        await state_cache.update_agent_state(name, updated)
        log.info("agent_mode_changed", agent=name, mode=body.mode)
        await broadcaster.broadcast(
            "agent_mode_changed",
            {"agent_name": name, "mode": body.mode},
        )
        return AgentModeResponse(agent_name=name, mode=body.mode)

    @app.post("/api/agents/{name}/start", tags=["agents"])
    async def start_agent(name: str) -> dict[str, Any]:
        """Start an agent (set status to ``running``)."""
        agent = state_cache.get_agent_state(name)
        if agent is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent '{name}' not found",
            )
        updated = agent.model_copy(update={"status": "running"})
        await state_cache.update_agent_state(name, updated)
        log.info("agent_started", agent=name)
        await broadcaster.broadcast(
            "agent_started", {"agent_name": name, "status": "running"},
        )
        return {"agent_name": name, "status": "running"}

    @app.post("/api/agents/{name}/stop", tags=["agents"])
    async def stop_agent(name: str) -> dict[str, Any]:
        """Stop an agent (set status to ``idle``, mode to ``safe``)."""
        agent = state_cache.get_agent_state(name)
        if agent is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent '{name}' not found",
            )
        updated = agent.model_copy(update={"status": "idle", "mode": "safe"})
        await state_cache.update_agent_state(name, updated)
        log.info("agent_stopped", agent=name)
        await broadcaster.broadcast(
            "agent_stopped", {"agent_name": name, "status": "idle", "mode": "safe"},
        )
        return {"agent_name": name, "status": "idle", "mode": "safe"}

    # ==================================================================
    # Trading Controls
    # ==================================================================

    @app.post("/api/trading/enable", tags=["trading"])
    async def enable_trading() -> TradingStatusResponse:
        """Enable global trading."""
        risk_gateway.enable_trading()
        await broadcaster.broadcast("trading_enabled", {"trading_enabled": True})
        return _trading_status()

    @app.post("/api/trading/disable", tags=["trading"])
    async def disable_trading() -> TradingStatusResponse:
        """Disable global trading (kill switch)."""
        risk_gateway.disable_trading()
        await broadcaster.broadcast("trading_disabled", {"trading_enabled": False})
        return _trading_status()

    @app.get("/api/trading/status", tags=["trading"])
    async def get_trading_status() -> TradingStatusResponse:
        """Get current trading status."""
        return _trading_status()

    def _trading_status() -> TradingStatusResponse:
        return TradingStatusResponse(
            trading_enabled=risk_gateway.is_trading_enabled(),
            circuit_breaker_open=risk_gateway.is_circuit_open(),
            daily_pnl=str(risk_gateway.get_daily_pnl()),
        )

    @app.post("/api/trading/manual-order", tags=["trading"])
    async def submit_manual_order(body: ManualOrderRequest) -> dict[str, Any]:
        """Submit a manual order from the UI.

        Creates a :class:`TradeIntent` as if from a ``user`` agent and
        processes it through the standard execution pipeline (risk checks,
        order submission).
        """
        from backend.models.schemas import TradeIntent

        intent = TradeIntent(
            agent_name="user",
            ticker=body.ticker,
            side=body.side,
            action=body.action,
            count_fp=body.count_fp,
            price_dollars=body.price_dollars,
            reasoning="Manual order from UI",
        )

        try:
            result = await execution_service.process_intent(intent)
        except RuntimeError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(exc),
            )
        except Exception as exc:
            log.exception("manual_order_failed", ticker=body.ticker)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Order submission failed",
            )

        await broadcaster.broadcast("manual_order", {
            "ticker": body.ticker,
            "side": body.side,
            "result": result,
        })
        return result

    # ==================================================================
    # Semi-Auto Approvals
    # ==================================================================

    @app.get("/api/approvals/pending", tags=["approvals"])
    async def get_pending_approvals() -> list[dict[str, Any]]:
        """Pending semi-auto approval requests."""
        return execution_service.get_pending_approvals()

    @app.post("/api/approvals/{client_order_id}/approve", tags=["approvals"])
    async def approve_order(client_order_id: str) -> dict[str, Any]:
        """Approve a pending semi-auto order."""
        result = await execution_service.approve_pending(client_order_id)
        await broadcaster.broadcast("approval_resolved", {
            "client_order_id": client_order_id,
            "action": "approved",
            "result": result,
        })
        return result

    @app.post("/api/approvals/{client_order_id}/deny", tags=["approvals"])
    async def deny_order(client_order_id: str) -> dict[str, Any]:
        """Deny a pending semi-auto order."""
        result = await execution_service.deny_pending(client_order_id)
        await broadcaster.broadcast("approval_resolved", {
            "client_order_id": client_order_id,
            "action": "denied",
            "result": result,
        })
        return result

    # ==================================================================
    # Reconciliation
    # ==================================================================

    @app.post("/api/reconciliation/trigger", tags=["reconciliation"])
    async def trigger_reconciliation() -> dict[str, Any]:
        """Trigger a manual reconciliation run."""
        if reconciliation_service is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Reconciliation service not available",
            )
        result = await reconciliation_service.trigger()
        await broadcaster.broadcast("reconciliation_triggered", result)
        return result

    @app.get("/api/reconciliation/status", tags=["reconciliation"])
    async def get_reconciliation_status() -> dict[str, Any]:
        """Get reconciliation status."""
        if reconciliation_service is None:
            return {"status": "unavailable"}
        return reconciliation_service.status()

    # ==================================================================
    # Connection Management
    # ==================================================================

    @app.post("/api/connection/connect", tags=["connection"])
    async def connect(body: ConnectionRequest) -> ConnectionStatusResponse:
        """Connect to Kalshi with the provided credentials.

        Credentials are held in-memory only — never persisted to disk or logs.
        """
        _conn_state["environment"] = body.environment
        _conn_state["api_key_id"] = body.api_key_id
        _conn_state["connected"] = True

        # Pass credentials to config (in-memory only)
        config.environment = body.environment
        config.api_key_id = body.api_key_id
        # SecretStr wrapping handled by the caller/config layer; we store the
        # raw value only transiently.
        from pydantic import SecretStr as _SecretStr

        config.private_key_pem = _SecretStr(body.private_key_pem)

        # Clear stale cache when switching environments
        await state_cache.clear()
        await state_cache.set_environment(body.environment)

        log.info(
            "connection_established",
            environment=body.environment,
            api_key_id_masked=_mask_api_key(body.api_key_id),
        )
        await broadcaster.broadcast("connection_changed", {
            "connected": True,
            "environment": body.environment,
        })
        return ConnectionStatusResponse(
            connected=True,
            environment=body.environment,
            api_key_id_masked=_mask_api_key(body.api_key_id),
        )

    @app.post("/api/connection/disconnect", tags=["connection"])
    async def disconnect() -> ConnectionStatusResponse:
        """Disconnect from Kalshi and wipe in-memory credentials."""
        risk_gateway.disable_trading()

        _conn_state["connected"] = False
        _conn_state["api_key_id"] = ""

        # Wipe credentials from config
        config.api_key_id = ""
        from pydantic import SecretStr as _SecretStr

        config.private_key_pem = _SecretStr("")

        await state_cache.clear()

        log.info("connection_disconnected")
        await broadcaster.broadcast("connection_changed", {
            "connected": False,
            "environment": _conn_state["environment"],
        })
        return ConnectionStatusResponse(
            connected=False,
            environment=_conn_state["environment"],
            api_key_id_masked="",
        )

    @app.get("/api/connection/status", tags=["connection"])
    async def get_connection_status() -> ConnectionStatusResponse:
        """Get current connection status (credentials are never exposed)."""
        return ConnectionStatusResponse(
            connected=_conn_state["connected"],
            environment=_conn_state["environment"],
            api_key_id_masked=_mask_api_key(_conn_state["api_key_id"]),
        )

    # ==================================================================
    # Real-time Events WebSocket
    # ==================================================================

    @app.websocket("/api/events")
    async def events_ws(ws: WebSocket) -> None:
        """Stream real-time events to the UI over WebSocket.

        Each message is a JSON envelope::

            {"type": "<event_type>", "data": {...}, "timestamp": "ISO-8601"}

        The server sends events; the client may send ``ping`` to keep the
        connection alive.
        """
        await broadcaster.connect(ws)
        try:
            # Send initial snapshot on connect
            snapshot = state_cache.get_snapshot()
            await ws.send_json({
                "type": "snapshot",
                "data": snapshot,
                "timestamp": _now_iso(),
            })
            # Keep connection open, read client pings
            while True:
                await ws.receive_text()
        except WebSocketDisconnect:
            pass
        except Exception:
            log.debug("ws_connection_error", exc_info=True)
        finally:
            await broadcaster.disconnect(ws)

    return app, broadcaster
