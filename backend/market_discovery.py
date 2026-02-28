"""market_discovery.py — Market Discovery System.

Paginates the full Kalshi /markets list via REST, stores discovered markets
in the database, populates the local cache, and drives WebSocket subscriptions.

- Runs at startup and every DISCOVERY_INTERVAL seconds thereafter.
- Subscribes new open markets to the WebSocket.
- Marks expired/settled markets as INACTIVE.
- Robustly handles cursor expiry and transient REST failures.
- BTC recurring series are discovered regardless of their position in the list
  (pagination must reach past index 40,000).
"""
from __future__ import annotations

import asyncio
import logging
from typing import Optional

from kalshi.rest_client import KalshiRestClient
from kalshi.websocket_client import KalshiWebSocketClient
from market_cache import MarketCache
from persistence.database import Database

logger = logging.getLogger(__name__)

DISCOVERY_INTERVAL = 300        # seconds between full rediscovery runs
_PAGE_LIMIT = 1000              # max records per REST page
_WS_CHANNELS = ["ticker", "orderbook_delta", "trade", "market_lifecycle"]

# Internal market states
STATE_ACTIVE = "ACTIVE"
STATE_WATCHLIST = "WATCHLIST"
STATE_INACTIVE = "INACTIVE"
STATE_IGNORED = "IGNORED"

_KALSHI_STATUS_TO_INTERNAL = {
    "open": STATE_ACTIVE,
    "active": STATE_ACTIVE,
    "closed": STATE_INACTIVE,
    "settled": STATE_INACTIVE,
    "halted": STATE_WATCHLIST,
    "finalized": STATE_INACTIVE,
}


class MarketDiscovery:
    """Discovers all Kalshi markets and manages their lifecycle state."""

    def __init__(
        self,
        rest_client: KalshiRestClient,
        ws_client: KalshiWebSocketClient,
        cache: MarketCache,
        db: Optional[Database],
    ) -> None:
        self._rest = rest_client
        self._ws = ws_client
        self._cache = cache
        self._db = db
        self._env = rest_client._env
        self._running = False

        # Tickers we have already subscribed to avoid redundant subscribe calls
        self._subscribed: set[str] = set()
        self._total_discovered = 0

    @property
    def total_discovered(self) -> int:
        return self._total_discovered

    async def start(self) -> None:
        """Run discovery at startup and on a periodic interval."""
        self._running = True
        while self._running:
            try:
                await self._run_discovery()
            except Exception as exc:
                logger.error("Market discovery error", extra={"error": str(exc)}, exc_info=True)
            await asyncio.sleep(DISCOVERY_INTERVAL)

    async def stop(self) -> None:
        self._running = False

    async def run_once(self) -> None:
        """Run a single discovery pass (used at startup before the loop starts)."""
        await self._run_discovery()

    # ── Core discovery logic ──────────────────────────────────────────────────

    async def _run_discovery(self) -> None:
        if not self._rest.is_configured():
            logger.info("Market discovery skipped — REST client not configured.")
            return

        logger.info("Market discovery starting full scan.")
        count = 0
        cursor: Optional[str] = None

        while True:
            params: dict = {"limit": _PAGE_LIMIT}
            if cursor:
                params["cursor"] = cursor

            try:
                response = await self._rest.get_markets(**params)
            except Exception as exc:
                logger.error("REST /markets page failed", extra={"error": str(exc)})
                # Back off and retry this page
                await asyncio.sleep(5)
                continue

            markets = response.get("markets", [])
            if not markets:
                break

            for market in markets:
                await self._process_market(market)
                count += 1

            # Yield control periodically so we don't starve the event loop
            await asyncio.sleep(0)

            cursor = response.get("cursor")
            if not cursor:
                break   # All pages consumed

        self._total_discovered = count
        logger.info("Market discovery complete", extra={"total": count, "subscribed": len(self._subscribed)})

    async def _process_market(self, market: dict) -> None:
        """Evaluate a single market and decide its internal state."""
        ticker = market.get("ticker")
        if not ticker:
            return

        kalshi_status = (market.get("status") or "").lower()
        internal_state = _KALSHI_STATUS_TO_INTERNAL.get(kalshi_status, STATE_INACTIVE)

        # Populate local cache (metadata + initial prices)
        await self._cache.upsert_from_discovery(market)

        # Persist to database (fire-and-forget)
        if self._db:
            asyncio.create_task(self._persist_market(market, internal_state))

        # Subscribe active/watchlist markets to WebSocket
        if internal_state in (STATE_ACTIVE, STATE_WATCHLIST):
            await self._ensure_subscribed(ticker)
        else:
            # Unsubscribe markets that have gone inactive
            if ticker in self._subscribed:
                self._subscribed.discard(ticker)
                await self._ws.unsubscribe(_WS_CHANNELS, [ticker])

    async def _ensure_subscribed(self, ticker: str) -> None:
        if ticker in self._subscribed:
            return
        self._subscribed.add(ticker)
        await self._ws.subscribe(_WS_CHANNELS, [ticker])

    async def _persist_market(self, market: dict, internal_state: str) -> None:
        """Upsert market record in the database."""
        try:
            await self._db.upsert_market(market, internal_state, self._env)
        except Exception as exc:
            logger.warning("Failed to persist market", extra={"ticker": market.get("ticker"), "error": str(exc)})
