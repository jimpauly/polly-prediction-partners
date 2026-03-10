"""Tests for StateCache order eviction."""

from __future__ import annotations

from datetime import datetime, timezone, timedelta

import pytest

from backend.services.state_cache import StateCache
from backend.models.schemas import Order


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_order(
    order_id: str,
    status: str = "resting",
    last_update_time: datetime | None = None,
) -> Order:
    if last_update_time is None:
        last_update_time = datetime.now(timezone.utc)
    return Order(
        order_id=order_id,
        ticker="KXBTC-25NOV",
        status=status,
        side="yes",
        yes_price_dollars="0.50",
        fill_count_fp="0",
        remaining_count_fp="1",
        initial_count_fp="1",
        created_time=last_update_time,
        last_update_time=last_update_time,
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


class TestEvictTerminalOrders:
    """Verify stale filled/cancelled orders are evicted from cache."""

    @pytest.mark.asyncio
    async def test_no_eviction_under_cap(self) -> None:
        """Orders below the cap should not be evicted."""
        cache = StateCache()
        for i in range(10):
            await cache.update_order(f"ORD-{i}", _make_order(f"ORD-{i}", "executed"))

        removed = cache.evict_terminal_orders(cap=100)
        assert removed == 0
        assert len(cache.get_orders()) == 10

    @pytest.mark.asyncio
    async def test_eviction_removes_oldest_terminal(self) -> None:
        """Oldest terminal orders should be evicted first."""
        cache = StateCache()
        base = datetime(2025, 1, 1, tzinfo=timezone.utc)

        # Add 5 terminal orders with increasing timestamps
        for i in range(5):
            order = _make_order(
                f"ORD-{i}",
                "executed",
                last_update_time=base + timedelta(hours=i),
            )
            await cache.update_order(f"ORD-{i}", order)

        # Cap at 3 — should evict 2 oldest
        removed = cache.evict_terminal_orders(cap=3)
        assert removed == 2
        remaining = cache.get_orders()
        assert len(remaining) == 3
        # ORD-0, ORD-1 should be gone (oldest)
        assert "ORD-0" not in remaining
        assert "ORD-1" not in remaining
        # ORD-2, ORD-3, ORD-4 should remain
        assert "ORD-2" in remaining
        assert "ORD-3" in remaining
        assert "ORD-4" in remaining

    @pytest.mark.asyncio
    async def test_resting_orders_never_evicted(self) -> None:
        """Resting orders should not be evicted even if over cap."""
        cache = StateCache()
        base = datetime(2025, 1, 1, tzinfo=timezone.utc)

        # 3 resting + 2 terminal
        for i in range(3):
            await cache.update_order(
                f"REST-{i}",
                _make_order(f"REST-{i}", "resting", base + timedelta(hours=i)),
            )
        for i in range(2):
            await cache.update_order(
                f"TERM-{i}",
                _make_order(f"TERM-{i}", "executed", base + timedelta(hours=i)),
            )

        # Cap at 3 — should evict 2 terminal, keep all resting
        removed = cache.evict_terminal_orders(cap=3)
        assert removed == 2
        remaining = cache.get_orders()
        assert len(remaining) == 3
        assert all(k.startswith("REST") for k in remaining)

    @pytest.mark.asyncio
    async def test_evict_canceled_orders(self) -> None:
        """Cancelled orders should also be evicted."""
        cache = StateCache()
        base = datetime(2025, 1, 1, tzinfo=timezone.utc)

        await cache.update_order(
            "ORD-A",
            _make_order("ORD-A", "canceled", base),
        )
        await cache.update_order(
            "ORD-B",
            _make_order("ORD-B", "resting", base + timedelta(hours=1)),
        )

        removed = cache.evict_terminal_orders(cap=1)
        assert removed == 1
        remaining = cache.get_orders()
        assert "ORD-A" not in remaining
        assert "ORD-B" in remaining
