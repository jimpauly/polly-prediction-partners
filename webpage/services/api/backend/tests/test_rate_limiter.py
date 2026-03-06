"""Tests for :class:`backend.services.rate_limiter.RateLimiter`.

Covers:
* Buckets start fully loaded.
* Acquiring a token decrements the bucket count.
* Read and write buckets are independent of each other.
* The bucket refills proportionally to elapsed wall-clock time.
* Priority and non-priority callers each complete without error.
"""

from __future__ import annotations

import asyncio
import time
from unittest.mock import patch

import pytest

from backend.services.rate_limiter import RateLimiter, _JITTER_FACTOR, _Bucket


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _drain_bucket(b: _Bucket) -> None:
    """Unconditionally empty a bucket's token store."""
    b.tokens = 0.0
    b.last_refill = time.monotonic()


# ---------------------------------------------------------------------------
# Initial state
# ---------------------------------------------------------------------------


def test_read_bucket_starts_full(settings) -> None:
    """The read bucket starts with tokens equal to its rate (capacity)."""
    limiter = RateLimiter(settings)
    b = limiter._buckets["read"]

    assert b.tokens == pytest.approx(float(settings.read_budget_per_second))


def test_write_bucket_starts_full(settings) -> None:
    """The write bucket starts with tokens equal to its rate (capacity)."""
    limiter = RateLimiter(settings)
    b = limiter._buckets["write"]

    assert b.tokens == pytest.approx(float(settings.write_budget_per_second))


def test_bucket_capacity_matches_rate(settings) -> None:
    """Capacity is always equal to the configured rate."""
    limiter = RateLimiter(settings)

    for name in ("read", "write"):
        b = limiter._buckets[name]
        assert b.capacity == b.rate


# ---------------------------------------------------------------------------
# Acquire — immediate success
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_acquire_read_succeeds_when_tokens_available(settings) -> None:
    """acquire('read') completes immediately while tokens are available."""
    limiter = RateLimiter(settings)

    # Should not block — the bucket starts full
    await asyncio.wait_for(limiter.acquire("read"), timeout=1.0)


@pytest.mark.asyncio
async def test_acquire_write_succeeds_when_tokens_available(settings) -> None:
    """acquire('write') completes immediately while tokens are available."""
    limiter = RateLimiter(settings)

    await asyncio.wait_for(limiter.acquire("write"), timeout=1.0)


@pytest.mark.asyncio
async def test_acquire_decrements_token_count(settings) -> None:
    """Each successful acquire reduces the bucket's token count by 1."""
    limiter = RateLimiter(settings)
    b = limiter._buckets["write"]

    before = b.tokens
    await limiter.acquire("write")

    # _refill() is called on every acquire, so allow a tiny drift; the net
    # effect over a near-instant call is essentially −1.
    assert b.tokens == pytest.approx(before - 1.0, abs=0.05)


@pytest.mark.asyncio
async def test_priority_acquire_completes_without_error(settings) -> None:
    """acquire with priority=True completes normally on a full bucket."""
    limiter = RateLimiter(settings)

    await asyncio.wait_for(limiter.acquire("write", priority=True), timeout=1.0)


@pytest.mark.asyncio
async def test_multiple_sequential_acquires(settings) -> None:
    """Multiple sequential acquires each consume exactly one token."""
    limiter = RateLimiter(settings)
    b = limiter._buckets["write"]
    # write_budget_per_second=5, so we can drain 5 tokens without waiting.
    capacity = int(b.capacity)

    for _ in range(capacity):
        await asyncio.wait_for(limiter.acquire("write"), timeout=1.0)

    assert b.tokens == pytest.approx(0.0, abs=0.1)


# ---------------------------------------------------------------------------
# Read and write buckets are independent
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_read_and_write_buckets_are_independent(settings) -> None:
    """Draining the read bucket has no effect on the write bucket."""
    limiter = RateLimiter(settings)
    read_b = limiter._buckets["read"]
    write_b = limiter._buckets["write"]

    # Drain the read bucket entirely
    _drain_bucket(read_b)

    # Write bucket should be unaffected
    assert write_b.tokens > 0.0

    # Can still immediately acquire from the write bucket
    await asyncio.wait_for(limiter.acquire("write"), timeout=1.0)


@pytest.mark.asyncio
async def test_draining_write_does_not_affect_read(settings) -> None:
    """Draining the write bucket has no effect on the read bucket."""
    limiter = RateLimiter(settings)
    read_b = limiter._buckets["read"]
    write_b = limiter._buckets["write"]

    _drain_bucket(write_b)

    assert read_b.tokens > 0.0
    await asyncio.wait_for(limiter.acquire("read"), timeout=1.0)


# ---------------------------------------------------------------------------
# Bucket refills over time
# ---------------------------------------------------------------------------


def test_bucket_refill_adds_tokens_proportional_to_elapsed_time(settings) -> None:
    """_refill() adds tokens proportional to elapsed time × rate."""
    limiter = RateLimiter(settings)
    b = limiter._buckets["read"]

    _drain_bucket(b)
    assert b.tokens == pytest.approx(0.0)

    with patch("backend.services.rate_limiter.time") as mock_time:
        # Simulate 1 full second passing since the last refill
        mock_time.monotonic.return_value = b.last_refill + 1.0
        b._refill()

    # After 1 second the bucket should have gained exactly `rate` tokens
    # (capped at capacity).
    expected = min(float(settings.read_budget_per_second), b.capacity)
    assert b.tokens == pytest.approx(expected, abs=0.01)


def test_bucket_refill_does_not_exceed_capacity(settings) -> None:
    """_refill() never allows tokens to exceed the bucket capacity."""
    limiter = RateLimiter(settings)
    b = limiter._buckets["read"]

    with patch("backend.services.rate_limiter.time") as mock_time:
        # Simulate a very long elapsed time
        mock_time.monotonic.return_value = b.last_refill + 9999.0
        b._refill()

    assert b.tokens <= b.capacity


def test_partial_second_refill(settings) -> None:
    """A partial-second elapsed window adds a proportional fraction of tokens."""
    limiter = RateLimiter(settings)
    b = limiter._buckets["read"]

    _drain_bucket(b)

    elapsed = 0.1  # 100 ms
    with patch("backend.services.rate_limiter.time") as mock_time:
        mock_time.monotonic.return_value = b.last_refill + elapsed
        b._refill()

    expected = elapsed * float(settings.read_budget_per_second)
    assert b.tokens == pytest.approx(expected, abs=0.001)


# ---------------------------------------------------------------------------
# Priority waiter mechanics
# ---------------------------------------------------------------------------


def test_priority_waiters_counter_initial_zero(settings) -> None:
    """Each bucket's priority_waiters counter starts at zero."""
    limiter = RateLimiter(settings)

    for b in limiter._buckets.values():
        assert b.priority_waiters == 0


@pytest.mark.asyncio
async def test_priority_waiter_sleeps_less_than_non_priority(settings) -> None:
    """Priority callers sleep for the exact deficit; non-priority adds jitter.

    We verify this by inspecting the sleep durations captured via a mock.
    Because the mock replaces the real sleep, we manually replenish tokens
    after the first sleep so the retry succeeds.
    """
    limiter = RateLimiter(settings)
    b = limiter._buckets["write"]

    # Set up a partial-token bucket so that one sleep is required.
    b.tokens = 0.5
    b.last_refill = time.monotonic()

    priority_sleep_durations: list[float] = []
    normal_sleep_durations: list[float] = []

    async def mock_sleep_priority(t: float) -> None:
        priority_sleep_durations.append(t)
        b.tokens = 1.0  # replenish so the retry succeeds

    async def mock_sleep_normal(t: float) -> None:
        normal_sleep_durations.append(t)
        b.tokens = 1.0  # replenish

    # --- priority caller ---
    with patch("backend.services.rate_limiter.asyncio.sleep", side_effect=mock_sleep_priority):
        await limiter.acquire("write", priority=True)

    priority_wait = priority_sleep_durations[0]

    # Reset bucket for the non-priority test
    b.tokens = 0.5
    b.last_refill = time.monotonic()

    # --- non-priority caller ---
    with patch("backend.services.rate_limiter.asyncio.sleep", side_effect=mock_sleep_normal):
        await limiter.acquire("write", priority=False)

    normal_wait = normal_sleep_durations[0]

    # Non-priority adds a jitter of (wait * _JITTER_FACTOR), so it must sleep
    # strictly longer than the priority caller.
    assert normal_wait > priority_wait
    # And the extra sleep should be approximately JITTER_FACTOR × priority_wait.
    assert normal_wait == pytest.approx(priority_wait * (1 + _JITTER_FACTOR), rel=0.05)
