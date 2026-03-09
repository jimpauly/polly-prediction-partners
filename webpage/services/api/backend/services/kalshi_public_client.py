"""Lightweight async client for Kalshi **public** (unauthenticated) REST endpoints.

Kalshi exposes several read-only endpoints that require no API key or request
signing.  This client fetches market and event data directly from the Kalshi
production API so the Trading Studio can display live market cards even before
the user has entered their API credentials.

Only ``GET`` endpoints that Kalshi documents as publicly accessible are used:
  * ``GET /markets``
  * ``GET /events``
  * ``GET /markets/{ticker}/orderbook``
"""

from __future__ import annotations

import asyncio
from typing import Any

import httpx
import structlog

log = structlog.get_logger(__name__)

# Default to the Kalshi production API (covers all market types despite the
# "elections" subdomain).
_DEFAULT_BASE_URL = "https://api.elections.kalshi.com/trade-api/v2"

_MAX_RETRIES = 3
_BACKOFF_BASE = 1.0  # seconds


class KalshiPublicClient:
    """Fetch market discovery data from Kalshi without authentication."""

    def __init__(self, base_url: str = _DEFAULT_BASE_URL) -> None:
        self._base_url = base_url
        self._client = httpx.AsyncClient(
            base_url=self._base_url,
            timeout=httpx.Timeout(30.0, connect=10.0),
        )

    async def close(self) -> None:
        await self._client.aclose()

    # -- internal -------------------------------------------------------

    async def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        """Execute an unauthenticated GET with retry on transient errors."""
        last_exc: Exception | None = None
        for attempt in range(_MAX_RETRIES):
            try:
                resp = await self._client.get(path, params=params)
                if resp.status_code == 429:
                    wait = _BACKOFF_BASE * (2 ** attempt)
                    log.warning("public_api_rate_limited", wait=wait)
                    await asyncio.sleep(wait)
                    continue
                if resp.status_code >= 500:
                    wait = _BACKOFF_BASE * (2 ** attempt)
                    log.warning("public_api_server_error", status=resp.status_code, wait=wait)
                    await asyncio.sleep(wait)
                    continue
                resp.raise_for_status()
                return resp.json()
            except (httpx.HTTPStatusError, httpx.RequestError) as exc:
                last_exc = exc
                if attempt < _MAX_RETRIES - 1:
                    await asyncio.sleep(_BACKOFF_BASE * (2 ** attempt))
        log.error("public_api_request_failed", path=path, error=str(last_exc))
        return None

    # -- public endpoints -----------------------------------------------

    async def get_markets(
        self,
        limit: int = 200,
        cursor: str | None = None,
        status: str | None = None,
    ) -> tuple[list[dict], str]:
        """Fetch a page of markets (unauthenticated)."""
        params: dict[str, Any] = {"limit": limit}
        if cursor:
            params["cursor"] = cursor
        if status:
            params["status"] = status
        data = await self._get("/markets", params=params)
        if data is None:
            return [], ""
        return data.get("markets", []), data.get("cursor", "")

    async def get_events(
        self,
        limit: int = 200,
        cursor: str | None = None,
        status: str | None = None,
        with_nested_markets: bool = False,
    ) -> tuple[list[dict], str]:
        """Fetch a page of events (unauthenticated)."""
        params: dict[str, Any] = {"limit": limit}
        if cursor:
            params["cursor"] = cursor
        if status:
            params["status"] = status
        if with_nested_markets:
            params["with_nested_markets"] = "true"
        data = await self._get("/events", params=params)
        if data is None:
            return [], ""
        return data.get("events", []), data.get("cursor", "")

    async def fetch_all_active_markets(self) -> list[dict]:
        """Paginate through all active markets."""
        all_markets: list[dict] = []
        cursor: str | None = None
        while True:
            page, cursor = await self.get_markets(
                status="active", limit=200, cursor=cursor or None,
            )
            all_markets.extend(page)
            if not cursor:
                break
        return all_markets

    async def get_series(self, series_ticker: str) -> dict | None:
        """Fetch a single series by ticker (unauthenticated)."""
        data = await self._get(f"/series/{series_ticker}")
        if data is None:
            return None
        return data.get("series", data)

    async def fetch_all_open_events(self) -> list[dict]:
        """Paginate through all open events."""
        all_events: list[dict] = []
        cursor: str | None = None
        while True:
            page, cursor = await self.get_events(
                status="open", limit=200, cursor=cursor or None,
            )
            all_events.extend(page)
            if not cursor:
                break
        return all_events
