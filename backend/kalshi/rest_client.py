"""kalshi/rest_client.py — Async REST client with token-bucket rate limiting and retry logic.

All Kalshi REST calls go through this client.  The client:
- Signs every request with RSA-PSS auth headers.
- Enforces separate read (GET) and write (POST/DELETE) token buckets.
- Retries failed requests according to the strategy defined in the PRD.
- Never logs sensitive header values or key material.
"""
from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

import aiohttp

from kalshi.auth import build_headers, load_private_key
import config

logger = logging.getLogger(__name__)

# ── Retry configuration ───────────────────────────────────────────────────────

_RETRY_TABLE: dict[int | str, tuple[float, int]] = {
    # (initial_delay_seconds, max_attempts)
    429: (0.1, 5),   # exponential backoff starting at 100 ms
    500: (0.5, 3),
    503: (1.0, 3),
    "timeout": (0.25, 3),
}
_NO_RETRY_CODES = {400, 401, 404}


# ── Token bucket ──────────────────────────────────────────────────────────────

class TokenBucket:
    """Simple async token bucket for rate limiting."""

    def __init__(self, capacity: int, refill_rate: float) -> None:
        self._capacity = capacity
        self._refill_rate = refill_rate       # tokens per second
        self._tokens: float = float(capacity)
        self._last_refill: float = time.monotonic()
        self._lock = asyncio.Lock()

    async def acquire(self) -> None:
        """Block until a token is available."""
        while True:
            async with self._lock:
                now = time.monotonic()
                elapsed = now - self._last_refill
                self._tokens = min(
                    self._capacity,
                    self._tokens + elapsed * self._refill_rate,
                )
                self._last_refill = now
                if self._tokens >= 1.0:
                    self._tokens -= 1.0
                    return
            # Not enough tokens — wait a short interval then retry
            await asyncio.sleep(0.05)


# ── REST client ───────────────────────────────────────────────────────────────

class KalshiRestClient:
    """Async REST client for the Kalshi Trade API.

    One instance should exist per environment (live / demo).
    """

    def __init__(self, environment: str) -> None:
        self._env = environment
        self._base_url = config.base_url(environment)
        self._api_key: str | None = None
        self._private_key = None
        self._session: aiohttp.ClientSession | None = None

        # Token buckets: reads = 20/s, writes = 10/s
        self._read_bucket = TokenBucket(capacity=20, refill_rate=20)
        self._write_bucket = TokenBucket(capacity=10, refill_rate=10)

    def configure(self, api_key: str, private_key_pem_path: str) -> None:
        """Load credentials (called after keys are provided via the Control API)."""
        self._api_key = api_key
        self._private_key = load_private_key(private_key_pem_path)

    def is_configured(self) -> bool:
        return bool(self._api_key and self._private_key)

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=30, connect=10)
            self._session = aiohttp.ClientSession(timeout=timeout)
        return self._session

    async def close(self) -> None:
        if self._session and not self._session.closed:
            await self._session.close()

    def _full_path(self, endpoint: str) -> str:
        """Return the URL path portion (no host) for signing."""
        # endpoint should start with / e.g. /markets
        if not endpoint.startswith("/"):
            endpoint = "/" + endpoint
        return f"/trade-api/v2{endpoint}"

    def _full_url(self, endpoint: str) -> str:
        return f"{self._base_url}{endpoint}"

    async def _request(
        self,
        method: str,
        endpoint: str,
        params: dict | None = None,
        json_body: dict | None = None,
    ) -> dict[str, Any]:
        """Core request method with rate limiting and retry."""
        is_write = method.upper() in ("POST", "DELETE")
        bucket = self._write_bucket if is_write else self._read_bucket

        path = self._full_path(endpoint)
        url = self._full_url(endpoint)

        # Determine retry strategy
        max_attempts = 1  # default: no retry unless error code matches table
        attempt = 0

        while True:
            await bucket.acquire()

            if not self.is_configured():
                raise RuntimeError(f"[{self._env}] REST client not configured — no API keys loaded.")

            headers = build_headers(self._api_key, self._private_key, method, path)
            session = await self._get_session()

            try:
                async with session.request(
                    method,
                    url,
                    headers=headers,
                    params=params,
                    json=json_body,
                ) as resp:
                    status = resp.status

                    if status == 200 or status == 201:
                        return await resp.json()

                    if status in _NO_RETRY_CODES:
                        text = await resp.text()
                        logger.warning(
                            "Kalshi REST non-retryable error",
                            extra={"status": status, "endpoint": endpoint, "body": text[:500]},
                        )
                        resp.raise_for_status()

                    if status == 401:
                        # Auth failure — halt trading via exception
                        logger.error("Kalshi 401 Unauthorized — check API key and private key.")
                        raise PermissionError("Kalshi 401 Unauthorized")

                    if status in _RETRY_TABLE:
                        base_delay, max_att = _RETRY_TABLE[status]
                        max_attempts = max_att
                        if attempt < max_attempts:
                            # Exponential backoff for 429, fixed for others
                            delay = base_delay * (2 ** attempt) if status == 429 else base_delay
                            attempt += 1
                            logger.warning(
                                "Kalshi REST retryable error",
                                extra={"status": status, "endpoint": endpoint, "attempt": attempt, "delay": delay},
                            )
                            await asyncio.sleep(delay)
                            continue

                    text = await resp.text()
                    logger.error(
                        "Kalshi REST request failed",
                        extra={"status": status, "endpoint": endpoint, "body": text[:500]},
                    )
                    resp.raise_for_status()

            except asyncio.TimeoutError:
                base_delay, max_att = _RETRY_TABLE["timeout"]
                if attempt < max_att:
                    attempt += 1
                    await asyncio.sleep(base_delay)
                    continue
                raise

    # ── Public REST helpers ───────────────────────────────────────────────────

    async def get(self, endpoint: str, params: dict | None = None) -> dict[str, Any]:
        return await self._request("GET", endpoint, params=params)

    async def post(self, endpoint: str, body: dict) -> dict[str, Any]:
        return await self._request("POST", endpoint, json_body=body)

    async def delete(self, endpoint: str) -> dict[str, Any]:
        return await self._request("DELETE", endpoint)

    # ── Convenience wrappers ──────────────────────────────────────────────────

    async def get_markets(self, **kwargs) -> dict[str, Any]:
        return await self.get("/markets", params=kwargs or None)

    async def get_market(self, ticker: str) -> dict[str, Any]:
        return await self.get(f"/markets/{ticker}")

    async def get_balance(self) -> dict[str, Any]:
        return await self.get("/portfolio/balance")

    async def get_positions(self, **kwargs) -> dict[str, Any]:
        return await self.get("/portfolio/positions", params=kwargs or None)

    async def get_orders(self, **kwargs) -> dict[str, Any]:
        return await self.get("/portfolio/orders", params=kwargs or None)

    async def get_order(self, order_id: str) -> dict[str, Any]:
        return await self.get(f"/portfolio/orders/{order_id}")

    async def create_order(self, body: dict) -> dict[str, Any]:
        return await self.post("/portfolio/orders", body)

    async def cancel_order(self, order_id: str) -> dict[str, Any]:
        return await self.delete(f"/portfolio/orders/{order_id}")

    async def get_fills(self, **kwargs) -> dict[str, Any]:
        return await self.get("/portfolio/fills", params=kwargs or None)

    async def get_exchange_status(self) -> dict[str, Any]:
        return await self.get("/exchange/status")
