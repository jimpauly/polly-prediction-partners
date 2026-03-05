"""Async Kalshi WebSocket client for real-time market data.

Maintains a single persistent connection per environment with automatic
reconnection (exponential backoff + jitter), subscription tracking, and
orderbook sequence-number integrity checks.

Supported channels:

* **ticker** — market price updates
* **orderbook_delta** — orderbook changes
* **trade** — public trades
* **market_lifecycle_v2** — market state changes
* **fill** — user fill notifications (authenticated)
* **user_orders** — user order updates (authenticated)
* **market_positions** — user position updates (authenticated)
"""

from __future__ import annotations

import asyncio
import json
import random
from dataclasses import dataclass, field
from typing import Any, Callable, Coroutine

import structlog
import websockets
from websockets.asyncio.client import ClientConnection

from backend.config import Settings
from backend.utils.auth import get_websocket_auth_headers

log = structlog.get_logger(__name__)

_WS_PATH = "/trade-api/ws/v2"

_BACKOFF_BASE = 1.0  # seconds
_BACKOFF_MAX = 60.0  # seconds

# Internal event types emitted to the callback
_EVENT_RECONNECTED = "_reconnected"
_EVENT_STALE_ORDERBOOK = "_stale_orderbook"


# ---------------------------------------------------------------------------
# Internal bookkeeping
# ---------------------------------------------------------------------------

@dataclass
class _Subscription:
    """Tracks an active subscription for reconnection replay."""

    sid: int
    channels: list[str]
    market_tickers: list[str] | None
    send_initial_snapshot: bool
    skip_ticker_ack: bool


@dataclass
class _SeqTracker:
    """Per-subscription sequence number tracker for orderbook integrity."""

    last_seq: int | None = None
    stale: bool = False


# ---------------------------------------------------------------------------
# Public client
# ---------------------------------------------------------------------------

OnMessageCallback = Callable[[dict[str, Any]], Coroutine[Any, Any, None] | None]


class KalshiWebSocketClient:
    """Async WebSocket client for the Kalshi streaming API.

    Usage::

        client = KalshiWebSocketClient(settings, on_message_callback=handler)
        await client.connect()
        sid = await client.subscribe(["ticker"], market_tickers=["KXBTC-..."])
        ...
        await client.disconnect()
    """

    def __init__(
        self,
        config: Settings,
        on_message_callback: OnMessageCallback,
    ) -> None:
        self._config = config
        self._ws_url = f"{config.ws_url}{_WS_PATH}"
        self._api_key_id: str = config.api_key_id
        self._private_key_pem: str = config.private_key_pem.get_secret_value()
        self._on_message = on_message_callback

        self._ws: ClientConnection | None = None
        self._reader_task: asyncio.Task[None] | None = None
        self._closing = False

        # Command ID counter (monotonically increasing per connection lifetime)
        self._next_cmd_id: int = 1

        # Subscription bookkeeping for reconnection replay
        self._subscriptions: dict[int, _Subscription] = {}

        # Sequence tracking per subscription id
        self._seq_trackers: dict[int, _SeqTracker] = {}

    # ------------------------------------------------------------------
    # Connection lifecycle
    # ------------------------------------------------------------------

    async def connect(self) -> None:
        """Establish the WebSocket connection and start the reader loop."""
        self._closing = False
        await self._connect()

    async def disconnect(self) -> None:
        """Gracefully close the connection."""
        self._closing = True

        if self._reader_task is not None:
            self._reader_task.cancel()
            try:
                await self._reader_task
            except asyncio.CancelledError:
                pass
            self._reader_task = None

        if self._ws is not None:
            await self._ws.close()
            self._ws = None

        log.info("ws_disconnected")

    # ------------------------------------------------------------------
    # Public commands
    # ------------------------------------------------------------------

    async def subscribe(
        self,
        channels: list[str],
        market_tickers: list[str] | None = None,
        send_initial_snapshot: bool = False,
        skip_ticker_ack: bool = False,
    ) -> int:
        """Subscribe to one or more channels.

        Returns the command id used for this subscription request.
        """
        params: dict[str, Any] = {"channels": channels}
        if market_tickers is not None:
            params["market_tickers"] = market_tickers
        if send_initial_snapshot:
            params["send_initial_snapshot"] = True
        if skip_ticker_ack:
            params["skip_ticker_ack"] = True

        cmd_id = await self._send_command("subscribe", params)

        # Optimistically track; the server will assign a real ``sid`` in the
        # ack.  We store the command id as a temporary key so that
        # ``_handle_subscribe_ack`` can upgrade it.
        self._subscriptions[cmd_id] = _Subscription(
            sid=cmd_id,
            channels=channels,
            market_tickers=market_tickers,
            send_initial_snapshot=send_initial_snapshot,
            skip_ticker_ack=skip_ticker_ack,
        )

        return cmd_id

    async def unsubscribe(self, sids: list[int]) -> None:
        """Unsubscribe by subscription ids."""
        await self._send_command("unsubscribe", {"sids": sids})
        for sid in sids:
            self._subscriptions.pop(sid, None)
            self._seq_trackers.pop(sid, None)

    async def list_subscriptions(self) -> int:
        """Request the server to list active subscriptions.

        The response arrives asynchronously via the message callback.
        Returns the command id.
        """
        return await self._send_command("list_subscriptions")

    async def update_subscription(
        self,
        sid: int,
        action: str,
        market_tickers: list[str],
    ) -> int:
        """Add or remove markets from an existing subscription.

        Args:
            sid: Subscription id to modify.
            action: ``"add_markets"`` or ``"delete_markets"``.
            market_tickers: Tickers to add or remove.

        Returns the command id.
        """
        params: dict[str, Any] = {
            "sids": [sid],
            "action": action,
            "market_tickers": market_tickers,
        }
        cmd_id = await self._send_command("update_subscription", params)

        # Keep local bookkeeping consistent.
        sub = self._subscriptions.get(sid)
        if sub is not None and sub.market_tickers is not None:
            if action == "add_markets":
                sub.market_tickers = list(
                    set(sub.market_tickers) | set(market_tickers)
                )
            elif action == "delete_markets":
                sub.market_tickers = [
                    t for t in sub.market_tickers if t not in set(market_tickers)
                ]

        return cmd_id

    # ------------------------------------------------------------------
    # Internals — connection
    # ------------------------------------------------------------------

    async def _connect(self) -> None:
        """Open the WebSocket and start the message reader task."""
        auth_headers = get_websocket_auth_headers(
            private_key_pem=self._private_key_pem,
            api_key_id=self._api_key_id,
        )

        log.info("ws_connecting", url=self._ws_url)
        self._ws = await websockets.connect(
            self._ws_url,
            additional_headers=auth_headers,
        )
        log.info("ws_connected", url=self._ws_url)

        self._reader_task = asyncio.create_task(
            self._message_reader(), name="kalshi-ws-reader"
        )

    async def _reconnect(self) -> None:
        """Reconnect with exponential backoff + jitter, then replay subs."""
        attempt = 0
        while not self._closing:
            delay = _backoff(attempt)
            log.warning(
                "ws_reconnecting",
                attempt=attempt,
                delay=round(delay, 2),
            )
            await asyncio.sleep(delay)

            try:
                await self._connect()
            except Exception:
                log.exception("ws_reconnect_failed", attempt=attempt)
                attempt += 1
                continue

            # Notify callback of reconnection
            await self._dispatch({"type": _EVENT_RECONNECTED, "attempt": attempt})

            # Re-subscribe to previously tracked subscriptions
            await self._replay_subscriptions()
            return

    async def _replay_subscriptions(self) -> None:
        """Re-establish all tracked subscriptions after a reconnect."""
        old_subs = list(self._subscriptions.values())
        self._subscriptions.clear()
        self._seq_trackers.clear()
        self._next_cmd_id = 1

        for sub in old_subs:
            try:
                await self.subscribe(
                    channels=sub.channels,
                    market_tickers=sub.market_tickers,
                    send_initial_snapshot=sub.send_initial_snapshot,
                    skip_ticker_ack=sub.skip_ticker_ack,
                )
            except Exception:
                log.exception(
                    "ws_replay_subscribe_failed",
                    channels=sub.channels,
                    market_tickers=sub.market_tickers,
                )

    # ------------------------------------------------------------------
    # Internals — message loop
    # ------------------------------------------------------------------

    async def _message_reader(self) -> None:
        """Continuously read messages from the WebSocket."""
        if self._ws is None:
            raise RuntimeError("WebSocket is not connected")
        try:
            async for raw in self._ws:
                try:
                    msg = json.loads(raw)
                except json.JSONDecodeError:
                    log.warning("ws_invalid_json", raw=raw[:200])
                    continue

                self._process_server_message(msg)
                await self._dispatch(msg)

        except websockets.ConnectionClosedError as exc:
            if not self._closing:
                log.warning("ws_connection_lost", code=exc.code, reason=exc.reason)
                await self._reconnect()
        except websockets.ConnectionClosedOK:
            log.info("ws_connection_closed_ok")
        except asyncio.CancelledError:
            raise
        except Exception:
            if not self._closing:
                log.exception("ws_reader_error")
                await self._reconnect()

    def _process_server_message(self, msg: dict[str, Any]) -> None:
        """Handle bookkeeping side-effects of incoming messages.

        * Upgrade subscription tracking when the server acks a subscribe.
        * Track sequence numbers for orderbook_delta integrity.
        """
        msg_type = msg.get("type")

        # --- subscribe ack: upgrade cmd_id → real sid ---
        if msg_type == "subscribed":
            cmd_id = msg.get("id")
            sid = msg.get("sid")
            if cmd_id is not None and sid is not None and cmd_id in self._subscriptions:
                sub = self._subscriptions.pop(cmd_id)
                sub.sid = sid
                self._subscriptions[sid] = sub

        # --- orderbook_delta sequence tracking ---
        sid = msg.get("sid")
        if sid is not None and msg_type == "orderbook_delta":
            seq = msg.get("seq")
            self._check_sequence(sid, seq)

    def _check_sequence(self, sid: int, seq: int | None) -> None:
        """Verify orderbook_delta sequence continuity."""
        if seq is None:
            return

        tracker = self._seq_trackers.setdefault(sid, _SeqTracker())

        if tracker.last_seq is not None and seq != tracker.last_seq + 1:
            log.warning(
                "ws_sequence_gap",
                sid=sid,
                expected=tracker.last_seq + 1,
                received=seq,
            )
            tracker.stale = True
            # Schedule stale notification + resubscribe (non-blocking)
            asyncio.create_task(self._handle_stale_orderbook(sid))

        tracker.last_seq = seq

    async def _handle_stale_orderbook(self, sid: int) -> None:
        """Emit a stale-orderbook event and trigger a resubscribe."""
        await self._dispatch({
            "type": _EVENT_STALE_ORDERBOOK,
            "sid": sid,
        })

        sub = self._subscriptions.get(sid)
        if sub is None:
            return

        # Unsubscribe + resubscribe to get a fresh snapshot
        try:
            await self.unsubscribe([sid])
            await self.subscribe(
                channels=sub.channels,
                market_tickers=sub.market_tickers,
                send_initial_snapshot=True,
                skip_ticker_ack=sub.skip_ticker_ack,
            )
        except Exception:
            log.exception("ws_stale_resubscribe_failed", sid=sid)

    # ------------------------------------------------------------------
    # Internals — sending
    # ------------------------------------------------------------------

    async def _send_command(
        self,
        cmd: str,
        params: dict[str, Any] | None = None,
    ) -> int:
        """Serialize and send a command, returning its auto-incremented id."""
        if self._ws is None:
            raise RuntimeError("WebSocket is not connected")

        cmd_id = self._next_cmd_id
        self._next_cmd_id += 1

        payload: dict[str, Any] = {"id": cmd_id, "cmd": cmd}
        if params:
            payload["params"] = params

        raw = json.dumps(payload)
        log.debug("ws_send", cmd=cmd, id=cmd_id)
        await self._ws.send(raw)
        return cmd_id

    # ------------------------------------------------------------------
    # Internals — dispatch
    # ------------------------------------------------------------------

    async def _dispatch(self, msg: dict[str, Any]) -> None:
        """Forward a parsed message to the user callback."""
        try:
            result = self._on_message(msg)
            if asyncio.iscoroutine(result):
                await result
        except Exception:
            log.exception("ws_callback_error", msg_type=msg.get("type"))


# ---------------------------------------------------------------------------
# Module-level helpers
# ---------------------------------------------------------------------------


def _backoff(attempt: int) -> float:
    """Exponential backoff with full jitter."""
    ceiling = min(_BACKOFF_BASE * (2 ** attempt), _BACKOFF_MAX)
    # Not security-sensitive: jitter for retry backoff only.
    return random.uniform(0, ceiling)  # noqa: S311
