"""persistence/database.py — asyncpg connection pool and all DB operations.

Design principles:
- All operations are async and non-blocking.
- The trading system continues operating if the DB is unavailable (graceful degradation).
- Live and Demo data live in separate schemas ('live' and 'demo').
- Schema creation runs once at startup.
"""
from __future__ import annotations

import json
import logging
from typing import Optional
from uuid import UUID

import asyncpg

from persistence.models import SCHEMAS, all_create_statements

logger = logging.getLogger(__name__)


class Database:
    """Async PostgreSQL interface backed by an asyncpg connection pool."""

    def __init__(self, dsn: str) -> None:
        self._dsn = dsn
        self._pool: Optional[asyncpg.Pool] = None

    # ── Lifecycle ─────────────────────────────────────────────────────────────

    async def connect(self) -> None:
        """Open the connection pool and create schemas/tables if needed."""
        try:
            self._pool = await asyncpg.create_pool(
                dsn=self._dsn,
                min_size=2,
                max_size=10,
                command_timeout=30,
            )
            await self._create_schema()
            logger.info("Database connected and schema verified.")
        except Exception as exc:
            logger.error("Database connection failed — running without persistence.", extra={"error": str(exc)})
            self._pool = None

    async def close(self) -> None:
        if self._pool:
            await self._pool.close()
            self._pool = None

    def is_available(self) -> bool:
        return self._pool is not None

    async def _create_schema(self) -> None:
        """Idempotently create all schemas and tables."""
        for schema in SCHEMAS:
            stmts = all_create_statements(schema)
            async with self._pool.acquire() as conn:
                for stmt in stmts:
                    try:
                        await conn.execute(stmt)
                    except Exception as exc:
                        logger.warning("Schema creation warning", extra={"schema": schema, "error": str(exc)})

    # ── Safe executor ─────────────────────────────────────────────────────────

    async def _execute(self, query: str, *args):
        """Execute a statement, returning None if DB is unavailable."""
        if not self._pool:
            return None
        try:
            async with self._pool.acquire() as conn:
                return await conn.execute(query, *args)
        except Exception as exc:
            logger.warning("DB execute error", extra={"error": str(exc), "query": query[:120]})
            return None

    async def _fetch(self, query: str, *args) -> list[dict]:
        if not self._pool:
            return []
        try:
            async with self._pool.acquire() as conn:
                rows = await conn.fetch(query, *args)
                return [dict(r) for r in rows]
        except Exception as exc:
            logger.warning("DB fetch error", extra={"error": str(exc)})
            return []

    async def _fetchrow(self, query: str, *args) -> Optional[dict]:
        if not self._pool:
            return None
        try:
            async with self._pool.acquire() as conn:
                row = await conn.fetchrow(query, *args)
                return dict(row) if row else None
        except Exception as exc:
            logger.warning("DB fetchrow error", extra={"error": str(exc)})
            return None

    # ── Markets ───────────────────────────────────────────────────────────────

    async def upsert_market(self, market: dict, internal_state: str, schema: str = "demo") -> None:
        query = f"""
            INSERT INTO {schema}.markets
                (market_ticker, event_ticker, series_ticker, title, subtitle, market_status,
                 open_time, close_time, internal_state, last_sync_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
            ON CONFLICT (market_ticker) DO UPDATE SET
                market_status  = EXCLUDED.market_status,
                internal_state = EXCLUDED.internal_state,
                last_sync_time = now()
        """
        await self._execute(
            query,
            market.get("ticker", ""),
            market.get("event_ticker", ""),
            market.get("series_ticker", ""),
            market.get("title", ""),
            market.get("subtitle"),
            market.get("status", ""),
            market.get("open_time"),
            market.get("close_time"),
            internal_state,
        )

    # ── Orders ────────────────────────────────────────────────────────────────

    async def insert_order(self, order: dict, environment: str) -> None:
        schema = environment
        query = f"""
            INSERT INTO {schema}.orders
                (order_id, client_order_id, agent_id, market_ticker, action, side, order_type,
                 price, count, remaining_count, status, environment)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (order_id) DO NOTHING
        """
        await self._execute(
            query,
            _uuid(order["order_id"]),
            _uuid(order["client_order_id"]),
            _uuid(order["agent_id"]),
            order["market_ticker"],
            order["action"],
            order["side"],
            order["order_type"],
            int(order["price"]),
            int(order["count"]),
            int(order.get("remaining_count", order["count"])),
            order.get("status", "pending"),
            environment,
        )

    async def update_order_status(self, order_id: str, status: str, environment: str = "demo") -> None:
        schema = environment
        query = f"""
            UPDATE {schema}.orders
            SET status = $1, updated_at = now()
            WHERE order_id = $2
        """
        await self._execute(query, status, _uuid(order_id))

    async def get_open_orders(self, environment: str) -> list[dict]:
        schema = environment
        query = f"""
            SELECT * FROM {schema}.orders
            WHERE status IN ('pending', 'resting') AND environment = $1
        """
        return await self._fetch(query, environment)

    async def get_order_by_client_id(self, client_order_id: str, environment: str) -> Optional[dict]:
        schema = environment
        query = f"SELECT * FROM {schema}.orders WHERE client_order_id = $1"
        return await self._fetchrow(query, _uuid(client_order_id))

    # ── Fills ─────────────────────────────────────────────────────────────────

    async def insert_fill(self, fill: dict, environment: str) -> None:
        schema = environment
        import datetime
        query = f"""
            INSERT INTO {schema}.fills
                (fill_id, order_id, market_ticker, action, side, price, count, is_taker,
                 environment, filled_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (fill_id) DO NOTHING
        """
        filled_at = fill.get("created_time") or fill.get("ts")
        if isinstance(filled_at, (int, float)):
            filled_at = datetime.datetime.utcfromtimestamp(filled_at / 1000)

        await self._execute(
            query,
            _uuid(fill.get("fill_id") or fill.get("id", "")),
            _uuid(fill.get("order_id", "")),
            fill.get("market_ticker", ""),
            fill.get("action", ""),
            fill.get("side", ""),
            int(fill.get("yes_price") or fill.get("price", 0)),
            int(fill.get("count", 0)),
            bool(fill.get("is_taker", False)),
            environment,
            filled_at,
        )

    async def fill_exists(self, fill_id: str) -> bool:
        for schema in SCHEMAS:
            row = await self._fetchrow(
                f"SELECT 1 FROM {schema}.fills WHERE fill_id = $1", _uuid(fill_id)
            )
            if row:
                return True
        return False

    # ── Positions ─────────────────────────────────────────────────────────────

    async def upsert_position(self, market_ticker: str, environment: str, pos: dict) -> None:
        schema = environment
        query = f"""
            INSERT INTO {schema}.positions
                (market_ticker, environment, yes_count, no_count,
                 average_yes_price, average_no_price, realized_pnl, unrealized_pnl, last_updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
            ON CONFLICT (market_ticker, environment) DO UPDATE SET
                yes_count         = EXCLUDED.yes_count,
                no_count          = EXCLUDED.no_count,
                average_yes_price = EXCLUDED.average_yes_price,
                average_no_price  = EXCLUDED.average_no_price,
                realized_pnl      = EXCLUDED.realized_pnl,
                unrealized_pnl    = EXCLUDED.unrealized_pnl,
                last_updated_at   = now()
        """
        await self._execute(
            query,
            market_ticker,
            environment,
            int(pos.get("position", 0)),    # Kalshi uses 'position' for yes net
            int(pos.get("no_position", 0) or 0),
            pos.get("average_yes_price"),
            pos.get("average_no_price"),
            int(pos.get("realized_pnl", 0) or 0),
            int(pos.get("unrealized_pnl", 0) or 0),
        )

    async def get_positions(self, environment: str) -> list[dict]:
        schema = environment
        return await self._fetch(f"SELECT * FROM {schema}.positions WHERE environment = $1", environment)

    # ── Agent state ───────────────────────────────────────────────────────────

    async def load_agent_states(self, environment: str) -> list[dict]:
        schema = environment
        return await self._fetch(f"SELECT * FROM {schema}.agent_state")

    async def upsert_agent_state(self, agent: dict, environment: str) -> None:
        schema = environment
        query = f"""
            INSERT INTO {schema}.agent_state
                (agent_id, agent_name, enabled, mode, configuration, lifecycle_state,
                 last_decision_at, internal_state_blob)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (agent_id) DO UPDATE SET
                agent_name          = EXCLUDED.agent_name,
                enabled             = EXCLUDED.enabled,
                mode                = EXCLUDED.mode,
                configuration       = EXCLUDED.configuration,
                lifecycle_state     = EXCLUDED.lifecycle_state,
                last_decision_at    = EXCLUDED.last_decision_at,
                internal_state_blob = EXCLUDED.internal_state_blob,
                updated_at          = now()
        """
        await self._execute(
            query,
            _uuid(str(agent["agent_id"])),
            agent["agent_name"],
            bool(agent.get("enabled", False)),
            agent.get("mode", "FullStop"),
            json.dumps(agent.get("configuration", {})),
            agent.get("lifecycle_state", "STOPPED"),
            agent.get("last_decision_at"),
            json.dumps(agent.get("internal_state_blob")) if agent.get("internal_state_blob") else None,
        )

    # ── System config ─────────────────────────────────────────────────────────

    async def get_config(self, key: str, environment: str = "demo") -> Optional[str]:
        schema = environment
        row = await self._fetchrow(
            f"SELECT config_value FROM {schema}.system_config WHERE config_key = $1", key
        )
        return row["config_value"] if row else None

    async def set_config(self, key: str, value: str, environment: str = "demo") -> None:
        schema = environment
        query = f"""
            INSERT INTO {schema}.system_config (config_key, config_value, updated_at)
            VALUES ($1, $2, now())
            ON CONFLICT (config_key) DO UPDATE SET config_value = $2, updated_at = now()
        """
        await self._execute(query, key, value)


def _uuid(val: str) -> UUID:
    """Convert string to UUID, returning a nil UUID on failure."""
    try:
        return UUID(str(val))
    except (ValueError, AttributeError):
        return UUID("00000000-0000-0000-0000-000000000000")
