"""Configuration module for Paulie's Prediction Partners backend.

Loads settings from environment variables (prefixed with ``PAULIES_``) and
an optional ``.env`` file.  Two fully-isolated environments are supported —
**live** and **demo** — each with its own Kalshi REST and WebSocket endpoints.
"""

from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    """Supported deployment environments."""

    LIVE = "live"
    DEMO = "demo"


_REST_BASE_URLS: dict[Environment, str] = {
    Environment.LIVE: "https://api.elections.kalshi.com/trade-api/v2",
    Environment.DEMO: "https://demo-api.kalshi.co/trade-api/v2",
}

_WS_URLS: dict[Environment, str] = {
    Environment.LIVE: "wss://api.elections.kalshi.com",
    Environment.DEMO: "wss://demo-api.kalshi.co",
}


class Settings(BaseSettings):
    """Application settings validated by Pydantic.

    All fields can be overridden via environment variables prefixed with
    ``PAULIES_`` (e.g. ``PAULIES_ENVIRONMENT=demo``).
    """

    model_config = SettingsConfigDict(
        env_prefix="PAULIES_",
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # --- Core ---
    environment: Literal["live", "demo"] = Field(
        default="live",
        description="Target Kalshi environment (live or demo).",
    )
    api_key_id: str = Field(
        default="",
        description="Kalshi API key identifier.",
    )
    private_key_pem: SecretStr = Field(
        default=SecretStr(""),
        description="RSA private key in PEM format used for request signing.",
    )

    # --- Server ---
    host: str = Field(
        default="127.0.0.1",
        description="Address the HTTP server binds to.",
    )
    port: int = Field(
        default=8000,
        description="Port the HTTP server listens on.",
    )
    log_level: str = Field(
        default="INFO",
        description="Python log level name.",
    )

    # --- Database ---
    db_url: str = Field(
        default="",
        description="Async database connection URL (e.g. postgresql+asyncpg://…).",
    )

    # --- Telemetry ---
    telemetry_enabled: bool = Field(
        default=False,
        description="Enable Prometheus metrics export.",
    )

    # --- Risk limits ---
    max_order_notional: float = Field(
        default=50.00,
        description="Maximum notional value for a single order in USD.",
    )
    max_per_market_exposure: float = Field(
        default=100.00,
        description="Maximum exposure per market in USD.",
    )
    max_per_event_exposure: float = Field(
        default=200.00,
        description="Maximum exposure per event in USD.",
    )
    daily_loss_cap: float = Field(
        default=50.00,
        description="Maximum allowable daily loss in USD.",
    )
    min_balance_threshold: float = Field(
        default=5.00,
        description="Minimum account balance required to place orders in USD.",
    )

    # --- Agent ---
    default_agent_mode: str = Field(
        default="safe",
        description="Default operating mode for autonomous agents.",
    )
    approval_timeout_seconds: int = Field(
        default=60,
        description="Seconds to wait for human approval before cancelling an action.",
    )

    # --- Rate limiting ---
    read_budget_per_second: int = Field(
        default=10,
        description="Maximum read requests per second.",
    )
    write_budget_per_second: int = Field(
        default=5,
        description="Maximum write requests per second.",
    )

    # --- Reconciliation ---
    reconciliation_interval_seconds: int = Field(
        default=3600,
        description="Seconds between automatic position reconciliation runs.",
    )

    # --- Derived URLs ---

    @property
    def rest_base_url(self) -> str:
        """Return the Kalshi REST base URL for the active environment."""
        return _REST_BASE_URLS[Environment(self.environment)]

    @property
    def ws_url(self) -> str:
        """Return the Kalshi WebSocket URL for the active environment."""
        return _WS_URLS[Environment(self.environment)]
