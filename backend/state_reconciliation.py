"""state_reconciliation.py — State Reconciliation System.

Ensures the local Persistence Layer matches Kalshi's authoritative state after:
- System startup (before agents activate)
- Every 60 minutes during runtime
- Immediately after any WebSocket reconnection

Steps:
1. Load local open orders from DB.
2. Fetch open orders from Kalshi GET /portfolio/orders.
3. Mark locally-open orders not found on Kalshi as CANCELLED or FILLED.
4. Fetch positions from Kalshi GET /portfolio/positions.
5. Overwrite local positions with Kalshi values.
6. Fetch recent fills from GET /portfolio/fills and backfill missing records.
7. Log all discrepancies found.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Optional

from kalshi.rest_client import KalshiRestClient
from persistence.database import Database

logger = logging.getLogger(__name__)

RECONCILIATION_INTERVAL = 3600   # seconds between periodic reconciliations


class StateReconciliation:
    """Reconciles local DB state with Kalshi authoritative state."""

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
        self._running = False

    async def start(self) -> None:
        """Periodic reconciliation loop (runs every 60 min)."""
        self._running = True
        while self._running:
            await asyncio.sleep(RECONCILIATION_INTERVAL)
            await self.run_once()

    async def stop(self) -> None:
        self._running = False

    async def run_once(self) -> None:
        """Execute a full reconciliation cycle."""
        if not self._rest.is_configured():
            logger.info("Reconciliation skipped — REST client not configured.", extra={"env": self._env})
            return

        logger.info("State reconciliation starting.", extra={"env": self._env})
        discrepancies: list[str] = []

        try:
            discrepancies += await self._reconcile_orders()
        except Exception as exc:
            logger.error("Order reconciliation failed", extra={"env": self._env, "error": str(exc)})

        try:
            discrepancies += await self._reconcile_positions()
        except Exception as exc:
            logger.error("Position reconciliation failed", extra={"env": self._env, "error": str(exc)})

        try:
            discrepancies += await self._backfill_fills()
        except Exception as exc:
            logger.error("Fill backfill failed", extra={"env": self._env, "error": str(exc)})

        if discrepancies:
            for msg in discrepancies:
                logger.warning("Reconciliation discrepancy", extra={"env": self._env, "detail": msg})

        logger.info(
            "State reconciliation complete",
            extra={"env": self._env, "discrepancies": len(discrepancies)},
        )

        if self._broadcaster:
            await self._broadcaster.broadcast({
                "type": "reconciliation_complete",
                "environment": self._env,
                "discrepancies": len(discrepancies),
            })

    # ── Order reconciliation ──────────────────────────────────────────────────

    async def _reconcile_orders(self) -> list[str]:
        discrepancies: list[str] = []

        if not self._db:
            return discrepancies

        # Load locally-open orders
        local_open = await self._db.get_open_orders(self._env)
        local_ids = {row["order_id"]: row for row in local_open}

        if not local_ids:
            return discrepancies

        # Fetch from Kalshi (paginate through all open orders)
        kalshi_orders = await self._fetch_all_orders()
        kalshi_ids = {o["order_id"]: o for o in kalshi_orders}

        # Compare
        for order_id, local_row in local_ids.items():
            if order_id not in kalshi_ids:
                # Order is open locally but not on Kalshi — mark as cancelled
                discrepancies.append(f"Order {order_id} open locally but missing on Kalshi → marking CANCELLED")
                await self._db.update_order_status(order_id, "cancelled")
            else:
                kalshi_order = kalshi_ids[order_id]
                kalshi_status = kalshi_order.get("status", "")
                local_status = local_row.get("status", "")
                if kalshi_status != local_status:
                    discrepancies.append(
                        f"Order {order_id} status mismatch: local={local_status} kalshi={kalshi_status}"
                    )
                    await self._db.update_order_status(order_id, kalshi_status)

        return discrepancies

    async def _fetch_all_orders(self) -> list[dict]:
        """Paginate through GET /portfolio/orders."""
        results = []
        cursor = None
        while True:
            params: dict = {"status": "resting", "limit": 200}
            if cursor:
                params["cursor"] = cursor
            try:
                resp = await self._rest.get_orders(**params)
            except Exception:
                break
            orders = resp.get("orders", [])
            results.extend(orders)
            cursor = resp.get("cursor")
            if not cursor:
                break
        return results

    # ── Position reconciliation ───────────────────────────────────────────────

    async def _reconcile_positions(self) -> list[str]:
        discrepancies: list[str] = []
        if not self._db:
            return discrepancies

        resp = await self._rest.get_positions()
        kalshi_positions = resp.get("market_positions", []) or resp.get("positions", [])

        for pos in kalshi_positions:
            ticker = pos.get("market_id") or pos.get("market_ticker")
            if not ticker:
                continue
            # Kalshi is source of truth — overwrite local
            await self._db.upsert_position(ticker, self._env, pos)

        return discrepancies

    # ── Fill backfill ─────────────────────────────────────────────────────────

    async def _backfill_fills(self) -> list[str]:
        discrepancies: list[str] = []
        if not self._db:
            return discrepancies

        resp = await self._rest.get_fills(limit=100)
        fills = resp.get("fills", [])

        for fill in fills:
            fill_id = fill.get("fill_id") or fill.get("id")
            if not fill_id:
                continue
            exists = await self._db.fill_exists(fill_id)
            if not exists:
                discrepancies.append(f"Backfilling missing fill {fill_id}")
                await self._db.insert_fill(fill, self._env)

        return discrepancies
