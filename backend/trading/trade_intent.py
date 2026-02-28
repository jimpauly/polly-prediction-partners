"""trading/trade_intent.py — TradeIntent dataclass."""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from uuid import UUID


@dataclass
class TradeIntent:
    agent_id: UUID
    client_order_id: UUID      # pre-generated for idempotency
    market_ticker: str
    action: str                # "buy" or "sell"
    side: str                  # "yes" or "no"
    order_type: str            # "limit" or "market"
    price: int                 # cents, 1-99
    count: int                 # number of contracts
    confidence: float          # agent's internal score, 0.0-1.0
    generated_at: int = field(default_factory=lambda: int(time.time() * 1000))
