"""Shared pytest fixtures for the backend test suite.

All async tests use ``asyncio_mode = auto`` (configured in pytest.ini at the
``webpage/services/api/`` level), so coroutine test functions are collected
and run automatically without needing the ``@pytest.mark.asyncio`` decorator.
Decorators are still added for clarity.
"""

from __future__ import annotations

from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import pytest

from backend.config import Settings
from backend.models.schemas import AgentState, TradeIntent


# ---------------------------------------------------------------------------
# Minimal Settings (no real Kalshi credentials required)
# ---------------------------------------------------------------------------


@pytest.fixture
def settings() -> Settings:
    """Return a minimal :class:`Settings` instance safe for unit tests."""
    return Settings(
        environment="demo",
        api_key_id="test-api-key-id",
        private_key_pem="",
        max_order_notional=50.0,
        max_per_market_exposure=100.0,
        max_per_event_exposure=200.0,
        daily_loss_cap=50.0,
        min_balance_threshold=5.0,
        read_budget_per_second=10,
        write_budget_per_second=5,
        approval_timeout_seconds=60,
    )


# ---------------------------------------------------------------------------
# Mock StateCache
# ---------------------------------------------------------------------------


@pytest.fixture
def mock_state_cache() -> MagicMock:
    """Return a :class:`MagicMock` stand-in for :class:`StateCache`.

    Default return values represent a clean, unconstrained account so that
    individual tests only need to override the specific behaviour they care
    about.
    """
    cache = MagicMock()
    cache.get_agent_state.return_value = None
    cache.get_market.return_value = None
    cache.get_positions.return_value = {}
    cache.get_markets.return_value = {}
    cache.get_balance.return_value = {"balance": "100.00"}
    cache.get_account_limits.return_value = {}
    cache.add_risk_event = AsyncMock()
    cache.update_order = AsyncMock()
    cache.add_fill = AsyncMock()
    return cache


# ---------------------------------------------------------------------------
# Helpers — reusable model builders
# ---------------------------------------------------------------------------


@pytest.fixture
def auto_agent_state() -> AgentState:
    """An :class:`AgentState` configured for fully-autonomous execution."""
    return AgentState(
        agent_name="prime",
        mode="auto",
        status="running",
    )


@pytest.fixture
def trade_intent() -> TradeIntent:
    """A minimal valid :class:`TradeIntent` for the *prime* agent."""
    return TradeIntent(
        agent_name="prime",
        ticker="KXBTC-25NOV",
        side="yes",
        action="buy",
        count_fp="1",
        price_dollars="0.50",
        reasoning="unit test trade",
    )


@pytest.fixture
def active_market() -> MagicMock:
    """A mock market object with ``status="active"``."""
    market = MagicMock()
    market.status = "active"
    market.event_ticker = "KXBTC"
    return market
