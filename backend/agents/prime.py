"""agents/prime.py — Agent Prime.

Strategy: majority signal / volume direction.
- Watches total buy (taker_side="yes") vs sell (taker_side="no") trade volume
  accumulated within each 60-second window across all open markets.
- At the end of each window, identifies which side dominates.
- Places limit orders aligned with the majority side on the top N markets
  (ranked by volume in the current window).
- Operates on all open markets.
"""
from __future__ import annotations

import asyncio
import logging
import time
from collections import defaultdict
from typing import Optional
from uuid import UUID, uuid4

from agents.base_agent import BaseAgent
from market_cache import MarketCache, MarketState
from trading.trade_intent import TradeIntent

logger = logging.getLogger(__name__)

_WINDOW_SECONDS = 60     # aggregate volume over this rolling window
_TOP_N_MARKETS = 5       # trade the N highest-volume markets per window
_DEFAULT_COUNT = 1       # contracts per order
_MIN_CONFIDENCE = 0.55   # minimum directional confidence to trade


class AgentPrime(BaseAgent):
    """Majority-signal volume direction agent.

    Reads the `recent_trades` deque from each market in the cache, aggregates
    buy vs sell volume over the last WINDOW_SECONDS, and submits limit orders
    aligned with the dominant side.
    """

    def __init__(
        self,
        agent_id: UUID,
        cache: MarketCache,
        permission_layer,
        broadcaster=None,
    ) -> None:
        super().__init__(
            agent_id=agent_id,
            agent_name="AgentPrime",
            cache=cache,
            permission_layer=permission_layer,
            broadcaster=broadcaster,
        )
        # Rolling window state: market_ticker → {"yes_vol": int, "no_vol": int}
        self._window_start = time.time()
        self._volume_window: dict[str, dict[str, int]] = defaultdict(lambda: {"yes_vol": 0, "no_vol": 0})
        self._last_trade_ts: dict[str, int] = {}   # last trade ts processed per market

    async def on_market_update(self) -> None:
        """Aggregate trade volume and submit orders at window boundaries."""
        now = time.time()
        markets = await self._cache.get_all()

        self._accumulate_trades(markets, now)

        # Check if window has elapsed
        if now - self._window_start < _WINDOW_SECONDS:
            return

        # Window complete — evaluate and trade
        await self._evaluate_and_trade(markets)
        # Reset window
        self._window_start = now
        self._volume_window.clear()

    def _accumulate_trades(self, markets: dict[str, MarketState], now: float) -> None:
        """Scan recent_trades on each open market and bucket by side."""
        cutoff_ms = int((now - _WINDOW_SECONDS) * 1000)
        for ticker, state in markets.items():
            if state.market_status != "open":
                continue
            last_seen = self._last_trade_ts.get(ticker, 0)
            for trade in state.recent_trades:
                ts = trade.get("ts", 0)
                if ts <= last_seen or ts < cutoff_ms:
                    continue
                count = trade.get("count", 1)
                taker_side = trade.get("taker_side", "")
                if taker_side == "yes":
                    self._volume_window[ticker]["yes_vol"] += count
                elif taker_side == "no":
                    self._volume_window[ticker]["no_vol"] += count
            if state.recent_trades:
                self._last_trade_ts[ticker] = max(
                    t.get("ts", 0) for t in state.recent_trades
                )

    async def _evaluate_and_trade(self, markets: dict[str, MarketState]) -> None:
        """Identify top-N markets by volume and place aligned limit orders."""
        # Sort by total window volume descending
        ranked = sorted(
            [
                (ticker, data)
                for ticker, data in self._volume_window.items()
                if (data["yes_vol"] + data["no_vol"]) > 0
            ],
            key=lambda x: x[1]["yes_vol"] + x[1]["no_vol"],
            reverse=True,
        )

        for ticker, vol_data in ranked[:_TOP_N_MARKETS]:
            state = markets.get(ticker)
            if not state or state.market_status != "open":
                continue

            yes_vol = vol_data["yes_vol"]
            no_vol = vol_data["no_vol"]
            total = yes_vol + no_vol
            if total == 0:
                continue

            yes_frac = yes_vol / total
            no_frac = no_vol / total

            if yes_frac >= _MIN_CONFIDENCE:
                side = "yes"
                price = state.yes_bid + 1 if state.yes_bid < 98 else state.yes_bid
                confidence = yes_frac
            elif no_frac >= _MIN_CONFIDENCE:
                side = "no"
                price = state.no_bid + 1 if state.no_bid < 98 else state.no_bid
                confidence = no_frac
            else:
                continue   # no clear majority

            price = max(1, min(99, price))

            intent = TradeIntent(
                agent_id=self.agent_id,
                client_order_id=uuid4(),
                market_ticker=ticker,
                action="buy",
                side=side,
                order_type="limit",
                price=price,
                count=_DEFAULT_COUNT,
                confidence=confidence,
            )

            logger.info(
                "AgentPrime generating TradeIntent",
                extra={"ticker": ticker, "side": side, "price": price, "confidence": round(confidence, 3)},
            )

            if self._broadcaster:
                await self._broadcaster.broadcast({
                    "type": "agent_decision",
                    "agent_id": str(self.agent_id),
                    "agent_name": self.agent_name,
                    "ticker": ticker,
                    "side": side,
                    "price": price,
                    "confidence": round(confidence, 3),
                })

            await self._permission.submit(intent)
