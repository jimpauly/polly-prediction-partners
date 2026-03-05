"""Agent Praxis — sports market specialist.

Strategy: filter to sports-related markets and apply a momentum/volume
strategy.  Track recent price movement direction and volume trends to
generate YES or NO signals when momentum and volume align.

"This one only goes for the markets that are sports."
"It's going to get really good at sports."
"""

from __future__ import annotations

import time
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

import structlog

from backend.models.schemas import AgentState, Market, TradeIntent
from backend.services.state_cache import StateCache

logger = structlog.get_logger(__name__)


class AgentPraxis:
    """Sports-focused momentum/volume trading agent.

    Filters the market universe to sports events, then watches price
    direction and volume trends.  When price momentum and rising volume
    agree, a trade signal is generated.
    """

    def __init__(self, state_cache: StateCache) -> None:
        self.agent_name = "praxis"
        self.state_cache = state_cache

        self.sports_keywords: list[str] = [
            "nfl", "nba", "mlb", "nhl", "soccer", "football", "basketball",
            "baseball", "hockey", "tennis", "golf", "ufc", "mma", "boxing",
            "sports", "ncaa", "college", "championship", "playoff",
            "super-bowl", "world-series", "stanley-cup", "finals",
        ]

        # Rolling history keyed by ticker
        self.price_history: dict[str, list[tuple[float, str]]] = {}
        self.volume_history: dict[str, list[tuple[float, str]]] = {}
        self.lookback_periods = 10
        self.min_volume_threshold = "100.00"

        # Win/loss tracking
        self.total_trades = 0
        self.win_count = 0
        self.loss_count = 0
        self.realized_pnl = Decimal("0")

    # ------------------------------------------------------------------
    # Sports filter
    # ------------------------------------------------------------------

    def is_sports_market(
        self, ticker: str, market: Market | None = None,
    ) -> bool:
        """Return ``True`` if *ticker* (or its associated market) relates
        to a sports event."""
        haystack = ticker.lower()
        if market is not None:
            haystack = " ".join([
                haystack,
                market.event_ticker.lower(),
                market.yes_sub_title.lower(),
                market.no_sub_title.lower(),
            ])
        return any(kw in haystack for kw in self.sports_keywords)

    # ------------------------------------------------------------------
    # Market-data ingestion
    # ------------------------------------------------------------------

    async def on_market_update(self, ticker: str, market_data: dict) -> None:
        """Process a market update and append price/volume to history.

        Parameters
        ----------
        ticker:
            Market ticker.
        market_data:
            Dict with at least ``yes_bid_dollars`` and one of
            ``volume_fp`` / ``volume_24h_fp``.
        """
        now = time.time()

        yes_bid = market_data.get("yes_bid_dollars", "")
        if yes_bid:
            self.price_history.setdefault(ticker, []).append((now, yes_bid))
            # Keep only the most recent data points
            if len(self.price_history[ticker]) > self.lookback_periods * 2:
                self.price_history[ticker] = self.price_history[ticker][
                    -self.lookback_periods * 2 :
                ]

        volume = market_data.get("volume_fp") or market_data.get(
            "volume_24h_fp", "",
        )
        if volume:
            self.volume_history.setdefault(ticker, []).append((now, volume))
            if len(self.volume_history[ticker]) > self.lookback_periods * 2:
                self.volume_history[ticker] = self.volume_history[ticker][
                    -self.lookback_periods * 2 :
                ]

        logger.debug(
            "praxis.on_market_update",
            ticker=ticker,
            yes_bid=yes_bid,
            volume=volume,
            price_points=len(self.price_history.get(ticker, [])),
            volume_points=len(self.volume_history.get(ticker, [])),
        )

    # ------------------------------------------------------------------
    # Evaluation
    # ------------------------------------------------------------------

    async def evaluate(self, ticker: str) -> TradeIntent | None:
        """Evaluate a sports market for momentum/volume trade signals.

        Logic
        -----
        1. Confirm the market is sports-related.
        2. Require at least ``lookback_periods`` price and volume data
           points.
        3. Require volume above ``min_volume_threshold``.
        4. Compute price direction (positive = up, negative = down) and
           volume trend (rising or falling).
        5. If price trending up *and* volume rising → YES signal.
        6. If price trending down *and* volume rising → NO signal.
        7. Otherwise → no signal.
        """
        market = self.state_cache.get_market(ticker)
        if not self.is_sports_market(ticker, market):
            return None

        prices = self.price_history.get(ticker, [])
        volumes = self.volume_history.get(ticker, [])

        if (
            len(prices) < self.lookback_periods
            or len(volumes) < self.lookback_periods
        ):
            logger.debug(
                "praxis.evaluate.skip",
                ticker=ticker,
                reason="insufficient_data",
                price_points=len(prices),
                volume_points=len(volumes),
                required=self.lookback_periods,
            )
            return None

        # Use most recent lookback slice
        recent_prices = prices[-self.lookback_periods :]
        recent_volumes = volumes[-self.lookback_periods :]

        # --- Volume threshold check ---
        latest_volume = Decimal(recent_volumes[-1][1] or "0")
        if latest_volume < Decimal(self.min_volume_threshold):
            logger.debug(
                "praxis.evaluate.skip",
                ticker=ticker,
                reason="low_volume",
                volume=str(latest_volume),
                threshold=self.min_volume_threshold,
            )
            return None

        # --- Price direction (simple linear comparison) ---
        first_price = Decimal(recent_prices[0][1] or "0")
        last_price = Decimal(recent_prices[-1][1] or "0")
        price_delta = last_price - first_price

        # --- Volume trend (compare first half avg to second half avg) ---
        mid = self.lookback_periods // 2
        first_half_vol = sum(
            Decimal(v[1] or "0") for v in recent_volumes[:mid]
        ) / max(mid, 1)
        second_half_vol = sum(
            Decimal(v[1] or "0") for v in recent_volumes[mid:]
        ) / max(self.lookback_periods - mid, 1)
        volume_rising = second_half_vol > first_half_vol

        if not volume_rising:
            logger.debug(
                "praxis.evaluate.no_signal",
                ticker=ticker,
                reason="volume_not_rising",
                first_half_vol=str(first_half_vol),
                second_half_vol=str(second_half_vol),
            )
            return None

        if price_delta > 0:
            side = "yes"
            reasoning = (
                f"Sports momentum signal: price up {price_delta} with "
                f"rising volume for {ticker}"
            )
            price = (market.yes_ask_dollars if market else "") or str(last_price)
            pattern = f"momentum_up_{price_delta}"
        elif price_delta < 0:
            side = "no"
            reasoning = (
                f"Sports momentum signal: price down {price_delta} with "
                f"rising volume for {ticker}"
            )
            price = (market.no_ask_dollars if market else "") or str(last_price)
            pattern = f"momentum_down_{price_delta}"
        else:
            logger.debug(
                "praxis.evaluate.no_signal",
                ticker=ticker,
                reason="flat_price",
            )
            return None

        timestamp = int(time.time())
        intent = TradeIntent(
            agent_name=self.agent_name,
            ticker=ticker,
            side=side,
            action="buy",
            count_fp="1.00",
            price_dollars=price,
            reasoning=reasoning,
            pattern_detected=pattern,
        )

        logger.info(
            "praxis.evaluate.signal",
            ticker=ticker,
            side=side,
            price_delta=str(price_delta),
            volume_rising=volume_rising,
            client_order_id=f"praxis-{ticker}-{timestamp}",
        )
        return intent

    async def evaluate_all_markets(self) -> list[TradeIntent]:
        """Evaluate all subscribed sports markets and return intents."""
        subscribed = self.state_cache.get_subscribed_markets()
        intents: list[TradeIntent] = []

        for ticker in subscribed:
            intent = await self.evaluate(ticker)
            if intent is not None:
                intents.append(intent)

        logger.info(
            "praxis.evaluate_all",
            markets_checked=len(subscribed),
            signals_generated=len(intents),
        )
        return intents

    # ------------------------------------------------------------------
    # Outcome tracking
    # ------------------------------------------------------------------

    async def record_outcome(self, won: bool, pnl: Decimal | str = "0") -> None:
        """Record the outcome of an executed trade for stats tracking."""
        self.total_trades += 1
        if won:
            self.win_count += 1
        else:
            self.loss_count += 1
        self.realized_pnl += Decimal(str(pnl))

        await self.state_cache.update_agent_state(
            self.agent_name,
            AgentState(
                agent_name=self.agent_name,
                mode="auto",
                status="active",
                total_trades=self.total_trades,
                win_count=self.win_count,
                loss_count=self.loss_count,
                realized_pnl=self.realized_pnl,
                last_decision_time=datetime.now(timezone.utc),
            ),
        )

    # ------------------------------------------------------------------
    # Status
    # ------------------------------------------------------------------

    def get_status(self) -> dict[str, Any]:
        """Return current agent status for UI display."""
        win_rate = (
            round(self.win_count / self.total_trades * 100, 1)
            if self.total_trades > 0
            else 0.0
        )
        tracked_tickers = [
            ticker
            for ticker, pts in self.price_history.items()
            if len(pts) > 0
        ]
        return {
            "agent_name": self.agent_name,
            "strategy": "sports_momentum_volume",
            "lookback_periods": self.lookback_periods,
            "min_volume_threshold": self.min_volume_threshold,
            "sports_keywords": self.sports_keywords,
            "total_trades": self.total_trades,
            "win_count": self.win_count,
            "loss_count": self.loss_count,
            "win_rate": win_rate,
            "realized_pnl": str(self.realized_pnl),
            "tracked_tickers": tracked_tickers,
        }
