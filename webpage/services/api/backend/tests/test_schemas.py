"""Tests for Pydantic data models in :mod:`backend.models.schemas`.

Covers:
* :class:`TradeIntent` — valid construction, field validation, optional fields.
* :class:`AgentState` — default values and mode literal constraints.
* :class:`Market` — status and market_type literals.
* :class:`OrderRequest` — conditional price fields.
* :class:`RiskEvent` — construction with required fields.
* :class:`Environment` — enum values and membership.
"""

from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

import pytest
from pydantic import ValidationError

from backend.config import Environment
from backend.models.schemas import (
    AgentState,
    Market,
    OrderRequest,
    RiskEvent,
    TradeIntent,
)


# ---------------------------------------------------------------------------
# TradeIntent
# ---------------------------------------------------------------------------


class TestTradeIntent:
    """Tests for :class:`TradeIntent`."""

    def test_valid_buy_intent(self) -> None:
        """A fully-specified buy intent can be constructed without error."""
        intent = TradeIntent(
            agent_name="prime",
            ticker="KXBTC-25NOV",
            side="yes",
            action="buy",
            count_fp="2",
            price_dollars="0.45",
            reasoning="momentum signal detected",
        )

        assert intent.agent_name == "prime"
        assert intent.ticker == "KXBTC-25NOV"
        assert intent.side == "yes"
        assert intent.action == "buy"
        assert intent.count_fp == "2"
        assert intent.price_dollars == "0.45"
        assert intent.reasoning == "momentum signal detected"
        assert intent.pattern_detected is None  # optional default

    def test_valid_sell_no_side(self) -> None:
        """A sell intent on the 'no' side is also valid."""
        intent = TradeIntent(
            agent_name="arbitrage",
            ticker="KXELEC-25DEC",
            side="no",
            action="sell",
            count_fp="5",
            price_dollars="0.30",
            reasoning="hedge exit",
        )

        assert intent.side == "no"
        assert intent.action == "sell"

    def test_pattern_detected_optional(self) -> None:
        """pattern_detected is optional and defaults to None."""
        intent = TradeIntent(
            agent_name="prime",
            ticker="KXBTC-25NOV",
            side="yes",
            action="buy",
            count_fp="1",
            price_dollars="0.50",
            reasoning="test",
        )

        assert intent.pattern_detected is None

    def test_pattern_detected_can_be_set(self) -> None:
        """pattern_detected can be supplied as a string."""
        intent = TradeIntent(
            agent_name="prime",
            ticker="KXBTC-25NOV",
            side="yes",
            action="buy",
            count_fp="1",
            price_dollars="0.50",
            reasoning="test",
            pattern_detected="head_and_shoulders",
        )

        assert intent.pattern_detected == "head_and_shoulders"

    def test_invalid_side_raises(self) -> None:
        """An unrecognised side value must raise a ValidationError."""
        with pytest.raises(ValidationError):
            TradeIntent(
                agent_name="prime",
                ticker="KXBTC-25NOV",
                side="maybe",  # invalid — only 'yes' or 'no'
                action="buy",
                count_fp="1",
                price_dollars="0.50",
                reasoning="test",
            )

    def test_invalid_action_raises(self) -> None:
        """An unrecognised action value must raise a ValidationError."""
        with pytest.raises(ValidationError):
            TradeIntent(
                agent_name="prime",
                ticker="KXBTC-25NOV",
                side="yes",
                action="hold",  # invalid — only 'buy' or 'sell'
                count_fp="1",
                price_dollars="0.50",
                reasoning="test",
            )

    def test_missing_required_field_raises(self) -> None:
        """Omitting a required field must raise a ValidationError."""
        with pytest.raises(ValidationError):
            TradeIntent(  # type: ignore[call-arg]
                agent_name="prime",
                # ticker missing
                side="yes",
                action="buy",
                count_fp="1",
                price_dollars="0.50",
                reasoning="test",
            )


# ---------------------------------------------------------------------------
# AgentState
# ---------------------------------------------------------------------------


class TestAgentState:
    """Tests for :class:`AgentState`."""

    def test_auto_mode_construction(self) -> None:
        """An agent in auto mode can be constructed with required fields only."""
        state = AgentState(
            agent_name="prime",
            mode="auto",
            status="running",
        )

        assert state.agent_name == "prime"
        assert state.mode == "auto"
        assert state.status == "running"

    def test_defaults_are_zero(self) -> None:
        """Numeric fields default to zero; optional datetime is None."""
        state = AgentState(
            agent_name="beta",
            mode="safe",
            status="idle",
        )

        assert state.total_trades == 0
        assert state.win_count == 0
        assert state.loss_count == 0
        assert state.realized_pnl == Decimal("0")
        assert state.last_decision_time is None

    def test_semi_auto_mode(self) -> None:
        """semi-auto is a valid mode literal."""
        state = AgentState(
            agent_name="gamma",
            mode="semi-auto",
            status="waiting",
        )

        assert state.mode == "semi-auto"

    def test_safe_mode(self) -> None:
        """safe is a valid mode literal."""
        state = AgentState(
            agent_name="delta",
            mode="safe",
            status="disabled",
        )

        assert state.mode == "safe"

    def test_invalid_mode_raises(self) -> None:
        """An unrecognised mode must raise a ValidationError."""
        with pytest.raises(ValidationError):
            AgentState(
                agent_name="rogue",
                mode="yolo",  # invalid
                status="running",
            )

    def test_realized_pnl_tracks_decimal(self) -> None:
        """realized_pnl preserves Decimal precision."""
        state = AgentState(
            agent_name="prime",
            mode="auto",
            status="running",
            realized_pnl=Decimal("123.456"),
        )

        assert state.realized_pnl == Decimal("123.456")

    def test_last_decision_time_can_be_set(self) -> None:
        """last_decision_time accepts a timezone-aware datetime."""
        now = datetime.now(timezone.utc)
        state = AgentState(
            agent_name="prime",
            mode="auto",
            status="running",
            last_decision_time=now,
        )

        assert state.last_decision_time == now


# ---------------------------------------------------------------------------
# Market
# ---------------------------------------------------------------------------


class TestMarket:
    """Tests for :class:`Market`."""

    _BASE_TIMESTAMPS = {
        "open_time": datetime(2025, 1, 1, tzinfo=timezone.utc),
        "close_time": datetime(2025, 12, 31, tzinfo=timezone.utc),
        "created_time": datetime(2024, 11, 1, tzinfo=timezone.utc),
    }

    def _make(self, **overrides) -> Market:
        """Build a minimal valid :class:`Market`."""
        base = dict(
            ticker="KXBTC-25NOV",
            event_ticker="KXBTC",
            market_type="binary",
            status="active",
            **self._BASE_TIMESTAMPS,
        )
        base.update(overrides)
        return Market(**base)

    def test_active_market(self) -> None:
        """Active binary market can be constructed without error."""
        market = self._make()

        assert market.ticker == "KXBTC-25NOV"
        assert market.event_ticker == "KXBTC"
        assert market.status == "active"
        assert market.market_type == "binary"

    def test_all_valid_statuses(self) -> None:
        """Every documented market status is accepted by the model."""
        valid_statuses = [
            "initialized",
            "inactive",
            "active",
            "closed",
            "determined",
            "disputed",
            "amended",
            "finalized",
        ]

        for status in valid_statuses:
            market = self._make(status=status)
            assert market.status == status

    def test_invalid_status_raises(self) -> None:
        """An unrecognised status must raise a ValidationError."""
        with pytest.raises(ValidationError):
            self._make(status="open")  # 'open' is not in the Literal

    def test_scalar_market_type(self) -> None:
        """Scalar market type is accepted."""
        market = self._make(market_type="scalar")
        assert market.market_type == "scalar"

    def test_invalid_market_type_raises(self) -> None:
        """An invalid market type must raise a ValidationError."""
        with pytest.raises(ValidationError):
            self._make(market_type="ternary")  # not in Literal


# ---------------------------------------------------------------------------
# OrderRequest
# ---------------------------------------------------------------------------


class TestOrderRequest:
    """Tests for :class:`OrderRequest`."""

    def test_yes_side_order(self) -> None:
        """A limit buy on the yes side is valid with yes_price_dollars set."""
        req = OrderRequest(
            ticker="KXBTC-25NOV",
            side="yes",
            action="buy",
            count_fp="3",
            type="limit",
            yes_price_dollars="0.60",
        )

        assert req.yes_price_dollars == "0.60"
        assert req.no_price_dollars is None

    def test_no_side_order(self) -> None:
        """A limit sell on the no side is valid with no_price_dollars set."""
        req = OrderRequest(
            ticker="KXBTC-25NOV",
            side="no",
            action="sell",
            count_fp="2",
            type="limit",
            no_price_dollars="0.40",
        )

        assert req.no_price_dollars == "0.40"
        assert req.yes_price_dollars is None

    def test_market_order_type(self) -> None:
        """Market order type is accepted."""
        req = OrderRequest(
            ticker="KXBTC-25NOV",
            side="yes",
            action="buy",
            count_fp="1",
            type="market",
        )

        assert req.type == "market"

    def test_client_order_id_defaults_to_empty_string(self) -> None:
        """client_order_id defaults to an empty string when not provided."""
        req = OrderRequest(
            ticker="KXBTC-25NOV",
            side="yes",
            action="buy",
            count_fp="1",
            type="limit",
        )

        assert req.client_order_id == ""


# ---------------------------------------------------------------------------
# RiskEvent
# ---------------------------------------------------------------------------


class TestRiskEvent:
    """Tests for :class:`RiskEvent`."""

    def test_valid_construction(self) -> None:
        """A RiskEvent can be constructed with all required fields."""
        now = datetime.now(timezone.utc)
        event = RiskEvent(
            event_type="trade_rejected",
            agent_name="prime",
            ticker="KXBTC-25NOV",
            reason="max_order_notional_exceeded",
            timestamp=now,
        )

        assert event.event_type == "trade_rejected"
        assert event.agent_name == "prime"
        assert event.ticker == "KXBTC-25NOV"
        assert event.reason == "max_order_notional_exceeded"
        assert event.timestamp == now

    def test_missing_reason_raises(self) -> None:
        """Omitting the required 'reason' field must raise a ValidationError."""
        with pytest.raises(ValidationError):
            RiskEvent(  # type: ignore[call-arg]
                event_type="trade_rejected",
                agent_name="prime",
                ticker="KXBTC-25NOV",
                # reason missing
                timestamp=datetime.now(timezone.utc),
            )


# ---------------------------------------------------------------------------
# Environment enum
# ---------------------------------------------------------------------------


class TestEnvironmentEnum:
    """Tests for the :class:`Environment` enum in :mod:`backend.config`."""

    def test_live_value(self) -> None:
        """Environment.LIVE has value 'live'."""
        assert Environment.LIVE == "live"
        assert Environment.LIVE.value == "live"

    def test_demo_value(self) -> None:
        """Environment.DEMO has value 'demo'."""
        assert Environment.DEMO == "demo"
        assert Environment.DEMO.value == "demo"

    def test_only_two_members(self) -> None:
        """Exactly two environments are defined."""
        assert len(Environment) == 2

    def test_membership_from_string(self) -> None:
        """Environment can be created from its string value."""
        assert Environment("live") is Environment.LIVE
        assert Environment("demo") is Environment.DEMO

    def test_invalid_value_raises(self) -> None:
        """An unrecognised string raises ValueError."""
        with pytest.raises(ValueError):
            Environment("staging")

    def test_is_str_subclass(self) -> None:
        """Environment inherits from str, enabling direct string comparison."""
        assert isinstance(Environment.LIVE, str)
        assert Environment.DEMO == "demo"
