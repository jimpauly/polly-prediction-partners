"""agents/base_agent.py — Abstract base class for all trading agents.

Defines:
- AgentLifecycleState enum
- BaseAgent abstract class with start/stop/pause/resume lifecycle
- Event-driven execution loop (wakes on market cache update, not polling)
- Safe exception isolation (one agent crash cannot affect others)
"""
from __future__ import annotations

import asyncio
import logging
from abc import ABC, abstractmethod
from enum import Enum
from typing import Optional
from uuid import UUID

from market_cache import MarketCache

logger = logging.getLogger(__name__)


class AgentLifecycleState(str, Enum):
    INITIALIZING = "INITIALIZING"
    ACTIVE = "ACTIVE"
    IDLE = "IDLE"
    PAUSED = "PAUSED"
    ERROR = "ERROR"
    STOPPED = "STOPPED"


class BaseAgent(ABC):
    """Abstract trading agent.

    Subclasses implement `on_market_update()` which is called whenever the
    market cache notifies of new data.  The agent loop wakes on the shared
    asyncio.Event — no polling.
    """

    def __init__(
        self,
        agent_id: UUID,
        agent_name: str,
        cache: MarketCache,
        permission_layer,
        broadcaster=None,
    ) -> None:
        self.agent_id = agent_id
        self.agent_name = agent_name
        self._cache = cache
        self._permission = permission_layer
        self._broadcaster = broadcaster

        self._state = AgentLifecycleState.INITIALIZING
        self._enabled = False
        self._mode = "FullStop"         # "Auto" | "SemiAuto" | "FullStop"
        self._task: Optional[asyncio.Task] = None
        self._pause_event = asyncio.Event()
        self._pause_event.set()         # not paused by default

    # ── Properties ────────────────────────────────────────────────────────────

    @property
    def state(self) -> AgentLifecycleState:
        return self._state

    @property
    def mode(self) -> str:
        return self._mode

    # ── Lifecycle control ─────────────────────────────────────────────────────

    def set_mode(self, mode: str) -> None:
        self._mode = mode
        self._permission.set_agent_mode(self.agent_id, mode)

    def enable(self) -> None:
        self._enabled = True

    def disable(self) -> None:
        self._enabled = False

    async def start(self) -> None:
        """Launch the agent as an asyncio Task."""
        if self._task and not self._task.done():
            return
        self._state = AgentLifecycleState.INITIALIZING
        await self._on_start()
        self._task = asyncio.create_task(self._run(), name=f"agent-{self.agent_name}")
        logger.info("Agent started", extra={"agent": self.agent_name, "id": str(self.agent_id)})

    async def stop(self) -> None:
        """Stop the agent gracefully."""
        self._state = AgentLifecycleState.STOPPED
        self._pause_event.set()       # unblock any wait
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        await self._on_stop()
        logger.info("Agent stopped", extra={"agent": self.agent_name})

    async def pause(self) -> None:
        self._state = AgentLifecycleState.PAUSED
        self._pause_event.clear()
        logger.info("Agent paused", extra={"agent": self.agent_name})

    async def resume(self) -> None:
        self._state = AgentLifecycleState.ACTIVE
        self._pause_event.set()
        logger.info("Agent resumed", extra={"agent": self.agent_name})

    # ── Main execution loop ───────────────────────────────────────────────────

    async def _run(self) -> None:
        self._state = AgentLifecycleState.ACTIVE
        await self._broadcast_state()

        while self._state != AgentLifecycleState.STOPPED:
            try:
                # Wait for a market cache update notification
                await asyncio.wait_for(
                    self._cache.update_notification.wait(),
                    timeout=60.0,   # heartbeat: wake every 60s even if no updates
                )
                # Clear the event so we don't spin — we'll re-wait after processing
                self._cache.update_notification.clear()

                # Respect pause
                await self._pause_event.wait()

                if not self._enabled:
                    self._state = AgentLifecycleState.IDLE
                    continue

                self._state = AgentLifecycleState.ACTIVE

                # Execute agent logic (implemented by subclass)
                await self.on_market_update()

            except asyncio.TimeoutError:
                # Normal heartbeat — stay IDLE if no markets yet
                if self._state != AgentLifecycleState.PAUSED:
                    self._state = AgentLifecycleState.IDLE
                continue
            except asyncio.CancelledError:
                break
            except Exception as exc:
                # Isolate: log error, set ERROR state, keep running
                logger.error(
                    "Agent unhandled exception",
                    extra={"agent": self.agent_name, "error": str(exc)},
                    exc_info=True,
                )
                self._state = AgentLifecycleState.ERROR
                await self._broadcast_state()
                await asyncio.sleep(5)   # brief back-off before resuming
                self._state = AgentLifecycleState.ACTIVE

    # ── Hooks for subclasses ──────────────────────────────────────────────────

    @abstractmethod
    async def on_market_update(self) -> None:
        """Called on every market cache update.  Produce TradeIntents here."""

    async def _on_start(self) -> None:
        """Override for initialization work (e.g. load history from DB)."""

    async def _on_stop(self) -> None:
        """Override for teardown work."""

    # ── Helpers ───────────────────────────────────────────────────────────────

    async def _broadcast_state(self) -> None:
        if self._broadcaster:
            await self._broadcaster.broadcast({
                "type": "agent_state_change",
                "agent_id": str(self.agent_id),
                "agent_name": self.agent_name,
                "lifecycle_state": self._state.value,
            })

    def to_dict(self) -> dict:
        return {
            "agent_id": str(self.agent_id),
            "agent_name": self.agent_name,
            "enabled": self._enabled,
            "mode": self._mode,
            "lifecycle_state": self._state.value,
        }
