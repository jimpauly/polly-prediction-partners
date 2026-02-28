"""config.py — Environment configuration loader.

Reads all settings from a .env file (or real environment variables).
Never logs or exposes secret values.
"""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the backend directory (or parent, wherever it lives)
_env_path = Path(__file__).parent / ".env"
if not _env_path.exists():
    _env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)


def _require(key: str) -> str:
    """Return env var or raise a clear error."""
    value = os.getenv(key)
    if not value:
        raise EnvironmentError(f"Required environment variable '{key}' is not set.")
    return value


def _optional(key: str, default: str = "") -> str:
    return os.getenv(key, default)


# ── Kalshi credentials ────────────────────────────────────────────────────────

KALSHI_LIVE_API_KEY: str = _optional("KALSHI_LIVE_API_KEY")
KALSHI_LIVE_PRIVATE_KEY_PATH: str = _optional("KALSHI_LIVE_PRIVATE_KEY_PATH")

KALSHI_DEMO_API_KEY: str = _optional("KALSHI_DEMO_API_KEY")
KALSHI_DEMO_PRIVATE_KEY_PATH: str = _optional("KALSHI_DEMO_PRIVATE_KEY_PATH")

# ── Base URLs ─────────────────────────────────────────────────────────────────

KALSHI_LIVE_BASE_URL: str = "https://api.elections.kalshi.com/trade-api/v2"
KALSHI_DEMO_BASE_URL: str = "https://demo-api.kalshi.co/trade-api/v2"

KALSHI_LIVE_WS_URL: str = "wss://api.elections.kalshi.com/trade-api/ws/v2"
KALSHI_DEMO_WS_URL: str = "wss://demo-api.kalshi.co/trade-api/ws/v2"

# ── Database ──────────────────────────────────────────────────────────────────

DATABASE_URL: str = _optional("DATABASE_URL")

# ── Control API server ────────────────────────────────────────────────────────

CONTROL_API_HOST: str = _optional("CONTROL_API_HOST", "127.0.0.1")
CONTROL_API_PORT: int = int(_optional("CONTROL_API_PORT", "8100"))

# ── Active environment ────────────────────────────────────────────────────────

ACTIVE_ENVIRONMENT: str = _optional("ACTIVE_ENVIRONMENT", "demo")  # "live" | "demo"

# ── Trading flags ─────────────────────────────────────────────────────────────

GLOBAL_TRADING_ENABLED: bool = _optional("GLOBAL_TRADING_ENABLED", "false").lower() == "true"

# ── Derived helpers ───────────────────────────────────────────────────────────


def base_url(environment: str) -> str:
    return KALSHI_LIVE_BASE_URL if environment == "live" else KALSHI_DEMO_BASE_URL


def ws_url(environment: str) -> str:
    return KALSHI_LIVE_WS_URL if environment == "live" else KALSHI_DEMO_WS_URL


def api_key(environment: str) -> str:
    return KALSHI_LIVE_API_KEY if environment == "live" else KALSHI_DEMO_API_KEY


def private_key_path(environment: str) -> str:
    return KALSHI_LIVE_PRIVATE_KEY_PATH if environment == "live" else KALSHI_DEMO_PRIVATE_KEY_PATH
