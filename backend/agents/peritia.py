"""agents/peritia.py — Agent Peritia.

BTC 15-minute recurring series specialist.

Strategy: orderbook imbalance signal.
- Focuses exclusively on markets whose series_ticker contains "BTC" and whose
  event/series implies a 15-minute frequency.
- On every market update, reads the full orderbook and recent trade history.
- Computes orderbook imbalance: (yes_bid_volume - no_bid_volume) / total_volume
- Positive imbalance → buy yes; negative imbalance → buy no.
- High-frequency: submits both buy and sell sides when imbalance is strong.
- Operates on all active BTC 15-min markets simultaneously.
"""
from __future__ import annotations

import logging
import time
from typing import Optional
from uuid import UUID, uuid4

from agents.base_agent import BaseAgent
from market_cache import MarketCache, MarketState
from trading.trade_intent import TradeIntent

logger = logging.getLogger(__name__)

_IMBALANCE_THRESHOLD = 0.15   # minimum abs imbalance to trade (15%)
_DEFAULT_COUNT = 1
_COOLDOWN_MS = 5_000          # ms between orders on the same market (high-frequency guard)

# Series/ticker patterns that identify BTC 15-min recurring markets
_BTC_KEYWORDS = ("BTC", "BITCOIN")
_FREQ_KEYWORDS = ("15", "15MIN", "15M")


def _is_btc_15min(state: MarketState) -> bool:
    """Heuristically identify BTC 15-minute markets."""
    ticker_upper = state.market_ticker.upper()
    series_upper = state.series_ticker.upper()
    event_upper = state.event_ticker.upper()

    has_btc = any(kw in ticker_upper or kw in series_upper or kw in event_upper for kw in _BTC_KEYWORDS)
    has_15m = any(kw in ticker_upper or kw in series_upper or kw in event_upper for kw in _FREQ_KEYWORDS)
    return has_btc and has_15m


class AgentPeritia(BaseAgent):
    """BTC 15-min orderbook imbalance specialist agent."""

    def __init__(
        self,
        agent_id: UUID,
        cache: MarketCache,
        permission_layer,
        broadcaster=None,
    ) -> None:
        super().__init__(
            agent_id=agent_id,
            agent_name="AgentPeritia",
            cache=cache,
            permission_layer=permission_layer,
            broadcaster=broadcaster,
        )
        # Per-market cooldown tracking: ticker → last_order_ts_ms
        self._last_order_ms: dict[str, int] = {}

    async def on_market_update(self) -> None:
        """Scan all BTC 15-min markets and emit orders on strong imbalance."""
        markets = await self._cache.get_all()

        for ticker, state in markets.items():
            if state.market_status != "open":
                continue
            if not _is_btc_15min(state):
                continue

            await self._evaluate_market(state)

    async def _evaluate_market(self, state: MarketState) -> None:
        """Compute orderbook imbalance and generate intents."""
        # Cooldown check
        now_ms = int(time.time() * 1000)
        last = self._last_order_ms.get(state.market_ticker, 0)
        if (now_ms - last) < _COOLDOWN_MS:
            return

        imbalance = self._compute_imbalance(state)
        if imbalance is None:
            return

        abs_imbalance = abs(imbalance)
        if abs_imbalance < _IMBALANCE_THRESHOLD:
            return

        confidence = min(1.0, abs_imbalance)

        if imbalance > 0:
            # More yes-bid volume → buy yes
            side = "yes"
            price = state.yes_bid + 1 if state.yes_bid < 98 else state.yes_bid
            action = "buy"
        else:
            # More no-bid volume → buy no
            side = "no"
            price = state.no_bid + 1 if state.no_bid < 98 else state.no_bid
            action = "buy"

        price = max(1, min(99, price))

        self._last_order_ms[state.market_ticker] = now_ms

        intent = TradeIntent(
            agent_id=self.agent_id,
            client_order_id=uuid4(),
            market_ticker=state.market_ticker,
            action=action,
            side=side,
            order_type="limit",
            price=price,
            count=_DEFAULT_COUNT,
            confidence=confidence,
        )

        logger.info(
            "AgentPeritia generating TradeIntent",
            extra={
                "ticker": state.market_ticker,
                "side": side,
                "price": price,
                "imbalance": round(imbalance, 4),
                "confidence": round(confidence, 3),
            },
        )

        if self._broadcaster:
            await self._broadcaster.broadcast({
                "type": "agent_decision",
                "agent_id": str(self.agent_id),
                "agent_name": self.agent_name,
                "ticker": state.market_ticker,
                "side": side,
                "price": price,
                "imbalance": round(imbalance, 4),
                "confidence": round(confidence, 3),
            })

        await self._permission.submit(intent)

    def _compute_imbalance(self, state: MarketState) -> Optional[float]:
        """Compute (yes_bid_vol - no_bid_vol) / total_vol from the orderbook.

        Returns a value in [-1, 1] or None if no orderbook data is available.
        Positive = yes-side heavier; negative = no-side heavier.
        """
        if not state.orderbook:
            # Fall back to top-of-book quantities if full orderbook is absent
            yes_vol = state.yes_bid
            no_vol = state.no_bid
        else:
            yes_vol = sum(state.orderbook.get("yes", {}).values())
            no_vol = sum(state.orderbook.get("no", {}).values())

        total = yes_vol + no_vol
        if total == 0:
            return None

        return (yes_vol - no_vol) / total
