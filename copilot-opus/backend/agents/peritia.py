"""Agent Peritia — candlestick pattern recognition specialist.

Strategy: scan BTC 15-minute recurring series markets for candlestick
patterns, confirm with volume trend (above/below 20-bar moving average),
and fall back to a simple SMA-20 crossover when no pattern is detected.

This is the *primary* agent of the system — its whole purpose is to get
really good at the 15-minute BTC price up/down yes/no recurring series,
and eventually expand to all crypto.
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

# Threshold for considering a candle body "small" relative to total range.
_DOJI_BODY_RATIO = Decimal("0.1")
# Minimum shadow-to-body ratio for hammer-family patterns.
_SHADOW_BODY_RATIO = Decimal("2")
# How close a marubozu open/close must be to high/low (fraction of range).
_MARUBOZU_WICK_RATIO = Decimal("0.05")


def _body(c: dict[str, Decimal]) -> Decimal:
    """Absolute body size of a candle."""
    return abs(c["close"] - c["open"])


def _range(c: dict[str, Decimal]) -> Decimal:
    """High-low range of a candle."""
    return c["high"] - c["low"]


def _is_bullish(c: dict[str, Decimal]) -> bool:
    return c["close"] > c["open"]


def _is_bearish(c: dict[str, Decimal]) -> bool:
    return c["close"] < c["open"]


def _upper_shadow(c: dict[str, Decimal]) -> Decimal:
    return c["high"] - max(c["open"], c["close"])


def _lower_shadow(c: dict[str, Decimal]) -> Decimal:
    return min(c["open"], c["close"]) - c["low"]


def _midpoint(c: dict[str, Decimal]) -> Decimal:
    return (c["open"] + c["close"]) / 2


class AgentPeritia:
    """Candlestick-pattern + volume-confirmation trading agent.

    Primary focus: BTC 15-min recurring series (``KXBTC``).  Expands to
    all crypto markets over time.
    """

    def __init__(self, state_cache: StateCache) -> None:
        self.agent_name = "peritia"
        self.state_cache = state_cache

        self.btc_keywords = ["btc", "bitcoin", "kxbtc"]
        self.crypto_keywords = [
            "btc", "bitcoin", "eth", "ethereum",
            "sol", "crypto", "kxbtc", "kxeth", "kxsol",
        ]

        # OHLCV history keyed by ticker
        self.candlestick_history: dict[str, list[dict[str, Any]]] = {}
        self.volume_history: dict[str, list[Decimal]] = {}

        # Strategy parameters
        self.sma_period = 20
        self.min_candles_for_signal = 3

        # Pattern performance tracking
        self.pattern_performance: dict[str, dict[str, int | bool]] = {}
        self.min_pattern_sample = 50
        self.min_pattern_accuracy = Decimal("0.45")

        # Win / loss tracking
        self.total_trades = 0
        self.win_count = 0
        self.loss_count = 0
        self.realized_pnl = Decimal("0")

    # ------------------------------------------------------------------
    # Market classification
    # ------------------------------------------------------------------

    def is_btc_market(self, ticker: str) -> bool:
        """Check if *ticker* belongs to a BTC recurring series market."""
        lower = ticker.lower()
        return any(kw in lower for kw in self.btc_keywords)

    def is_crypto_market(self, ticker: str) -> bool:
        """Check if *ticker* belongs to any crypto market."""
        lower = ticker.lower()
        return any(kw in lower for kw in self.crypto_keywords)

    # ------------------------------------------------------------------
    # Candle ingestion
    # ------------------------------------------------------------------

    async def on_candlestick_update(self, ticker: str, candle: dict) -> None:
        """Ingest a new OHLCV candlestick bar.

        Parameters
        ----------
        ticker:
            Market ticker.
        candle:
            Dict with ``open``, ``high``, ``low``, ``close`` as
            FixedPointDollars strings and ``volume`` as a numeric string.
        """
        parsed: dict[str, Any] = {
            "open": Decimal(candle["open"]) if candle.get("open") else Decimal(0),
            "high": Decimal(candle["high"]) if candle.get("high") else Decimal(0),
            "low": Decimal(candle["low"]) if candle.get("low") else Decimal(0),
            "close": Decimal(candle["close"]) if candle.get("close") else Decimal(0),
            "volume": Decimal(candle.get("volume", "0") or "0"),
            "timestamp": candle.get("end_period_ts", int(time.time())),
        }

        self.candlestick_history.setdefault(ticker, []).append(parsed)
        self.volume_history.setdefault(ticker, []).append(parsed["volume"])

        # Cap history to a reasonable window (100 bars)
        if len(self.candlestick_history[ticker]) > 100:
            self.candlestick_history[ticker] = self.candlestick_history[ticker][-100:]
        if len(self.volume_history[ticker]) > 100:
            self.volume_history[ticker] = self.volume_history[ticker][-100:]

        logger.debug(
            "peritia.candle_ingested",
            ticker=ticker,
            close=str(parsed["close"]),
            volume=str(parsed["volume"]),
            history_len=len(self.candlestick_history[ticker]),
        )

    # ------------------------------------------------------------------
    # SMA helper
    # ------------------------------------------------------------------

    @staticmethod
    def calculate_sma(values: list[Decimal], period: int) -> Decimal | None:
        """Return the Simple Moving Average over the last *period* values."""
        if len(values) < period:
            return None
        window = values[-period:]
        return sum(window) / period

    # ------------------------------------------------------------------
    # Volume confirmation
    # ------------------------------------------------------------------

    def check_volume_confirmation(self, ticker: str) -> bool:
        """Return ``True`` if the latest volume is above the 20-bar SMA."""
        volumes = self.volume_history.get(ticker, [])
        if len(volumes) < self.sma_period:
            return False
        sma = self.calculate_sma(volumes, self.sma_period)
        if sma is None or sma == 0:
            return False
        return volumes[-1] > sma

    # ------------------------------------------------------------------
    # Pattern detection — orchestrator
    # ------------------------------------------------------------------

    def detect_patterns(self, candles: list[dict]) -> list[tuple[str, str]]:
        """Detect candlestick patterns from recent OHLC data.

        Returns a list of ``(pattern_name, signal)`` tuples where *signal*
        is ``"bullish"`` or ``"bearish"``.
        """
        if len(candles) < self.min_candles_for_signal:
            return []

        detectors = [
            self._detect_hammer,
            self._detect_inverted_hammer,
            self._detect_shooting_star,
            self._detect_hanging_man,
            self._detect_engulfing,
            self._detect_morning_star,
            self._detect_evening_star,
            self._detect_doji,
            self._detect_marubozu,
            self._detect_three_white_soldiers,
            self._detect_three_black_crows,
            self._detect_piercing_line,
            self._detect_dark_cloud_cover,
            self._detect_harami,
            self._detect_abandoned_baby,
            self._detect_dragonfly_doji,
            self._detect_gravestone_doji,
            self._detect_long_legged_doji,
            self._detect_harami_cross,
            self._detect_evening_doji_star,
            self._detect_morning_doji_star,
            self._detect_spinning_top,
            self._detect_rising_three_methods,
            self._detect_falling_three_methods,
            self._detect_stick_sandwich,
            self._detect_upside_tasuki_gap,
            self._detect_downside_tasuki_gap,
        ]

        patterns: list[tuple[str, str]] = []
        for fn in detectors:
            result = fn(candles)
            if result is not None:
                name, signal = result
                # Skip disabled patterns
                perf = self.pattern_performance.get(name, {})
                if perf.get("disabled", False):
                    logger.debug(
                        "peritia.pattern_disabled",
                        pattern=name,
                    )
                    continue
                patterns.append((name, signal))
        return patterns

    # ------------------------------------------------------------------
    # Individual pattern detectors
    # ------------------------------------------------------------------

    def _detect_hammer(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bullish reversal — small body near the top, long lower shadow."""
        c = candles[-1]
        rng = _range(c)
        if rng == 0:
            return None
        body = _body(c)
        lower = _lower_shadow(c)
        upper = _upper_shadow(c)
        if body == 0:
            return None
        if lower >= body * _SHADOW_BODY_RATIO and upper < body:
            # Preceding candle should be bearish for context
            if len(candles) >= 2 and _is_bearish(candles[-2]):
                return ("hammer", "bullish")
        return None

    def _detect_inverted_hammer(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bullish reversal — small body near the bottom, long upper shadow."""
        c = candles[-1]
        rng = _range(c)
        if rng == 0:
            return None
        body = _body(c)
        upper = _upper_shadow(c)
        lower = _lower_shadow(c)
        if body == 0:
            return None
        if upper >= body * _SHADOW_BODY_RATIO and lower < body:
            if len(candles) >= 2 and _is_bearish(candles[-2]):
                return ("inverted_hammer", "bullish")
        return None

    def _detect_shooting_star(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bearish reversal — small body near the bottom, long upper shadow after uptrend."""
        c = candles[-1]
        if _range(c) == 0:
            return None
        body = _body(c)
        upper = _upper_shadow(c)
        lower = _lower_shadow(c)
        if body == 0:
            return None
        if upper >= body * _SHADOW_BODY_RATIO and lower < body:
            if len(candles) >= 2 and _is_bullish(candles[-2]):
                return ("shooting_star", "bearish")
        return None

    def _detect_hanging_man(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bearish reversal — small body near the top, long lower shadow after uptrend."""
        c = candles[-1]
        if _range(c) == 0:
            return None
        body = _body(c)
        lower = _lower_shadow(c)
        upper = _upper_shadow(c)
        if body == 0:
            return None
        if lower >= body * _SHADOW_BODY_RATIO and upper < body:
            if len(candles) >= 2 and _is_bullish(candles[-2]):
                return ("hanging_man", "bearish")
        return None

    def _detect_engulfing(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bullish or bearish engulfing (2-candle pattern)."""
        if len(candles) < 2:
            return None
        prev, cur = candles[-2], candles[-1]
        prev_body = _body(prev)
        cur_body = _body(cur)
        if prev_body == 0 or cur_body == 0:
            return None
        # Bullish engulfing: prev bearish, current bullish body engulfs prev body
        if _is_bearish(prev) and _is_bullish(cur):
            if cur["open"] <= prev["close"] and cur["close"] >= prev["open"]:
                return ("bullish_engulfing", "bullish")
        # Bearish engulfing: prev bullish, current bearish body engulfs prev body
        if _is_bullish(prev) and _is_bearish(cur):
            if cur["open"] >= prev["close"] and cur["close"] <= prev["open"]:
                return ("bearish_engulfing", "bearish")
        return None

    def _detect_morning_star(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bullish reversal — 3-candle pattern (bearish, small, bullish)."""
        if len(candles) < 3:
            return None
        first, second, third = candles[-3], candles[-2], candles[-1]
        first_rng = _range(first)
        if first_rng == 0:
            return None
        # First: large bearish candle
        if not _is_bearish(first) or _body(first) < first_rng * Decimal("0.4"):
            return None
        # Second: small body (star) — body < 30% of first body
        if _body(second) >= _body(first) * Decimal("0.3"):
            return None
        # Third: large bullish candle closing above first's midpoint
        if not _is_bullish(third):
            return None
        if third["close"] < _midpoint(first):
            return None
        return ("morning_star", "bullish")

    def _detect_evening_star(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bearish reversal — 3-candle pattern (bullish, small, bearish)."""
        if len(candles) < 3:
            return None
        first, second, third = candles[-3], candles[-2], candles[-1]
        first_rng = _range(first)
        if first_rng == 0:
            return None
        if not _is_bullish(first) or _body(first) < first_rng * Decimal("0.4"):
            return None
        if _body(second) >= _body(first) * Decimal("0.3"):
            return None
        if not _is_bearish(third):
            return None
        if third["close"] > _midpoint(first):
            return None
        return ("evening_star", "bearish")

    def _detect_doji(self, candles: list[dict]) -> tuple[str, str] | None:
        """Indecision candle — very small body relative to range.

        Signal direction is inferred from context: after a downtrend it
        hints bullish; after an uptrend it hints bearish.
        """
        c = candles[-1]
        rng = _range(c)
        if rng == 0:
            return None
        if _body(c) > rng * _DOJI_BODY_RATIO:
            return None
        # Determine context from the preceding candle
        if len(candles) >= 2:
            if _is_bearish(candles[-2]):
                return ("doji", "bullish")
            if _is_bullish(candles[-2]):
                return ("doji", "bearish")
        return None

    def _detect_marubozu(self, candles: list[dict]) -> tuple[str, str] | None:
        """Strong trend candle — almost no shadows."""
        c = candles[-1]
        rng = _range(c)
        if rng == 0:
            return None
        upper = _upper_shadow(c)
        lower = _lower_shadow(c)
        threshold = rng * _MARUBOZU_WICK_RATIO
        if upper <= threshold and lower <= threshold:
            if _is_bullish(c):
                return ("marubozu", "bullish")
            if _is_bearish(c):
                return ("marubozu", "bearish")
        return None

    def _detect_three_white_soldiers(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bullish — three consecutive bullish candles with higher closes."""
        if len(candles) < 3:
            return None
        trio = candles[-3:]
        if not all(_is_bullish(c) for c in trio):
            return None
        if not (trio[1]["close"] > trio[0]["close"] and trio[2]["close"] > trio[1]["close"]):
            return None
        # Each candle should open within the body of the previous one
        if trio[1]["open"] < trio[0]["open"] or trio[1]["open"] > trio[0]["close"]:
            return None
        if trio[2]["open"] < trio[1]["open"] or trio[2]["open"] > trio[1]["close"]:
            return None
        return ("three_white_soldiers", "bullish")

    def _detect_three_black_crows(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bearish — three consecutive bearish candles with lower closes."""
        if len(candles) < 3:
            return None
        trio = candles[-3:]
        if not all(_is_bearish(c) for c in trio):
            return None
        if not (trio[1]["close"] < trio[0]["close"] and trio[2]["close"] < trio[1]["close"]):
            return None
        # Each candle should open within the body of the previous one
        if trio[1]["open"] > trio[0]["open"] or trio[1]["open"] < trio[0]["close"]:
            return None
        if trio[2]["open"] > trio[1]["open"] or trio[2]["open"] < trio[1]["close"]:
            return None
        return ("three_black_crows", "bearish")

    def _detect_piercing_line(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bullish reversal — bearish candle followed by bullish candle
        that opens below prior low and closes above prior midpoint."""
        if len(candles) < 2:
            return None
        prev, cur = candles[-2], candles[-1]
        if not _is_bearish(prev) or not _is_bullish(cur):
            return None
        if cur["open"] >= prev["close"]:
            return None
        if cur["close"] <= _midpoint(prev):
            return None
        # Must not fully engulf (that would be an engulfing pattern)
        if cur["close"] >= prev["open"]:
            return None
        return ("piercing_line", "bullish")

    def _detect_dark_cloud_cover(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bearish reversal — bullish candle followed by bearish candle
        that opens above prior high and closes below prior midpoint."""
        if len(candles) < 2:
            return None
        prev, cur = candles[-2], candles[-1]
        if not _is_bullish(prev) or not _is_bearish(cur):
            return None
        if cur["open"] <= prev["close"]:
            return None
        if cur["close"] >= _midpoint(prev):
            return None
        if cur["close"] <= prev["open"]:
            return None
        return ("dark_cloud_cover", "bearish")

    def _detect_harami(self, candles: list[dict]) -> tuple[str, str] | None:
        """Reversal — current candle's body is contained within previous body."""
        if len(candles) < 2:
            return None
        prev, cur = candles[-2], candles[-1]
        if _body(prev) == 0 or _body(cur) == 0:
            return None
        prev_top = max(prev["open"], prev["close"])
        prev_bot = min(prev["open"], prev["close"])
        cur_top = max(cur["open"], cur["close"])
        cur_bot = min(cur["open"], cur["close"])
        if cur_top <= prev_top and cur_bot >= prev_bot:
            # Bullish harami: prev bearish, cur bullish
            if _is_bearish(prev) and _is_bullish(cur):
                return ("bullish_harami", "bullish")
            # Bearish harami: prev bullish, cur bearish
            if _is_bullish(prev) and _is_bearish(cur):
                return ("bearish_harami", "bearish")
        return None

    def _detect_abandoned_baby(self, candles: list[dict]) -> tuple[str, str] | None:
        """Rare reversal — gap-doji-gap three-candle pattern."""
        if len(candles) < 3:
            return None
        first, second, third = candles[-3], candles[-2], candles[-1]
        rng_second = _range(second)
        if rng_second == 0:
            return None
        # Middle candle must be a doji
        if _body(second) > rng_second * _DOJI_BODY_RATIO:
            return None
        # Bullish abandoned baby: bearish first, doji shadows gap below first, third gaps above doji
        if _is_bearish(first) and _is_bullish(third):
            if second["high"] < first["low"]:
                if third["low"] > second["high"]:
                    return ("abandoned_baby", "bullish")
        # Bearish abandoned baby: bullish first, doji shadows gap above first, third gaps below doji
        if _is_bullish(first) and _is_bearish(third):
            if second["low"] > first["high"]:
                if third["high"] < second["low"]:
                    return ("abandoned_baby", "bearish")
        return None

    def _detect_dragonfly_doji(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bullish reversal — open/close at the high, long lower shadow."""
        c = candles[-1]
        rng = _range(c)
        if rng == 0:
            return None
        if _body(c) > rng * _DOJI_BODY_RATIO:
            return None
        upper = _upper_shadow(c)
        lower = _lower_shadow(c)
        # Open/close should be near the high; lower shadow dominates
        if upper > rng * Decimal("0.1"):
            return None
        if lower < rng * Decimal("0.6"):
            return None
        return ("dragonfly_doji", "bullish")

    def _detect_gravestone_doji(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bearish reversal — open/close at the low, long upper shadow."""
        c = candles[-1]
        rng = _range(c)
        if rng == 0:
            return None
        if _body(c) > rng * _DOJI_BODY_RATIO:
            return None
        upper = _upper_shadow(c)
        lower = _lower_shadow(c)
        # Open/close should be near the low; upper shadow dominates
        if lower > rng * Decimal("0.1"):
            return None
        if upper < rng * Decimal("0.6"):
            return None
        return ("gravestone_doji", "bearish")

    def _detect_long_legged_doji(self, candles: list[dict]) -> tuple[str, str] | None:
        """Indecision — doji with long upper and lower shadows."""
        c = candles[-1]
        rng = _range(c)
        if rng == 0:
            return None
        if _body(c) > rng * _DOJI_BODY_RATIO:
            return None
        upper = _upper_shadow(c)
        lower = _lower_shadow(c)
        # Both shadows must be significant
        if upper < rng * Decimal("0.3"):
            return None
        if lower < rng * Decimal("0.3"):
            return None
        # Determine context from the preceding candle
        if len(candles) >= 2:
            if _is_bearish(candles[-2]):
                return ("long_legged_doji", "bullish")
            if _is_bullish(candles[-2]):
                return ("long_legged_doji", "bearish")
        return None

    def _detect_harami_cross(self, candles: list[dict]) -> tuple[str, str] | None:
        """Reversal — like harami but the inside candle is a doji."""
        if len(candles) < 2:
            return None
        prev, cur = candles[-2], candles[-1]
        if _body(prev) == 0:
            return None
        rng_cur = _range(cur)
        if rng_cur == 0:
            return None
        # Current candle must be a doji
        if _body(cur) > rng_cur * _DOJI_BODY_RATIO:
            return None
        prev_top = max(prev["open"], prev["close"])
        prev_bot = min(prev["open"], prev["close"])
        cur_top = max(cur["open"], cur["close"])
        cur_bot = min(cur["open"], cur["close"])
        # Doji body must be contained within previous body
        if cur_top > prev_top or cur_bot < prev_bot:
            return None
        if _is_bearish(prev):
            return ("harami_cross", "bullish")
        if _is_bullish(prev):
            return ("harami_cross", "bearish")
        return None

    def _detect_evening_doji_star(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bearish reversal — like evening star but the middle candle is a doji."""
        if len(candles) < 3:
            return None
        first, second, third = candles[-3], candles[-2], candles[-1]
        first_rng = _range(first)
        if first_rng == 0:
            return None
        if not _is_bullish(first) or _body(first) < first_rng * Decimal("0.4"):
            return None
        # Second candle must be a doji
        rng_second = _range(second)
        if rng_second == 0:
            return None
        if _body(second) > rng_second * _DOJI_BODY_RATIO:
            return None
        if not _is_bearish(third):
            return None
        if third["close"] > _midpoint(first):
            return None
        return ("evening_doji_star", "bearish")

    def _detect_morning_doji_star(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bullish reversal — like morning star but the middle candle is a doji."""
        if len(candles) < 3:
            return None
        first, second, third = candles[-3], candles[-2], candles[-1]
        first_rng = _range(first)
        if first_rng == 0:
            return None
        if not _is_bearish(first) or _body(first) < first_rng * Decimal("0.4"):
            return None
        # Second candle must be a doji
        rng_second = _range(second)
        if rng_second == 0:
            return None
        if _body(second) > rng_second * _DOJI_BODY_RATIO:
            return None
        if not _is_bullish(third):
            return None
        if third["close"] < _midpoint(first):
            return None
        return ("morning_doji_star", "bullish")

    def _detect_spinning_top(self, candles: list[dict]) -> tuple[str, str] | None:
        """Indecision — small body with upper and lower shadows exceeding body length."""
        c = candles[-1]
        rng = _range(c)
        if rng == 0:
            return None
        body = _body(c)
        if body == 0:
            return None
        # Body must be small relative to range but not doji-small
        if body > rng * Decimal("0.3"):
            return None
        if body <= rng * _DOJI_BODY_RATIO:
            return None
        upper = _upper_shadow(c)
        lower = _lower_shadow(c)
        # Both shadows must exceed the body
        if upper < body or lower < body:
            return None
        # Determine context from the preceding candle
        if len(candles) >= 2:
            if _is_bearish(candles[-2]):
                return ("spinning_top", "bullish")
            if _is_bullish(candles[-2]):
                return ("spinning_top", "bearish")
        return None

    def _detect_rising_three_methods(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bullish continuation — long white, 3 small inside candles, long white at new high."""
        if len(candles) < 5:
            return None
        first = candles[-5]
        middle = candles[-4:-1]
        last = candles[-1]
        first_rng = _range(first)
        if first_rng == 0:
            return None
        # First candle: long bullish
        if not _is_bullish(first) or _body(first) < first_rng * Decimal("0.5"):
            return None
        # Middle three: small bodies contained within the first candle's range
        for m in middle:
            if _body(m) >= _body(first) * Decimal("0.5"):
                return None
            if m["high"] > first["high"] or m["low"] < first["low"]:
                return None
        # Last candle: long bullish closing above first candle's close
        last_rng = _range(last)
        if last_rng == 0:
            return None
        if not _is_bullish(last) or _body(last) < last_rng * Decimal("0.5"):
            return None
        if last["close"] <= first["close"]:
            return None
        return ("rising_three_methods", "bullish")

    def _detect_falling_three_methods(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bearish continuation — long black, 3 small inside candles, long black at new low."""
        if len(candles) < 5:
            return None
        first = candles[-5]
        middle = candles[-4:-1]
        last = candles[-1]
        first_rng = _range(first)
        if first_rng == 0:
            return None
        # First candle: long bearish
        if not _is_bearish(first) or _body(first) < first_rng * Decimal("0.5"):
            return None
        # Middle three: small bodies contained within the first candle's range
        for m in middle:
            if _body(m) >= _body(first) * Decimal("0.5"):
                return None
            if m["high"] > first["high"] or m["low"] < first["low"]:
                return None
        # Last candle: long bearish closing below first candle's close
        last_rng = _range(last)
        if last_rng == 0:
            return None
        if not _is_bearish(last) or _body(last) < last_rng * Decimal("0.5"):
            return None
        if last["close"] >= first["close"]:
            return None
        return ("falling_three_methods", "bearish")

    def _detect_stick_sandwich(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bullish reversal — two black bodies surrounding white body, equal closes."""
        if len(candles) < 3:
            return None
        first, second, third = candles[-3], candles[-2], candles[-1]
        if not _is_bearish(first) or not _is_bullish(second) or not _is_bearish(third):
            return None
        # First and third candles should have approximately equal closes
        avg_range = (_range(first) + _range(third)) / 2
        if avg_range == 0:
            return None
        if abs(first["close"] - third["close"]) > avg_range * Decimal("0.05"):
            return None
        return ("stick_sandwich", "bullish")

    def _detect_upside_tasuki_gap(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bullish continuation — gap up between first two bullish candles,
        third bearish candle opens inside second body but does not close the gap."""
        if len(candles) < 3:
            return None
        first, second, third = candles[-3], candles[-2], candles[-1]
        if not _is_bullish(first) or not _is_bullish(second):
            return None
        if not _is_bearish(third):
            return None
        # Gap up: second candle opens above first candle's close
        if second["open"] <= first["close"]:
            return None
        # Third candle opens within the second candle's body
        body_lo = min(second["open"], second["close"])
        body_hi = max(second["open"], second["close"])
        if third["open"] < body_lo or third["open"] > body_hi:
            return None
        # Third candle does not close below the gap (first close)
        if third["close"] < first["close"]:
            return None
        return ("upside_tasuki_gap", "bullish")

    def _detect_downside_tasuki_gap(self, candles: list[dict]) -> tuple[str, str] | None:
        """Bearish continuation — gap down between first two bearish candles,
        third bullish candle opens inside second body but does not close the gap."""
        if len(candles) < 3:
            return None
        first, second, third = candles[-3], candles[-2], candles[-1]
        if not _is_bearish(first) or not _is_bearish(second):
            return None
        if not _is_bullish(third):
            return None
        # Gap down: second candle opens below first candle's close
        if second["open"] >= first["close"]:
            return None
        # Third candle opens within the second candle's body
        body_lo = min(second["open"], second["close"])
        body_hi = max(second["open"], second["close"])
        if third["open"] < body_lo or third["open"] > body_hi:
            return None
        # Third candle does not close above the gap (first close)
        if third["close"] > first["close"]:
            return None
        return ("downside_tasuki_gap", "bearish")

    # ------------------------------------------------------------------
    # Evaluation pipeline
    # ------------------------------------------------------------------

    async def evaluate(self, ticker: str) -> TradeIntent | None:
        """Full evaluation pipeline for *ticker*.

        1. Verify this is a crypto / BTC market.
        2. Retrieve recent candlesticks.
        3. Detect candlestick patterns.
        4. Check volume confirmation.
        5. Apply decision rules (pattern + volume → strong signal).
        6. Fall back to SMA-20 crossover if no pattern found.
        7. Return a ``TradeIntent`` or ``None``.
        """
        if not self.is_crypto_market(ticker):
            return None

        candles = self.candlestick_history.get(ticker, [])
        if len(candles) < self.min_candles_for_signal:
            logger.debug(
                "peritia.evaluate.skip",
                ticker=ticker,
                reason="insufficient_candles",
                candle_count=len(candles),
            )
            return None

        patterns = self.detect_patterns(candles)
        volume_confirmed = self.check_volume_confirmation(ticker)

        side: str | None = None
        reasoning_parts: list[str] = []
        pattern_label: str | None = None

        if patterns:
            bullish = [p for p in patterns if p[1] == "bullish"]
            bearish = [p for p in patterns if p[1] == "bearish"]

            if bullish and not bearish:
                if volume_confirmed:
                    side = "yes"
                    names = ", ".join(p[0] for p in bullish)
                    pattern_label = bullish[0][0]
                    reasoning_parts.append(
                        f"Bullish pattern(s) [{names}] with strong volume"
                    )
                else:
                    logger.info(
                        "peritia.evaluate.weak_signal",
                        ticker=ticker,
                        patterns=[p[0] for p in bullish],
                        reason="volume_not_confirmed",
                    )
            elif bearish and not bullish:
                if volume_confirmed:
                    side = "no"
                    names = ", ".join(p[0] for p in bearish)
                    pattern_label = bearish[0][0]
                    reasoning_parts.append(
                        f"Bearish pattern(s) [{names}] with strong volume"
                    )
                else:
                    logger.info(
                        "peritia.evaluate.weak_signal",
                        ticker=ticker,
                        patterns=[p[0] for p in bearish],
                        reason="volume_not_confirmed",
                    )
            else:
                logger.info(
                    "peritia.evaluate.conflicting",
                    ticker=ticker,
                    bullish=[p[0] for p in bullish],
                    bearish=[p[0] for p in bearish],
                )

        # Fallback: SMA-20 crossover momentum bias
        if side is None:
            closes = [c["close"] for c in candles]
            sma = self.calculate_sma(closes, self.sma_period)
            if sma is not None:
                current_close = closes[-1]
                if current_close > sma:
                    side = "yes"
                    reasoning_parts.append(
                        f"SMA-20 fallback: price {current_close} > SMA {sma:.4f} → slight YES bias"
                    )
                    pattern_label = "sma_crossover_bullish"
                elif current_close < sma:
                    side = "no"
                    reasoning_parts.append(
                        f"SMA-20 fallback: price {current_close} < SMA {sma:.4f} → slight NO bias"
                    )
                    pattern_label = "sma_crossover_bearish"

        if side is None:
            logger.debug(
                "peritia.evaluate.no_signal",
                ticker=ticker,
            )
            return None

        # Determine price from state cache
        market = self.state_cache.get_market(ticker)
        if side == "yes":
            price = (market.yes_ask_dollars if market else "") or "0.50"
        else:
            price = (market.no_ask_dollars if market else "") or "0.50"

        is_btc = self.is_btc_market(ticker)
        reasoning = "; ".join(reasoning_parts)
        if is_btc:
            reasoning = f"[BTC-primary] {reasoning}"

        timestamp = int(time.time())
        intent = TradeIntent(
            agent_name=self.agent_name,
            ticker=ticker,
            side=side,
            action="buy",
            count_fp="1.00",
            price_dollars=price,
            reasoning=reasoning,
            pattern_detected=pattern_label,
        )

        logger.info(
            "peritia.evaluate.signal",
            ticker=ticker,
            side=side,
            pattern=pattern_label,
            volume_confirmed=volume_confirmed,
            client_order_id=f"peritia-{ticker}-{timestamp}",
        )
        return intent

    async def evaluate_all_markets(self) -> list[TradeIntent]:
        """Evaluate every subscribed crypto market and return trade intents."""
        subscribed = self.state_cache.get_subscribed_markets()
        intents: list[TradeIntent] = []

        for ticker in subscribed:
            if not self.is_crypto_market(ticker):
                continue
            intent = await self.evaluate(ticker)
            if intent is not None:
                intents.append(intent)

        logger.info(
            "peritia.evaluate_all",
            markets_checked=len(subscribed),
            signals_generated=len(intents),
        )
        return intents

    # ------------------------------------------------------------------
    # Outcome tracking
    # ------------------------------------------------------------------

    def record_outcome(self, pattern_name: str, won: bool) -> None:
        """Record a trade outcome for per-pattern performance tracking.

        After ``min_pattern_sample`` trades, patterns below
        ``min_pattern_accuracy`` win-rate are automatically disabled.
        """
        perf = self.pattern_performance.setdefault(
            pattern_name, {"wins": 0, "losses": 0, "disabled": False},
        )
        if won:
            perf["wins"] += 1  # type: ignore[operator]
            self.win_count += 1
        else:
            perf["losses"] += 1  # type: ignore[operator]
            self.loss_count += 1

        self.total_trades += 1
        total = perf["wins"] + perf["losses"]  # type: ignore[operator]

        if total >= self.min_pattern_sample and total > 0:
            accuracy = Decimal(str(perf["wins"])) / Decimal(str(total))
            if accuracy < self.min_pattern_accuracy:
                perf["disabled"] = True
                logger.warning(
                    "peritia.pattern_disabled",
                    pattern=pattern_name,
                    accuracy=str(accuracy),
                    sample_size=total,
                )
            else:
                perf["disabled"] = False

        logger.info(
            "peritia.outcome_recorded",
            pattern=pattern_name,
            won=won,
            pattern_wins=perf["wins"],
            pattern_losses=perf["losses"],
            pattern_total=total,
        )

    async def record_trade_pnl(self, won: bool, pnl: Decimal | str = "0") -> None:
        """Record outcome and persist agent state to the cache."""
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

    def get_status(self) -> dict:
        """Return current agent status with pattern performance breakdown."""
        win_rate = (
            round(self.win_count / self.total_trades * 100, 1)
            if self.total_trades > 0
            else 0.0
        )

        pattern_stats: dict[str, Any] = {}
        for name, perf in self.pattern_performance.items():
            total = perf["wins"] + perf["losses"]  # type: ignore[operator]
            pattern_stats[name] = {
                "wins": perf["wins"],
                "losses": perf["losses"],
                "total": total,
                "accuracy": round(
                    int(perf["wins"]) / total * 100, 1,  # type: ignore[arg-type]
                ) if total > 0 else 0.0,
                "disabled": perf["disabled"],
            }

        active_tickers = list(self.candlestick_history.keys())

        return {
            "agent_name": self.agent_name,
            "strategy": "candlestick_pattern_volume_confirmation",
            "sma_period": self.sma_period,
            "min_candles_for_signal": self.min_candles_for_signal,
            "total_trades": self.total_trades,
            "win_count": self.win_count,
            "loss_count": self.loss_count,
            "win_rate": win_rate,
            "realized_pnl": str(self.realized_pnl),
            "active_tickers": active_tickers,
            "pattern_performance": pattern_stats,
        }
