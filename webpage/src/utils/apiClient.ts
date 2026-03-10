/**
 * Typed API client for the Paulie's Prediction Partners backend.
 *
 * Wraps the FastAPI endpoints defined in
 * `services/api/backend/api/control_api.py` with full TypeScript types.
 * All requests target `http://127.0.0.1:8000` (or are proxied via Vite's
 * dev-server proxy so that `/api/*` routes reach the backend without CORS issues).
 */

import type {
  AgentMode,
  AgentModeRequest,
  AgentModeResponse,
  AgentState,
  Balance,
  ConnectionRequest,
  ConnectionStatusResponse,
  Fill,
  ManualOrderRequest,
  Market,
  Order,
  Position,
  RiskEvent,
  StateSnapshot,
  TradingStatusResponse,
  TradeIntent,
  WsEventEnvelope,
} from "../types/trading";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL = "/api";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// ---------------------------------------------------------------------------
// State endpoints
// ---------------------------------------------------------------------------

export const stateApi = {
  /** Full UI dashboard snapshot. */
  snapshot: (): Promise<StateSnapshot> => get("/state/snapshot"),

  /** All markets keyed by ticker. */
  markets: (): Promise<Record<string, Market>> => get("/state/markets"),

  /** Single market by ticker. */
  market: (ticker: string): Promise<Market> =>
    get(`/state/market/${encodeURIComponent(ticker)}`),

  /** Orderbook for a ticker. */
  orderbook: (ticker: string): Promise<Record<string, unknown>> =>
    get(`/state/orderbook/${encodeURIComponent(ticker)}`),

  /** Account balance. */
  balance: (): Promise<Balance> => get("/state/balance"),

  /** All portfolio positions. */
  positions: (): Promise<Record<string, Position>> => get("/state/positions"),

  /** All open/resting orders. */
  orders: (): Promise<Record<string, Order>> => get("/state/orders"),

  /** Executed fills. */
  fills: (): Promise<Fill[]> => get("/state/fills"),

  /** All agent states. */
  agents: (): Promise<Record<string, AgentState>> => get("/state/agents"),

  /** Single agent state by name. */
  agent: (name: string): Promise<AgentState> =>
    get(`/state/agent/${encodeURIComponent(name)}`),

  /** Risk events log. */
  riskEvents: (): Promise<RiskEvent[]> => get("/state/risk-events"),

  /** Exchange connectivity status. */
  exchangeStatus: (): Promise<Record<string, unknown>> =>
    get("/state/exchange-status"),
};

// ---------------------------------------------------------------------------
// Agent control endpoints
// ---------------------------------------------------------------------------

export const agentsApi = {
  /** Set an agent's operating mode. */
  setMode: (name: string, mode: AgentMode): Promise<AgentModeResponse> =>
    post(`/agents/${encodeURIComponent(name)}/mode`, {
      mode,
    } satisfies AgentModeRequest),

  /** Start an agent. */
  start: (name: string): Promise<Record<string, string>> =>
    post(`/agents/${encodeURIComponent(name)}/start`),

  /** Stop an agent (forces safe mode). */
  stop: (name: string): Promise<Record<string, string>> =>
    post(`/agents/${encodeURIComponent(name)}/stop`),

  /** Get performance metrics (wins, losses, PnL, scaling tier) for an agent. */
  performance: (name: string): Promise<Record<string, unknown>> =>
    get(`/agents/${encodeURIComponent(name)}/performance`),
};

// ---------------------------------------------------------------------------
// Trading control endpoints
// ---------------------------------------------------------------------------

export const tradingApi = {
  /** Get current trading status. */
  status: (): Promise<TradingStatusResponse> => get("/trading/status"),

  /** Enable live trading. */
  enable: (): Promise<TradingStatusResponse> => post("/trading/enable"),

  /** Disable live trading. */
  disable: (): Promise<TradingStatusResponse> => post("/trading/disable"),

  /** Submit a manual order. */
  manualOrder: (order: ManualOrderRequest): Promise<Record<string, unknown>> =>
    post("/trading/manual-order", order),

  /** Cancel a resting order by exchange-assigned order ID. */
  cancelOrder: (orderId: string): Promise<Record<string, unknown>> =>
    post(`/orders/${encodeURIComponent(orderId)}/cancel`),
};

// ---------------------------------------------------------------------------
// Semi-auto approval endpoints
// ---------------------------------------------------------------------------

export const approvalsApi = {
  /** List pending trade-intent approval requests. */
  pending: (): Promise<TradeIntent[]> => get("/approvals/pending"),

  /** Approve a pending order by client_order_id. */
  approve: (clientOrderId: string): Promise<Record<string, unknown>> =>
    post(`/approvals/${encodeURIComponent(clientOrderId)}/approve`),

  /** Deny a pending order by client_order_id. */
  deny: (clientOrderId: string): Promise<Record<string, unknown>> =>
    post(`/approvals/${encodeURIComponent(clientOrderId)}/deny`),
};

// ---------------------------------------------------------------------------
// Connection management endpoints
// ---------------------------------------------------------------------------

export const connectionApi = {
  /** Get connection status. */
  status: (): Promise<ConnectionStatusResponse> => get("/connection/status"),

  /** Connect to the Kalshi exchange. */
  connect: (req: ConnectionRequest): Promise<ConnectionStatusResponse> =>
    post("/connection/connect", req),

  /** Disconnect from the Kalshi exchange. */
  disconnect: (): Promise<ConnectionStatusResponse> =>
    post("/connection/disconnect"),
};

// ---------------------------------------------------------------------------
// Reconciliation endpoints
// ---------------------------------------------------------------------------

export const reconciliationApi = {
  /** Trigger a manual reconciliation run. */
  trigger: (): Promise<Record<string, unknown>> =>
    post("/reconciliation/trigger"),

  /** Get current reconciliation status. */
  status: (): Promise<Record<string, unknown>> =>
    get("/reconciliation/status"),
};

// ---------------------------------------------------------------------------
// WebSocket helper
// ---------------------------------------------------------------------------

/**
 * Opens a WebSocket connection to the backend real-time event stream.
 *
 * @param onMessage - Callback invoked for each parsed {@link WsEventEnvelope}.
 * @param onError   - Optional error handler.
 * @returns The underlying {@link WebSocket} instance (call `.close()` to disconnect).
 */
export function connectEventStream(
  onMessage: (event: WsEventEnvelope) => void,
  onError?: (error: Event) => void
): WebSocket {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/api/events`;
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (ev) => {
    try {
      const envelope = JSON.parse(ev.data as string) as WsEventEnvelope;
      onMessage(envelope);
    } catch {
      // Ignore malformed frames
    }
  };

  if (onError) {
    ws.onerror = onError;
  }

  return ws;
}
