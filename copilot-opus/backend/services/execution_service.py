"""Order execution service for the Paulie's Prediction Partners trading system.

Receives :class:`TradeIntent` objects from agents, runs them through the
:class:`RiskGateway`, submits approved orders via :class:`KalshiRestClient`,
and tracks the full order lifecycle (create → fill/cancel).  Semi-auto
intents are queued for human approval with a configurable timeout.
"""

from __future__ import annotations

import time
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

import structlog

from backend.config import Settings
from backend.models.schemas import TradeIntent
from backend.services.kalshi_rest_client import KalshiAPIError, KalshiRestClient
from backend.services.risk_gateway import RiskGateway
from backend.services.state_cache import StateCache

log = structlog.get_logger(__name__)


class ExecutionService:
    """Orchestrates the full trade-intent → order lifecycle.

    Responsibilities:
      1. Route intents by agent mode (auto / semi-auto / safe).
      2. Run risk checks via :class:`RiskGateway`.
      3. Submit approved orders via :class:`KalshiRestClient`.
      4. Queue semi-auto intents for human approval.
      5. Handle order updates and fills from the WebSocket feed.
      6. Record every state transition to the :class:`StateCache`.
    """

    def __init__(
        self,
        config: Settings,
        rest_client: KalshiRestClient,
        risk_gateway: RiskGateway,
        state_cache: StateCache,
    ) -> None:
        self.config = config
        self.rest_client = rest_client
        self.risk_gateway = risk_gateway
        self.state_cache = state_cache

        # Pending semi-auto approvals keyed by client_order_id
        self.pending_approvals: dict[str, TradeIntent] = {}
        self._pending_timestamps: dict[str, float] = {}

    # ------------------------------------------------------------------
    # Primary entry point
    # ------------------------------------------------------------------

    async def process_intent(self, intent: TradeIntent) -> dict[str, Any]:
        """Process a trade intent through the full pipeline.

        Routing by agent mode:
          * **auto** — risk-check then immediately submit.
          * **semi-auto** — queue for human approval.
          * **safe** — reject outright.

        Returns a result dict with ``status`` and contextual details.
        """
        agent_state = self.state_cache.get_agent_state(intent.agent_name)
        if agent_state is None:
            reason = "unknown_agent"
            await self._record_rejection(intent, reason)
            return self._result("rejected", intent, reason=reason)

        mode = agent_state.mode

        if mode == "safe":
            reason = "agent_mode_safe_blocks_execution"
            await self._record_rejection(intent, reason)
            return self._result("rejected", intent, reason=reason)

        if mode == "semi-auto":
            return await self._queue_for_approval(intent)

        # mode == "auto"
        approved, reason = await self.risk_gateway.check_trade_intent(intent)
        if not approved:
            return self._result("rejected", intent, reason=reason)

        return await self.submit_order(intent)

    # ------------------------------------------------------------------
    # Order submission
    # ------------------------------------------------------------------

    async def submit_order(self, intent: TradeIntent) -> dict[str, Any]:
        """Build an order request from *intent* and submit via REST client.

        Returns a result dict with the order response on success or error
        details on failure.
        """
        client_order_id = _generate_client_order_id()
        order_request = self._build_order_request(intent, client_order_id)

        log.info(
            "order_submitting",
            agent=intent.agent_name,
            ticker=intent.ticker,
            side=intent.side,
            action=intent.action,
            count_fp=intent.count_fp,
            price_dollars=intent.price_dollars,
            client_order_id=client_order_id,
        )

        try:
            order_response = await self.rest_client.create_order(order_request)
        except KalshiAPIError as exc:
            self.risk_gateway.record_submit_failure()
            log.error(
                "order_submit_failed",
                agent=intent.agent_name,
                ticker=intent.ticker,
                error=str(exc),
                status_code=exc.status_code,
            )
            await self._record_risk_event(
                intent,
                "order_submit_failed",
                f"API error {exc.status_code}: {exc.detail}",
            )
            return self._result(
                "error",
                intent,
                reason="api_error",
                error=str(exc),
                status_code=exc.status_code,
            )

        self.risk_gateway.record_submit_success()

        order_id = order_response.get("order_id", "")
        await self.state_cache.update_order(order_id, order_response)

        log.info(
            "order_submitted",
            agent=intent.agent_name,
            ticker=intent.ticker,
            order_id=order_id,
            client_order_id=client_order_id,
        )
        return self._result(
            "submitted",
            intent,
            order_id=order_id,
            client_order_id=client_order_id,
            order=order_response,
        )

    # ------------------------------------------------------------------
    # Order cancellation
    # ------------------------------------------------------------------

    async def cancel_order(self, order_id: str) -> dict[str, Any]:
        """Cancel a resting order by its exchange-assigned *order_id*."""
        log.info("order_cancelling", order_id=order_id)
        try:
            result = await self.rest_client.cancel_order(order_id)
        except KalshiAPIError as exc:
            log.error(
                "order_cancel_failed",
                order_id=order_id,
                error=str(exc),
                status_code=exc.status_code,
            )
            return {
                "status": "error",
                "order_id": order_id,
                "reason": "api_error",
                "error": str(exc),
            }

        await self.state_cache.update_order(
            order_id, {"order_id": order_id, "status": "canceled"},
        )

        log.info("order_cancelled", order_id=order_id)
        return {"status": "cancelled", "order_id": order_id, "result": result}

    # ------------------------------------------------------------------
    # Semi-auto approval workflow
    # ------------------------------------------------------------------

    async def approve_pending(self, client_order_id: str) -> dict[str, Any]:
        """Approve a pending semi-auto intent and execute it."""
        self._expire_old_approvals()

        intent = self.pending_approvals.pop(client_order_id, None)
        self._pending_timestamps.pop(client_order_id, None)

        if intent is None:
            log.warning(
                "approve_pending_not_found", client_order_id=client_order_id,
            )
            return {
                "status": "error",
                "client_order_id": client_order_id,
                "reason": "not_found_or_expired",
            }

        log.info(
            "pending_intent_approved",
            agent=intent.agent_name,
            ticker=intent.ticker,
            client_order_id=client_order_id,
        )
        await self._record_risk_event(
            intent, "intent_approved", "human approved semi-auto intent",
        )
        return await self.submit_order(intent)

    async def deny_pending(self, client_order_id: str) -> dict[str, Any]:
        """Deny a pending semi-auto intent and log the denial."""
        self._expire_old_approvals()

        intent = self.pending_approvals.pop(client_order_id, None)
        self._pending_timestamps.pop(client_order_id, None)

        if intent is None:
            log.warning(
                "deny_pending_not_found", client_order_id=client_order_id,
            )
            return {
                "status": "error",
                "client_order_id": client_order_id,
                "reason": "not_found_or_expired",
            }

        log.info(
            "pending_intent_denied",
            agent=intent.agent_name,
            ticker=intent.ticker,
            client_order_id=client_order_id,
        )
        await self._record_rejection(intent, "human_denied")
        return self._result("denied", intent, client_order_id=client_order_id)

    def get_pending_approvals(self) -> list[dict[str, Any]]:
        """Return all pending semi-auto approval requests for the UI."""
        self._expire_old_approvals()
        now = time.monotonic()
        results: list[dict[str, Any]] = []
        for coid, intent in self.pending_approvals.items():
            queued_at = self._pending_timestamps.get(coid, now)
            age_seconds = now - queued_at
            timeout = self.config.approval_timeout_seconds
            results.append({
                "client_order_id": coid,
                "agent_name": intent.agent_name,
                "ticker": intent.ticker,
                "side": intent.side,
                "action": intent.action,
                "count_fp": intent.count_fp,
                "price_dollars": intent.price_dollars,
                "reasoning": intent.reasoning,
                "pattern_detected": intent.pattern_detected,
                "age_seconds": round(age_seconds, 1),
                "expires_in_seconds": round(max(timeout - age_seconds, 0), 1),
            })
        return results

    def _expire_old_approvals(self) -> None:
        """Remove pending approvals older than ``approval_timeout_seconds``."""
        timeout = self.config.approval_timeout_seconds
        now = time.monotonic()
        expired = [
            coid
            for coid, ts in self._pending_timestamps.items()
            if now - ts > timeout
        ]
        for coid in expired:
            intent = self.pending_approvals.pop(coid, None)
            self._pending_timestamps.pop(coid, None)
            if intent is not None:
                log.info(
                    "pending_approval_expired",
                    agent=intent.agent_name,
                    ticker=intent.ticker,
                    client_order_id=coid,
                )

    # ------------------------------------------------------------------
    # WebSocket event handlers
    # ------------------------------------------------------------------

    async def process_order_update(self, order_data: dict[str, Any]) -> None:
        """Handle an order update from the WebSocket feed (fills, cancels)."""
        order_id = order_data.get("order_id", "")
        status = order_data.get("status", "")

        log.info(
            "order_update_received",
            order_id=order_id,
            status=status,
            ticker=order_data.get("ticker", ""),
        )

        if order_id:
            await self.state_cache.update_order(order_id, order_data)

    async def process_fill(self, fill_data: dict[str, Any]) -> None:
        """Handle a fill notification — update state and record PnL."""
        fill_id = fill_data.get("fill_id", "")
        order_id = fill_data.get("order_id", "")
        ticker = fill_data.get("ticker", "")

        log.info(
            "fill_received",
            fill_id=fill_id,
            order_id=order_id,
            ticker=ticker,
            side=fill_data.get("side", ""),
            action=fill_data.get("action", ""),
            count_fp=fill_data.get("count_fp", ""),
        )

        await self.state_cache.add_fill(fill_data)

        # Compute realized PnL contribution for the risk gateway's daily tally.
        pnl = self._compute_fill_pnl(fill_data)
        if pnl != Decimal("0"):
            self.risk_gateway.record_pnl(pnl)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _queue_for_approval(
        self, intent: TradeIntent,
    ) -> dict[str, Any]:
        """Queue a semi-auto intent for human approval."""
        self._expire_old_approvals()

        client_order_id = _generate_client_order_id()
        self.pending_approvals[client_order_id] = intent
        self._pending_timestamps[client_order_id] = time.monotonic()

        log.info(
            "intent_queued_for_approval",
            agent=intent.agent_name,
            ticker=intent.ticker,
            client_order_id=client_order_id,
            timeout_seconds=self.config.approval_timeout_seconds,
        )
        await self._record_risk_event(
            intent,
            "intent_pending_approval",
            "semi-auto intent queued for human approval",
        )
        return self._result(
            "pending_approval",
            intent,
            client_order_id=client_order_id,
            timeout_seconds=self.config.approval_timeout_seconds,
        )

    @staticmethod
    def _build_order_request(
        intent: TradeIntent, client_order_id: str,
    ) -> dict[str, Any]:
        """Translate a :class:`TradeIntent` into a Kalshi order payload."""
        request: dict[str, Any] = {
            "ticker": intent.ticker,
            "client_order_id": client_order_id,
            "side": intent.side,
            "action": intent.action,
            "count_fp": intent.count_fp,
            "type": "limit",
        }
        if intent.side == "yes":
            request["yes_price_dollars"] = intent.price_dollars
        else:
            request["no_price_dollars"] = intent.price_dollars
        return request

    @staticmethod
    def _compute_fill_pnl(fill_data: dict[str, Any]) -> Decimal:
        """Estimate realized PnL from a fill for daily tracking.

        For buys the cost is negative (outflow); for sells it is positive
        (inflow).  Fees are always subtracted.
        """
        count = Decimal(fill_data.get("count_fp", "0") or "0")
        yes_price = Decimal(fill_data.get("yes_price_fixed", "0") or "0")
        fee = Decimal(fill_data.get("fee_cost", "0") or "0")
        action = fill_data.get("action", "buy")

        notional = count * yes_price
        if action == "sell":
            return notional - fee
        # buy: cost is an outflow
        return -notional - fee

    async def _record_rejection(
        self, intent: TradeIntent, reason: str,
    ) -> None:
        """Log a rejection and persist a risk event."""
        log.warning(
            "trade_intent_rejected",
            agent=intent.agent_name,
            ticker=intent.ticker,
            side=intent.side,
            action=intent.action,
            reason=reason,
        )
        await self._record_risk_event(intent, "trade_rejected", reason)

    async def _record_risk_event(
        self,
        intent: TradeIntent,
        event_type: str,
        reason: str,
    ) -> None:
        """Write a risk event to the state cache."""
        await self.state_cache.add_risk_event({
            "event_type": event_type,
            "agent_name": intent.agent_name,
            "ticker": intent.ticker,
            "reason": reason,
            "timestamp": datetime.now(timezone.utc),
        })

    @staticmethod
    def _result(
        status: str,
        intent: TradeIntent,
        **extra: Any,
    ) -> dict[str, Any]:
        """Build a uniform result dict."""
        result: dict[str, Any] = {
            "status": status,
            "agent_name": intent.agent_name,
            "ticker": intent.ticker,
            "side": intent.side,
            "action": intent.action,
        }
        result.update(extra)
        return result


def _generate_client_order_id() -> str:
    """Return a unique client order ID."""
    return uuid.uuid4().hex
