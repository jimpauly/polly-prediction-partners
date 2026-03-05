"""Reconciliation service for Paulie's Prediction Partners.

Periodically compares the in-memory StateCache against the Kalshi REST API
to detect and correct drift.  Reconciliation can be triggered at startup,
on WebSocket reconnect, on a scheduled interval, or manually via the
control API.
"""

from __future__ import annotations

import time
from typing import Any

import structlog

from backend.services.kalshi_rest_client import KalshiRestClient
from backend.services.state_cache import StateCache

log = structlog.get_logger(__name__)

_PAGE_LIMIT_ORDERS = 200
_PAGE_LIMIT_FILLS = 200
_PAGE_LIMIT_POSITIONS = 100


class ReconciliationService:
    """Detects and repairs drift between the local state cache and Kalshi."""

    def __init__(
        self,
        rest_client: KalshiRestClient,
        state_cache: StateCache,
    ) -> None:
        self.rest_client = rest_client
        self.state_cache = state_cache
        self.last_reconciliation_time: float | None = None
        self.reconciliation_in_progress: bool = False
        self._drift_detected: bool = False
        self._last_reason: str = ""
        self._last_error: str | None = None
        self._drift_details: list[dict[str, Any]] = []

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def reconcile(self, reason: str = "manual") -> None:
        """Run a full reconciliation cycle.

        Steps:
        1. Fetch historical cutoff timestamps.
        2. Fetch all portfolio orders (paginated).
        3. Fetch all portfolio fills (paginated).
        4. Fetch all portfolio positions (paginated).
        5. Fetch balance.
        6. Compare with state cache.
        7. Log any drift and fix state cache.
        8. Update ``last_reconciliation_time``.
        """
        if self.reconciliation_in_progress:
            log.warning("reconciliation_skipped", reason="already_in_progress")
            return

        self.reconciliation_in_progress = True
        self._drift_detected = False
        self._last_reason = reason
        self._last_error = None
        self._drift_details = []

        log.info("reconciliation_start", reason=reason)
        start = time.monotonic()

        try:
            # 1. Historical cutoff
            cutoff = await self._fetch_historical_cutoff()

            # 2-4. Fetch live portfolio data
            orders = await self._fetch_all_orders()
            fills = await self._fetch_all_fills()
            positions = await self._fetch_all_positions()

            # 2b-4b. Merge historical data when the cutoff applies
            if cutoff:
                await self._fetch_historical_if_needed(
                    cutoff, orders=orders, fills=fills,
                )

            # 5. Fetch balance
            balance = await self._fetch_balance()

            # 6-7. Compare and repair
            await self._reconcile_orders(orders)
            await self._reconcile_fills(fills)
            await self._reconcile_positions(positions)
            if balance is not None:
                await self._reconcile_balance(balance)

            elapsed = time.monotonic() - start
            log.info(
                "reconciliation_complete",
                reason=reason,
                drift_detected=self._drift_detected,
                drift_count=len(self._drift_details),
                elapsed_s=round(elapsed, 3),
            )
        except Exception:
            self._last_error = "reconciliation_failed"
            log.exception("reconciliation_failed", reason=reason)
        finally:
            self.last_reconciliation_time = time.time()
            self.reconciliation_in_progress = False

    def has_drift(self) -> bool:
        """Return ``True`` if the most recent reconciliation found drift."""
        return self._drift_detected

    def get_status(self) -> dict[str, Any]:
        """Return a JSON-serialisable status summary."""
        return {
            "in_progress": self.reconciliation_in_progress,
            "last_reconciliation_epoch": self.last_reconciliation_time,
            "last_reason": self._last_reason,
            "drift_detected": self._drift_detected,
            "drift_details": list(self._drift_details),
            "last_error": self._last_error,
        }

    # ------------------------------------------------------------------
    # Data fetchers (paginated)
    # ------------------------------------------------------------------

    async def _fetch_all_orders(self) -> list[dict]:
        """Paginate through all portfolio orders."""
        all_orders: list[dict] = []
        cursor: str | None = None
        try:
            while True:
                page, cursor = await self.rest_client.get_portfolio_orders(
                    limit=_PAGE_LIMIT_ORDERS, cursor=cursor or None,
                )
                all_orders.extend(page)
                if not cursor:
                    break
        except Exception:
            log.exception("reconciliation_fetch_orders_failed")
        log.debug("reconciliation_fetched_orders", count=len(all_orders))
        return all_orders

    async def _fetch_all_fills(self) -> list[dict]:
        """Paginate through all portfolio fills."""
        all_fills: list[dict] = []
        cursor: str | None = None
        try:
            while True:
                page, cursor = await self.rest_client.get_portfolio_fills(
                    limit=_PAGE_LIMIT_FILLS, cursor=cursor or None,
                )
                all_fills.extend(page)
                if not cursor:
                    break
        except Exception:
            log.exception("reconciliation_fetch_fills_failed")
        log.debug("reconciliation_fetched_fills", count=len(all_fills))
        return all_fills

    async def _fetch_all_positions(self) -> list[dict]:
        """Paginate through all portfolio positions."""
        all_positions: list[dict] = []
        cursor: str | None = None
        try:
            while True:
                page, cursor = await self.rest_client.get_positions(
                    limit=_PAGE_LIMIT_POSITIONS, cursor=cursor or None,
                )
                all_positions.extend(page)
                if not cursor:
                    break
        except Exception:
            log.exception("reconciliation_fetch_positions_failed")
        log.debug("reconciliation_fetched_positions", count=len(all_positions))
        return all_positions

    async def _fetch_balance(self) -> dict | None:
        """Fetch the current account balance."""
        try:
            balance = await self.rest_client.get_balance()
            log.debug("reconciliation_fetched_balance")
            return balance
        except Exception:
            log.exception("reconciliation_fetch_balance_failed")
            return None

    async def _fetch_historical_cutoff(self) -> dict:
        """Fetch the historical data cutoff and update the state cache."""
        try:
            cutoff = await self.rest_client.get_historical_cutoff()
            await self.state_cache.set_historical_cutoff(cutoff)
            log.debug("reconciliation_fetched_cutoff", cutoff=cutoff)
            return cutoff
        except Exception:
            log.exception("reconciliation_fetch_cutoff_failed")
            return {}

    # ------------------------------------------------------------------
    # Historical boundary
    # ------------------------------------------------------------------

    async def _fetch_historical_if_needed(
        self,
        cutoff: dict,
        *,
        orders: list[dict],
        fills: list[dict],
    ) -> None:
        """Merge historical fills when data spans the cutoff boundary.

        The ``cutoff`` dict is expected to contain a ``cutoff_ts`` (or
        similar key) indicating the boundary between live and historical
        tiers.  If a cutoff exists we pull historical fills and prepend
        any that are not already present in the live set.
        """
        cutoff_ts = cutoff.get("cutoff_ts") or cutoff.get("timestamp")
        if not cutoff_ts:
            return

        log.info("reconciliation_historical_merge", cutoff_ts=cutoff_ts)

        # Historical fills
        try:
            existing_fill_ids = {
                f.get("fill_id") or f.get("trade_id") for f in fills
            }
            hist_cursor: str | None = None
            while True:
                page, hist_cursor = (
                    await self.rest_client.get_historical_fills(
                        limit=_PAGE_LIMIT_FILLS, cursor=hist_cursor or None,
                    )
                )
                for hf in page:
                    fid = hf.get("fill_id") or hf.get("trade_id")
                    if fid and fid not in existing_fill_ids:
                        fills.append(hf)
                        existing_fill_ids.add(fid)
                if not hist_cursor:
                    break
        except Exception:
            log.exception("reconciliation_historical_fills_failed")

    # ------------------------------------------------------------------
    # Comparison / repair helpers
    # ------------------------------------------------------------------

    async def _reconcile_orders(self, api_orders: list[dict]) -> None:
        """Compare API orders with cached orders and repair drift."""
        cached_orders = self.state_cache.get_orders()
        api_order_map: dict[str, dict] = {}
        for o in api_orders:
            oid = o.get("order_id", "")
            if oid:
                api_order_map[oid] = o

        # Detect orders present in API but missing/stale in cache
        for oid, api_order in api_order_map.items():
            cached = cached_orders.get(oid)
            if cached is None:
                self._record_drift("order_missing_in_cache", oid)
                await self.state_cache.update_order(oid, api_order)
            elif _order_differs(cached, api_order):
                self._record_drift("order_stale_in_cache", oid)
                await self.state_cache.update_order(oid, api_order)

        # Detect resting orders in cache that are gone from the API
        for oid, cached in cached_orders.items():
            status = (
                cached.status if hasattr(cached, "status") else
                cached.get("status", "")  # type: ignore[union-attr]
            )
            if status == "resting" and oid not in api_order_map:
                self._record_drift("order_removed_from_api", oid)
                # Mark the stale resting order as canceled in cache
                updated = dict(cached) if isinstance(cached, dict) else cached.model_dump()
                updated["status"] = "canceled"
                await self.state_cache.update_order(oid, updated)

    async def _reconcile_fills(self, api_fills: list[dict]) -> None:
        """Compare API fills with cached fills and repair drift."""
        cached_fills = self.state_cache.get_fills()
        cached_fill_ids = {
            (f.fill_id if hasattr(f, "fill_id") else f.get("fill_id", ""))
            for f in cached_fills
        }

        new_count = 0
        for af in api_fills:
            fid = af.get("fill_id", "")
            if fid and fid not in cached_fill_ids:
                new_count += 1
                await self.state_cache.add_fill(af)

        if new_count:
            self._record_drift("fills_missing_in_cache", f"{new_count} fills")

    async def _reconcile_positions(self, api_positions: list[dict]) -> None:
        """Compare API positions with cached positions and repair drift."""
        cached_positions = self.state_cache.get_positions()
        api_pos_map: dict[str, dict] = {}
        for p in api_positions:
            ticker = p.get("ticker", "")
            if ticker:
                api_pos_map[ticker] = p

        for ticker, api_pos in api_pos_map.items():
            cached = cached_positions.get(ticker)
            if cached is None or cached != api_pos:
                self._record_drift("position_drift", ticker)
                await self.state_cache.update_position(ticker, api_pos)

        # Remove positions from cache that no longer exist in the API
        for ticker in cached_positions:
            if ticker not in api_pos_map:
                self._record_drift("position_removed_from_api", ticker)
                await self.state_cache.update_position(ticker, {
                    "ticker": ticker,
                    "market_exposure": "0",
                    "position": "0",
                    "realized_pnl_dollars": "0",
                    "total_traded_fp": "0",
                })

    async def _reconcile_balance(self, api_balance: dict) -> None:
        """Compare API balance with cached balance and repair drift."""
        cached_balance = self.state_cache.get_balance()
        if cached_balance != api_balance:
            self._record_drift(
                "balance_drift",
                f"cached={cached_balance!r} api={api_balance!r}",
            )
            await self.state_cache.update_balance(api_balance)

    # ------------------------------------------------------------------
    # Internal utilities
    # ------------------------------------------------------------------

    def _record_drift(self, drift_type: str, detail: str) -> None:
        """Mark that drift was found and append a detail entry."""
        self._drift_detected = True
        entry = {"type": drift_type, "detail": detail}
        self._drift_details.append(entry)
        log.warning("reconciliation_drift", **entry)


# ---------------------------------------------------------------------------
# Module-level helpers
# ---------------------------------------------------------------------------


def _order_differs(cached: Any, api_order: dict) -> bool:
    """Return ``True`` if the cached order diverges from the API copy."""
    if hasattr(cached, "model_dump"):
        cached_dict = cached.model_dump(mode="json")
    elif isinstance(cached, dict):
        cached_dict = cached
    else:
        return True

    for key in ("status", "fill_count_fp", "remaining_count_fp"):
        if str(cached_dict.get(key, "")) != str(api_order.get(key, "")):
            return True
    return False
