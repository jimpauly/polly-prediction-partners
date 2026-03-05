"""Prometheus metrics for Paulie's Prediction Partners backend.

Exposes module-level metric singletons that any service can import and
update.  When ``telemetry_enabled`` is ``True`` in the application
:class:`~backend.config.Settings`, :func:`mount_metrics` adds a
``/metrics`` HTTP endpoint to the FastAPI application so that a
Prometheus scraper can collect them.

Usage::

    from backend.services.metrics import SUBMIT_LATENCY, REJECTS

    SUBMIT_LATENCY.observe(elapsed)
    REJECTS.labels(reason="risk_check").inc()
"""

from __future__ import annotations

from typing import TYPE_CHECKING

import structlog
from prometheus_client import (
    Counter,
    Gauge,
    Histogram,
    generate_latest,
    CONTENT_TYPE_LATEST,
)

if TYPE_CHECKING:
    from fastapi import FastAPI

log = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# Counters
# ---------------------------------------------------------------------------

RECONNECTS: Counter = Counter(
    "paulies_reconnects_total",
    "Number of WebSocket reconnection events.",
)

SEQUENCE_GAPS: Counter = Counter(
    "paulies_sequence_gaps_total",
    "Sequence-number gaps detected on the WebSocket feed.",
)

REJECTS: Counter = Counter(
    "paulies_rejects_total",
    "Trade intents rejected by the risk gateway or exchange.",
    ["reason"],
)

RETRIES: Counter = Counter(
    "paulies_retries_total",
    "Retried REST or WebSocket operations.",
    ["operation"],
)

RATE_LIMIT_429: Counter = Counter(
    "paulies_rate_limit_429_total",
    "HTTP 429 (rate-limit) responses received from the exchange.",
)

REQUEST_COUNT: Counter = Counter(
    "paulies_http_requests_total",
    "Incoming HTTP requests handled by the control API.",
    ["method", "path"],
)

# ---------------------------------------------------------------------------
# Histograms
# ---------------------------------------------------------------------------

SUBMIT_LATENCY: Histogram = Histogram(
    "paulies_submit_latency_seconds",
    "End-to-end latency of order submissions to the exchange.",
    buckets=(0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0),
)

# ---------------------------------------------------------------------------
# Gauges
# ---------------------------------------------------------------------------

RECONCILIATION_DRIFT: Gauge = Gauge(
    "paulies_reconciliation_drift",
    "Number of position discrepancies found in the last reconciliation.",
)

ACTIVE_AGENTS: Gauge = Gauge(
    "paulies_active_agents",
    "Number of autonomous agents currently running.",
)

ACTIVE_CONNECTIONS: Gauge = Gauge(
    "paulies_active_connections",
    "Number of active WebSocket connections to the exchange.",
)


# ---------------------------------------------------------------------------
# FastAPI integration
# ---------------------------------------------------------------------------


def mount_metrics(app: FastAPI, *, telemetry_enabled: bool = False) -> None:
    """Optionally add a ``/metrics`` endpoint to *app*.

    When *telemetry_enabled* is ``False`` (the default) this function is a
    no-op, so callers can invoke it unconditionally without feature-flag
    checks.

    Parameters
    ----------
    app:
        The FastAPI application instance.
    telemetry_enabled:
        When ``True``, register the ``/metrics`` route.
    """
    if not telemetry_enabled:
        log.info("prometheus_metrics_disabled")
        return

    from fastapi.responses import Response as FastAPIResponse

    @app.get("/metrics", include_in_schema=False)
    async def _metrics_endpoint() -> FastAPIResponse:
        """Serve Prometheus text-format metrics."""
        return FastAPIResponse(
            content=generate_latest(),
            media_type=CONTENT_TYPE_LATEST,
        )

    log.info("prometheus_metrics_mounted", path="/metrics")
