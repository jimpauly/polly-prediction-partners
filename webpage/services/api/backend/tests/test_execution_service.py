"""Tests for the ExecutionService — fill feedback loop, DB persistence, and
order lifecycle.
"""

from __future__ import annotations

from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from backend.config import Settings
from backend.models.schemas import AgentState, TradeIntent
from backend.services.execution_service import ExecutionService
from backend.services.risk_gateway import RiskGateway
from backend.services.state_cache import StateCache


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def settings() -> Settings:
    return Settings(
        environment="demo",
        api_key_id="test-key",
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


@pytest.fixture
def state_cache() -> StateCache:
    return StateCache()


@pytest.fixture
def risk_gateway(settings: Settings, state_cache: StateCache) -> RiskGateway:
    return RiskGateway(settings, state_cache)


@pytest.fixture
def mock_rest_client() -> MagicMock:
    client = MagicMock()
    client.create_order = AsyncMock(
        return_value={"order_id": "ORD-001", "status": "resting"},
    )
    client.cancel_order = AsyncMock(return_value={"order_id": "ORD-001"})
    return client


@pytest.fixture
def mock_position_sizer() -> MagicMock:
    sizer = MagicMock()
    sizer.record_trade_result = MagicMock()
    sizer.get_agent_record = MagicMock(
        return_value={
            "agent_name": "prime",
            "wins": 3,
            "losses": 1,
            "total_trades": 4,
            "win_rate": "0.75",
            "cumulative_pnl": "5.00",
            "current_tier": 0,
        },
    )
    return sizer


@pytest.fixture
def mock_database() -> MagicMock:
    db = MagicMock()
    db.upsert_order = AsyncMock()
    db.insert_fill = AsyncMock()
    db.save_agent_state = AsyncMock()
    db.insert_audit_log = AsyncMock()
    return db


@pytest.fixture
def mock_agent() -> MagicMock:
    agent = MagicMock()
    agent.agent_name = "prime"
    agent.record_outcome = AsyncMock()
    # Prime/Praxis have record_outcome but NOT record_trade_pnl
    # Delete record_trade_pnl so hasattr returns False for it
    del agent.record_trade_pnl
    return agent


@pytest.fixture
def execution_service(
    settings: Settings,
    mock_rest_client: MagicMock,
    risk_gateway: RiskGateway,
    state_cache: StateCache,
    mock_position_sizer: MagicMock,
    mock_database: MagicMock,
    mock_agent: MagicMock,
) -> ExecutionService:
    return ExecutionService(
        settings,
        mock_rest_client,
        risk_gateway,
        state_cache,
        position_sizer=mock_position_sizer,
        database=mock_database,
        agents={"prime": mock_agent},
    )


@pytest.fixture
def trade_intent() -> TradeIntent:
    return TradeIntent(
        agent_name="prime",
        ticker="KXBTC-25NOV",
        side="yes",
        action="buy",
        count_fp="1",
        price_dollars="0.50",
        reasoning="unit test trade",
    )


# ---------------------------------------------------------------------------
# Tests — Fill feedback loop
# ---------------------------------------------------------------------------


class TestFillFeedbackLoop:
    """Verify that fills notify agents and position sizer."""

    @pytest.mark.asyncio
    async def test_process_fill_records_in_position_sizer(
        self, execution_service: ExecutionService, mock_position_sizer: MagicMock,
    ) -> None:
        """Position sizer should receive record_trade_result on every fill."""
        # Simulate an order being placed by "prime"
        execution_service._order_agent_map["ORD-001"] = "prime"

        fill_data = {
            "fill_id": "FILL-001",
            "order_id": "ORD-001",
            "ticker": "KXBTC-25NOV",
            "side": "yes",
            "action": "buy",
            "count_fp": "1",
            "yes_price_fixed": "0.50",
            "no_price_fixed": "0.50",
            "fee_cost": "0.01",
        }

        await execution_service.process_fill(fill_data)

        mock_position_sizer.record_trade_result.assert_called_once()
        call_args = mock_position_sizer.record_trade_result.call_args
        assert call_args[0][0] == "prime"  # agent_name
        assert isinstance(call_args[0][1], Decimal)  # pnl

    @pytest.mark.asyncio
    async def test_process_fill_notifies_agent(
        self,
        execution_service: ExecutionService,
        mock_agent: MagicMock,
    ) -> None:
        """Agent should be notified of fill outcome."""
        execution_service._order_agent_map["ORD-002"] = "prime"

        fill_data = {
            "fill_id": "FILL-002",
            "order_id": "ORD-002",
            "ticker": "KXBTC-25NOV",
            "side": "yes",
            "action": "sell",
            "count_fp": "1",
            "yes_price_fixed": "0.60",
            "no_price_fixed": "0.40",
            "fee_cost": "0.01",
        }

        await execution_service.process_fill(fill_data)

        # Agent.record_outcome should have been called
        mock_agent.record_outcome.assert_called_once()

    @pytest.mark.asyncio
    async def test_process_fill_skips_user_agent(
        self,
        execution_service: ExecutionService,
        mock_position_sizer: MagicMock,
    ) -> None:
        """User (manual) orders should still update position sizer but not notify an agent."""
        execution_service._order_agent_map["ORD-003"] = "user"

        fill_data = {
            "fill_id": "FILL-003",
            "order_id": "ORD-003",
            "ticker": "KXBTC-25NOV",
            "side": "yes",
            "action": "buy",
            "count_fp": "1",
            "yes_price_fixed": "0.50",
            "no_price_fixed": "0.50",
            "fee_cost": "0.00",
        }

        await execution_service.process_fill(fill_data)

        # Position sizer should still be called
        mock_position_sizer.record_trade_result.assert_called_once()

    @pytest.mark.asyncio
    async def test_process_fill_unknown_order(
        self,
        execution_service: ExecutionService,
        mock_position_sizer: MagicMock,
    ) -> None:
        """Fills for unknown orders should not crash."""
        fill_data = {
            "fill_id": "FILL-004",
            "order_id": "UNKNOWN-ORDER",
            "ticker": "KXBTC-25NOV",
            "side": "yes",
            "action": "buy",
            "count_fp": "1",
            "yes_price_fixed": "0.50",
            "no_price_fixed": "0.50",
            "fee_cost": "0.00",
        }

        await execution_service.process_fill(fill_data)

        # No agent name resolved — position sizer should NOT be called
        mock_position_sizer.record_trade_result.assert_not_called()


# ---------------------------------------------------------------------------
# Tests — DB persistence
# ---------------------------------------------------------------------------


class TestDBPersistence:
    """Verify that orders and fills are persisted to the database."""

    @pytest.mark.asyncio
    async def test_submit_order_persists_to_db(
        self,
        execution_service: ExecutionService,
        mock_database: MagicMock,
        trade_intent: TradeIntent,
    ) -> None:
        """submit_order should call db.upsert_order."""
        await execution_service.submit_order(trade_intent)

        mock_database.upsert_order.assert_called_once()
        call_args = mock_database.upsert_order.call_args
        assert call_args[0][0] == "demo"  # environment
        assert call_args[0][1] == "ORD-001"  # order_id

    @pytest.mark.asyncio
    async def test_process_fill_persists_to_db(
        self,
        execution_service: ExecutionService,
        mock_database: MagicMock,
    ) -> None:
        """process_fill should call db.insert_fill."""
        fill_data = {
            "fill_id": "FILL-005",
            "order_id": "ORD-001",
            "ticker": "KXBTC-25NOV",
            "side": "yes",
            "action": "buy",
            "count_fp": "1",
            "yes_price_fixed": "0.50",
            "no_price_fixed": "0.50",
            "fee_cost": "0.00",
        }

        await execution_service.process_fill(fill_data)

        mock_database.insert_fill.assert_called_once()
        call_args = mock_database.insert_fill.call_args
        assert call_args[0][0] == "demo"  # environment
        assert call_args[0][1] == "FILL-005"  # fill_id

    @pytest.mark.asyncio
    async def test_process_order_update_persists_to_db(
        self,
        execution_service: ExecutionService,
        mock_database: MagicMock,
    ) -> None:
        """process_order_update should call db.upsert_order."""
        order_data = {
            "order_id": "ORD-001",
            "status": "executed",
            "ticker": "KXBTC-25NOV",
        }

        await execution_service.process_order_update(order_data)

        mock_database.upsert_order.assert_called_once()

    @pytest.mark.asyncio
    async def test_db_none_does_not_crash(
        self,
        settings: Settings,
        mock_rest_client: MagicMock,
        risk_gateway: RiskGateway,
        state_cache: StateCache,
        trade_intent: TradeIntent,
    ) -> None:
        """ExecutionService with database=None should work fine (no-op)."""
        svc = ExecutionService(
            settings,
            mock_rest_client,
            risk_gateway,
            state_cache,
            database=None,
        )

        await svc.submit_order(trade_intent)
        # Should not raise — DB calls are silently skipped


# ---------------------------------------------------------------------------
# Tests — Order agent attribution
# ---------------------------------------------------------------------------


class TestOrderAgentAttribution:
    """Verify that submit_order tracks agent attribution for fills."""

    @pytest.mark.asyncio
    async def test_submit_order_maps_order_id_to_agent(
        self,
        execution_service: ExecutionService,
        trade_intent: TradeIntent,
    ) -> None:
        """After submitting, the order_id should map back to the agent."""
        await execution_service.submit_order(trade_intent)

        assert "ORD-001" in execution_service._order_agent_map
        assert execution_service._order_agent_map["ORD-001"] == "prime"

    @pytest.mark.asyncio
    async def test_submit_order_maps_client_order_id_to_agent(
        self,
        execution_service: ExecutionService,
        trade_intent: TradeIntent,
    ) -> None:
        """After submitting, the client_order_id should also map to the agent."""
        await execution_service.submit_order(trade_intent)

        # At least one client_order_id entry should exist for "prime"
        agent_entries = [
            v
            for k, v in execution_service._order_agent_map.items()
            if v == "prime"
        ]
        assert len(agent_entries) >= 2  # order_id + client_order_id


# ---------------------------------------------------------------------------
# Tests — Cancel order
# ---------------------------------------------------------------------------


class TestCancelOrder:
    """Verify order cancellation works."""

    @pytest.mark.asyncio
    async def test_cancel_order_success(
        self,
        execution_service: ExecutionService,
        mock_rest_client: MagicMock,
    ) -> None:
        """cancel_order should call REST client and return status."""
        result = await execution_service.cancel_order("ORD-001")

        mock_rest_client.cancel_order.assert_called_once_with("ORD-001")
        assert result["status"] == "cancelled"
        assert result["order_id"] == "ORD-001"
