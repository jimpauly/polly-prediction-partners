"""Main application entry point and orchestrator for Paulie's Prediction Partners.

Creates all services, wires them together, manages the full application
lifecycle (connect → trade → disconnect), and exposes a FastAPI server on
``127.0.0.1``.
"""

from __future__ import annotations

import asyncio
import signal
from typing import Any

import structlog
import uvicorn
from fastapi import FastAPI, Request, Response

from backend.agents.peritia import AgentPeritia
from backend.agents.praxis import AgentPraxis
from backend.agents.prime import AgentPrime
from backend.api.control_api import create_api as _create_control_api
from backend.config import Settings
from backend.services.database import Database
from backend.services.execution_service import ExecutionService
from backend.services.kalshi_rest_client import KalshiRestClient
from backend.services.kalshi_websocket_client import KalshiWebSocketClient
from backend.services.metrics import (
    ACTIVE_AGENTS,
    ACTIVE_CONNECTIONS,
    RECONCILIATION_DRIFT,
    mount_metrics,
)
from backend.services.position_sizer import PositionSizer
from backend.services.rate_limiter import RateLimiter
from backend.services.reconciliation_service import ReconciliationService
from backend.services.risk_gateway import RiskGateway
from backend.services.state_cache import StateCache

log = structlog.get_logger(__name__)

# Agent evaluation intervals (seconds)
_PRIME_INTERVAL = 10.0
_PRAXIS_INTERVAL = 30.0
_PERITIA_INTERVAL = 15.0


# ---------------------------------------------------------------------------
# Adapter so ReconciliationService satisfies the control-API protocol
# ---------------------------------------------------------------------------


class _ReconciliationAdapter:
    """Thin wrapper that maps :class:`ReconciliationService` to the
    :class:`ReconciliationServiceProtocol` expected by the control API."""

    def __init__(self, svc: ReconciliationService) -> None:
        self._svc = svc

    async def trigger(self) -> dict[str, Any]:
        await self._svc.reconcile(reason="manual")
        return self._svc.get_status()

    def status(self) -> dict[str, Any]:
        return self._svc.get_status()


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------


class Application:
    """Top-level orchestrator that owns every subsystem."""

    def __init__(self) -> None:
        self.config = Settings()
        self.state_cache = StateCache()
        self.rest_client: KalshiRestClient | None = None
        self.ws_client: KalshiWebSocketClient | None = None
        self.risk_gateway = RiskGateway(self.config, self.state_cache)
        self.execution_service: ExecutionService | None = None
        self.reconciliation_service: ReconciliationService | None = None
        self.agents: dict[str, AgentPrime | AgentPraxis | AgentPeritia] = {}
        self.api_app: FastAPI | None = None
        self._broadcaster: Any = None
        self._running = False
        self._agent_tasks: list[asyncio.Task] = []
        self._reconciliation_task: asyncio.Task | None = None

        # New Phase 3.8 services
        self.rate_limiter = RateLimiter(self.config)
        self.position_sizer = PositionSizer(self.config)
        self.database = Database()
        self._shutdown_event: asyncio.Event | None = None

    # ------------------------------------------------------------------
    # WebSocket message routing
    # ------------------------------------------------------------------

    async def _on_websocket_message(self, message: dict) -> None:
        """Route incoming WebSocket messages to appropriate handlers."""
        msg_type = message.get("type", "")

        try:
            if msg_type == "ticker":
                await self._handle_ticker(message)
            elif msg_type == "orderbook_snapshot":
                await self._handle_orderbook(message)
            elif msg_type == "orderbook_delta":
                await self._handle_orderbook(message)
            elif msg_type == "trade":
                await self._handle_trade(message)
            elif msg_type == "market_lifecycle_v2":
                await self._handle_market_lifecycle(message)
            elif msg_type == "fill":
                await self._handle_fill(message)
            elif msg_type == "user_orders":
                await self._handle_user_orders(message)
            elif msg_type == "market_positions":
                await self._handle_market_positions(message)
            elif msg_type == "_reconnected":
                await self._handle_reconnected()
            elif msg_type == "_stale_orderbook":
                await self._handle_stale_orderbook(message)
            else:
                log.debug("ws_message_unhandled", type=msg_type)
        except Exception:
            log.exception("ws_message_handler_error", type=msg_type)

    async def _handle_ticker(self, message: dict) -> None:
        """Update market data in cache and notify agents."""
        msg = message.get("msg", message)
        ticker = msg.get("ticker", message.get("market_ticker", ""))
        if not ticker:
            return

        await self.state_cache.update_market(ticker, msg)

        if self._broadcaster is not None:
            await self._broadcaster.broadcast("market_update", {"ticker": ticker, "data": msg})

        # Notify Praxis (sports momentum agent) of price/volume updates
        praxis = self.agents.get("praxis")
        if praxis is not None and isinstance(praxis, AgentPraxis):
            try:
                await praxis.on_market_update(ticker, msg)
            except Exception:
                log.exception("praxis_market_update_error", ticker=ticker)

    async def _handle_orderbook(self, message: dict) -> None:
        """Update orderbook in cache."""
        msg = message.get("msg", message)
        ticker = msg.get("ticker", message.get("market_ticker", ""))
        if not ticker:
            return
        await self.state_cache.update_orderbook(ticker, msg)

    async def _handle_trade(self, message: dict) -> None:
        """Update trades and notify AgentPrime."""
        msg = message.get("msg", message)
        ticker = msg.get("ticker", message.get("market_ticker", ""))
        if not ticker:
            return

        if self._broadcaster is not None:
            await self._broadcaster.broadcast("trade", {"ticker": ticker, "data": msg})

        prime = self.agents.get("prime")
        if prime is not None and isinstance(prime, AgentPrime):
            try:
                await prime.on_trade(ticker, msg)
            except Exception:
                log.exception("prime_trade_handler_error", ticker=ticker)

    async def _handle_market_lifecycle(self, message: dict) -> None:
        """Update market status on lifecycle events."""
        msg = message.get("msg", message)
        ticker = msg.get("ticker", message.get("market_ticker", ""))
        if not ticker:
            return
        await self.state_cache.update_market(ticker, msg)

        if self._broadcaster is not None:
            await self._broadcaster.broadcast(
                "market_lifecycle", {"ticker": ticker, "data": msg},
            )

    async def _handle_fill(self, message: dict) -> None:
        """Process fill in execution service."""
        msg = message.get("msg", message)
        if self.execution_service is not None:
            await self.execution_service.process_fill(msg)

        if self._broadcaster is not None:
            await self._broadcaster.broadcast("fill", {"data": msg})

    async def _handle_user_orders(self, message: dict) -> None:
        """Process order update in execution service."""
        msg = message.get("msg", message)
        if self.execution_service is not None:
            await self.execution_service.process_order_update(msg)

        if self._broadcaster is not None:
            await self._broadcaster.broadcast("order_update", {"data": msg})

    async def _handle_market_positions(self, message: dict) -> None:
        """Update positions in cache."""
        msg = message.get("msg", message)
        ticker = msg.get("ticker", message.get("market_ticker", ""))
        if ticker:
            await self.state_cache.update_position(ticker, msg)

    async def _handle_reconnected(self) -> None:
        """Trigger reconciliation after WebSocket reconnect."""
        log.info("ws_reconnected_triggering_reconciliation")
        if self.reconciliation_service is not None:
            try:
                await self.reconciliation_service.reconcile(reason="ws_reconnect")
            except Exception:
                log.exception("reconnect_reconciliation_failed")

    async def _handle_stale_orderbook(self, message: dict) -> None:
        """Mark orderbook stale; the WS client handles resubscription."""
        sid = message.get("sid")
        log.warning("stale_orderbook_detected", sid=sid)

    # ------------------------------------------------------------------
    # Channel subscription
    # ------------------------------------------------------------------

    async def _subscribe_channels(self) -> None:
        """Subscribe to all relevant WebSocket channels."""
        if self.ws_client is None:
            return

        subscribed = self.state_cache.get_subscribed_markets()
        tickers = list(subscribed) if subscribed else None

        # Public channels
        try:
            await self.ws_client.subscribe(
                channels=["ticker", "orderbook_delta", "trade", "market_lifecycle_v2"],
                market_tickers=tickers,
                send_initial_snapshot=True,
            )
            log.info("subscribed_public_channels", tickers_count=len(tickers or []))
        except Exception:
            log.exception("subscribe_public_channels_failed")

        # Authenticated channels
        try:
            await self.ws_client.subscribe(
                channels=["fill", "user_orders", "market_positions"],
                market_tickers=tickers,
            )
            log.info("subscribed_auth_channels")
        except Exception:
            log.exception("subscribe_auth_channels_failed")

    # ------------------------------------------------------------------
    # Agent management
    # ------------------------------------------------------------------

    def _init_agents(self) -> None:
        """Create agent instances."""
        self.agents = {
            "prime": AgentPrime(self.state_cache),
            "praxis": AgentPraxis(self.state_cache),
            "peritia": AgentPeritia(self.state_cache),
        }
        log.info("agents_initialised", agents=list(self.agents.keys()))

    async def start_agents(self) -> None:
        """Start agent evaluation loops as asyncio tasks."""
        await self.stop_agents()

        intervals = {
            "prime": _PRIME_INTERVAL,
            "praxis": _PRAXIS_INTERVAL,
            "peritia": _PERITIA_INTERVAL,
        }

        for name, agent in self.agents.items():
            interval = intervals.get(name, 30.0)
            task = asyncio.create_task(
                self._agent_evaluation_loop(agent, interval),
                name=f"agent-{name}-loop",
            )
            self._agent_tasks.append(task)

        # Start reconciliation loop
        if self.reconciliation_service is not None and self._reconciliation_task is None:
            self._reconciliation_task = asyncio.create_task(
                self._reconciliation_loop(),
                name="reconciliation-loop",
            )

        log.info("agent_loops_started", count=len(self._agent_tasks))
        ACTIVE_AGENTS.set(len(self._agent_tasks))

    async def stop_agents(self) -> None:
        """Stop all agent evaluation loops."""
        for task in self._agent_tasks:
            task.cancel()
        if self._agent_tasks:
            await asyncio.gather(*self._agent_tasks, return_exceptions=True)
        self._agent_tasks.clear()
        log.info("agent_loops_stopped")

    async def _agent_evaluation_loop(
        self,
        agent: AgentPrime | AgentPraxis | AgentPeritia,
        interval_seconds: float,
    ) -> None:
        """Periodic evaluation loop for a single agent."""
        agent_name = agent.agent_name
        log.info("agent_loop_started", agent=agent_name, interval=interval_seconds)

        try:
            while True:
                await asyncio.sleep(interval_seconds)

                if not self._running:
                    break

                # Check agent status — only evaluate if running
                agent_state = self.state_cache.get_agent_state(agent_name)
                if agent_state is None or agent_state.status != "running":
                    continue

                try:
                    intents = await agent.evaluate_all_markets()

                    for intent in intents:
                        if self.execution_service is not None:
                            try:
                                result = await self.execution_service.process_intent(intent)
                                log.info(
                                    "agent_intent_processed",
                                    agent=agent_name,
                                    ticker=intent.ticker,
                                    status=result.get("status"),
                                )
                                if self._broadcaster is not None:
                                    await self._broadcaster.broadcast(
                                        "agent_intent",
                                        {
                                            "agent_name": agent_name,
                                            "ticker": intent.ticker,
                                            "side": intent.side,
                                            "result": result,
                                        },
                                    )
                            except Exception:
                                log.exception(
                                    "agent_intent_submit_error",
                                    agent=agent_name,
                                    ticker=intent.ticker,
                                )

                except Exception:
                    log.exception("agent_evaluation_error", agent=agent_name)

        except asyncio.CancelledError:
            log.info("agent_loop_cancelled", agent=agent_name)

    async def _reconciliation_loop(self) -> None:
        """Periodic reconciliation loop."""
        interval = self.config.reconciliation_interval_seconds
        log.info("reconciliation_loop_started", interval=interval)

        try:
            while True:
                await asyncio.sleep(interval)

                if not self._running:
                    break

                if self.reconciliation_service is None:
                    continue

                try:
                    await self.reconciliation_service.reconcile(reason="scheduled")
                    log.info("scheduled_reconciliation_complete")

                    if self._broadcaster is not None:
                        await self._broadcaster.broadcast(
                            "reconciliation_complete",
                            self.reconciliation_service.get_status(),
                        )
                except Exception:
                    log.exception("scheduled_reconciliation_failed")

        except asyncio.CancelledError:
            log.info("reconciliation_loop_cancelled")

    # ------------------------------------------------------------------
    # FastAPI application factory
    # ------------------------------------------------------------------

    def create_api(self) -> FastAPI:
        """Create and configure the FastAPI application with lifecycle hooks.

        The control API's ``/api/connection/connect`` and
        ``/api/connection/disconnect`` endpoints handle credential storage
        and basic state management.  An HTTP middleware layer detects
        successful calls to those endpoints and triggers the full service
        lifecycle (REST/WS clients, agents, reconciliation) as background
        tasks so the HTTP response is returned immediately.
        """
        recon_adapter: _ReconciliationAdapter | None = None
        if self.reconciliation_service is not None:
            recon_adapter = _ReconciliationAdapter(self.reconciliation_service)

        app, broadcaster = _create_control_api(
            state_cache=self.state_cache,
            execution_service=self._execution_proxy,
            risk_gateway=self.risk_gateway,
            reconciliation_service=recon_adapter,
            config=self.config,
        )

        self._broadcaster = broadcaster
        self.api_app = app

        # Mount Prometheus metrics endpoint when enabled
        mount_metrics(app, telemetry_enabled=self.config.telemetry_enabled)

        # Lifecycle middleware — hooks into connect/disconnect responses
        application = self  # capture for closure

        @app.middleware("http")
        async def _lifecycle_middleware(request: Request, call_next: Any) -> Response:
            response: Response = await call_next(request)

            if response.status_code != 200:
                return response

            path = request.url.path
            method = request.method.upper()

            if path == "/api/connection/connect" and method == "POST":
                asyncio.create_task(application._on_api_connect())
            elif path == "/api/connection/disconnect" and method == "POST":
                asyncio.create_task(application._on_api_disconnect())

            return response

        return app

    # ------------------------------------------------------------------
    # Lifecycle hooks called by middleware after API endpoints succeed
    # ------------------------------------------------------------------

    async def _on_api_connect(self) -> None:
        """Bootstrap services after the control API stored credentials."""
        try:
            await self._bootstrap_services()
        except Exception:
            log.exception("post_connect_bootstrap_failed")

    async def _on_api_disconnect(self) -> None:
        """Tear down services after the control API cleared credentials."""
        try:
            await self._teardown_services()
        except Exception:
            log.exception("post_disconnect_teardown_failed")

    async def _bootstrap_services(self) -> None:
        """Create clients, run initial reconciliation, subscribe channels,
        and start agent loops.  Credentials are already in ``self.config``."""
        # Database
        try:
            await self.database.connect(self.config.db_url)
            await self.database.init_schema()
        except Exception:
            log.exception("database_bootstrap_failed")

        # REST client
        self.rest_client = KalshiRestClient(self.config)

        try:
            exchange_status = await self.rest_client.get_exchange_status()
            await self.state_cache.update_exchange_status(exchange_status)
        except Exception:
            log.exception("exchange_status_fetch_failed")

        try:
            balance = await self.rest_client.get_balance()
            await self.state_cache.update_balance(balance)
        except Exception:
            log.exception("balance_fetch_failed")

        self.risk_gateway.set_environment_healthy(True)

        # Execution & reconciliation
        self.execution_service = ExecutionService(
            self.config,
            self.rest_client,
            self.risk_gateway,
            self.state_cache,
        )

        self.reconciliation_service = ReconciliationService(
            self.rest_client,
            self.state_cache,
        )

        # WebSocket
        self.ws_client = KalshiWebSocketClient(
            self.config,
            on_message_callback=self._on_websocket_message,
        )
        try:
            await self.ws_client.connect()
            ACTIVE_CONNECTIONS.inc()
            log.info("websocket_connected")
        except Exception:
            log.exception("websocket_connect_failed")

        # Startup reconciliation (required by PRD)
        try:
            await self.reconciliation_service.reconcile(reason="startup")
            log.info("startup_reconciliation_complete")
            await self.database.insert_audit_log(
                self.config.environment,
                "startup_reconciliation",
                {"status": "complete"},
            )
        except Exception:
            log.exception("startup_reconciliation_failed")

        # Subscribe channels & start agents
        await self._subscribe_channels()
        self._init_agents()
        await self.start_agents()

        self._running = True
        log.info(
            "services_bootstrapped",
            environment=self.config.environment,
        )

    async def _teardown_services(self) -> None:
        """Stop agents, close connections, clear runtime state."""
        self._running = False

        await self.stop_agents()

        if self._reconciliation_task is not None:
            self._reconciliation_task.cancel()
            try:
                await self._reconciliation_task
            except asyncio.CancelledError:
                pass
            self._reconciliation_task = None

        if self.ws_client is not None:
            try:
                await self.ws_client.disconnect()
                ACTIVE_CONNECTIONS.dec()
            except Exception:
                log.exception("websocket_disconnect_error")
            self.ws_client = None

        if self.rest_client is not None:
            try:
                await self.rest_client.close()
            except Exception:
                log.exception("rest_client_close_error")
            self.rest_client = None

        self.risk_gateway.set_environment_healthy(False)

        self.execution_service = None
        self.reconciliation_service = None
        self.agents.clear()
        ACTIVE_AGENTS.set(0)

        # Close database pool
        try:
            await self.database.close()
        except Exception:
            log.exception("database_close_error")

        log.info("services_torn_down")

    # ------------------------------------------------------------------
    # Proxy that forwards to self.execution_service (may be None early)
    # ------------------------------------------------------------------

    @property
    def _execution_proxy(self) -> _ExecutionProxy:
        """Return a proxy object for the execution service.

        The control API is created before a real
        :class:`ExecutionService` exists.  The proxy forwards every call
        to whatever ``self.execution_service`` points to at call time.
        """
        return _ExecutionProxy(self)

    # ------------------------------------------------------------------
    # Direct connect / disconnect (for programmatic use)
    # ------------------------------------------------------------------

    async def connect(
        self,
        environment: str,
        api_key_id: str,
        private_key_pem: str,
    ) -> None:
        """Connect to Kalshi and bootstrap services (programmatic API).

        Prefer calling via the control API endpoints; this method is
        useful in scripts and tests.
        """
        from pydantic import SecretStr

        self.config.environment = environment
        self.config.api_key_id = api_key_id
        self.config.private_key_pem = SecretStr(private_key_pem)

        await self.state_cache.clear()
        await self.state_cache.set_environment(environment)

        await self._bootstrap_services()

        if self._broadcaster is not None:
            await self._broadcaster.broadcast(
                "connection_changed",
                {"connected": True, "environment": environment},
            )

    async def disconnect(self) -> None:
        """Disconnect and tear down services (programmatic API)."""
        self.risk_gateway.disable_trading()
        await self._teardown_services()
        await self.state_cache.clear()

        from pydantic import SecretStr

        self.config.api_key_id = ""
        self.config.private_key_pem = SecretStr("")

        if self._broadcaster is not None:
            await self._broadcaster.broadcast(
                "connection_changed",
                {"connected": False, "environment": self.config.environment},
            )

    # ------------------------------------------------------------------
    # Top-level entry point
    # ------------------------------------------------------------------

    async def run(self) -> None:
        """Start the API server with graceful shutdown on SIGINT/SIGTERM."""
        api = self.create_api()
        config = uvicorn.Config(
            api,
            host="127.0.0.1",
            port=self.config.port,
            log_level=self.config.log_level.lower(),
        )
        server = uvicorn.Server(config)

        # Graceful shutdown via signal handlers
        self._shutdown_event = asyncio.Event()
        loop = asyncio.get_running_loop()

        def _signal_handler(sig: int) -> None:
            sig_name = signal.Signals(sig).name
            log.info("shutdown_signal_received", signal=sig_name)
            self._shutdown_event.set()  # type: ignore[union-attr]
            server.should_exit = True

        for sig in (signal.SIGINT, signal.SIGTERM):
            try:
                loop.add_signal_handler(sig, _signal_handler, sig)
            except NotImplementedError:
                # Windows does not support add_signal_handler
                pass

        try:
            await server.serve()
        finally:
            log.info("graceful_shutdown_starting")
            await self._graceful_shutdown()

    async def _graceful_shutdown(self) -> None:
        """Cleanly tear down all services on shutdown."""
        try:
            self.risk_gateway.disable_trading()
            await self._teardown_services()
            await self.state_cache.clear()
            log.info("graceful_shutdown_complete")
        except Exception:
            log.exception("graceful_shutdown_error")


# ---------------------------------------------------------------------------
# Execution-service proxy (lazy forwarder)
# ---------------------------------------------------------------------------


class _ExecutionProxy:
    """Forwards attribute access to the live :class:`ExecutionService`.

    The control API is constructed before a REST client (and therefore an
    :class:`ExecutionService`) exists.  This proxy allows the API routes
    to call ``execution_service.get_pending_approvals()`` etc. and have
    the call land on whatever service is currently active.
    """

    def __init__(self, app: Application) -> None:
        self._app = app

    def __getattr__(self, name: str) -> Any:
        svc = self._app.execution_service
        if svc is None:
            raise RuntimeError("ExecutionService is not available (not connected)")
        return getattr(svc, name)


# ---------------------------------------------------------------------------
# Module entry point
# ---------------------------------------------------------------------------


def main() -> None:
    """Entry point for the application."""
    app = Application()
    api = app.create_api()
    uvicorn.run(
        api,
        host="127.0.0.1",
        port=app.config.port,
        log_level=app.config.log_level.lower(),
    )


if __name__ == "__main__":
    main()
