"""Tests for :class:`backend.services.risk_gateway.RiskGateway`.

Covers:
* Permission gates — global trading flag, environment health, agent mode,
  account kill switch.
* Circuit breaker — opens after threshold failures, resets after cooldown.
* Daily P&L — records PnL and auto-resets when the UTC date rolls over.
* Risk checks — notional cap, per-market / per-event exposure caps, daily
  loss cap, market-not-found / market-not-active rejections.
* Happy path — approved when all checks pass.
"""

from __future__ import annotations

from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from backend.models.schemas import AgentState, TradeIntent
from backend.services.risk_gateway import (
    RiskGateway,
    _CB_COOLDOWN_SECS,
    _CB_FAILURE_THRESHOLD,
    _CB_ROLLING_WINDOW_SECS,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def gateway(settings, mock_state_cache) -> RiskGateway:
    """A :class:`RiskGateway` wired to the shared mock cache."""
    return RiskGateway(settings, mock_state_cache)


@pytest.fixture
def enabled_gateway(gateway, mock_state_cache, auto_agent_state, active_market) -> RiskGateway:
    """A :class:`RiskGateway` with all permission gates open and a healthy
    mock environment — suitable for testing risk checks directly."""
    gateway.enable_trading()
    gateway.set_environment_healthy(True)
    mock_state_cache.get_agent_state.return_value = auto_agent_state
    mock_state_cache.get_market.return_value = active_market
    mock_state_cache.get_markets.return_value = {"KXBTC-25NOV": active_market}
    mock_state_cache.get_positions.return_value = {}
    mock_state_cache.get_balance.return_value = {"balance": "100.00"}
    mock_state_cache.get_account_limits.return_value = {}
    return gateway


# ---------------------------------------------------------------------------
# Permission gates
# ---------------------------------------------------------------------------


def test_trading_disabled_by_default(gateway: RiskGateway) -> None:
    """Trading must be disabled at startup (safe-by-default, PRD Chapter 2)."""
    assert not gateway.is_trading_enabled()


@pytest.mark.asyncio
async def test_permission_gate_trading_disabled(
    gateway: RiskGateway, trade_intent: TradeIntent
) -> None:
    """Intents are rejected immediately when global trading is disabled."""
    ok, reason = await gateway.check_trade_intent(trade_intent)

    assert not ok
    assert reason == "global_trading_disabled"


@pytest.mark.asyncio
async def test_permission_gate_environment_unhealthy(
    gateway: RiskGateway, trade_intent: TradeIntent
) -> None:
    """Intents are rejected when the environment is not healthy."""
    gateway.enable_trading()

    ok, reason = await gateway.check_trade_intent(trade_intent)

    assert not ok
    assert reason == "environment_unhealthy"


@pytest.mark.asyncio
async def test_permission_gate_unknown_agent(
    gateway: RiskGateway, trade_intent: TradeIntent, mock_state_cache: MagicMock
) -> None:
    """Non-'user' intents with no registered agent state are rejected."""
    gateway.enable_trading()
    gateway.set_environment_healthy(True)
    mock_state_cache.get_agent_state.return_value = None  # unknown agent

    ok, reason = await gateway.check_trade_intent(trade_intent)

    assert not ok
    assert reason == "unknown_agent"


@pytest.mark.asyncio
async def test_permission_gate_agent_mode_safe(
    gateway: RiskGateway,
    trade_intent: TradeIntent,
    mock_state_cache: MagicMock,
) -> None:
    """Agents in 'safe' mode are blocked from execution."""
    gateway.enable_trading()
    gateway.set_environment_healthy(True)
    mock_state_cache.get_agent_state.return_value = AgentState(
        agent_name="prime", mode="safe", status="running"
    )

    ok, reason = await gateway.check_trade_intent(trade_intent)

    assert not ok
    assert reason == "agent_mode_safe_blocks_execution"


@pytest.mark.asyncio
async def test_permission_gate_agent_mode_semi_auto(
    gateway: RiskGateway,
    trade_intent: TradeIntent,
    mock_state_cache: MagicMock,
) -> None:
    """Agents in 'semi-auto' mode require human approval."""
    gateway.enable_trading()
    gateway.set_environment_healthy(True)
    mock_state_cache.get_agent_state.return_value = AgentState(
        agent_name="prime", mode="semi-auto", status="running"
    )

    ok, reason = await gateway.check_trade_intent(trade_intent)

    assert not ok
    assert reason == "agent_mode_semi_auto_needs_approval"


@pytest.mark.asyncio
async def test_permission_gate_account_kill_switch(
    gateway: RiskGateway,
    trade_intent: TradeIntent,
    mock_state_cache: MagicMock,
    auto_agent_state: AgentState,
) -> None:
    """Account-level kill switch blocks execution even in auto mode."""
    gateway.enable_trading()
    gateway.set_environment_healthy(True)
    mock_state_cache.get_agent_state.return_value = auto_agent_state
    gateway.set_account_kill_switch(True)

    ok, reason = await gateway.check_trade_intent(trade_intent)

    assert not ok
    assert reason == "account_kill_switch_active"


@pytest.mark.asyncio
async def test_user_intent_bypasses_agent_gate(
    gateway: RiskGateway, mock_state_cache: MagicMock, active_market: MagicMock
) -> None:
    """Manual 'user' intents skip the agent-state gate but still hit risk checks."""
    gateway.enable_trading()
    gateway.set_environment_healthy(True)
    mock_state_cache.get_agent_state.return_value = None
    mock_state_cache.get_market.return_value = active_market
    mock_state_cache.get_markets.return_value = {}
    mock_state_cache.get_balance.return_value = {"balance": "100.00"}
    mock_state_cache.get_account_limits.return_value = {}

    intent = TradeIntent(
        agent_name="user",
        ticker="KXBTC-25NOV",
        side="yes",
        action="buy",
        count_fp="1",
        price_dollars="0.50",
        reasoning="manual UI order",
    )

    ok, reason = await gateway.check_trade_intent(intent)

    assert ok, f"Expected approved but got: {reason}"
    assert reason == "approved"


# ---------------------------------------------------------------------------
# Circuit breaker
# ---------------------------------------------------------------------------


def test_circuit_breaker_closed_initially(gateway: RiskGateway) -> None:
    """Circuit breaker is closed (not open) on a freshly created gateway."""
    assert not gateway.is_circuit_open()


def test_circuit_breaker_does_not_open_below_threshold(gateway: RiskGateway) -> None:
    """Fewer than ``_CB_FAILURE_THRESHOLD`` failures must not open the breaker."""
    for _ in range(_CB_FAILURE_THRESHOLD - 1):
        gateway.record_submit_failure()

    assert not gateway.is_circuit_open()


def test_circuit_breaker_opens_at_threshold(gateway: RiskGateway) -> None:
    """Exactly ``_CB_FAILURE_THRESHOLD`` failures within the window opens the breaker."""
    for _ in range(_CB_FAILURE_THRESHOLD):
        gateway.record_submit_failure()

    assert gateway.is_circuit_open()


def test_circuit_breaker_opens_after_n_failures(gateway: RiskGateway) -> None:
    """More than threshold failures also keep the breaker open."""
    for _ in range(_CB_FAILURE_THRESHOLD + 2):
        gateway.record_submit_failure()

    assert gateway.is_circuit_open()


def test_circuit_breaker_resets_after_cooldown(gateway: RiskGateway) -> None:
    """After the cooldown period the breaker closes if the rolling window is clear."""
    with patch("backend.services.risk_gateway.time") as mock_time:
        # All 5 failures happen at t=0
        mock_time.monotonic.return_value = 0.0
        for _ in range(_CB_FAILURE_THRESHOLD):
            gateway.record_submit_failure()

        assert gateway.is_circuit_open()

        # Advance past cooldown AND past the rolling window so all failures
        # fall outside the window (cooldown=120s, window=60s → use 200s).
        mock_time.monotonic.return_value = _CB_COOLDOWN_SECS + _CB_ROLLING_WINDOW_SECS + 10.0

        assert not gateway.is_circuit_open()
        assert gateway._cb_opened_at is None


def test_circuit_breaker_stays_open_during_cooldown(gateway: RiskGateway) -> None:
    """The breaker must remain open while the cooldown has not yet elapsed."""
    with patch("backend.services.risk_gateway.time") as mock_time:
        mock_time.monotonic.return_value = 0.0
        for _ in range(_CB_FAILURE_THRESHOLD):
            gateway.record_submit_failure()

        # Advance to just before the cooldown expires
        mock_time.monotonic.return_value = _CB_COOLDOWN_SECS - 1.0

        assert gateway.is_circuit_open()


@pytest.mark.asyncio
async def test_circuit_breaker_blocks_trade_intents(
    enabled_gateway: RiskGateway, trade_intent: TradeIntent
) -> None:
    """check_trade_intent returns 'circuit_breaker_open' when the breaker is tripped."""
    for _ in range(_CB_FAILURE_THRESHOLD):
        enabled_gateway.record_submit_failure()

    ok, reason = await enabled_gateway.check_trade_intent(trade_intent)

    assert not ok
    assert reason == "circuit_breaker_open"


# ---------------------------------------------------------------------------
# Daily P&L
# ---------------------------------------------------------------------------


def test_daily_pnl_starts_at_zero(gateway: RiskGateway) -> None:
    """Daily PnL must begin at zero on a newly created gateway."""
    assert gateway.get_daily_pnl() == Decimal("0")


def test_record_pnl_accumulates(gateway: RiskGateway) -> None:
    """record_pnl adds the amount to the running daily total."""
    gateway.record_pnl(Decimal("10.00"))
    gateway.record_pnl(Decimal("-3.50"))

    assert gateway.get_daily_pnl() == pytest.approx(Decimal("6.50"))


def test_reset_daily_counters_clears_pnl(gateway: RiskGateway) -> None:
    """reset_daily_counters zeroes out the daily PnL."""
    gateway.record_pnl(Decimal("25.00"))
    gateway.reset_daily_counters()

    assert gateway.get_daily_pnl() == Decimal("0")


def test_daily_pnl_resets_on_new_day(gateway: RiskGateway) -> None:
    """Daily PnL resets automatically when the UTC date rolls over."""
    gateway.record_pnl(Decimal("20.00"))
    assert gateway.get_daily_pnl() == Decimal("20.00")

    # Simulate a date roll-over by back-dating the reset sentinel
    gateway._daily_reset_date = "1970-01-01"

    # Next access triggers _maybe_auto_reset which resets the counters
    assert gateway.get_daily_pnl() == Decimal("0")


# ---------------------------------------------------------------------------
# Risk checks
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_risk_check_market_not_found(
    enabled_gateway: RiskGateway,
    trade_intent: TradeIntent,
    mock_state_cache: MagicMock,
) -> None:
    """Orders for unknown markets are rejected."""
    mock_state_cache.get_market.return_value = None

    ok, reason = await enabled_gateway.check_trade_intent(trade_intent)

    assert not ok
    assert reason == "market_not_found"


@pytest.mark.asyncio
async def test_risk_check_market_not_active(
    enabled_gateway: RiskGateway,
    trade_intent: TradeIntent,
    mock_state_cache: MagicMock,
) -> None:
    """Orders for inactive markets are rejected with the market status included."""
    closed_market = MagicMock()
    closed_market.status = "closed"
    closed_market.event_ticker = "KXBTC"
    mock_state_cache.get_market.return_value = closed_market

    ok, reason = await enabled_gateway.check_trade_intent(trade_intent)

    assert not ok
    assert "market_not_active" in reason
    assert "closed" in reason


@pytest.mark.asyncio
async def test_risk_check_max_order_notional_exceeded(
    enabled_gateway: RiskGateway,
    mock_state_cache: MagicMock,
) -> None:
    """Notional (count × price) above the configured cap is rejected."""
    # settings.max_order_notional = 50.0; 10 × $6.00 = $60.00 > $50.00
    big_intent = TradeIntent(
        agent_name="prime",
        ticker="KXBTC-25NOV",
        side="yes",
        action="buy",
        count_fp="10",
        price_dollars="6.00",
        reasoning="oversized test order",
    )

    ok, reason = await enabled_gateway.check_trade_intent(big_intent)

    assert not ok
    assert "max_order_notional_exceeded" in reason


@pytest.mark.asyncio
async def test_risk_check_max_per_market_exposure(
    enabled_gateway: RiskGateway,
    trade_intent: TradeIntent,
    mock_state_cache: MagicMock,
) -> None:
    """Orders that would push per-market exposure above the cap are rejected."""
    # settings.max_per_market_exposure = 100.0; existing = 99.00 → adding
    # even 1 × $0.50 = $99.50, but let's push well over the limit.
    mock_state_cache.get_positions.return_value = {
        "KXBTC-25NOV": {"market_exposure": "100.00"}
    }

    ok, reason = await enabled_gateway.check_trade_intent(trade_intent)

    assert not ok
    assert "max_per_market_exposure_exceeded" in reason


@pytest.mark.asyncio
async def test_risk_check_max_per_event_exposure(
    enabled_gateway: RiskGateway,
    mock_state_cache: MagicMock,
    active_market: MagicMock,
) -> None:
    """Orders that would breach the per-event exposure cap are rejected."""
    # Create a sister market in the same event with high exposure.
    sister = MagicMock()
    sister.status = "active"
    sister.event_ticker = "KXBTC"  # same event as active_market

    mock_state_cache.get_markets.return_value = {
        "KXBTC-25NOV": active_market,
        "KXBTC-25DEC": sister,
    }
    # Existing position on the sister market already uses up event cap.
    mock_state_cache.get_positions.return_value = {
        "KXBTC-25DEC": {"market_exposure": "200.00"},  # at the cap already
    }

    ok, reason = await enabled_gateway.check_trade_intent(
        TradeIntent(
            agent_name="prime",
            ticker="KXBTC-25NOV",
            side="yes",
            action="buy",
            count_fp="1",
            price_dollars="0.50",
            reasoning="event exposure test",
        )
    )

    assert not ok
    assert "max_per_event_exposure_exceeded" in reason


@pytest.mark.asyncio
async def test_risk_check_daily_loss_cap(
    enabled_gateway: RiskGateway,
    trade_intent: TradeIntent,
) -> None:
    """Further orders are rejected once the daily loss cap is reached."""
    # settings.daily_loss_cap = 50.0
    enabled_gateway.record_pnl(Decimal("-50.00"))

    ok, reason = await enabled_gateway.check_trade_intent(trade_intent)

    assert not ok
    assert "daily_loss_cap_reached" in reason


@pytest.mark.asyncio
async def test_risk_check_balance_below_minimum(
    enabled_gateway: RiskGateway,
    trade_intent: TradeIntent,
    mock_state_cache: MagicMock,
) -> None:
    """Orders are rejected when account balance is below the minimum threshold."""
    # settings.min_balance_threshold = 5.0
    mock_state_cache.get_balance.return_value = {"balance": "2.00"}

    ok, reason = await enabled_gateway.check_trade_intent(trade_intent)

    assert not ok
    assert "balance_below_minimum" in reason


@pytest.mark.asyncio
async def test_risk_check_duplicate_client_order_id(
    enabled_gateway: RiskGateway,
    trade_intent: TradeIntent,
) -> None:
    """A second identical intent within the TTL window is rejected as a duplicate."""
    ok1, _ = await enabled_gateway.check_trade_intent(trade_intent)
    assert ok1, "First intent should be approved"

    # Submit the same intent again immediately — should be a duplicate
    ok2, reason = await enabled_gateway.check_trade_intent(trade_intent)

    assert not ok2
    assert "duplicate_client_order_id" in reason


# ---------------------------------------------------------------------------
# Happy path — all checks pass
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_approved_when_all_checks_pass(
    enabled_gateway: RiskGateway,
    trade_intent: TradeIntent,
) -> None:
    """check_trade_intent returns (True, 'approved') when nothing is blocking."""
    ok, reason = await enabled_gateway.check_trade_intent(trade_intent)

    assert ok
    assert reason == "approved"
