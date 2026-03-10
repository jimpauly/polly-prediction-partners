"""In-memory state cache for the Paulie's Prediction Partners trading system.

Provides a single authoritative view of markets, orderbooks, positions,
orders, fills, balances, agent states, and risk events.  All mutations
are guarded by an ``asyncio.Lock`` so the cache is safe to use from
concurrent coroutines.
"""

from __future__ import annotations

import asyncio
from collections import deque
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

import structlog

from backend.models.schemas import AgentState, Event, Fill, Market, Order, RiskEvent

_FILLS_CAP = 1000
_RISK_EVENTS_CAP = 500
_ORDERS_CAP = 2000  # max orders kept in cache; oldest terminal orders evicted first

_AGENT_NAMES = ("prime", "praxis", "peritia")

log = structlog.get_logger(__name__)


class StateCache:
    """Hot-path, in-memory state cache for the trading system.

    Concurrency model: all *mutations* acquire ``_lock`` to serialize
    writes.  Read-only getters are intentionally synchronous and lock-free
    because ``asyncio`` is single-threaded — a synchronous method body
    cannot be pre-empted by another coroutine (context switches only occur
    at ``await`` points).  Getters that return collections create shallow
    copies so callers never hold a reference to internal state.
    """

    def __init__(self) -> None:
        self._lock = asyncio.Lock()

        # Core state
        self._markets: dict[str, Market] = {}
        self._events: dict[str, Event] = {}
        self._series: dict[str, Any] = {}
        self._orderbooks: dict[str, dict] = {}
        self._positions: dict[str, dict] = {}
        self._orders: dict[str, Order] = {}
        self._fills: deque[Fill] = deque(maxlen=_FILLS_CAP)
        self._balance: dict[str, Any] = {}

        # Agent / risk
        self._agent_states: dict[str, AgentState] = {
            name: AgentState(
                agent_name=name,
                mode="safe",
                status="idle",
            )
            for name in _AGENT_NAMES
        }
        self._risk_events: deque[RiskEvent] = deque(maxlen=_RISK_EVENTS_CAP)

        # Infrastructure
        self._exchange_status: dict[str, Any] = {}
        self._account_limits: dict[str, Any] = {}
        self._historical_cutoff: dict[str, Any] = {}
        self._subscribed_markets: set[str] = set()
        self._environment: str = "live"

    # ------------------------------------------------------------------
    # Market
    # ------------------------------------------------------------------

    async def update_market(self, ticker: str, data: Market | dict) -> None:
        async with self._lock:
            if isinstance(data, dict):
                existing = self._markets.get(ticker)
                if existing is not None:
                    # Merge partial update into existing market — WebSocket ticker
                    # events only carry price/volume deltas, not all required fields.
                    # Skip keys whose value is None or empty string so we don't
                    # overwrite valid existing data with missing-field placeholders.
                    merged = {
                        **existing.model_dump(),
                        **{k: v for k, v in data.items() if v is not None and v != ""},
                    }
                    try:
                        data = Market.model_validate(merged)
                    except Exception as exc:
                        log.debug(
                            "market_merge_failed",
                            ticker=ticker,
                            error=str(exc),
                        )
                        return  # keep existing on bad merge
                else:
                    try:
                        data = Market.model_validate(data)
                    except Exception as exc:
                        log.debug(
                            "market_create_failed",
                            ticker=ticker,
                            keys=list(data.keys()),
                            error=str(exc),
                        )
                        return  # can't create without required fields
            self._markets[ticker] = data

    def get_market(self, ticker: str) -> Market | None:
        return self._markets.get(ticker)

    def get_markets(self) -> dict[str, Market]:
        return dict(self._markets)

    # ------------------------------------------------------------------
    # Event
    # ------------------------------------------------------------------

    async def update_event(self, event_ticker: str, data: Event | dict) -> None:
        async with self._lock:
            if isinstance(data, dict):
                try:
                    data = Event.model_validate(data)
                except Exception as exc:
                    log.debug(
                        "event_create_failed",
                        event_ticker=event_ticker,
                        error=str(exc),
                    )
                    return
            self._events[event_ticker] = data

    def get_event(self, event_ticker: str) -> Event | None:
        return self._events.get(event_ticker)

    def get_events(self) -> dict[str, Event]:
        return dict(self._events)

    # ------------------------------------------------------------------
    # Series
    # ------------------------------------------------------------------

    async def update_series(self, series_ticker: str, data: Any) -> None:
        async with self._lock:
            self._series[series_ticker] = data

    def get_series(self, series_ticker: str) -> Any:
        return self._series.get(series_ticker)

    def get_all_series(self) -> dict[str, Any]:
        return dict(self._series)

    # ------------------------------------------------------------------
    # Orderbook
    # ------------------------------------------------------------------

    async def update_orderbook(self, ticker: str, snapshot_or_delta: dict) -> None:
        async with self._lock:
            msg_type = snapshot_or_delta.get("type", "snapshot")
            if msg_type == "orderbook_snapshot" or msg_type == "snapshot":
                self._orderbooks[ticker] = {
                    "yes": snapshot_or_delta.get("yes", []),
                    "no": snapshot_or_delta.get("no", []),
                }
            elif msg_type == "orderbook_delta" or msg_type == "delta":
                book = self._orderbooks.setdefault(
                    ticker, {"yes": [], "no": []}
                )
                for side in ("yes", "no"):
                    deltas = snapshot_or_delta.get(side, [])
                    for delta in deltas:
                        price = delta.get("price")
                        quantity = delta.get("quantity", delta.get("delta", 0))
                        self._apply_delta(book[side], price, quantity)
            else:
                # Treat unknown types as full replacement
                self._orderbooks[ticker] = snapshot_or_delta

    @staticmethod
    def _apply_delta(levels: list, price: Any, quantity: Any) -> None:
        """Apply a single price-level delta to an orderbook side."""
        for i, level in enumerate(levels):
            if level[0] == price:
                if quantity == 0:
                    levels.pop(i)
                else:
                    levels[i] = [price, quantity]
                return
        if quantity != 0:
            levels.append([price, quantity])

    def get_orderbook(self, ticker: str) -> dict | None:
        return self._orderbooks.get(ticker)

    # ------------------------------------------------------------------
    # Position
    # ------------------------------------------------------------------

    async def update_position(self, ticker: str, data: dict) -> None:
        async with self._lock:
            self._positions[ticker] = data

    def get_positions(self) -> dict[str, dict]:
        return dict(self._positions)

    # ------------------------------------------------------------------
    # Order
    # ------------------------------------------------------------------

    async def update_order(self, order_id: str, data: Order | dict) -> None:
        async with self._lock:
            if isinstance(data, dict):
                existing = self._orders.get(order_id)
                if existing is not None:
                    # Merge partial update (e.g. a status-change from WebSocket).
                    # Omit None values but preserve empty strings (some fields are
                    # legitimately empty, e.g. client_order_id on exchange orders).
                    merged = {
                        **existing.model_dump(),
                        **{k: v for k, v in data.items() if v is not None},
                    }
                    try:
                        data = Order.model_validate(merged)
                    except Exception as exc:
                        log.debug(
                            "order_merge_failed",
                            order_id=order_id,
                            error=str(exc),
                        )
                        return  # keep existing on bad merge
                else:
                    try:
                        data = Order.model_validate(data)
                    except Exception as exc:
                        log.debug(
                            "order_create_failed",
                            order_id=order_id,
                            keys=list(data.keys()),
                            error=str(exc),
                        )
                        return  # can't create without required fields
            self._orders[order_id] = data

    def get_orders(self) -> dict[str, Order]:
        return dict(self._orders)

    def evict_terminal_orders(self, cap: int = _ORDERS_CAP) -> int:
        """Remove oldest filled/cancelled orders when the cache exceeds *cap*.

        Only orders with ``status`` in ``("executed", "canceled")`` are
        eligible for eviction.  Resting orders are never evicted.

        Returns the number of orders removed.
        """
        if len(self._orders) <= cap:
            return 0

        terminal = [
            (oid, o)
            for oid, o in self._orders.items()
            if hasattr(o, "status") and o.status in ("executed", "canceled")
        ]

        # Sort by last_update_time ascending so oldest are removed first
        terminal.sort(
            key=lambda pair: getattr(pair[1], "last_update_time", None)
            or datetime.min.replace(tzinfo=timezone.utc),
        )

        to_remove = len(self._orders) - cap
        removed = 0
        for oid, _ in terminal[:to_remove]:
            del self._orders[oid]
            removed += 1

        if removed:
            log.info("orders_evicted", removed=removed, remaining=len(self._orders))

        return removed

    # ------------------------------------------------------------------
    # Fill
    # ------------------------------------------------------------------

    async def add_fill(self, fill_data: Fill | dict) -> None:
        async with self._lock:
            if isinstance(fill_data, dict):
                try:
                    fill_data = Fill.model_validate(fill_data)
                except Exception as exc:
                    # WebSocket fill shape may differ from REST shape; log and
                    # skip rather than crashing the whole handler.
                    log.warning(
                        "fill_parse_failed",
                        keys=list(fill_data.keys()),
                        error=str(exc),
                    )
                    return
            self._fills.append(fill_data)

    def get_fills(self) -> list[Fill]:
        return list(self._fills)

    # ------------------------------------------------------------------
    # Balance
    # ------------------------------------------------------------------

    async def update_balance(self, data: dict) -> None:
        async with self._lock:
            self._balance = data

    def get_balance(self) -> dict[str, Any]:
        return dict(self._balance)

    # ------------------------------------------------------------------
    # Agent state
    # ------------------------------------------------------------------

    async def update_agent_state(self, agent_name: str, state: AgentState | dict) -> None:
        async with self._lock:
            if isinstance(state, dict):
                state = AgentState(**state)
            self._agent_states[agent_name] = state

    def get_agent_state(self, name: str) -> AgentState | None:
        return self._agent_states.get(name)

    def get_all_agent_states(self) -> dict[str, AgentState]:
        return dict(self._agent_states)

    # ------------------------------------------------------------------
    # Risk events
    # ------------------------------------------------------------------

    async def add_risk_event(self, event: RiskEvent | dict) -> None:
        async with self._lock:
            if isinstance(event, dict):
                event = RiskEvent(**event)
            self._risk_events.append(event)

    def get_risk_events(self) -> list[RiskEvent]:
        return list(self._risk_events)

    # ------------------------------------------------------------------
    # Exchange status
    # ------------------------------------------------------------------

    async def update_exchange_status(self, data: dict) -> None:
        async with self._lock:
            self._exchange_status = data

    def get_exchange_status(self) -> dict[str, Any]:
        return dict(self._exchange_status)

    # ------------------------------------------------------------------
    # Account limits
    # ------------------------------------------------------------------

    async def set_account_limits(self, data: dict) -> None:
        async with self._lock:
            self._account_limits = data

    def get_account_limits(self) -> dict[str, Any]:
        return dict(self._account_limits)

    # ------------------------------------------------------------------
    # Historical cutoff
    # ------------------------------------------------------------------

    async def set_historical_cutoff(self, data: dict) -> None:
        async with self._lock:
            self._historical_cutoff = data

    def get_historical_cutoff(self) -> dict[str, Any]:
        return dict(self._historical_cutoff)

    # ------------------------------------------------------------------
    # Subscribed markets
    # ------------------------------------------------------------------

    async def add_subscribed_market(self, ticker: str) -> None:
        async with self._lock:
            self._subscribed_markets.add(ticker)

    async def remove_subscribed_market(self, ticker: str) -> None:
        async with self._lock:
            self._subscribed_markets.discard(ticker)

    def get_subscribed_markets(self) -> set[str]:
        return set(self._subscribed_markets)

    # ------------------------------------------------------------------
    # Environment
    # ------------------------------------------------------------------

    @property
    def environment(self) -> str:
        return self._environment

    async def set_environment(self, env: str) -> None:
        async with self._lock:
            self._environment = env

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def clear(self) -> None:
        """Reset all cached state (e.g. on environment switch)."""
        async with self._lock:
            self._markets.clear()
            self._events.clear()
            self._series.clear()
            self._orderbooks.clear()
            self._positions.clear()
            self._orders.clear()
            self._fills.clear()
            self._balance.clear()
            self._agent_states = {
                name: AgentState(
                    agent_name=name,
                    mode="safe",
                    status="idle",
                )
                for name in _AGENT_NAMES
            }
            self._risk_events.clear()
            self._exchange_status.clear()
            self._account_limits.clear()
            self._historical_cutoff.clear()
            self._subscribed_markets.clear()

    def get_snapshot(self) -> dict[str, Any]:
        """Return a JSON-serializable snapshot of all cached state."""
        return {
            "environment": self._environment,
            "markets": {
                t: m.model_dump(mode="json") for t, m in self._markets.items()
            },
            "events": {
                t: e.model_dump(mode="json") for t, e in self._events.items()
            },
            "series": dict(self._series),
            "orderbooks": dict(self._orderbooks),
            "positions": dict(self._positions),
            "orders": {
                oid: o.model_dump(mode="json") for oid, o in self._orders.items()
            },
            "fills": [f.model_dump(mode="json") for f in self._fills],
            "balance": dict(self._balance),
            "agent_states": {
                n: s.model_dump(mode="json")
                for n, s in self._agent_states.items()
            },
            "risk_events": [
                e.model_dump(mode="json") for e in self._risk_events
            ],
            "exchange_status": dict(self._exchange_status),
            "account_limits": dict(self._account_limits),
            "historical_cutoff": dict(self._historical_cutoff),
            "subscribed_markets": sorted(self._subscribed_markets),
        }
