"""market_cache.py — Local Market Cache.

Single source of truth for all subscribed market states.
Updated exclusively by the WebSocket message dispatcher.
Agents and the Control API only read from here.

Key design points:
- dict keyed by market_ticker, protected by asyncio.Lock.
- Derived fields (spread, midpoint, implied_probability) computed on every write.
- recent_trades is a bounded deque (last 100 trades per market).
- Notifies waiting agents via asyncio.Event on each update.
- Supports at least 40,000 markets simultaneously.
"""
from __future__ import annotations

import asyncio
import logging
from collections import deque
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class MarketState:
    market_ticker: str
    event_ticker: str
    series_ticker: str
    market_status: str              # "open", "closed", "settled", "halted"
    yes_bid: int                    # direct from API, cents
    no_bid: int                     # direct from API, cents
    yes_ask: int                    # derived: 100 - no_bid
    no_ask: int                     # derived: 100 - yes_bid
    last_price: int
    volume: int
    open_interest: int
    spread: int                     # derived: yes_ask - yes_bid
    midpoint: float                 # derived: (yes_bid + yes_ask) / 2.0
    implied_probability: float      # derived: yes_bid / 100.0
    last_updated_timestamp: int     # unix millis
    orderbook: Optional[dict] = None
    recent_trades: deque = field(default_factory=lambda: deque(maxlen=100))


def _compute_derived(yes_bid: int, no_bid: int) -> tuple[int, int, int, float, float]:
    """Return (yes_ask, no_ask, spread, midpoint, implied_probability)."""
    yes_ask = 100 - no_bid
    no_ask = 100 - yes_bid
    spread = yes_ask - yes_bid
    midpoint = (yes_bid + yes_ask) / 2.0
    implied_probability = yes_bid / 100.0
    return yes_ask, no_ask, spread, midpoint, implied_probability


class MarketCache:
    """Thread-safe (asyncio) in-memory cache of MarketState objects.

    The update_notification Event is set every time any market is updated.
    Agents await this event to wake up without polling.
    """

    def __init__(self) -> None:
        self._cache: dict[str, MarketState] = {}
        self._lock = asyncio.Lock()
        # Broadcast: cleared and re-set on every write so agents can batch reads
        self.update_notification: asyncio.Event = asyncio.Event()

    # ── Reads ─────────────────────────────────────────────────────────────────

    async def get(self, market_ticker: str) -> Optional[MarketState]:
        async with self._lock:
            return self._cache.get(market_ticker)

    async def get_all(self) -> dict[str, MarketState]:
        """Return a shallow copy of the entire cache."""
        async with self._lock:
            return dict(self._cache)

    async def size(self) -> int:
        async with self._lock:
            return len(self._cache)

    # ── Writes (called by WebSocket dispatcher only) ──────────────────────────

    async def upsert_from_ticker(self, msg: dict) -> None:
        """Apply a `ticker` channel update to the cache."""
        ticker = msg.get("market_ticker")
        if not ticker:
            return

        yes_bid = msg.get("yes_bid", 0)
        no_bid = msg.get("no_bid", 0)

        # If ticker channel provides yes_ask directly, use it; otherwise derive.
        if "yes_ask" in msg:
            yes_ask = msg["yes_ask"]
            no_ask = 100 - yes_bid
        else:
            yes_ask, no_ask, _, _, _ = _compute_derived(yes_bid, no_bid)

        _, _, spread, midpoint, implied_prob = _compute_derived(yes_bid, no_bid)

        async with self._lock:
            existing = self._cache.get(ticker)
            if existing:
                existing.yes_bid = yes_bid
                existing.no_bid = no_bid
                existing.yes_ask = yes_ask
                existing.no_ask = no_ask
                existing.last_price = msg.get("last_price", existing.last_price)
                existing.volume = msg.get("volume", existing.volume)
                existing.open_interest = msg.get("open_interest", existing.open_interest)
                existing.spread = spread
                existing.midpoint = midpoint
                existing.implied_probability = implied_prob
                existing.last_updated_timestamp = msg.get("ts", existing.last_updated_timestamp)
            else:
                # First time we hear about this ticker via WS — create a minimal entry
                self._cache[ticker] = MarketState(
                    market_ticker=ticker,
                    event_ticker=msg.get("event_ticker", ""),
                    series_ticker=msg.get("series_ticker", ""),
                    market_status=msg.get("status", "open"),
                    yes_bid=yes_bid,
                    no_bid=no_bid,
                    yes_ask=yes_ask,
                    no_ask=no_ask,
                    last_price=msg.get("last_price", 0),
                    volume=msg.get("volume", 0),
                    open_interest=msg.get("open_interest", 0),
                    spread=spread,
                    midpoint=midpoint,
                    implied_probability=implied_prob,
                    last_updated_timestamp=msg.get("ts", 0),
                )

        self._notify()

    async def upsert_from_discovery(self, market_data: dict) -> None:
        """Create or refresh a MarketState from REST /markets response data."""
        ticker = market_data.get("ticker")
        if not ticker:
            return

        yes_bid = market_data.get("yes_bid", 0) or 0
        no_bid = market_data.get("no_bid", 0) or 0
        yes_ask, no_ask, spread, midpoint, implied_prob = _compute_derived(yes_bid, no_bid)

        async with self._lock:
            existing = self._cache.get(ticker)
            if existing:
                # Only refresh metadata — WS data takes priority for live fields
                existing.event_ticker = market_data.get("event_ticker", existing.event_ticker)
                existing.series_ticker = market_data.get("series_ticker", existing.series_ticker)
                existing.market_status = market_data.get("status", existing.market_status)
            else:
                self._cache[ticker] = MarketState(
                    market_ticker=ticker,
                    event_ticker=market_data.get("event_ticker", ""),
                    series_ticker=market_data.get("series_ticker", ""),
                    market_status=market_data.get("status", "open"),
                    yes_bid=yes_bid,
                    no_bid=no_bid,
                    yes_ask=yes_ask,
                    no_ask=no_ask,
                    last_price=market_data.get("last_price", 0) or 0,
                    volume=market_data.get("volume", 0) or 0,
                    open_interest=market_data.get("open_interest", 0) or 0,
                    spread=spread,
                    midpoint=midpoint,
                    implied_probability=implied_prob,
                    last_updated_timestamp=0,
                )

    async def apply_orderbook_delta(self, msg: dict) -> None:
        """Apply an orderbook_delta snapshot or incremental update."""
        ticker = msg.get("market_ticker")
        if not ticker:
            return

        seq = msg.get("seq")
        yes_levels: list = msg.get("yes", [])
        no_levels: list = msg.get("no", [])

        async with self._lock:
            state = self._cache.get(ticker)
            if not state:
                return

            # seq == 1 or no existing orderbook → full snapshot
            is_snapshot = seq == 1 or state.orderbook is None
            if is_snapshot:
                state.orderbook = {
                    "yes": {int(p): int(q) for p, q in yes_levels},
                    "no": {int(p): int(q) for p, q in no_levels},
                    "seq": seq,
                }
            else:
                ob = state.orderbook
                for price, qty in yes_levels:
                    price, qty = int(price), int(qty)
                    if qty == 0:
                        ob["yes"].pop(price, None)
                    else:
                        ob["yes"][price] = qty
                for price, qty in no_levels:
                    price, qty = int(price), int(qty)
                    if qty == 0:
                        ob["no"].pop(price, None)
                    else:
                        ob["no"][price] = qty
                ob["seq"] = seq

            # Update best bid/ask from orderbook
            if state.orderbook:
                yes_bids = state.orderbook.get("yes", {})
                no_bids = state.orderbook.get("no", {})
                best_yes_bid = max(yes_bids.keys(), default=0)
                best_no_bid = max(no_bids.keys(), default=0)
                state.yes_bid = best_yes_bid
                state.no_bid = best_no_bid
                state.yes_ask = 100 - best_no_bid
                state.no_ask = 100 - best_yes_bid
                state.spread = state.yes_ask - state.yes_bid
                state.midpoint = (state.yes_bid + state.yes_ask) / 2.0
                state.implied_probability = state.yes_bid / 100.0

        self._notify()

    async def append_trade(self, msg: dict) -> None:
        """Append a public trade to the market's recent_trades buffer."""
        ticker = msg.get("market_ticker")
        if not ticker:
            return

        trade = {
            "yes_price": msg.get("yes_price", 0),
            "count": msg.get("count", 0),
            "taker_side": msg.get("taker_side", ""),
            "ts": msg.get("ts", 0),
        }

        async with self._lock:
            state = self._cache.get(ticker)
            if state:
                state.recent_trades.append(trade)

        self._notify()

    async def update_status(self, ticker: str, status: str) -> None:
        """Update a market's status from a market_lifecycle event."""
        async with self._lock:
            state = self._cache.get(ticker)
            if state:
                state.market_status = status
        self._notify()

    def _notify(self) -> None:
        """Signal all agents waiting for updates."""
        self.update_notification.set()
        # Immediately clear so the next update triggers a fresh wake-up cycle.
        # Agents must call asyncio.Event.wait(), then clear it themselves before
        # processing to avoid missing back-to-back updates.
        # We do NOT clear here — agents clear it after waking.
