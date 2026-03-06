"""Risk-checking and permission gates for the trading system.

Implements the layered defence described in PRD Chapter 2:
  1. Permission gates  — global switch, env health, agent mode, account kill-switch
  2. Pre-submit risk checks — market status, notional, exposure, loss cap, balance,
     duplicate suppression, position limits
  3. Circuit breaker    — blocks agent orders after repeated submit failures
"""

from __future__ import annotations

import time
from collections import deque
from datetime import datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING

import structlog

if TYPE_CHECKING:
    from backend.config import Settings
    from backend.models.schemas import TradeIntent
    from backend.services.state_cache import StateCache

log = structlog.get_logger(__name__)

# Default circuit-breaker parameters
_CB_FAILURE_THRESHOLD = 5
_CB_ROLLING_WINDOW_SECS = 60.0
_CB_COOLDOWN_SECS = 120.0

# TTL for duplicate client_order_id tracking (seconds)
_CLIENT_ORDER_ID_TTL = 300.0


class RiskGateway:
    """Centralised risk gate that every trade intent must pass before submission."""

    def __init__(self, config: Settings, state_cache: StateCache) -> None:
        self._config = config
        self._cache = state_cache

        # Pre-compute Decimal limits from config to avoid repeated conversion
        self._max_order_notional = Decimal(str(config.max_order_notional))
        self._max_per_market_exposure = Decimal(str(config.max_per_market_exposure))
        self._max_per_event_exposure = Decimal(str(config.max_per_event_exposure))
        self._daily_loss_cap = Decimal(str(config.daily_loss_cap))
        self._min_balance = Decimal(str(config.min_balance_threshold))

        # --- Permission gates ---
        self._trading_enabled: bool = False  # disabled at startup per PRD
        self._environment_healthy: bool = False
        self._account_kill_switch: bool = False  # True == blocked

        # --- Daily P&L tracking ---
        self._daily_pnl: Decimal = Decimal("0")
        self._daily_reset_date: str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        # --- Duplicate suppression: {client_order_id: timestamp} ---
        self._seen_client_order_ids: dict[str, float] = {}

        # --- Circuit breaker ---
        self._failure_times: deque[float] = deque()
        self._cb_opened_at: float | None = None

    # ------------------------------------------------------------------
    # Public API — main entry point
    # ------------------------------------------------------------------

    async def check_trade_intent(self, intent: TradeIntent) -> tuple[bool, str]:
        """Evaluate all gates and risk checks for *intent*.

        Returns ``(True, "approved")`` on success or ``(False, reason)``
        with a human-readable reason code on rejection.
        """
        # 1. Permission gates
        ok, reason = self._check_permission_gates(intent)
        if not ok:
            await self._log_rejection(intent, reason)
            return False, reason

        # 2. Circuit breaker
        if self.is_circuit_open():
            reason = "circuit_breaker_open"
            await self._log_rejection(intent, reason)
            return False, reason

        # 3. Pre-submit risk checks
        ok, reason = self._check_risk(intent)
        if not ok:
            await self._log_rejection(intent, reason)
            return False, reason

        log.info(
            "trade_intent_approved",
            agent=intent.agent_name,
            ticker=intent.ticker,
            side=intent.side,
            action=intent.action,
        )
        return True, "approved"

    # ------------------------------------------------------------------
    # Permission gates
    # ------------------------------------------------------------------

    def enable_trading(self) -> None:
        """Enable global trading."""
        self._trading_enabled = True
        log.info("global_trading_enabled")

    def disable_trading(self) -> None:
        """Disable global trading (kill switch)."""
        self._trading_enabled = False
        log.warning("global_trading_disabled")

    def is_trading_enabled(self) -> bool:
        """Check if global trading is enabled."""
        return self._trading_enabled

    def set_environment_healthy(self, healthy: bool) -> None:
        """Mark environment as healthy/unhealthy."""
        self._environment_healthy = healthy
        log.info("environment_health_changed", healthy=healthy)

    def set_account_kill_switch(self, blocked: bool) -> None:
        """Activate or deactivate the account-level kill switch."""
        self._account_kill_switch = blocked
        if blocked:
            log.warning("account_kill_switch_activated")
        else:
            log.info("account_kill_switch_deactivated")

    # ------------------------------------------------------------------
    # Circuit breaker
    # ------------------------------------------------------------------

    def record_submit_failure(self) -> None:
        """Record an order submit failure for circuit breaker."""
        now = time.monotonic()
        self._failure_times.append(now)
        self._prune_old_failures(now)

        if len(self._failure_times) >= _CB_FAILURE_THRESHOLD and self._cb_opened_at is None:
            self._cb_opened_at = now
            log.warning(
                "circuit_breaker_opened",
                failures=len(self._failure_times),
                window_secs=_CB_ROLLING_WINDOW_SECS,
            )

    def record_submit_success(self) -> None:
        """Record successful submit, helps circuit breaker recovery."""
        now = time.monotonic()
        self._prune_old_failures(now)
        # If the breaker was open but cooldown has passed and the window is
        # clear, allow it to close naturally on the next is_circuit_open() call.

    def is_circuit_open(self) -> bool:
        """Check if circuit breaker is open."""
        if self._cb_opened_at is None:
            return False

        now = time.monotonic()
        elapsed = now - self._cb_opened_at

        if elapsed < _CB_COOLDOWN_SECS:
            return True

        # Cooldown expired — check whether failures have subsided
        self._prune_old_failures(now)
        if len(self._failure_times) < _CB_FAILURE_THRESHOLD:
            self._cb_opened_at = None
            log.info("circuit_breaker_closed")
            return False

        # Still too many recent failures; keep open and reset timer
        self._cb_opened_at = now
        return True

    # ------------------------------------------------------------------
    # Daily P&L
    # ------------------------------------------------------------------

    def get_daily_pnl(self) -> Decimal:
        """Get today's realized PnL across all agents."""
        self._maybe_auto_reset()
        return self._daily_pnl

    def record_pnl(self, amount: Decimal) -> None:
        """Add *amount* to the running daily PnL tally."""
        self._maybe_auto_reset()
        self._daily_pnl += amount

    def reset_daily_counters(self) -> None:
        """Reset daily loss tracking (call at midnight UTC)."""
        self._daily_pnl = Decimal("0")
        self._daily_reset_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        self._seen_client_order_ids.clear()
        log.info("daily_counters_reset", date=self._daily_reset_date)

    # ------------------------------------------------------------------
    # Internal — permission gate checks
    # ------------------------------------------------------------------

    def _check_permission_gates(self, intent: TradeIntent) -> tuple[bool, str]:
        # Gate 1: global trading enabled
        if not self._trading_enabled:
            return False, "global_trading_disabled"

        # Gate 2: environment healthy & authenticated
        if not self._environment_healthy:
            return False, "environment_unhealthy"

        # Gate 3: agent mode
        agent_state = self._cache.get_agent_state(intent.agent_name)
        if agent_state is None:
            if intent.agent_name == "user":
                # Manual UI orders have no agent-state record; allow them
                # through this gate (trading-enabled / kill-switch checks
                # already ran above).
                pass
            else:
                return False, "unknown_agent"
        else:
            mode = agent_state.mode
            if mode == "safe":
                return False, "agent_mode_safe_blocks_execution"
            if mode == "semi-auto":
                return False, "agent_mode_semi_auto_needs_approval"
            if mode != "auto":
                return False, f"agent_mode_unsupported:{mode}"

        # Gate 4: account-level kill switch
        if self._account_kill_switch:
            return False, "account_kill_switch_active"

        return True, ""

    # ------------------------------------------------------------------
    # Internal — pre-submit risk checks
    # ------------------------------------------------------------------

    def _check_risk(self, intent: TradeIntent) -> tuple[bool, str]:
        # Risk 1: market tradable
        market = self._cache.get_market(intent.ticker)
        if market is None:
            return False, "market_not_found"
        if market.status != "active":
            return False, f"market_not_active:status={market.status}"

        notional = self._compute_notional(intent)

        # Risk 2: max order notional
        if notional > self._max_order_notional:
            return False, f"max_order_notional_exceeded:notional={notional},limit={self._max_order_notional}"

        # Risk 3: max per-market exposure
        market_exposure = self._current_market_exposure(intent.ticker)
        if market_exposure + notional > self._max_per_market_exposure:
            return False, (
                f"max_per_market_exposure_exceeded:"
                f"current={market_exposure},order={notional},limit={self._max_per_market_exposure}"
            )

        # Risk 4: max per-event exposure
        event_exposure = self._current_event_exposure(market.event_ticker)
        if event_exposure + notional > self._max_per_event_exposure:
            return False, (
                f"max_per_event_exposure_exceeded:"
                f"current={event_exposure},order={notional},limit={self._max_per_event_exposure}"
            )

        # Risk 5: daily loss cap
        self._maybe_auto_reset()
        if self._daily_pnl < Decimal("0") and abs(self._daily_pnl) >= self._daily_loss_cap:
            return False, (
                f"daily_loss_cap_reached:pnl={self._daily_pnl},cap={self._daily_loss_cap}"
            )

        # Risk 6: min balance threshold
        balance_data = self._cache.get_balance()
        current_balance = Decimal(str(balance_data.get("balance", "0")))
        if current_balance < self._min_balance:
            return False, (
                f"balance_below_minimum:balance={current_balance},min={self._min_balance}"
            )

        # Risk 7: duplicate client_order_id suppression
        dup_ok, dup_reason = self._check_duplicate(intent)
        if not dup_ok:
            return False, dup_reason

        # Risk 8: position limit awareness
        pos_ok, pos_reason = self._check_position_limits(intent)
        if not pos_ok:
            return False, pos_reason

        return True, ""

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _compute_notional(intent: TradeIntent) -> Decimal:
        """Notional = count * price."""
        count = Decimal(intent.count_fp) if intent.count_fp else Decimal("0")
        price = Decimal(intent.price_dollars) if intent.price_dollars else Decimal("0")
        return count * price

    def _current_market_exposure(self, ticker: str) -> Decimal:
        """Sum absolute exposure for a single market from cached positions."""
        positions = self._cache.get_positions()
        pos = positions.get(ticker)
        if pos is None:
            return Decimal("0")
        return abs(Decimal(str(pos.get("market_exposure", "0"))))

    def _current_event_exposure(self, event_ticker: str) -> Decimal:
        """Sum exposure across all markets belonging to *event_ticker*."""
        total = Decimal("0")
        markets = self._cache.get_markets()
        positions = self._cache.get_positions()
        for ticker, mkt in markets.items():
            if mkt.event_ticker == event_ticker:
                pos = positions.get(ticker)
                if pos is not None:
                    total += abs(Decimal(str(pos.get("market_exposure", "0"))))
        return total

    def _check_duplicate(self, intent: TradeIntent) -> tuple[bool, str]:
        """Reject if the same client_order_id was already seen recently."""
        # Normalize Decimal strings to avoid '1.5' vs '1.5000' mismatches
        norm_count = str(Decimal(intent.count_fp).normalize())
        norm_price = str(Decimal(intent.price_dollars).normalize())
        coid = (
            f"{intent.agent_name}:{intent.ticker}:{intent.side}:"
            f"{intent.action}:{norm_count}:{norm_price}"
        )
        now = time.monotonic()
        self._prune_old_client_ids(now)

        if coid in self._seen_client_order_ids:
            return False, f"duplicate_client_order_id:{coid}"

        self._seen_client_order_ids[coid] = now
        return True, ""

    def _check_position_limits(self, intent: TradeIntent) -> tuple[bool, str]:
        """Check account-level position limits if available."""
        limits = self._cache.get_account_limits()
        if not limits:
            return True, ""

        max_positions = limits.get("max_positions")
        if max_positions is not None:
            positions = self._cache.get_positions()
            if len(positions) >= int(max_positions) and intent.ticker not in positions:
                return False, (
                    f"position_limit_reached:current={len(positions)},max={max_positions}"
                )

        return True, ""

    def _prune_old_failures(self, now: float) -> None:
        """Remove failure timestamps outside the rolling window."""
        cutoff = now - _CB_ROLLING_WINDOW_SECS
        while self._failure_times and self._failure_times[0] < cutoff:
            self._failure_times.popleft()

    def _prune_old_client_ids(self, now: float) -> None:
        """Remove expired client_order_id entries."""
        expired = [
            coid
            for coid, ts in self._seen_client_order_ids.items()
            if now - ts > _CLIENT_ORDER_ID_TTL
        ]
        for coid in expired:
            del self._seen_client_order_ids[coid]

    def _maybe_auto_reset(self) -> None:
        """Auto-reset daily counters if the UTC date has rolled over."""
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if today != self._daily_reset_date:
            self.reset_daily_counters()

    async def _log_rejection(self, intent: TradeIntent, reason: str) -> None:
        """Log the rejection and record a risk event in the state cache."""
        log.warning(
            "trade_intent_rejected",
            agent=intent.agent_name,
            ticker=intent.ticker,
            side=intent.side,
            action=intent.action,
            reason=reason,
        )
        await self._cache.add_risk_event(
            {
                "event_type": "trade_rejected",
                "agent_name": intent.agent_name,
                "ticker": intent.ticker,
                "reason": reason,
                "timestamp": datetime.now(timezone.utc),
            }
        )
