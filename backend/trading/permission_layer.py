"""trading/permission_layer.py — Trading Permission Layer.

Acts as a gate between the Agent Runtime and the Execution Engine.
All TradeIntents must pass three checks before being forwarded:
  1. Global trading enabled?
  2. Active environment configured with API keys?
  3. Is the originating agent in Auto mode?

If any check fails the intent is silently dropped (no error raised to the agent).
The global kill switch immediately halts all trading.
"""
from __future__ import annotations

import logging
from uuid import UUID

from trading.trade_intent import TradeIntent

logger = logging.getLogger(__name__)


class TradingPermissionLayer:
    """Permission gate for TradeIntents."""

    def __init__(self) -> None:
        self._global_trading_enabled: bool = False
        self._active_environment: str = "demo"
        self._keys_loaded: dict[str, bool] = {"live": False, "demo": False}
        # Maps agent_id → mode ("Auto" | "SemiAuto" | "FullStop")
        self._agent_modes: dict[str, str] = {}
        # Downstream callback: called with (intent, environment) when approved
        self._on_approved = None

    def set_on_approved(self, callback) -> None:
        """Register the callback that receives approved TradeIntents."""
        self._on_approved = callback

    # ── State setters (called by Control API) ────────────────────────────────

    def set_global_trading(self, enabled: bool) -> None:
        self._global_trading_enabled = enabled
        logger.info("Global trading toggled", extra={"enabled": enabled})

    def set_environment(self, environment: str) -> None:
        self._active_environment = environment

    def set_keys_loaded(self, environment: str, loaded: bool) -> None:
        self._keys_loaded[environment] = loaded

    def set_agent_mode(self, agent_id: str | UUID, mode: str) -> None:
        self._agent_modes[str(agent_id)] = mode

    def is_global_trading_enabled(self) -> bool:
        return self._global_trading_enabled

    def get_environment(self) -> str:
        return self._active_environment

    # ── Permission check ──────────────────────────────────────────────────────

    async def submit(self, intent: TradeIntent) -> None:
        """Evaluate a TradeIntent through all permission levels."""
        # Level 1: Global kill switch
        if not self._global_trading_enabled:
            return

        # Level 2: Environment configured?
        env = self._active_environment
        if not self._keys_loaded.get(env, False):
            return

        # Level 3: Agent in Auto mode?
        agent_mode = self._agent_modes.get(str(intent.agent_id), "FullStop")
        if agent_mode != "Auto":
            return

        # All checks passed — forward to execution
        if self._on_approved:
            await self._on_approved(intent, env)
