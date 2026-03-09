/**
 * TypeScript type definitions for the Paulie's Prediction Partners API.
 *
 * These types mirror the Pydantic models defined in
 * `services/api/backend/models/schemas.py` and the response shapes
 * returned by `services/api/backend/api/control_api.py`.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Monetary value encoded as a fixed-point dollar string, e.g. "0.5600". */
export type FixedPointDollars = string;

/** ISO 8601 datetime string as returned by the API. */
export type ISODateString = string;

// ---------------------------------------------------------------------------
// Kalshi market models
// ---------------------------------------------------------------------------

export type MarketType = "binary" | "scalar";

export type MarketStatus =
  | "initialized"
  | "inactive"
  | "active"
  | "closed"
  | "determined"
  | "disputed"
  | "amended"
  | "finalized";

export interface Market {
  ticker: string;
  event_ticker: string;
  market_type: MarketType;
  yes_sub_title: string;
  no_sub_title: string;
  status: MarketStatus;

  /** Prices — FixedPointDollars strings (e.g. "0.5600") */
  yes_bid_dollars: FixedPointDollars;
  yes_ask_dollars: FixedPointDollars;
  no_bid_dollars: FixedPointDollars;
  no_ask_dollars: FixedPointDollars;
  last_price_dollars: FixedPointDollars;

  /** Volume / open interest */
  volume_fp: string;
  volume_24h_fp: string;
  open_interest_fp: string;

  /** Timestamps */
  open_time: ISODateString;
  close_time: ISODateString;
  created_time: ISODateString;

  notional_value_dollars: FixedPointDollars;
  result: string | null;
}

export type Side = "yes" | "no";
export type Action = "buy" | "sell";

export interface Fill {
  fill_id: string;
  trade_id: string;
  order_id: string;
  ticker: string;
  side: Side;
  action: Action;
  count_fp: string;
  yes_price_fixed: FixedPointDollars;
  no_price_fixed: FixedPointDollars;
  is_taker: boolean;
  fee_cost: FixedPointDollars;
  created_time: ISODateString;
}

export type OrderStatus = "resting" | "canceled" | "executed";

export interface Order {
  order_id: string;
  ticker: string;
  status: OrderStatus;
  side: Side;
  yes_price_dollars: FixedPointDollars;
  fill_count_fp: string;
  remaining_count_fp: string;
  initial_count_fp: string;
  client_order_id: string;
  created_time: ISODateString;
  last_update_time: ISODateString;
  expiration_time: ISODateString | null;
}

export interface Position {
  ticker: string;
  market_exposure: FixedPointDollars;
  position: string;
  realized_pnl_dollars: FixedPointDollars;
  total_traded_fp: string;
}

export interface Balance {
  balance: string;
  portfolio_value: string;
}

export interface Candlestick {
  end_period_ts: number;
  open: FixedPointDollars | null;
  high: FixedPointDollars | null;
  low: FixedPointDollars | null;
  close: FixedPointDollars | null;
  volume: string;
  mean: FixedPointDollars | null;
}

export interface Event {
  event_ticker: string;
  series_ticker: string;
  title: string;
  category: string;
  sub_title: string;
  markets: Market[] | null;
}

export interface Series {
  series_ticker: string;
  title: string;
  category: string;
  tags: string[] | null;
}

// ---------------------------------------------------------------------------
// Agent / risk models
// ---------------------------------------------------------------------------

export type AgentMode = "auto" | "semi-auto" | "safe";

export interface AgentState {
  agent_name: string;
  mode: AgentMode;
  status: string;
  total_trades: number;
  win_count: number;
  loss_count: number;
  realized_pnl: string;
  last_decision_time: ISODateString | null;
}

export interface TradeIntent {
  agent_name: string;
  ticker: string;
  side: Side;
  action: Action;
  count_fp: string;
  price_dollars: FixedPointDollars;
  reasoning: string;
  pattern_detected: string | null;
}

export interface RiskEvent {
  event_type: string;
  agent_name: string;
  ticker: string;
  reason: string;
  timestamp: ISODateString;
}

// ---------------------------------------------------------------------------
// API request / response shapes
// ---------------------------------------------------------------------------

export interface TradingStatusResponse {
  trading_enabled: boolean;
  circuit_breaker_open: boolean;
  daily_pnl: string;
}

export interface ConnectionRequest {
  environment: "live" | "demo";
  api_key_id: string;
  private_key_pem: string;
}

export interface ConnectionStatusResponse {
  connected: boolean;
  environment: string;
  api_key_id_masked: string;
}

export interface AgentModeRequest {
  mode: AgentMode;
}

export interface AgentModeResponse {
  agent_name: string;
  mode: AgentMode;
}

export interface ManualOrderRequest {
  ticker: string;
  side: Side;
  action?: Action;
  count_fp?: string;
  price_dollars: FixedPointDollars;
}

/** Real-time WebSocket event envelope. */
export interface WsEventEnvelope {
  type: string;
  data: Record<string, unknown>;
  timestamp: ISODateString;
}

/** Full state snapshot returned by GET /api/state/snapshot. */
export interface StateSnapshot {
  markets: Record<string, Market>;
  balance: Balance;
  positions: Record<string, Position>;
  orders: Record<string, Order>;
  fills: Fill[];
  agents: Record<string, AgentState>;
  risk_events: RiskEvent[];
  trading_status: TradingStatusResponse;
  connection_status: ConnectionStatusResponse;
}
