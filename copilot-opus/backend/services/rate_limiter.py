"""Token-bucket rate limiter for the Kalshi API client.

Maintains two independent buckets — **read** and **write** — each refilled at
a configurable rate (tokens per second).  An async :meth:`acquire` call either
succeeds immediately when a token is available or sleeps until one is
replenished.

Execution-critical paths (order submit / cancel) may pass ``priority=True``
to jump ahead of non-critical callers waiting on the same bucket.

Usage::

    limiter = RateLimiter(config)
    await limiter.acquire("read")          # normal read
    await limiter.acquire("write", priority=True)  # urgent execution path
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from typing import Literal

import structlog

from backend.config import Settings

log = structlog.get_logger(__name__)

BucketName = Literal["read", "write"]

# Non-priority waiters add ``_JITTER_FACTOR * wait`` of random jitter so that
# priority waiters (which sleep exactly the deficit interval) consistently wake
# and re-acquire the lock first.
_JITTER_FACTOR = 0.1


@dataclass
class _Bucket:
    """Internal state for a single token bucket.

    Attributes:
        rate: Tokens added per second.
        capacity: Maximum tokens the bucket can hold (equals *rate*).
        tokens: Current number of available tokens.
        last_refill: Monotonic timestamp of the last refill.
        lock: Serialises access under asyncio concurrency.
        priority_waiters: Count of priority callers currently waiting.
    """

    rate: float
    capacity: float
    tokens: float = field(init=False)
    last_refill: float = field(init=False)
    lock: asyncio.Lock = field(default_factory=asyncio.Lock, repr=False)
    priority_waiters: int = field(default=0, repr=False)

    def __post_init__(self) -> None:
        self.tokens = self.capacity
        self.last_refill = time.monotonic()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _refill(self) -> None:
        """Add tokens accrued since the last refill."""
        now = time.monotonic()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
        self.last_refill = now


class RateLimiter:
    """Async token-bucket rate limiter with read / write separation.

    Parameters
    ----------
    config:
        Application :class:`~backend.config.Settings` instance.  The fields
        ``read_budget_per_second`` and ``write_budget_per_second`` control the
        refill rates.
    """

    def __init__(self, config: Settings) -> None:
        self._buckets: dict[BucketName, _Bucket] = {
            "read": _Bucket(
                rate=float(config.read_budget_per_second),
                capacity=float(config.read_budget_per_second),
            ),
            "write": _Bucket(
                rate=float(config.write_budget_per_second),
                capacity=float(config.write_budget_per_second),
            ),
        }

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def acquire(
        self,
        bucket: BucketName,
        *,
        priority: bool = False,
    ) -> None:
        """Acquire a single token from *bucket*, waiting if necessary.

        Parameters
        ----------
        bucket:
            ``"read"`` or ``"write"``.
        priority:
            When ``True`` the caller is woken before non-priority waiters
            that are queued on the same bucket.  Use this for
            execution-critical paths such as order submission and
            cancellation.
        """
        b = self._buckets[bucket]

        while True:
            async with b.lock:
                b._refill()
                if b.tokens >= 1.0:
                    b.tokens -= 1.0
                    return

                # Calculate wait time for next token.
                deficit = 1.0 - b.tokens
                wait = deficit / b.rate

            log.debug(
                "rate_limiter_throttled",
                bucket=bucket,
                priority=priority,
                wait_seconds=round(wait, 4),
            )

            if priority:
                # Priority callers register themselves so non-priority
                # waiters know to back off, then sleep the exact deficit.
                b.priority_waiters += 1
                try:
                    await asyncio.sleep(wait)
                finally:
                    b.priority_waiters -= 1
            else:
                # Non-priority callers add jitter so that any priority
                # waiter sleeping the exact deficit wakes and grabs the
                # lock first.
                await asyncio.sleep(wait + wait * _JITTER_FACTOR)
                # If a priority waiter is currently contending, yield
                # repeatedly to let it acquire the lock ahead of us.
                while b.priority_waiters > 0:
                    await asyncio.sleep(0)
