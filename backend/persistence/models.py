"""persistence/models.py — SQL schema definitions and table creation helpers.

Live and Demo environments use separate PostgreSQL schemas: `live` and `demo`.
All DDL strings are defined here; execution is in database.py.
"""
from __future__ import annotations

# Schema names used as prefixes
SCHEMAS = ("live", "demo")


def create_schema_sql(schema: str) -> str:
    return f"CREATE SCHEMA IF NOT EXISTS {schema};"


def create_markets_sql(schema: str) -> str:
    return f"""
CREATE TABLE IF NOT EXISTS {schema}.markets (
    market_ticker       TEXT PRIMARY KEY,
    event_ticker        TEXT NOT NULL,
    series_ticker       TEXT NOT NULL,
    title               TEXT NOT NULL DEFAULT '',
    subtitle            TEXT,
    market_status       TEXT NOT NULL,
    open_time           TIMESTAMPTZ,
    close_time          TIMESTAMPTZ,
    settlement_price    SMALLINT,
    internal_state      TEXT NOT NULL DEFAULT 'ACTIVE',
    discovery_time      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_sync_time      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_{schema}_markets_series
    ON {schema}.markets (series_ticker);
CREATE INDEX IF NOT EXISTS idx_{schema}_markets_status
    ON {schema}.markets (market_status);
CREATE INDEX IF NOT EXISTS idx_{schema}_markets_internal_state
    ON {schema}.markets (internal_state);
"""


def create_orders_sql(schema: str) -> str:
    return f"""
CREATE TABLE IF NOT EXISTS {schema}.orders (
    order_id            UUID PRIMARY KEY,
    client_order_id     UUID NOT NULL UNIQUE,
    agent_id            UUID NOT NULL,
    market_ticker       TEXT NOT NULL REFERENCES {schema}.markets (market_ticker),
    action              TEXT NOT NULL,
    side                TEXT NOT NULL,
    order_type          TEXT NOT NULL,
    price               SMALLINT NOT NULL,
    count               INTEGER NOT NULL,
    remaining_count     INTEGER NOT NULL,
    status              TEXT NOT NULL,
    environment         TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_{schema}_orders_agent
    ON {schema}.orders (agent_id);
CREATE INDEX IF NOT EXISTS idx_{schema}_orders_market
    ON {schema}.orders (market_ticker);
CREATE INDEX IF NOT EXISTS idx_{schema}_orders_status
    ON {schema}.orders (status);
CREATE INDEX IF NOT EXISTS idx_{schema}_orders_environment
    ON {schema}.orders (environment);
"""


def create_fills_sql(schema: str) -> str:
    return f"""
CREATE TABLE IF NOT EXISTS {schema}.fills (
    fill_id             UUID PRIMARY KEY,
    order_id            UUID NOT NULL REFERENCES {schema}.orders (order_id),
    market_ticker       TEXT NOT NULL REFERENCES {schema}.markets (market_ticker),
    action              TEXT NOT NULL,
    side                TEXT NOT NULL,
    price               SMALLINT NOT NULL,
    count               INTEGER NOT NULL,
    is_taker            BOOLEAN NOT NULL,
    environment         TEXT NOT NULL,
    filled_at           TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_{schema}_fills_order
    ON {schema}.fills (order_id);
CREATE INDEX IF NOT EXISTS idx_{schema}_fills_market
    ON {schema}.fills (market_ticker);
CREATE INDEX IF NOT EXISTS idx_{schema}_fills_environment
    ON {schema}.fills (environment);
"""


def create_positions_sql(schema: str) -> str:
    return f"""
CREATE TABLE IF NOT EXISTS {schema}.positions (
    market_ticker       TEXT NOT NULL,
    environment         TEXT NOT NULL,
    yes_count           INTEGER NOT NULL DEFAULT 0,
    no_count            INTEGER NOT NULL DEFAULT 0,
    average_yes_price   SMALLINT,
    average_no_price    SMALLINT,
    realized_pnl        INTEGER NOT NULL DEFAULT 0,
    unrealized_pnl      INTEGER NOT NULL DEFAULT 0,
    last_updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (market_ticker, environment)
);
"""


def create_agent_state_sql(schema: str) -> str:
    return f"""
CREATE TABLE IF NOT EXISTS {schema}.agent_state (
    agent_id            UUID PRIMARY KEY,
    agent_name          TEXT NOT NULL,
    enabled             BOOLEAN NOT NULL DEFAULT false,
    mode                TEXT NOT NULL DEFAULT 'FullStop',
    configuration       JSONB NOT NULL DEFAULT '{{}}',
    lifecycle_state     TEXT NOT NULL DEFAULT 'STOPPED',
    last_decision_at    TIMESTAMPTZ,
    internal_state_blob JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""


def create_system_config_sql(schema: str) -> str:
    return f"""
CREATE TABLE IF NOT EXISTS {schema}.system_config (
    config_key      TEXT PRIMARY KEY,
    config_value    TEXT NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""


def all_create_statements(schema: str) -> list[str]:
    """Return all DDL statements for a schema in dependency order."""
    return [
        create_schema_sql(schema),
        create_markets_sql(schema),
        create_orders_sql(schema),
        create_fills_sql(schema),
        create_positions_sql(schema),
        create_agent_state_sql(schema),
        create_system_config_sql(schema),
    ]
