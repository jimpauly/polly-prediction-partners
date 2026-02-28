"""kalshi/websocket_client.py — Persistent WebSocket connection to Kalshi.

Responsibilities:
- Establish and maintain a single WebSocket connection per environment.
- Login immediately after connect.
- Subscribe to channels per market ticker.
- Send ping every 10 seconds; reconnect if pong not received within 5 seconds.
- Reconnect with exponential backoff (500ms → 1s → 2s → 4s → 8s, max 30s).
- Re-login and re-subscribe after every reconnect.
- Forward all inbound messages to an asyncio.Queue for downstream processing.
- Detect orderbook sequence gaps and trigger re-subscription.
- Never block the event loop.
"""
from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Callable, Set, Tuple

import websockets
from websockets.exceptions import ConnectionClosed

from kalshi.auth import build_ws_login_payload, load_private_key, load_private_key_from_pem
import config

logger = logging.getLogger(__name__)

_PING_INTERVAL = 10.0       # seconds between pings
_PONG_TIMEOUT = 5.0         # seconds to wait for pong before reconnecting
_RECONNECT_DELAYS = [0.5, 1.0, 2.0, 4.0, 8.0, 30.0]  # backoff ladder

# Type alias for a subscription key
SubscriptionKey = Tuple[str, str]  # (channel, market_ticker)


class KalshiWebSocketClient:
    """Persistent WebSocket client for Kalshi real-time data.

    One instance per environment.  Call `start()` to launch as an asyncio task.
    """

    def __init__(self, environment: str, message_queue: asyncio.Queue) -> None:
        self._env = environment
        self._ws_url = config.ws_url(environment)
        self._api_key: str | None = None
        self._private_key = None
        self._queue = message_queue

        # Set of (channel, market_ticker) tuples — restored on reconnect
        self._subscriptions: Set[SubscriptionKey] = set()

        # Orderbook sequence tracking: market_ticker → last_seq
        self._ob_seq: dict[str, int] = {}

        self._ws = None
        self._msg_id = 1
        self._running = False
        self._reconnect_attempts = 0

        # Pong tracking
        self._last_pong: float = 0.0
        self._ping_task: asyncio.Task | None = None

        # Callbacks invoked when the connection is re-established (e.g. for reconciliation)
        self._reconnect_callbacks: list[Callable] = []

    def configure(self, api_key: str, private_key_pem_path: str) -> None:
        self._api_key = api_key
        self._private_key = load_private_key(private_key_pem_path)

    def configure_from_pem(self, api_key: str, private_key_pem: str) -> None:
        """Load credentials directly from a PEM string (no disk write)."""
        self._api_key = api_key
        self._private_key = load_private_key_from_pem(private_key_pem)

    def is_configured(self) -> bool:
        return bool(self._api_key and self._private_key)

    def add_reconnect_callback(self, cb: Callable) -> None:
        self._reconnect_callbacks.append(cb)

    # ── Public subscription management ───────────────────────────────────────

    async def subscribe(self, channels: list[str], market_tickers: list[str]) -> None:
        """Subscribe to channels for given market tickers.  Idempotent."""
        new_keys = {(ch, mt) for ch in channels for mt in market_tickers}
        new_keys -= self._subscriptions          # only actually new ones
        if not new_keys:
            return

        self._subscriptions |= new_keys

        if self._ws and not self._ws.closed:
            await self._send_subscribe(channels, market_tickers)

    async def unsubscribe(self, channels: list[str], market_tickers: list[str]) -> None:
        """Unsubscribe from channels for given market tickers."""
        for ch in channels:
            for mt in market_tickers:
                self._subscriptions.discard((ch, mt))

        if self._ws and not self._ws.closed:
            msg = {
                "id": self._next_id(),
                "cmd": "unsubscribe",
                "params": {"channels": channels, "market_tickers": market_tickers},
            }
            await self._ws.send(json.dumps(msg))

    # ── Lifecycle ─────────────────────────────────────────────────────────────

    async def start(self) -> None:
        """Main loop — connects, reads messages, reconnects on failure."""
        self._running = True
        while self._running:
            try:
                await self._connect_and_run()
            except Exception as exc:
                if not self._running:
                    break
                delay = self._backoff_delay()
                logger.warning(
                    "WebSocket disconnected — reconnecting",
                    extra={"env": self._env, "error": str(exc), "delay": delay},
                )
                await asyncio.sleep(delay)

    async def stop(self) -> None:
        self._running = False
        if self._ping_task:
            self._ping_task.cancel()
        if self._ws:
            await self._ws.close()

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _next_id(self) -> int:
        self._msg_id += 1
        return self._msg_id

    def _backoff_delay(self) -> float:
        idx = min(self._reconnect_attempts, len(_RECONNECT_DELAYS) - 1)
        self._reconnect_attempts += 1
        return _RECONNECT_DELAYS[idx]

    async def _connect_and_run(self) -> None:
        if not self.is_configured():
            logger.info("WebSocket not yet configured — waiting for credentials.", extra={"env": self._env})
            await asyncio.sleep(5)
            return

        logger.info("Connecting WebSocket", extra={"env": self._env, "url": self._ws_url})
        async with websockets.connect(self._ws_url, ping_interval=None) as ws:
            self._ws = ws
            self._reconnect_attempts = 0     # successful connect resets counter
            self._last_pong = time.monotonic()

            # Login immediately
            await self._login(ws)

            # Re-subscribe to all previously tracked subscriptions
            if self._subscriptions:
                await self._resubscribe_all(ws)

            # Notify registered callbacks (e.g. trigger state reconciliation)
            for cb in self._reconnect_callbacks:
                asyncio.create_task(cb())

            # Start keep-alive ping loop
            if self._ping_task:
                self._ping_task.cancel()
            self._ping_task = asyncio.create_task(self._ping_loop(ws))

            # Read messages until connection closes
            try:
                async for raw in ws:
                    await self._handle_raw(raw)
            finally:
                if self._ping_task:
                    self._ping_task.cancel()

    async def _login(self, ws) -> None:
        payload = build_ws_login_payload(self._api_key, self._private_key, msg_id=1)
        await ws.send(json.dumps(payload))
        logger.debug("WebSocket login sent", extra={"env": self._env})

    async def _resubscribe_all(self, ws) -> None:
        """Rebuild subscriptions grouped by channel."""
        from collections import defaultdict
        channel_map: dict[str, list[str]] = defaultdict(list)
        for channel, ticker in self._subscriptions:
            channel_map[channel].append(ticker)

        for channel, tickers in channel_map.items():
            # Kalshi supports up to 10,000 tickers per subscribe command
            for i in range(0, len(tickers), 1000):
                batch = tickers[i : i + 1000]
                await self._send_subscribe([channel], batch, ws=ws)
                await asyncio.sleep(0.05)  # small pause between batches

        # Reset orderbook sequence tracking — fresh snapshots incoming
        self._ob_seq.clear()
        logger.info("WebSocket re-subscribed", extra={"env": self._env, "count": len(self._subscriptions)})

    async def _send_subscribe(
        self, channels: list[str], market_tickers: list[str], ws=None
    ) -> None:
        ws = ws or self._ws
        if not ws or ws.closed:
            return
        msg = {
            "id": self._next_id(),
            "cmd": "subscribe",
            "params": {"channels": channels, "market_tickers": market_tickers},
        }
        await ws.send(json.dumps(msg))

    async def _ping_loop(self, ws) -> None:
        """Send a ping every 10 seconds.  Reconnect if pong not received in 5s."""
        while True:
            await asyncio.sleep(_PING_INTERVAL)
            try:
                ping_msg = json.dumps({"id": 99, "cmd": "ping"})
                await ws.send(ping_msg)
                # Wait up to PONG_TIMEOUT for a pong (tracked in _handle_raw)
                deadline = time.monotonic() + _PONG_TIMEOUT
                while time.monotonic() < deadline:
                    if self._last_pong > time.monotonic() - _PING_INTERVAL - _PONG_TIMEOUT:
                        break
                    await asyncio.sleep(0.25)
                else:
                    logger.warning("Pong timeout — closing connection to force reconnect", extra={"env": self._env})
                    await ws.close()
                    return
            except Exception:
                return

    async def _handle_raw(self, raw: str) -> None:
        """Parse a raw message and route to the downstream queue."""
        try:
            msg = json.loads(raw)
        except json.JSONDecodeError:
            logger.warning("WebSocket received non-JSON message", extra={"env": self._env})
            return

        msg_type = msg.get("type", "")

        # Handle pong
        if msg_type == "pong":
            self._last_pong = time.monotonic()
            return

        # Handle subscribed confirmation — no downstream action needed
        if msg_type in ("subscribed", "unsubscribed", "ok"):
            return

        # Inject environment tag for downstream consumers
        msg["_env"] = self._env

        # Orderbook sequence gap detection
        if msg_type == "orderbook_delta":
            inner = msg.get("msg", {})
            ticker = inner.get("market_ticker", "")
            seq = inner.get("seq")
            if seq is not None and ticker:
                if ticker in self._ob_seq:
                    expected = self._ob_seq[ticker] + 1
                    if seq != expected:
                        logger.warning(
                            "Orderbook sequence gap detected — re-subscribing",
                            extra={"env": self._env, "ticker": ticker, "expected": expected, "got": seq},
                        )
                        del self._ob_seq[ticker]
                        # Force re-subscribe: discard so subscribe() sends the command
                        self._subscriptions.discard(("orderbook_delta", ticker))
                        asyncio.create_task(
                            self.subscribe(["orderbook_delta"], [ticker])
                        )
                        return  # discard this message; fresh snapshot incoming
                self._ob_seq[ticker] = seq

        await self._queue.put(msg)
