"""Async Kalshi REST API client.

Wraps every Kalshi v2 REST endpoint with automatic request signing,
structured logging, and retry logic (429 / 5xx).
"""

from __future__ import annotations

import asyncio
import random
from typing import Any
from urllib.parse import urlencode, urlparse

import httpx
import structlog

from backend.models.schemas import Market
from backend.utils.auth import sign_request

log = structlog.get_logger(__name__)

_MAX_RETRIES_RATE_LIMIT = 5
_MAX_RETRIES_SERVER_ERROR = 3
_BACKOFF_BASE = 0.5  # seconds
_BACKOFF_MAX = 30.0  # seconds


class KalshiAPIError(Exception):
    """Raised when the Kalshi API returns an error response."""

    def __init__(self, status_code: int, detail: str, method: str, path: str) -> None:
        self.status_code = status_code
        self.detail = detail
        self.method = method
        self.path = path
        super().__init__(
            f"Kalshi API error {status_code} {method} {path}: {detail}"
        )


class KalshiRestClient:
    """Async HTTP client for the Kalshi REST API v2.

    Usage::

        async with KalshiRestClient(settings) as client:
            markets, cursor = await client.get_markets(limit=20)
    """

    def __init__(self, config) -> None:
        self._base_url: str = config.rest_base_url
        self._api_key_id: str = config.api_key_id
        self._private_key_pem: str = config.private_key_pem.get_secret_value()
        self._client: httpx.AsyncClient = httpx.AsyncClient(
            base_url=self._base_url,
            timeout=httpx.Timeout(30.0, connect=10.0),
        )

    # -- context-manager support ------------------------------------------------

    async def __aenter__(self) -> KalshiRestClient:
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        await self.close()

    async def close(self) -> None:
        """Shut down the underlying HTTP transport."""
        await self._client.aclose()

    # -- internal helpers -------------------------------------------------------

    def _sign(self, method: str, full_path: str) -> dict[str, str]:
        """Return Kalshi auth headers for *method* and *full_path*."""
        return sign_request(
            private_key_pem=self._private_key_pem,
            api_key_id=self._api_key_id,
            method=method,
            path=full_path,
        )

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json_body: dict[str, Any] | None = None,
    ) -> Any:
        """Execute a signed HTTP request with retry logic.

        Returns the parsed JSON response body.
        """
        # Build the full path that the signing function expects. The base URL
        # already contains ``/trade-api/v2`` so we only need to combine.
        parsed_base = urlparse(self._base_url)
        full_path = parsed_base.path.rstrip("/") + "/" + path.lstrip("/")

        # Append query string so the signature covers it.
        if params:
            cleaned = {k: v for k, v in params.items() if v is not None}
            if cleaned:
                full_path = f"{full_path}?{urlencode(cleaned, doseq=True)}"

        attempt = 0
        while True:
            auth_headers = self._sign(method.upper(), full_path)

            log.debug(
                "kalshi_request",
                method=method.upper(),
                path=full_path,
                attempt=attempt,
            )

            response = await self._client.request(
                method.upper(),
                path,
                params=params,
                json=json_body,
                headers=auth_headers,
            )

            # --- Success ---
            if response.is_success:
                return response.json()

            status = response.status_code

            # --- Rate-limited (429) ---
            if status == 429 and attempt < _MAX_RETRIES_RATE_LIMIT:
                retry_after = response.headers.get("Retry-After")
                if retry_after is not None:
                    delay = float(retry_after)
                else:
                    delay = _backoff(attempt)
                log.warning(
                    "kalshi_rate_limited",
                    status=status,
                    retry_after=delay,
                    attempt=attempt,
                )
                await asyncio.sleep(delay)
                attempt += 1
                continue

            # --- Server error (5xx) ---
            if 500 <= status < 600 and attempt < _MAX_RETRIES_SERVER_ERROR:
                delay = _backoff(attempt)
                log.warning(
                    "kalshi_server_error",
                    status=status,
                    retry_delay=delay,
                    attempt=attempt,
                )
                await asyncio.sleep(delay)
                attempt += 1
                continue

            # --- Client error (4xx) or exhausted retries ---
            detail = _safe_error_detail(response)
            log.error(
                "kalshi_api_error",
                status=status,
                detail=detail,
                method=method.upper(),
                path=full_path,
            )
            raise KalshiAPIError(status, detail, method.upper(), full_path)

    # =========================================================================
    # Market Discovery
    # =========================================================================

    async def get_markets(
        self,
        limit: int = 100,
        cursor: str | None = None,
        event_ticker: str | None = None,
        series_ticker: str | None = None,
        status: str | None = None,
        max_close_ts: int | None = None,
        min_close_ts: int | None = None,
    ) -> tuple[list[Market], str]:
        """Fetch a page of markets."""
        params: dict[str, Any] = {"limit": limit}
        if cursor is not None:
            params["cursor"] = cursor
        if event_ticker is not None:
            params["event_ticker"] = event_ticker
        if series_ticker is not None:
            params["series_ticker"] = series_ticker
        if status is not None:
            params["status"] = status
        if max_close_ts is not None:
            params["max_close_ts"] = max_close_ts
        if min_close_ts is not None:
            params["min_close_ts"] = min_close_ts

        data = await self._request("GET", "/markets", params=params)
        markets = [Market.model_validate(m) for m in data.get("markets", [])]
        return markets, data.get("cursor", "")

    async def get_market(self, ticker: str) -> Market:
        """Fetch a single market by ticker."""
        data = await self._request("GET", f"/markets/{ticker}")
        return Market.model_validate(data.get("market", data))

    async def get_events(
        self,
        limit: int = 100,
        cursor: str | None = None,
        status: str | None = None,
        series_ticker: str | None = None,
        with_nested_markets: bool = False,
    ) -> tuple[list[dict], str]:
        """Fetch a page of events."""
        params: dict[str, Any] = {"limit": limit}
        if cursor is not None:
            params["cursor"] = cursor
        if status is not None:
            params["status"] = status
        if series_ticker is not None:
            params["series_ticker"] = series_ticker
        if with_nested_markets:
            params["with_nested_markets"] = "true"

        data = await self._request("GET", "/events", params=params)
        return data.get("events", []), data.get("cursor", "")

    async def get_event(self, event_ticker: str) -> dict:
        """Fetch a single event."""
        data = await self._request("GET", f"/events/{event_ticker}")
        return data.get("event", data)

    async def get_series(self, series_ticker: str) -> dict:
        """Fetch a single series."""
        data = await self._request("GET", f"/series/{series_ticker}")
        return data.get("series", data)

    async def get_market_orderbook(self, ticker: str, depth: int = 10) -> dict:
        """Fetch the order book for a market."""
        params: dict[str, Any] = {"depth": depth}
        data = await self._request(
            "GET", f"/markets/{ticker}/orderbook", params=params
        )
        return data.get("orderbook", data)

    async def get_market_candlesticks(
        self,
        series_ticker: str,
        market_ticker: str,
        start_ts: int | None = None,
        end_ts: int | None = None,
        period_interval: int | None = None,
    ) -> list[dict]:
        """Fetch OHLCV candlesticks for a market."""
        params: dict[str, Any] = {}
        if start_ts is not None:
            params["start_ts"] = start_ts
        if end_ts is not None:
            params["end_ts"] = end_ts
        if period_interval is not None:
            params["period_interval"] = period_interval

        data = await self._request(
            "GET",
            f"/series/{series_ticker}/markets/{market_ticker}/candlesticks",
            params=params,
        )
        return data.get("candlesticks", [])

    async def get_trades(
        self,
        limit: int = 100,
        cursor: str | None = None,
        ticker: str | None = None,
        min_ts: int | None = None,
        max_ts: int | None = None,
    ) -> tuple[list[dict], str]:
        """Fetch public trade history."""
        params: dict[str, Any] = {"limit": limit}
        if cursor is not None:
            params["cursor"] = cursor
        if ticker is not None:
            params["ticker"] = ticker
        if min_ts is not None:
            params["min_ts"] = min_ts
        if max_ts is not None:
            params["max_ts"] = max_ts

        data = await self._request("GET", "/markets/trades", params=params)
        return data.get("trades", []), data.get("cursor", "")

    # =========================================================================
    # Portfolio
    # =========================================================================

    async def get_balance(self) -> dict:
        """Return account balance."""
        data = await self._request("GET", "/portfolio/balance")
        return data.get("balance", data)

    async def get_positions(
        self,
        limit: int = 100,
        cursor: str | None = None,
        ticker: str | None = None,
        count_filter: str | None = None,
    ) -> tuple[list[dict], str]:
        """Fetch portfolio positions."""
        params: dict[str, Any] = {"limit": limit}
        if cursor is not None:
            params["cursor"] = cursor
        if ticker is not None:
            params["ticker"] = ticker
        if count_filter is not None:
            params["count_filter"] = count_filter

        data = await self._request(
            "GET", "/portfolio/positions", params=params
        )
        return (
            data.get("market_positions", []),
            data.get("cursor", ""),
        )

    async def get_portfolio_orders(
        self,
        limit: int = 100,
        cursor: str | None = None,
        ticker: str | None = None,
        status: str | None = None,
    ) -> tuple[list[dict], str]:
        """Fetch portfolio orders."""
        params: dict[str, Any] = {"limit": limit}
        if cursor is not None:
            params["cursor"] = cursor
        if ticker is not None:
            params["ticker"] = ticker
        if status is not None:
            params["status"] = status

        data = await self._request("GET", "/portfolio/orders", params=params)
        return data.get("orders", []), data.get("cursor", "")

    async def get_portfolio_fills(
        self,
        limit: int = 100,
        cursor: str | None = None,
        ticker: str | None = None,
        order_id: str | None = None,
    ) -> tuple[list[dict], str]:
        """Fetch portfolio fills."""
        params: dict[str, Any] = {"limit": limit}
        if cursor is not None:
            params["cursor"] = cursor
        if ticker is not None:
            params["ticker"] = ticker
        if order_id is not None:
            params["order_id"] = order_id

        data = await self._request("GET", "/portfolio/fills", params=params)
        return data.get("fills", []), data.get("cursor", "")

    # =========================================================================
    # Order Actions
    # =========================================================================

    async def create_order(self, order_request: dict) -> dict:
        """Place a new order."""
        data = await self._request(
            "POST", "/portfolio/orders", json_body=order_request
        )
        return data.get("order", data)

    async def cancel_order(self, order_id: str) -> dict:
        """Cancel a resting order."""
        data = await self._request(
            "DELETE", f"/portfolio/orders/{order_id}"
        )
        return data

    # =========================================================================
    # Exchange
    # =========================================================================

    async def get_exchange_status(self) -> dict:
        """Return current exchange status."""
        return await self._request("GET", "/exchange/status")

    async def get_exchange_schedule(self) -> dict:
        """Return the exchange schedule."""
        return await self._request("GET", "/exchange/schedule")

    async def get_account_limits(self) -> dict:
        """Return account-level trading limits."""
        data = await self._request("GET", "/portfolio/account/limits")
        return data

    # =========================================================================
    # Historical
    # =========================================================================

    async def get_historical_cutoff(self) -> dict:
        """Return the historical data cutoff timestamp."""
        return await self._request("GET", "/markets/historical/cutoff")

    async def get_historical_markets(
        self,
        limit: int = 100,
        cursor: str | None = None,
        event_ticker: str | None = None,
    ) -> tuple[list[dict], str]:
        """Fetch historical (closed/settled) markets."""
        params: dict[str, Any] = {"limit": limit}
        if cursor is not None:
            params["cursor"] = cursor
        if event_ticker is not None:
            params["event_ticker"] = event_ticker

        data = await self._request(
            "GET", "/markets/historical", params=params
        )
        return data.get("markets", []), data.get("cursor", "")

    async def get_historical_fills(
        self,
        limit: int = 100,
        cursor: str | None = None,
        ticker: str | None = None,
    ) -> tuple[list[dict], str]:
        """Fetch historical fills."""
        params: dict[str, Any] = {"limit": limit}
        if cursor is not None:
            params["cursor"] = cursor
        if ticker is not None:
            params["ticker"] = ticker

        data = await self._request(
            "GET", "/portfolio/fills/historical", params=params
        )
        return data.get("fills", []), data.get("cursor", "")


# ---------------------------------------------------------------------------
# Module-level helpers
# ---------------------------------------------------------------------------


def _backoff(attempt: int) -> float:
    """Exponential backoff with full jitter."""
    exp = min(_BACKOFF_BASE * (2**attempt), _BACKOFF_MAX)
    # Not security-sensitive: jitter for retry backoff only.
    return random.uniform(0, exp)  # noqa: S311


def _safe_error_detail(response: httpx.Response) -> str:
    """Extract a human-readable error from a response without leaking secrets."""
    try:
        body = response.json()
        if isinstance(body, dict):
            return body.get("message") or body.get("error") or str(body)
        return str(body)
    except Exception:
        text = response.text[:500] if response.text else "(empty body)"
        return text
