"""main.py — Polly Prediction Partners — Trading System Entry Point.

Starts all subsystems in the correct order:
 1. Logging setup (structured JSON)
 2. Database connection (with graceful degradation)
 3. Kalshi REST clients (live + demo)
 4. Kalshi WebSocket clients (live + demo)
 5. Local Market Cache
 6. Trading Permission Layer
 7. Execution Engines (live + demo)
 8. Agent Prime and Agent Peritia
 9. WebSocket message dispatcher (routes inbound WS messages to cache)
10. State Reconciliation (runs once before agents activate)
11. Market Discovery (run-once then periodic)
12. Backend Control API server
13. Periodic reconciliation loop

The system is event-driven.  Agents sleep until the market cache signals an
update via asyncio.Event.  Nothing polls.
"""
from __future__ import annotations

import asyncio
import logging
import signal
import sys
import time
from uuid import uuid4

from pythonjsonlogger import jsonlogger

import config
from kalshi.rest_client import KalshiRestClient
from kalshi.websocket_client import KalshiWebSocketClient
from market_cache import MarketCache
from market_discovery import MarketDiscovery
from state_reconciliation import StateReconciliation
from persistence.database import Database
from agents.prime import AgentPrime
from agents.peritia import AgentPeritia
from trading.permission_layer import TradingPermissionLayer
from trading.execution_engine import ExecutionEngine
from control_api.server import ControlAPIServer, EventBroadcaster


# ── Logging setup ─────────────────────────────────────────────────────────────

def _setup_logging() -> None:
    handler = logging.StreamHandler(sys.stdout)
    formatter = jsonlogger.JsonFormatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
    handler.setFormatter(formatter)
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.addHandler(handler)


logger = logging.getLogger(__name__)


# ── WebSocket message dispatcher ──────────────────────────────────────────────

async def _dispatch_messages(
    queue: asyncio.Queue,
    cache: MarketCache,
    engines: dict[str, ExecutionEngine],
    broadcaster: EventBroadcaster,
) -> None:
    """Route inbound WebSocket messages to the market cache and execution engines."""
    while True:
        msg = await queue.get()
        env = msg.get("_env", "demo")
        msg_type = msg.get("type", "")
        inner = msg.get("msg", {})

        try:
            if msg_type == "ticker":
                await cache.upsert_from_ticker(inner)

            elif msg_type == "orderbook_delta":
                await cache.apply_orderbook_delta(inner)

            elif msg_type == "trade":
                await cache.append_trade(inner)
                # Broadcast for UI market feed
                await broadcaster.broadcast({
                    "type": "market_update",
                    "ticker": inner.get("market_ticker"),
                    "trade": inner,
                })

            elif msg_type == "market_lifecycle":
                ticker = inner.get("market_ticker", "")
                status = inner.get("status", "")
                if ticker and status:
                    await cache.update_status(ticker, status)

            elif msg_type == "user:fill":
                engine = engines.get(env)
                if engine:
                    await engine.handle_fill(inner, env)

            elif msg_type == "user:order":
                engine = engines.get(env)
                if engine:
                    await engine.handle_order_update(inner, env)

            elif msg_type == "user:position":
                await broadcaster.broadcast({"type": "position_update", **inner, "environment": env})

        except Exception as exc:
            logger.error("Message dispatch error", extra={"type": msg_type, "error": str(exc)})


# ── Main ──────────────────────────────────────────────────────────────────────

async def main() -> None:
    _setup_logging()
    startup_time = time.time()
    logger.info("Polly Prediction Partners — starting up.")

    # ── Database ──────────────────────────────────────────────────────────────
    db: Database | None = None
    if config.DATABASE_URL:
        db = Database(config.DATABASE_URL)
        await db.connect()
    else:
        logger.warning("DATABASE_URL not set — running without persistence.")

    # ── REST clients ──────────────────────────────────────────────────────────
    rest_clients: dict[str, KalshiRestClient] = {
        "live": KalshiRestClient("live"),
        "demo": KalshiRestClient("demo"),
    }

    # Auto-configure from environment variables if keys are present
    for env in ("live", "demo"):
        api_key = config.api_key(env)
        key_path = config.private_key_path(env)
        if api_key and key_path:
            try:
                rest_clients[env].configure(api_key, key_path)
                logger.info("REST client configured", extra={"env": env})
            except Exception as exc:
                logger.warning("Could not load private key", extra={"env": env, "error": str(exc)})

    # ── Shared message queue and market cache ─────────────────────────────────
    ws_queue: asyncio.Queue = asyncio.Queue(maxsize=100_000)
    cache = MarketCache()

    # ── Event broadcaster ─────────────────────────────────────────────────────
    broadcaster = EventBroadcaster()

    # ── WebSocket clients ─────────────────────────────────────────────────────
    ws_clients: dict[str, KalshiWebSocketClient] = {
        "live": KalshiWebSocketClient("live", ws_queue),
        "demo": KalshiWebSocketClient("demo", ws_queue),
    }

    for env in ("live", "demo"):
        api_key = config.api_key(env)
        key_path = config.private_key_path(env)
        if api_key and key_path:
            try:
                ws_clients[env].configure(api_key, key_path)
            except Exception as exc:
                logger.warning("Could not configure WS client", extra={"env": env, "error": str(exc)})

    # ── Permission layer ──────────────────────────────────────────────────────
    permissions = TradingPermissionLayer()
    permissions.set_global_trading(config.GLOBAL_TRADING_ENABLED)
    permissions.set_environment(config.ACTIVE_ENVIRONMENT)

    # Mark keys as loaded for each configured environment
    for env in ("live", "demo"):
        if rest_clients[env].is_configured():
            permissions.set_keys_loaded(env, True)

    # ── Execution engines ─────────────────────────────────────────────────────
    engines: dict[str, ExecutionEngine] = {
        env: ExecutionEngine(rest_clients[env], db, env, broadcaster)
        for env in ("live", "demo")
    }
    for engine in engines.values():
        await engine.load_state_from_db()

    # Wire permission layer → execution engine
    async def _on_intent_approved(intent, env: str):
        await engines[env].execute(intent, env)

    permissions.set_on_approved(_on_intent_approved)

    # ── Agents ────────────────────────────────────────────────────────────────
    prime_id = uuid4()
    peritia_id = uuid4()

    agent_prime = AgentPrime(prime_id, cache, permissions, broadcaster)
    agent_peritia = AgentPeritia(peritia_id, cache, permissions, broadcaster)

    agent_registry: dict[str, object] = {
        str(prime_id): agent_prime,
        str(peritia_id): agent_peritia,
    }

    # Register agent modes in permission layer (default: FullStop — requires explicit enable)
    permissions.set_agent_mode(prime_id, "FullStop")
    permissions.set_agent_mode(peritia_id, "FullStop")

    # ── State reconciliation ──────────────────────────────────────────────────
    active_env = config.ACTIVE_ENVIRONMENT
    reconciler = StateReconciliation(rest_clients[active_env], db, active_env, broadcaster)

    # Register reconciliation as a WS reconnect callback
    ws_clients[active_env].add_reconnect_callback(reconciler.run_once)

    # ── Market discovery ──────────────────────────────────────────────────────
    discovery = MarketDiscovery(rest_clients[active_env], ws_clients[active_env], cache, db)

    # ── Control API ───────────────────────────────────────────────────────────
    control_api = ControlAPIServer(
        cache=cache,
        permission_layer=permissions,
        execution_engines=engines,
        agent_registry=agent_registry,
        ws_clients=ws_clients,
        rest_clients=rest_clients,
        db=db,
        market_discovery=discovery,
        broadcaster=broadcaster,
        startup_time=startup_time,
    )

    # ── Graceful shutdown ─────────────────────────────────────────────────────
    loop = asyncio.get_running_loop()
    stop_event = asyncio.Event()

    def _handle_signal():
        logger.info("Shutdown signal received.")
        stop_event.set()

    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, _handle_signal)

    # ── Launch all tasks ──────────────────────────────────────────────────────
    logger.info("Starting subsystems.")

    # Start Control API first so UI can connect immediately
    await control_api.start()

    # Start WebSocket connections
    ws_tasks = [
        asyncio.create_task(ws_clients["live"].start(), name="ws-live"),
        asyncio.create_task(ws_clients["demo"].start(), name="ws-demo"),
    ]

    # Message dispatcher
    dispatch_task = asyncio.create_task(
        _dispatch_messages(ws_queue, cache, engines, broadcaster),
        name="msg-dispatcher",
    )

    # State reconciliation (once at startup before agents activate)
    logger.info("Running startup state reconciliation.")
    await reconciler.run_once()

    # Market discovery — run once then start the periodic loop
    logger.info("Running initial market discovery.")
    await discovery.run_once()

    discovery_task = asyncio.create_task(discovery.start(), name="market-discovery")
    reconciliation_task = asyncio.create_task(reconciler.start(), name="reconciliation")

    # Start agents
    await agent_prime.start()
    await agent_peritia.start()

    logger.info("All systems running.  Waiting for shutdown signal.")
    await stop_event.wait()

    # ── Graceful teardown ─────────────────────────────────────────────────────
    logger.info("Shutting down.")

    await agent_prime.stop()
    await agent_peritia.stop()

    for task in [dispatch_task, discovery_task, reconciliation_task, *ws_tasks]:
        task.cancel()
        try:
            await task
        except (asyncio.CancelledError, Exception):
            pass

    await control_api.stop()
    if db:
        await db.close()

    logger.info("Polly Prediction Partners — shutdown complete.")


if __name__ == "__main__":
    asyncio.run(main())
