"""PostgreSQL persistence layer for the Paulie's Prediction Partners trading system.

Provides durable storage for markets, orders, fills, positions, agent state,
risk events, system configuration, and an append-only audit log.  All tables
are partitioned by an ``environment`` column so **live** and **demo** data are
fully isolated within the same physical database.

Design principles:
  * All writes are idempotent and replay-safe (``INSERT … ON CONFLICT``).
  * All timestamps use ``TIMESTAMPTZ`` (UTC).
  * The service is a graceful no-op when ``db_url`` is empty, allowing the
    system to run without a database during development.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

import structlog

log = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# Lazy import of asyncpg — keeps the module importable even when the driver
# is not installed (e.g. in lightweight test environments).
# ---------------------------------------------------------------------------
try:
    import asyncpg  # type: ignore[import-untyped]
except ImportError:  # pragma: no cover
    asyncpg = None  # type: ignore[assignment]


def _normalise_dsn(raw: str) -> str:
    """Strip the ``+asyncpg`` dialect suffix that SQLAlchemy-style URLs use.

    ``asyncpg`` expects a plain ``postgresql://…`` DSN.
    """
    return raw.replace("postgresql+asyncpg://", "postgresql://", 1)


def _json_serialiser(obj: object) -> str:
    """Convert common non-JSON-native types; raise for anything unexpected."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, (set, frozenset)):
        return list(obj)  # type: ignore[return-value]
    # Decimal, UUID, etc. — safe repr via str
    for type_name in ("Decimal", "UUID"):
        if type(obj).__name__ == type_name:
            return str(obj)
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serialisable")


# ===================================================================
# Schema DDL
# ===================================================================

_SCHEMA_SQL = """\
-- markets
CREATE TABLE IF NOT EXISTS markets (
    environment  TEXT           NOT NULL,
    ticker       TEXT           NOT NULL,
    data         JSONB          NOT NULL DEFAULT '{}',
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
    PRIMARY KEY (environment, ticker)
);

-- orderbooks
CREATE TABLE IF NOT EXISTS orderbooks (
    environment  TEXT           NOT NULL,
    ticker       TEXT           NOT NULL,
    data         JSONB          NOT NULL DEFAULT '{}',
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
    PRIMARY KEY (environment, ticker)
);

-- orders
CREATE TABLE IF NOT EXISTS orders (
    environment  TEXT           NOT NULL,
    order_id     TEXT           NOT NULL,
    data         JSONB          NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
    PRIMARY KEY (environment, order_id)
);

-- fills
CREATE TABLE IF NOT EXISTS fills (
    environment  TEXT           NOT NULL,
    fill_id      TEXT           NOT NULL,
    data         JSONB          NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
    PRIMARY KEY (environment, fill_id)
);

-- positions
CREATE TABLE IF NOT EXISTS positions (
    environment  TEXT           NOT NULL,
    ticker       TEXT           NOT NULL,
    data         JSONB          NOT NULL DEFAULT '{}',
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
    PRIMARY KEY (environment, ticker)
);

-- agent_state
CREATE TABLE IF NOT EXISTS agent_state (
    environment  TEXT           NOT NULL,
    agent_name   TEXT           NOT NULL,
    state        JSONB          NOT NULL DEFAULT '{}',
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
    PRIMARY KEY (environment, agent_name)
);

-- risk_events (append-only)
CREATE TABLE IF NOT EXISTS risk_events (
    id           BIGSERIAL      PRIMARY KEY,
    environment  TEXT           NOT NULL,
    event        JSONB          NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_risk_events_env
    ON risk_events (environment, created_at DESC);

-- system_config (environment-agnostic key/value store)
CREATE TABLE IF NOT EXISTS system_config (
    key          TEXT           PRIMARY KEY,
    value        JSONB          NOT NULL DEFAULT '{}',
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- audit_log (append-only)
CREATE TABLE IF NOT EXISTS audit_log (
    id           BIGSERIAL      PRIMARY KEY,
    environment  TEXT           NOT NULL,
    action       TEXT           NOT NULL,
    details      JSONB          NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_env
    ON audit_log (environment, created_at DESC);
"""


# ===================================================================
# Database service
# ===================================================================


class Database:
    """Async PostgreSQL persistence backed by :pypi:`asyncpg`.

    When *db_url* is empty every public method is a silent no-op so the
    rest of the system can operate without a database.
    """

    def __init__(self) -> None:
        self._pool: asyncpg.Pool | None = None  # type: ignore[name-defined]
        self._enabled: bool = False

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def connect(self, db_url: str) -> None:
        """Create the asyncpg connection pool.

        Args:
            db_url: A PostgreSQL connection URL.  May use the
                ``postgresql+asyncpg://`` scheme — the ``+asyncpg`` portion
                is stripped automatically.  If *db_url* is empty the service
                remains in no-op mode.
        """
        if not db_url:
            log.info("database_disabled", reason="db_url is empty")
            return

        if asyncpg is None:
            log.warning("database_disabled", reason="asyncpg not installed")
            return

        dsn = _normalise_dsn(db_url)
        self._pool = await asyncpg.create_pool(dsn, min_size=2, max_size=10)
        self._enabled = True
        log.info("database_connected", dsn=dsn.split("@")[-1])

    async def close(self) -> None:
        """Gracefully close the connection pool."""
        if self._pool is not None:
            await self._pool.close()
            self._pool = None
            self._enabled = False
            log.info("database_closed")

    async def init_schema(self) -> None:
        """Create all required tables and indexes if they do not exist."""
        if not self._enabled:
            return
        async with self._pool.acquire() as conn:  # type: ignore[union-attr]
            await conn.execute(_SCHEMA_SQL)
        log.info("database_schema_initialised")

    # ------------------------------------------------------------------
    # Markets
    # ------------------------------------------------------------------

    async def upsert_market(self, env: str, ticker: str, data: dict[str, Any]) -> None:
        """Insert or update a market record.

        Args:
            env: Environment partition (``live`` or ``demo``).
            ticker: Market ticker symbol.
            data: Arbitrary market payload stored as JSONB.
        """
        if not self._enabled:
            return
        async with self._pool.acquire() as conn:  # type: ignore[union-attr]
            await conn.execute(
                """
                INSERT INTO markets (environment, ticker, data, updated_at)
                VALUES ($1, $2, $3::jsonb, now())
                ON CONFLICT (environment, ticker)
                DO UPDATE SET data = EXCLUDED.data, updated_at = now()
                """,
                env,
                ticker,
                json.dumps(data),
            )

    # ------------------------------------------------------------------
    # Orders
    # ------------------------------------------------------------------

    async def upsert_order(self, env: str, order_id: str, data: dict[str, Any]) -> None:
        """Insert or update an order record.

        Args:
            env: Environment partition.
            order_id: Unique order identifier.
            data: Order payload stored as JSONB.
        """
        if not self._enabled:
            return
        async with self._pool.acquire() as conn:  # type: ignore[union-attr]
            await conn.execute(
                """
                INSERT INTO orders (environment, order_id, data, created_at, updated_at)
                VALUES ($1, $2, $3::jsonb, now(), now())
                ON CONFLICT (environment, order_id)
                DO UPDATE SET data = EXCLUDED.data, updated_at = now()
                """,
                env,
                order_id,
                json.dumps(data),
            )

    # ------------------------------------------------------------------
    # Fills
    # ------------------------------------------------------------------

    async def insert_fill(self, env: str, fill_id: str, data: dict[str, Any]) -> None:
        """Insert a fill record idempotently (duplicate *fill_id* is ignored).

        Args:
            env: Environment partition.
            fill_id: Unique fill identifier.
            data: Fill payload stored as JSONB.
        """
        if not self._enabled:
            return
        async with self._pool.acquire() as conn:  # type: ignore[union-attr]
            await conn.execute(
                """
                INSERT INTO fills (environment, fill_id, data, created_at)
                VALUES ($1, $2, $3::jsonb, now())
                ON CONFLICT (environment, fill_id) DO NOTHING
                """,
                env,
                fill_id,
                json.dumps(data),
            )

    # ------------------------------------------------------------------
    # Positions
    # ------------------------------------------------------------------

    async def upsert_position(self, env: str, ticker: str, data: dict[str, Any]) -> None:
        """Insert or update a position record.

        Args:
            env: Environment partition.
            ticker: Market ticker symbol.
            data: Position payload stored as JSONB.
        """
        if not self._enabled:
            return
        async with self._pool.acquire() as conn:  # type: ignore[union-attr]
            await conn.execute(
                """
                INSERT INTO positions (environment, ticker, data, updated_at)
                VALUES ($1, $2, $3::jsonb, now())
                ON CONFLICT (environment, ticker)
                DO UPDATE SET data = EXCLUDED.data, updated_at = now()
                """,
                env,
                ticker,
                json.dumps(data),
            )

    # ------------------------------------------------------------------
    # Agent state
    # ------------------------------------------------------------------

    async def save_agent_state(self, env: str, agent_name: str, state: dict[str, Any]) -> None:
        """Persist the latest agent state snapshot.

        Args:
            env: Environment partition.
            agent_name: Agent identifier (e.g. ``prime``, ``praxis``).
            state: Serialised agent state stored as JSONB.
        """
        if not self._enabled:
            return
        async with self._pool.acquire() as conn:  # type: ignore[union-attr]
            await conn.execute(
                """
                INSERT INTO agent_state (environment, agent_name, state, updated_at)
                VALUES ($1, $2, $3::jsonb, now())
                ON CONFLICT (environment, agent_name)
                DO UPDATE SET state = EXCLUDED.state, updated_at = now()
                """,
                env,
                agent_name,
                json.dumps(state),
            )

    # ------------------------------------------------------------------
    # Risk events
    # ------------------------------------------------------------------

    async def insert_risk_event(self, env: str, event: dict[str, Any]) -> None:
        """Append a risk event to the log.

        Args:
            env: Environment partition.
            event: Event payload stored as JSONB.
        """
        if not self._enabled:
            return
        async with self._pool.acquire() as conn:  # type: ignore[union-attr]
            await conn.execute(
                """
                INSERT INTO risk_events (environment, event, created_at)
                VALUES ($1, $2::jsonb, now())
                """,
                env,
                json.dumps(event, default=_json_serialiser),
            )

    # ------------------------------------------------------------------
    # Audit log
    # ------------------------------------------------------------------

    async def insert_audit_log(self, env: str, action: str, details: dict[str, Any]) -> None:
        """Append an entry to the immutable audit log.

        Args:
            env: Environment partition.
            action: Human-readable action label.
            details: Arbitrary context stored as JSONB.
        """
        if not self._enabled:
            return
        async with self._pool.acquire() as conn:  # type: ignore[union-attr]
            await conn.execute(
                """
                INSERT INTO audit_log (environment, action, details, created_at)
                VALUES ($1, $2, $3::jsonb, now())
                """,
                env,
                action,
                json.dumps(details, default=_json_serialiser),
            )

    # ------------------------------------------------------------------
    # System config
    # ------------------------------------------------------------------

    async def get_config(self, key: str) -> Any | None:
        """Retrieve a system configuration value by *key*.

        Returns the deserialised JSON value, or ``None`` if not set.
        """
        if not self._enabled:
            return None
        async with self._pool.acquire() as conn:  # type: ignore[union-attr]
            row = await conn.fetchrow(
                "SELECT value FROM system_config WHERE key = $1",
                key,
            )
        if row is None:
            return None
        return json.loads(row["value"])

    async def set_config(self, key: str, value: Any) -> None:
        """Set a system configuration value (upsert).

        Args:
            key: Configuration key.
            value: JSON-serialisable value.
        """
        if not self._enabled:
            return
        async with self._pool.acquire() as conn:  # type: ignore[union-attr]
            await conn.execute(
                """
                INSERT INTO system_config (key, value, updated_at)
                VALUES ($1, $2::jsonb, now())
                ON CONFLICT (key)
                DO UPDATE SET value = EXCLUDED.value, updated_at = now()
                """,
                key,
                json.dumps(value),
            )

    # ------------------------------------------------------------------
    # Read-back helpers
    # ------------------------------------------------------------------

    async def get_fills(
        self,
        env: str,
        *,
        limit: int = 100,
        since: datetime | None = None,
    ) -> list[dict[str, Any]]:
        """Return recent fills for *env*, newest first.

        Args:
            env: Environment partition.
            limit: Maximum number of rows to return.
            since: If provided, only fills created after this timestamp.
        """
        if not self._enabled:
            return []
        async with self._pool.acquire() as conn:  # type: ignore[union-attr]
            if since is not None:
                rows = await conn.fetch(
                    """
                    SELECT fill_id, data, created_at
                    FROM fills
                    WHERE environment = $1 AND created_at >= $2
                    ORDER BY created_at DESC
                    LIMIT $3
                    """,
                    env,
                    since,
                    limit,
                )
            else:
                rows = await conn.fetch(
                    """
                    SELECT fill_id, data, created_at
                    FROM fills
                    WHERE environment = $1
                    ORDER BY created_at DESC
                    LIMIT $2
                    """,
                    env,
                    limit,
                )
        return [
            {
                "fill_id": r["fill_id"],
                **json.loads(r["data"]),
                "created_at": r["created_at"].isoformat(),
            }
            for r in rows
        ]

    async def get_orders(
        self,
        env: str,
        *,
        limit: int = 100,
        since: datetime | None = None,
    ) -> list[dict[str, Any]]:
        """Return recent orders for *env*, newest first.

        Args:
            env: Environment partition.
            limit: Maximum number of rows to return.
            since: If provided, only orders updated after this timestamp.
        """
        if not self._enabled:
            return []
        async with self._pool.acquire() as conn:  # type: ignore[union-attr]
            if since is not None:
                rows = await conn.fetch(
                    """
                    SELECT order_id, data, created_at, updated_at
                    FROM orders
                    WHERE environment = $1 AND updated_at >= $2
                    ORDER BY updated_at DESC
                    LIMIT $3
                    """,
                    env,
                    since,
                    limit,
                )
            else:
                rows = await conn.fetch(
                    """
                    SELECT order_id, data, created_at, updated_at
                    FROM orders
                    WHERE environment = $1
                    ORDER BY updated_at DESC
                    LIMIT $2
                    """,
                    env,
                    limit,
                )
        return [
            {
                "order_id": r["order_id"],
                **json.loads(r["data"]),
                "created_at": r["created_at"].isoformat(),
                "updated_at": r["updated_at"].isoformat(),
            }
            for r in rows
        ]

    async def get_agent_states(self, env: str) -> list[dict[str, Any]]:
        """Return all persisted agent states for *env*.

        Args:
            env: Environment partition.
        """
        if not self._enabled:
            return []
        async with self._pool.acquire() as conn:  # type: ignore[union-attr]
            rows = await conn.fetch(
                """
                SELECT agent_name, state, updated_at
                FROM agent_state
                WHERE environment = $1
                ORDER BY agent_name
                """,
                env,
            )
        return [
            {
                "agent_name": r["agent_name"],
                **json.loads(r["state"]),
                "updated_at": r["updated_at"].isoformat(),
            }
            for r in rows
        ]
