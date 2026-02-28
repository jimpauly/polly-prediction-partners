"""control_api/server.py — Backend Control API.

Local HTTP server bound to 127.0.0.1.  Never exposed to the internet.

Provides:
- POST /control/* — commands to agents, trading, system.
- GET /state/*    — read-only state queries.
- GET /events     — Server-Sent Events (SSE) broadcast of live backend events.

All handlers are thin: they delegate to the system components passed in at
construction time.  No trading logic lives here.
"""
from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Optional
from uuid import UUID

from aiohttp import web

import config

logger = logging.getLogger(__name__)


class EventBroadcaster:
    """Manages a set of SSE response writers and fans out events to all of them."""

    def __init__(self) -> None:
        self._clients: list[web.StreamResponse] = []
        self._lock = asyncio.Lock()

    async def add_client(self, response: web.StreamResponse) -> None:
        async with self._lock:
            self._clients.append(response)

    async def remove_client(self, response: web.StreamResponse) -> None:
        async with self._lock:
            self._clients = [c for c in self._clients if c is not response]

    async def broadcast(self, event: dict) -> None:
        """Send an SSE event to all connected clients."""
        data = json.dumps(event)
        sse_payload = f"data: {data}\n\n".encode()

        async with self._lock:
            dead = []
            for client in self._clients:
                try:
                    await client.write(sse_payload)
                except Exception:
                    dead.append(client)
            self._clients = [c for c in self._clients if c not in dead]


class ControlAPIServer:
    """aiohttp-based local HTTP Control API server.

    Accepts references to all backend subsystems at construction time.
    """

    def __init__(
        self,
        cache,
        permission_layer,
        execution_engines: dict,    # env → ExecutionEngine
        agent_registry: dict,       # agent_id_str → BaseAgent
        ws_clients: dict,           # env → KalshiWebSocketClient
        rest_clients: dict,         # env → KalshiRestClient
        db,
        market_discovery,
        broadcaster: EventBroadcaster,
        startup_time: float,
    ) -> None:
        self._cache = cache
        self._permissions = permission_layer
        self._engines = execution_engines
        self._agents = agent_registry
        self._ws = ws_clients
        self._rest = rest_clients
        self._db = db
        self._discovery = market_discovery
        self._broadcaster = broadcaster
        self._startup_time = startup_time
        self._app: Optional[web.Application] = None
        self._runner: Optional[web.AppRunner] = None

    # ── Server lifecycle ──────────────────────────────────────────────────────

    async def start(self) -> None:
        self._app = web.Application()
        self._setup_routes()
        self._runner = web.AppRunner(self._app)
        await self._runner.setup()
        site = web.TCPSite(
            self._runner,
            config.CONTROL_API_HOST,
            config.CONTROL_API_PORT,
        )
        await site.start()
        logger.info(
            "Control API server started",
            extra={"host": config.CONTROL_API_HOST, "port": config.CONTROL_API_PORT},
        )

    async def stop(self) -> None:
        if self._runner:
            await self._runner.cleanup()

    # ── Route registration ────────────────────────────────────────────────────

    def _setup_routes(self) -> None:
        app = self._app

        # ── Control commands ──────────────────────────────────────────────────
        app.router.add_post("/control/agents/{agent_id}/start",    self._agent_start)
        app.router.add_post("/control/agents/{agent_id}/stop",     self._agent_stop)
        app.router.add_post("/control/agents/{agent_id}/pause",    self._agent_pause)
        app.router.add_post("/control/agents/{agent_id}/set_mode", self._agent_set_mode)
        app.router.add_post("/control/agents/{agent_id}/enable",   self._agent_enable)
        app.router.add_post("/control/agents/{agent_id}/disable",  self._agent_disable)

        app.router.add_post("/control/trading/enable",  self._trading_enable)
        app.router.add_post("/control/trading/disable", self._trading_disable)

        app.router.add_post("/control/keys/connect",    self._keys_connect)
        app.router.add_post("/control/keys/disconnect", self._keys_disconnect)
        app.router.add_post("/control/environment/set", self._environment_set)

        # ── State queries ─────────────────────────────────────────────────────
        app.router.add_get("/state/agents",          self._state_agents)
        app.router.add_get("/state/agents/{agent_id}", self._state_agent)
        app.router.add_get("/state/positions",       self._state_positions)
        app.router.add_get("/state/orders",          self._state_orders)
        app.router.add_get("/state/orders/{order_id}", self._state_order)
        app.router.add_get("/state/fills",           self._state_fills)
        app.router.add_get("/state/markets",         self._state_markets)
        app.router.add_get("/state/balance",         self._state_balance)
        app.router.add_get("/state/system",          self._state_system)

        # ── SSE event stream ──────────────────────────────────────────────────
        app.router.add_get("/events", self._sse_events)

    # ── Agent commands ────────────────────────────────────────────────────────

    async def _get_agent(self, request: web.Request) -> tuple[Optional[object], Optional[web.Response]]:
        agent_id = request.match_info["agent_id"]
        agent = self._agents.get(agent_id)
        if not agent:
            return None, web.json_response({"error": "agent not found"}, status=404)
        return agent, None

    async def _agent_start(self, request: web.Request) -> web.Response:
        agent, err = await self._get_agent(request)
        if err:
            return err
        await agent.start()
        return web.json_response({"status": "ok", "lifecycle_state": agent.state.value})

    async def _agent_stop(self, request: web.Request) -> web.Response:
        agent, err = await self._get_agent(request)
        if err:
            return err
        await agent.stop()
        return web.json_response({"status": "ok", "lifecycle_state": agent.state.value})

    async def _agent_pause(self, request: web.Request) -> web.Response:
        agent, err = await self._get_agent(request)
        if err:
            return err
        await agent.pause()
        return web.json_response({"status": "ok", "lifecycle_state": agent.state.value})

    async def _agent_set_mode(self, request: web.Request) -> web.Response:
        agent, err = await self._get_agent(request)
        if err:
            return err
        body = await request.json()
        mode = body.get("mode", "FullStop")
        if mode not in ("Auto", "SemiAuto", "FullStop"):
            return web.json_response({"error": "invalid mode"}, status=400)
        agent.set_mode(mode)
        return web.json_response({"status": "ok", "mode": mode})

    async def _agent_enable(self, request: web.Request) -> web.Response:
        agent, err = await self._get_agent(request)
        if err:
            return err
        agent.enable()
        return web.json_response({"status": "ok"})

    async def _agent_disable(self, request: web.Request) -> web.Response:
        agent, err = await self._get_agent(request)
        if err:
            return err
        agent.disable()
        return web.json_response({"status": "ok"})

    # ── Trading commands ──────────────────────────────────────────────────────

    async def _trading_enable(self, request: web.Request) -> web.Response:
        self._permissions.set_global_trading(True)
        await self._broadcaster.broadcast({"type": "system_status", "global_trading_enabled": True})
        return web.json_response({"status": "ok", "global_trading_enabled": True})

    async def _trading_disable(self, request: web.Request) -> web.Response:
        self._permissions.set_global_trading(False)
        await self._broadcaster.broadcast({"type": "system_status", "global_trading_enabled": False})
        return web.json_response({"status": "ok", "global_trading_enabled": False})

    # ── Key / environment commands ────────────────────────────────────────────

    async def _keys_connect(self, request: web.Request) -> web.Response:
        """Load API credentials for an environment at runtime."""
        body = await request.json()
        env = body.get("environment", "").lower()
        api_key = body.get("api_key", "")
        private_key_pem = body.get("private_key", "")   # PEM string or path

        if env not in ("live", "demo"):
            return web.json_response({"error": "environment must be 'live' or 'demo'"}, status=400)
        if not api_key or not private_key_pem:
            return web.json_response({"error": "api_key and private_key are required"}, status=400)

        # Write the PEM to a temp file so rest/ws clients can load it
        import tempfile, os
        tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".pem", delete=False)
        tmp.write(private_key_pem)
        tmp.close()

        try:
            if env in self._rest:
                self._rest[env].configure(api_key, tmp.name)
            if env in self._ws:
                self._ws[env].configure(api_key, tmp.name)
            self._permissions.set_keys_loaded(env, True)
        except Exception as exc:
            return web.json_response({"error": str(exc)}, status=500)
        finally:
            os.unlink(tmp.name)

        await self._broadcaster.broadcast({"type": "system_status", "api_keys_loaded": True, "environment": env})
        return web.json_response({"status": "ok", "environment": env})

    async def _keys_disconnect(self, request: web.Request) -> web.Response:
        body = await request.json()
        env = body.get("environment", "").lower()
        self._permissions.set_keys_loaded(env, False)
        return web.json_response({"status": "ok"})

    async def _environment_set(self, request: web.Request) -> web.Response:
        body = await request.json()
        env = body.get("environment", "").lower()
        if env not in ("live", "demo"):
            return web.json_response({"error": "environment must be 'live' or 'demo'"}, status=400)
        self._permissions.set_environment(env)
        await self._broadcaster.broadcast({"type": "system_status", "active_environment": env})
        return web.json_response({"status": "ok", "environment": env})

    # ── State queries ─────────────────────────────────────────────────────────

    async def _state_agents(self, request: web.Request) -> web.Response:
        return web.json_response([a.to_dict() for a in self._agents.values()])

    async def _state_agent(self, request: web.Request) -> web.Response:
        agent_id = request.match_info["agent_id"]
        agent = self._agents.get(agent_id)
        if not agent:
            return web.json_response({"error": "not found"}, status=404)
        return web.json_response(agent.to_dict())

    async def _state_positions(self, request: web.Request) -> web.Response:
        env = self._permissions.get_environment()
        engine = self._engines.get(env)
        positions = engine.get_positions() if engine else {}
        return web.json_response(positions)

    async def _state_orders(self, request: web.Request) -> web.Response:
        env = self._permissions.get_environment()
        engine = self._engines.get(env)
        orders = engine.get_open_orders() if engine else []
        status_filter = request.rel_url.query.get("status")
        if status_filter:
            orders = [o for o in orders if o.get("status") == status_filter]
        return web.json_response(orders)

    async def _state_order(self, request: web.Request) -> web.Response:
        order_id = request.match_info["order_id"]
        env = self._permissions.get_environment()
        engine = self._engines.get(env)
        if not engine:
            return web.json_response({"error": "not found"}, status=404)
        for order in engine.get_open_orders():
            if str(order.get("order_id")) == order_id:
                return web.json_response(order)
        return web.json_response({"error": "not found"}, status=404)

    async def _state_fills(self, request: web.Request) -> web.Response:
        env = self._permissions.get_environment()
        limit = int(request.rel_url.query.get("limit", 50))
        if self._db:
            fills = await self._db._fetch(
                f"SELECT * FROM {env}.fills ORDER BY filled_at DESC LIMIT $1", limit
            )
        else:
            fills = []
        return web.json_response(fills, dumps=_json_serial)

    async def _state_markets(self, request: web.Request) -> web.Response:
        query = request.rel_url.query
        status_filter = query.get("status")
        limit = int(query.get("limit", 20))
        cache_snapshot = await self._cache.get_all()
        result = []
        for ticker, state in cache_snapshot.items():
            if status_filter and state.market_status != status_filter:
                continue
            result.append({
                "market_ticker": state.market_ticker,
                "event_ticker": state.event_ticker,
                "series_ticker": state.series_ticker,
                "market_status": state.market_status,
                "yes_bid": state.yes_bid,
                "no_bid": state.no_bid,
                "yes_ask": state.yes_ask,
                "spread": state.spread,
                "midpoint": state.midpoint,
                "implied_probability": state.implied_probability,
                "volume": state.volume,
                "open_interest": state.open_interest,
            })
            if len(result) >= limit:
                break
        return web.json_response(result)

    async def _state_balance(self, request: web.Request) -> web.Response:
        env = self._permissions.get_environment()
        rest = self._rest.get(env)
        if not rest or not rest.is_configured():
            return web.json_response({"error": "not configured"}, status=503)
        try:
            data = await rest.get_balance()
            return web.json_response(data)
        except Exception as exc:
            return web.json_response({"error": str(exc)}, status=502)

    async def _state_system(self, request: web.Request) -> web.Response:
        env = self._permissions.get_environment()
        ws_client = self._ws.get(env)
        active_agents = sum(
            1 for a in self._agents.values()
            if a.state.value == "ACTIVE"
        )
        return web.json_response({
            "environment": env,
            "global_trading_enabled": self._permissions.is_global_trading_enabled(),
            "websocket_connected": ws_client is not None and ws_client._ws is not None and not ws_client._ws.closed,
            "api_keys_loaded": self._permissions._keys_loaded.get(env, False),
            "markets_discovered": self._discovery.total_discovered if self._discovery else 0,
            "active_agents": active_agents,
            "uptime_seconds": int(time.time() - self._startup_time),
        })

    # ── SSE event stream ──────────────────────────────────────────────────────

    async def _sse_events(self, request: web.Request) -> web.StreamResponse:
        response = web.StreamResponse(headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        })
        await response.prepare(request)
        await self._broadcaster.add_client(response)
        try:
            # Keep connection open until the client disconnects
            while not request.transport.is_closing():
                await asyncio.sleep(15)
                # Send a comment to keep the connection alive
                try:
                    await response.write(b": keepalive\n\n")
                except Exception:
                    break
        finally:
            await self._broadcaster.remove_client(response)
        return response


def _json_serial(obj):
    """JSON serialiser for types aiohttp doesn't handle natively."""
    import datetime, uuid
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()
    if isinstance(obj, uuid.UUID):
        return str(obj)
    raise TypeError(f"Type {type(obj)} not serialisable")
