"""Dynamic position sizing based on agent profitability.

Implements a conservative scaling strategy:
  1. Every agent starts at a minimum size (1 contract).
  2. After *N* profitable trades **and** the agent's win-rate exceeds a
     configurable threshold, position size scales up by a fixed factor per
     tier.
  3. The notional value of any order (count × price) never exceeds
     ``max_order_notional`` from the application config.

Each agent's trade history is tracked independently so a poorly-performing
agent cannot piggyback on the track record of a profitable one.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from decimal import Decimal
from typing import TYPE_CHECKING

import structlog

if TYPE_CHECKING:
    from backend.config import Settings

log = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# Sizing defaults — override via constructor kwargs
# ---------------------------------------------------------------------------

_DEFAULT_BASE_CONTRACTS: int = 1
_DEFAULT_SCALE_THRESHOLD: int = 5  # profitable trades per tier
_DEFAULT_SCALE_FACTOR: Decimal = Decimal("1.5")
_DEFAULT_MAX_SCALE_TIERS: int = 3
_DEFAULT_MIN_WIN_RATE: Decimal = Decimal("0.55")


# ---------------------------------------------------------------------------
# Per-agent performance record
# ---------------------------------------------------------------------------


@dataclass
class _AgentRecord:
    """Lightweight ledger tracking an agent's trade outcomes."""

    wins: int = 0
    losses: int = 0
    cumulative_pnl: Decimal = field(default_factory=lambda: Decimal("0"))

    @property
    def total_trades(self) -> int:
        return self.wins + self.losses

    @property
    def win_rate(self) -> Decimal:
        if self.total_trades == 0:
            return Decimal("0")
        return Decimal(self.wins) / Decimal(self.total_trades)


# ---------------------------------------------------------------------------
# PositionSizer
# ---------------------------------------------------------------------------


class PositionSizer:
    """Compute dynamic position sizes per agent, respecting risk limits.

    Parameters
    ----------
    config:
        Application :class:`Settings` — only ``max_order_notional`` is read.
    base_contracts:
        Minimum number of contracts for any order.
    scale_threshold:
        Number of **profitable** trades required per scaling tier.
    scale_factor:
        Multiplicative factor applied per tier (e.g. 1.5× per tier).
    max_scale_tiers:
        Hard cap on the number of tiers an agent can achieve.
    min_win_rate:
        Minimum win-rate (0–1) required before any scaling is applied.
    """

    def __init__(
        self,
        config: Settings,
        *,
        base_contracts: int = _DEFAULT_BASE_CONTRACTS,
        scale_threshold: int = _DEFAULT_SCALE_THRESHOLD,
        scale_factor: Decimal = _DEFAULT_SCALE_FACTOR,
        max_scale_tiers: int = _DEFAULT_MAX_SCALE_TIERS,
        min_win_rate: Decimal = _DEFAULT_MIN_WIN_RATE,
    ) -> None:
        self._max_order_notional = Decimal(str(config.max_order_notional))
        self._base_contracts = max(base_contracts, 1)
        self._scale_threshold = max(scale_threshold, 1)
        self._scale_factor = scale_factor
        self._max_scale_tiers = max(max_scale_tiers, 0)
        self._min_win_rate = min_win_rate

        # Per-agent performance ledger
        self._agents: dict[str, _AgentRecord] = {}

        log.info(
            "position_sizer_initialised",
            max_order_notional=str(self._max_order_notional),
            base_contracts=self._base_contracts,
            scale_threshold=self._scale_threshold,
            scale_factor=str(self._scale_factor),
            max_scale_tiers=self._max_scale_tiers,
            min_win_rate=str(self._min_win_rate),
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def compute_position_count(
        self,
        agent_name: str,
        price: Decimal,
    ) -> int:
        """Return the number of contracts *agent_name* should trade at *price*.

        The method guarantees:
        * Result ≥ 1  (always at least 1 contract).
        * ``result × price ≤ max_order_notional``.

        Parameters
        ----------
        agent_name:
            Identifier of the requesting agent (e.g. ``"prime"``).
        price:
            Per-contract price in USD as a :class:`Decimal`.

        Returns
        -------
        int
            Whole number of contracts to include in the order.
        """
        if price <= Decimal("0"):
            log.warning(
                "position_sizer_invalid_price",
                agent=agent_name,
                price=str(price),
            )
            return self._base_contracts

        record = self._agents.get(agent_name)
        desired = self._scaled_count(record)

        # Clamp to notional limit: count * price ≤ max_order_notional
        max_by_notional = math.floor(self._max_order_notional / price)
        count = max(min(desired, max_by_notional), 1)

        log.debug(
            "position_size_computed",
            agent=agent_name,
            price=str(price),
            desired=desired,
            max_by_notional=max_by_notional,
            final_count=count,
            tier=self._current_tier(record),
        )
        return count

    def record_trade_result(
        self,
        agent_name: str,
        pnl: Decimal,
    ) -> None:
        """Record a completed trade and its P&L for *agent_name*.

        A trade with ``pnl > 0`` is counted as a win; ``pnl ≤ 0`` is a loss.

        Parameters
        ----------
        agent_name:
            Identifier of the agent whose trade settled.
        pnl:
            Realized profit/loss of the trade in USD.
        """
        record = self._agents.setdefault(agent_name, _AgentRecord())
        record.cumulative_pnl += pnl

        if pnl > Decimal("0"):
            record.wins += 1
        else:
            record.losses += 1

        log.info(
            "trade_result_recorded",
            agent=agent_name,
            pnl=str(pnl),
            wins=record.wins,
            losses=record.losses,
            cumulative_pnl=str(record.cumulative_pnl),
            win_rate=str(record.win_rate),
            tier=self._current_tier(record),
        )

    def get_agent_record(self, agent_name: str) -> dict[str, object]:
        """Return a snapshot of the agent's performance record.

        Returns a plain dict suitable for JSON serialisation.  If the agent
        has no history, sensible zero-value defaults are returned.
        """
        record = self._agents.get(agent_name, _AgentRecord())
        return {
            "agent_name": agent_name,
            "wins": record.wins,
            "losses": record.losses,
            "total_trades": record.total_trades,
            "win_rate": str(record.win_rate),
            "cumulative_pnl": str(record.cumulative_pnl),
            "current_tier": self._current_tier(record),
        }

    def reset_agent(self, agent_name: str) -> None:
        """Clear the profitability history for *agent_name*."""
        self._agents.pop(agent_name, None)
        log.info("agent_record_reset", agent=agent_name)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _current_tier(self, record: _AgentRecord | None) -> int:
        """Determine the current scaling tier for an agent record.

        Tier 0 means base size (no scaling).  Each subsequent tier
        multiplies the base by ``scale_factor``.
        """
        if record is None:
            return 0

        # Gate: must be net-profitable and meet minimum win-rate
        if record.cumulative_pnl <= Decimal("0"):
            return 0
        if record.win_rate < self._min_win_rate:
            return 0

        earned_tiers = record.wins // self._scale_threshold
        return min(earned_tiers, self._max_scale_tiers)

    def _scaled_count(self, record: _AgentRecord | None) -> int:
        """Compute the raw contract count before notional clamping."""
        tier = self._current_tier(record)
        if tier == 0:
            return self._base_contracts

        raw = Decimal(self._base_contracts) * self._scale_factor ** tier
        return max(math.floor(raw), self._base_contracts)
