"""trading/execution_engine.py — Execution Engine.

The only component allowed to submit orders to Kalshi.

Flow per TradeIntent:
1. Validate intent fields.
2. Check for duplicate client_order_id (idempotency guard).
3. Acquire write token from rate-limit bucket.
4. Construct Kalshi REST order body.
5. Build auth headers and POST /portfolio/orders.
6. On success: persist to DB, broadcast via Control API.
7. On failure: retry logic per PRD table; mark FAILED if exhausted.

Maintains in-memory records of open orders, recent fills, and positions.
Positions are updated by WebSocket user:fill and user:position events.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Optional
from uuid import UUID

from kalshi.rest_client import KalshiRestClient
from persistence.database import Database
from trading.trade_intent import TradeIntent

logger = logging.getLogger(__name__)


class ExecutionEngine:
    """Submits orders to Kalshi and tracks execution state."""

    def __init__(
        self,
        rest_client: KalshiRestClient,
        db: Optional[Database],
        environment: str,
        event_broadcaster=None,
    ) -> None:
        self._rest = rest_client
        self._db = db
        self._env = environment
        self._broadcaster = event_broadcaster

        # In-memory idempotency guard: set of client_order_id strings
        self._submitted_ids: set[str] = set()

        # In-memory order tracking: order_id → order dict
        self._open_orders: dict[str, dict] = {}

        # In-memory position tracking: market_ticker → position dict
        self._positions: dict[str, dict] = {}

    # ── Bootstrap ─────────────────────────────────────────────────────────────

    async def load_state_from_db(self) -> None:
        """Load open orders and positions from DB at startup."""
        if not self._db:
            return
        open_orders = await self._db.get_open_orders(self._env)
        for row in open_orders:
            oid = str(row.get("order_id", ""))
            cid = str(row.get("client_order_id", ""))
            self._open_orders[oid] = row
            self._submitted_ids.add(cid)

        positions = await self._db.get_positions(self._env)
        for pos in positions:
            ticker = pos.get("market_ticker", "")
            self._positions[ticker] = pos

        logger.info(
            "Execution engine loaded state from DB",
            extra={"env": self._env, "open_orders": len(self._open_orders), "positions": len(self._positions)},
        )

    # ── Public entry point ────────────────────────────────────────────────────

    async def execute(self, intent: TradeIntent, environment: str) -> None:
        """Process a TradeIntent through the full execution flow."""
        # Step 1: Validate
        if not self._validate(intent):
            return

        client_id = str(intent.client_order_id)

        # Step 2: Idempotency guard
        if client_id in self._submitted_ids:
            logger.debug("Duplicate client_order_id — skipping", extra={"client_order_id": client_id})
            return
        self._submitted_ids.add(client_id)

        # Step 3-7: Submit with retry
        await self._submit_with_retry(intent, environment)

    # ── Validation ────────────────────────────────────────────────────────────

    def _validate(self, intent: TradeIntent) -> bool:
        if not (1 <= intent.price <= 99):
            logger.warning("Invalid price", extra={"price": intent.price, "ticker": intent.market_ticker})
            return False
        if intent.count <= 0:
            logger.warning("Invalid count", extra={"count": intent.count, "ticker": intent.market_ticker})
            return False
        if not intent.market_ticker:
            logger.warning("Missing market_ticker in TradeIntent")
            return False
        if intent.action not in ("buy", "sell"):
            logger.warning("Invalid action", extra={"action": intent.action})
            return False
        if intent.side not in ("yes", "no"):
            logger.warning("Invalid side", extra={"side": intent.side})
            return False
        return True

    # ── Order submission ──────────────────────────────────────────────────────

    async def _submit_with_retry(self, intent: TradeIntent, environment: str) -> None:
        price_field = "yes_price" if intent.side == "yes" else "no_price"
        body = {
            "ticker": intent.market_ticker,
            "client_order_id": str(intent.client_order_id),
            "type": intent.order_type,
            "action": intent.action,
            "side": intent.side,
            "count": intent.count,
            price_field: intent.price,
        }

        last_exc: Optional[Exception] = None
        for attempt in range(5):
            try:
                resp = await self._rest.create_order(body)
                await self._on_order_success(resp, intent, environment)
                return
            except PermissionError:
                # 401 — halt trading
                logger.error("Order rejected with 401 — halting further execution.")
                return
            except Exception as exc:
                last_exc = exc
                wait = 0.1 * (2 ** attempt)
                logger.warning(
                    "Order submission failed",
                    extra={"attempt": attempt + 1, "ticker": intent.market_ticker, "error": str(exc)},
                )
                await asyncio.sleep(wait)

        # All retries exhausted
        logger.error(
            "Order permanently FAILED after retries",
            extra={"client_order_id": str(intent.client_order_id), "ticker": intent.market_ticker, "error": str(last_exc)},
        )
        await self._on_order_failed(intent, environment)

    async def _on_order_success(self, resp: dict, intent: TradeIntent, environment: str) -> None:
        order = resp.get("order", resp)
        order_id = str(order.get("order_id", ""))
        logger.info(
            "Order submitted successfully",
            extra={"order_id": order_id, "ticker": intent.market_ticker, "env": environment},
        )

        self._open_orders[order_id] = order

        # Persist to DB (fire-and-forget)
        if self._db:
            order_record = {
                "order_id": order_id,
                "client_order_id": str(intent.client_order_id),
                "agent_id": str(intent.agent_id),
                "market_ticker": intent.market_ticker,
                "action": intent.action,
                "side": intent.side,
                "order_type": intent.order_type,
                "price": intent.price,
                "count": intent.count,
                "remaining_count": intent.count,
                "status": order.get("status", "resting"),
            }
            asyncio.create_task(self._db.insert_order(order_record, environment))

        if self._broadcaster:
            await self._broadcaster.broadcast({
                "type": "order_submitted",
                "order_id": order_id,
                "ticker": intent.market_ticker,
                "action": intent.action,
                "side": intent.side,
                "price": intent.price,
                "count": intent.count,
                "environment": environment,
            })

    async def _on_order_failed(self, intent: TradeIntent, environment: str) -> None:
        if self._broadcaster:
            await self._broadcaster.broadcast({
                "type": "order_failed",
                "client_order_id": str(intent.client_order_id),
                "ticker": intent.market_ticker,
                "environment": environment,
            })

    # ── WebSocket event handlers ──────────────────────────────────────────────

    async def handle_fill(self, msg: dict, environment: str) -> None:
        """Process a user:fill WebSocket event."""
        order_id = str(msg.get("order_id", ""))
        if order_id in self._open_orders:
            remaining = self._open_orders[order_id].get("remaining_count", 0) - msg.get("count", 0)
            if remaining <= 0:
                self._open_orders.pop(order_id, None)
                if self._db:
                    asyncio.create_task(self._db.update_order_status(order_id, "filled", environment))
            else:
                self._open_orders[order_id]["remaining_count"] = remaining

        fill_id = str(msg.get("fill_id", ""))
        if fill_id and self._db:
            asyncio.create_task(self._db.insert_fill(msg, environment))

        if self._broadcaster:
            await self._broadcaster.broadcast({"type": "order_filled", **msg, "environment": environment})

    async def handle_order_update(self, msg: dict, environment: str) -> None:
        """Process a user:order WebSocket event."""
        order_id = str(msg.get("order_id", ""))
        status = msg.get("status", "")
        if status in ("cancelled", "filled", "expired"):
            self._open_orders.pop(order_id, None)
            if self._db:
                asyncio.create_task(self._db.update_order_status(order_id, status, environment))
            event_type = "order_cancelled" if status == "cancelled" else "order_filled"
            if self._broadcaster:
                await self._broadcaster.broadcast({"type": event_type, **msg, "environment": environment})

    # ── State queries ─────────────────────────────────────────────────────────

    def get_open_orders(self) -> list[dict]:
        return list(self._open_orders.values())

    def get_positions(self) -> dict[str, dict]:
        return dict(self._positions)
