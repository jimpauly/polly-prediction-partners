"""Agent Prime — majority-signal follower.

Strategy: track buy/sell volume from other traders within a rolling 1-minute
window and place bets aligned with whichever side the majority is trading.
The idea is that group consensus of a market tends toward the most accurate
answer.
"""

from __future__ import annotations

import time
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

import structlog

from backend.models.schemas import AgentState, TradeIntent
from backend.services.state_cache import StateCache

logger = structlog.get_logger(__name__)


class AgentPrime:
    """Majority-signal trading agent.

    Watches total buy and sell volume within each minute and places bets
    aligned with whichever side the majority is trading in that window.
    """

    def __init__(self, state_cache: StateCache) -> None:
        self.agent_name = "prime"
        self.state_cache = state_cache
        self.trade_window_seconds = 60  # 1-minute rolling window
        self.recent_trades: dict[str, list[dict[str, Any]]] = {}
        self.min_trade_count = 5  # minimum trades in window to generate signal
        self.confidence_threshold = 0.6  # >60% one-directional = signal

        # Win/loss tracking
        self.total_trades = 0
        self.win_count = 0
        self.loss_count = 0
        self.realized_pnl = Decimal("0")

    # ------------------------------------------------------------------
    # Trade ingestion
    # ------------------------------------------------------------------

    async def on_trade(self, ticker: str, trade_data: dict) -> None:
        """Process incoming trade data and update rolling window.

        Parameters
        ----------
        ticker:
            Market ticker the trade belongs to.
        trade_data:
            Must contain at least ``side`` (``"yes"`` | ``"no"``) and
            ``count`` (numeric trade size).  An optional ``timestamp``
            field is used when present; otherwise ``time.time()`` is
            recorded.
        """
        entry = {
            "timestamp": trade_data.get("timestamp", time.time()),
            "side": trade_data["side"],
            "count": float(trade_data.get("count", 1)),
        }

        if ticker not in self.recent_trades:
            self.recent_trades[ticker] = []
        self.recent_trades[ticker].append(entry)

        self._clean_old_trades(ticker)

        logger.debug(
            "prime.on_trade",
            ticker=ticker,
            side=entry["side"],
            count=entry["count"],
            window_size=len(self.recent_trades.get(ticker, [])),
        )

    # ------------------------------------------------------------------
    # Evaluation
    # ------------------------------------------------------------------

    async def evaluate(self, ticker: str) -> TradeIntent | None:
        """Evaluate a market and return a ``TradeIntent`` if the signal is
        strong enough.

        Logic
        -----
        1. Look at trades in the last 60 seconds for this ticker.
        2. Sum buy (yes) volume vs sell (no) volume.
        3. If buy_volume / total_volume > confidence_threshold → signal YES.
        4. If sell_volume / total_volume > confidence_threshold → signal NO.
        5. Otherwise → no signal (return ``None``).
        6. Generate ``TradeIntent`` with reasoning.
        """
        self._clean_old_trades(ticker)
        trades = self.recent_trades.get(ticker, [])

        if len(trades) < self.min_trade_count:
            logger.debug(
                "prime.evaluate.skip",
                ticker=ticker,
                reason="insufficient_trades",
                trade_count=len(trades),
                min_required=self.min_trade_count,
            )
            return None

        yes_volume = sum(t["count"] for t in trades if t["side"] == "yes")
        no_volume = sum(t["count"] for t in trades if t["side"] == "no")
        total_volume = yes_volume + no_volume

        if total_volume == 0:
            return None

        yes_ratio = yes_volume / total_volume
        no_ratio = no_volume / total_volume

        # Determine price from state cache (best ask for the chosen side)
        market = self.state_cache.get_market(ticker)

        if yes_ratio >= self.confidence_threshold:
            side = "yes"
            pct = round(yes_ratio * 100, 1)
            price = (market.yes_ask_dollars if market else "") or "0.50"
            reasoning = (
                f"Majority buy signal: {pct}% buy volume in last "
                f"{self.trade_window_seconds}s for {ticker}"
            )
        elif no_ratio >= self.confidence_threshold:
            side = "no"
            pct = round(no_ratio * 100, 1)
            price = (market.no_ask_dollars if market else "") or "0.50"
            reasoning = (
                f"Majority sell signal: {pct}% sell volume in last "
                f"{self.trade_window_seconds}s for {ticker}"
            )
        else:
            logger.debug(
                "prime.evaluate.no_signal",
                ticker=ticker,
                yes_ratio=round(yes_ratio, 3),
                no_ratio=round(no_ratio, 3),
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
            pattern_detected=f"majority_{side}_{pct}pct",
        )

        logger.info(
            "prime.evaluate.signal",
            ticker=ticker,
            side=side,
            confidence=pct,
            client_order_id=f"prime-{ticker}-{timestamp}",
        )
        return intent

    async def evaluate_all_markets(self) -> list[TradeIntent]:
        """Evaluate all subscribed markets and return trade intents."""
        subscribed = self.state_cache.get_subscribed_markets()
        intents: list[TradeIntent] = []

        for ticker in subscribed:
            intent = await self.evaluate(ticker)
            if intent is not None:
                intents.append(intent)

        logger.info(
            "prime.evaluate_all",
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
    # Internal helpers
    # ------------------------------------------------------------------

    def _clean_old_trades(self, ticker: str) -> None:
        """Remove trades older than ``trade_window_seconds``."""
        if ticker not in self.recent_trades:
            return
        cutoff = time.time() - self.trade_window_seconds
        self.recent_trades[ticker] = [
            t for t in self.recent_trades[ticker] if t["timestamp"] >= cutoff
        ]

    # ------------------------------------------------------------------
    # Status
    # ------------------------------------------------------------------

    def get_status(self) -> dict:
        """Return current agent status for UI display."""
        win_rate = (
            round(self.win_count / self.total_trades * 100, 1)
            if self.total_trades > 0
            else 0.0
        )
        active_tickers = [
            ticker
            for ticker, trades in self.recent_trades.items()
            if len(trades) > 0
        ]
        return {
            "agent_name": self.agent_name,
            "strategy": "majority_signal_follower",
            "trade_window_seconds": self.trade_window_seconds,
            "min_trade_count": self.min_trade_count,
            "confidence_threshold": self.confidence_threshold,
            "total_trades": self.total_trades,
            "win_count": self.win_count,
            "loss_count": self.loss_count,
            "win_rate": win_rate,
            "realized_pnl": str(self.realized_pnl),
            "active_tickers": active_tickers,
        }
