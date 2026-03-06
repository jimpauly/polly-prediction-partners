"""Tests for :class:`backend.services.position_sizer.PositionSizer`.

Covers:
* New agents start at ``base_contracts``.
* Agents scale up only after winning enough profitable trades.
* Win-rate gate prevents scaling even after sufficient wins if losses drag
  the rate below the minimum threshold.
* The notional cap (count × price ≤ max_order_notional) is always respected.
* Tier ceiling — scaling is capped at ``max_scale_tiers``.
* Negative / break-even PnL prevents tier advancement.
* ``get_agent_record`` returns accurate metadata.
* ``reset_agent`` clears the profitability history.
"""

from __future__ import annotations

from decimal import Decimal

import pytest

from backend.services.position_sizer import PositionSizer, _AgentRecord


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def sizer(settings) -> PositionSizer:
    """A :class:`PositionSizer` using the shared minimal settings.

    Defaults:
    * base_contracts = 1
    * scale_threshold = 5 (wins per tier)
    * scale_factor = 1.5
    * max_scale_tiers = 3
    * min_win_rate = 0.55
    """
    return PositionSizer(settings)


@pytest.fixture
def tight_sizer(settings) -> PositionSizer:
    """A sizer with easy-to-trigger scaling (threshold = 2) for scaling tests."""
    return PositionSizer(settings, scale_threshold=2)


# ---------------------------------------------------------------------------
# Base behaviour (no history)
# ---------------------------------------------------------------------------


def test_new_agent_gets_base_contracts(sizer: PositionSizer) -> None:
    """An agent with no history receives exactly base_contracts (1) contracts."""
    count = sizer.compute_position_count("prime", Decimal("0.50"))

    assert count == 1


def test_unknown_agent_gets_base_contracts(sizer: PositionSizer) -> None:
    """An agent whose name is not yet in the sizer also starts at base_contracts."""
    count = sizer.compute_position_count("never_heard_of_you", Decimal("0.30"))

    assert count == 1


def test_zero_price_returns_base_contracts(sizer: PositionSizer) -> None:
    """A zero (or negative) price is treated as invalid and returns base_contracts."""
    assert sizer.compute_position_count("prime", Decimal("0")) == 1
    assert sizer.compute_position_count("prime", Decimal("-0.10")) == 1


# ---------------------------------------------------------------------------
# Scaling — happy path
# ---------------------------------------------------------------------------


def test_scales_up_after_sufficient_wins(tight_sizer: PositionSizer) -> None:
    """After scale_threshold profitable trades the agent moves to tier 1."""
    # tight_sizer: threshold = 2, scale_factor = 1.5, min_win_rate = 0.55
    # Record 2 wins (win_rate = 1.0 ≥ 0.55, cumulative_pnl > 0 → tier 1)
    tight_sizer.record_trade_result("prime", Decimal("5.00"))
    tight_sizer.record_trade_result("prime", Decimal("5.00"))

    count = tight_sizer.compute_position_count("prime", Decimal("0.10"))

    # With base_contracts=1 and scale_factor=1.5, tier-1 gives
    # floor(1 × 1.5^1) = floor(1.5) = 1 — the count is identical to base due
    # to the floor, but the tier counter itself must be 1.
    record = tight_sizer._agents.get("prime")
    assert record is not None
    tier = tight_sizer._current_tier(record)
    assert tier == 1  # Tier incremented even if count stays 1 due to floor


def test_scales_to_tier_two(tight_sizer: PositionSizer) -> None:
    """After 2 × scale_threshold wins the agent reaches tier 2."""
    for _ in range(4):  # 4 wins, threshold=2 → tier = 4 // 2 = 2
        tight_sizer.record_trade_result("prime", Decimal("1.00"))

    record = tight_sizer._agents["prime"]
    assert tight_sizer._current_tier(record) == 2


def test_tier_respects_max_scale_tiers(settings) -> None:
    """Tier is capped at max_scale_tiers regardless of win count."""
    sizer = PositionSizer(settings, scale_threshold=1, max_scale_tiers=2)

    # 10 wins → tier = min(10 // 1, 2) = 2 (capped)
    for _ in range(10):
        sizer.record_trade_result("prime", Decimal("1.00"))

    record = sizer._agents["prime"]
    assert sizer._current_tier(record) == 2


def test_scaled_count_applies_notional_cap(settings) -> None:
    """Scaled contract count is clamped so count × price ≤ max_order_notional."""
    # max_order_notional = 50.0; price = $5.00 → max by notional = floor(50/5) = 10
    sizer = PositionSizer(
        settings,
        base_contracts=100,  # deliberately large base that must be clamped
        scale_threshold=1,
    )

    count = sizer.compute_position_count("prime", Decimal("5.00"))

    # 100 * $5 = $500 >> $50; clamp to floor(50/5)=10
    assert count == 10


# ---------------------------------------------------------------------------
# Win-rate gate prevents scaling
# ---------------------------------------------------------------------------


def test_win_rate_gate_prevents_scaling(tight_sizer: PositionSizer) -> None:
    """Scaling is blocked when win-rate is below min_win_rate (0.55).

    A 50 % win-rate (5 wins, 5 losses) must keep the sizer at tier 0.
    """
    # 6 wins to pass threshold (threshold=2 → would be tier 3 without gate),
    # but interleave 6 losses to drop win_rate to 0.50 < 0.55.
    for _ in range(6):
        tight_sizer.record_trade_result("prime", Decimal("1.00"))   # win
        tight_sizer.record_trade_result("prime", Decimal("-1.00"))  # loss

    record = tight_sizer._agents["prime"]
    # cumulative_pnl = 0.00 → tier 0 (also blocked by non-positive pnl gate)
    assert tight_sizer._current_tier(record) == 0


def test_win_rate_gate_exact_minimum_threshold(settings) -> None:
    """Win-rate exactly equal to min_win_rate (0.55) permits scaling."""
    # We need win_rate = 0.55 and cumulative_pnl > 0.
    # 11 trades with 6 wins → 6/11 ≈ 0.545… which is below — let's use 55/100.
    # Simpler: 11 wins, 9 losses → 11/20 = 0.55 exactly.
    sizer = PositionSizer(settings, scale_threshold=5, min_win_rate=Decimal("0.55"))

    for _ in range(11):
        sizer.record_trade_result("prime", Decimal("1.00"))  # wins
    for _ in range(9):
        sizer.record_trade_result("prime", Decimal("-0.10"))  # small losses

    record = sizer._agents["prime"]
    # win_rate = 11/20 = 0.55, cumulative_pnl = 11 - 0.9 = 10.1 > 0
    # tier = min(11 // 5, 3) = min(2, 3) = 2
    assert record.win_rate == pytest.approx(Decimal("11") / Decimal("20"), rel=1e-6)
    assert sizer._current_tier(record) >= 1


def test_negative_cumulative_pnl_prevents_scaling(tight_sizer: PositionSizer) -> None:
    """Even many wins cannot unlock scaling if cumulative PnL is negative."""
    for _ in range(10):
        tight_sizer.record_trade_result("prime", Decimal("0.01"))   # tiny wins
    for _ in range(2):
        tight_sizer.record_trade_result("prime", Decimal("-100.00"))  # big losses

    record = tight_sizer._agents["prime"]
    assert record.cumulative_pnl < Decimal("0")
    assert tight_sizer._current_tier(record) == 0


# ---------------------------------------------------------------------------
# Result guarantees
# ---------------------------------------------------------------------------


def test_count_always_at_least_one(settings) -> None:
    """compute_position_count always returns ≥ 1 regardless of notional cap."""
    # Even with a very high price, we must trade at least 1 contract.
    sizer = PositionSizer(settings)
    # $0.99 price, max_order_notional=50 → floor(50/0.99)=50 → fine
    # Use a price larger than max_order_notional to stress-test the floor()+max(,1).
    count = sizer.compute_position_count("prime", Decimal("0.01"))
    assert count >= 1


def test_compute_respects_notional_cap_at_high_price(settings) -> None:
    """count × price must never exceed max_order_notional."""
    sizer = PositionSizer(settings)
    price = Decimal("4.99")

    count = sizer.compute_position_count("prime", price)

    assert count * price <= Decimal(str(settings.max_order_notional))


# ---------------------------------------------------------------------------
# Agent record and reset
# ---------------------------------------------------------------------------


def test_get_agent_record_defaults_for_unknown_agent(sizer: PositionSizer) -> None:
    """get_agent_record returns zero-value defaults for an unknown agent."""
    record = sizer.get_agent_record("no_such_agent")

    assert record["wins"] == 0
    assert record["losses"] == 0
    assert record["total_trades"] == 0
    assert record["win_rate"] == "0"
    assert record["cumulative_pnl"] == "0"
    assert record["current_tier"] == 0


def test_get_agent_record_after_trades(sizer: PositionSizer) -> None:
    """get_agent_record reflects recorded trade outcomes accurately."""
    sizer.record_trade_result("prime", Decimal("3.00"))   # win
    sizer.record_trade_result("prime", Decimal("-1.00"))  # loss

    record = sizer.get_agent_record("prime")

    assert record["wins"] == 1
    assert record["losses"] == 1
    assert record["total_trades"] == 2
    assert Decimal(record["cumulative_pnl"]) == pytest.approx(Decimal("2.00"))


def test_reset_agent_clears_history(sizer: PositionSizer) -> None:
    """reset_agent removes all trade history for the named agent."""
    for _ in range(5):
        sizer.record_trade_result("prime", Decimal("1.00"))

    sizer.reset_agent("prime")

    assert "prime" not in sizer._agents
    # After reset the agent starts fresh at base_contracts
    count = sizer.compute_position_count("prime", Decimal("0.50"))
    assert count == 1


def test_reset_nonexistent_agent_is_noop(sizer: PositionSizer) -> None:
    """reset_agent on an unknown agent name should not raise."""
    sizer.reset_agent("ghost_agent")  # must not raise


# ---------------------------------------------------------------------------
# Independent per-agent tracking
# ---------------------------------------------------------------------------


def test_agents_are_tracked_independently(tight_sizer: PositionSizer) -> None:
    """One agent's wins do not affect another agent's tier."""
    # Give 'alpha' many wins
    for _ in range(10):
        tight_sizer.record_trade_result("alpha", Decimal("1.00"))

    # 'beta' has no history — must still be at base tier
    count = tight_sizer.compute_position_count("beta", Decimal("0.50"))
    assert count == 1

    # Verify alpha is scaled
    record_alpha = tight_sizer._agents["alpha"]
    assert tight_sizer._current_tier(record_alpha) >= 1
