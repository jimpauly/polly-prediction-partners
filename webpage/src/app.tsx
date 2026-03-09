import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import type { AgentMode, AgentState, Balance, Fill, Market, Position, TradingStatusResponse, WsEventEnvelope } from "./types/trading";
import { stateApi, tradingApi, agentsApi, approvalsApi } from "./utils/apiClient";
import { useConnection } from "./hooks/useConnection";
import { useApi } from "./hooks/useApi";
import { useWebSocket } from "./hooks/useWebSocket";
import { AppShell } from "./components/layout/AppShell";
import { MAX_FILLS } from "./constants";

function App() {
  const connection = useConnection();

  // Core data — polled while connected
  const marketsApi = useApi<Record<string, Market>>(stateApi.markets, { enabled: connection.connected, interval: 30000 });
  const positionsApi = useApi<Record<string, Position>>(stateApi.positions, { enabled: connection.connected, interval: 10000 });
  const fillsApi = useApi<Fill[]>(stateApi.fills, { enabled: connection.connected, interval: 15000 });
  const agentsApiData = useApi<Record<string, AgentState>>(stateApi.agents, { enabled: connection.connected, interval: 10000 });
  const balanceApi = useApi<Balance>(stateApi.balance, { enabled: connection.connected, interval: 15000 });
  const tradingStatusApi = useApi<TradingStatusResponse>(tradingApi.status, { enabled: connection.connected, interval: 15000 });

  // Derived state with real-time WS overlays
  const [markets, setMarkets] = useState<Record<string, Market>>({});
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [fills, setFills] = useState<Fill[]>([]);
  const [agents, setAgents] = useState<Record<string, AgentState>>({});

  // Sync polled data into local state
  React.useEffect(() => { if (marketsApi.data) setMarkets(marketsApi.data); }, [marketsApi.data]);
  React.useEffect(() => { if (positionsApi.data) setPositions(positionsApi.data); }, [positionsApi.data]);
  React.useEffect(() => { if (fillsApi.data) setFills(fillsApi.data); }, [fillsApi.data]);
  React.useEffect(() => { if (agentsApiData.data) setAgents(agentsApiData.data); }, [agentsApiData.data]);

  // WebSocket real-time updates
  const handleWsMessage = useCallback((envelope: WsEventEnvelope) => {
    const { type, data } = envelope;
    if (type === "market_update" && data.ticker) {
      setMarkets((prev) => ({ ...prev, [data.ticker as string]: data as unknown as Market }));
    } else if (type === "position_update" && data.ticker) {
      setPositions((prev) => ({ ...prev, [data.ticker as string]: data as unknown as Position }));
    } else if (type === "fill" && data.fill_id) {
      setFills((prev) => [data as unknown as Fill, ...prev].slice(0, MAX_FILLS));
    } else if (type === "agent_update" && data.agent_name) {
      setAgents((prev) => ({ ...prev, [data.agent_name as string]: data as unknown as AgentState }));
    }
  }, []);

  useWebSocket({ enabled: connection.connected, onMessage: handleWsMessage });

  // Action handlers
  const handleBuy = useCallback(async (ticker: string, side: "yes" | "no", priceDollars: string) => {
    try {
      await tradingApi.manualOrder({ ticker, side, price_dollars: priceDollars });
      fillsApi.refetch();
      positionsApi.refetch();
    } catch (err) {
      console.error("Order failed:", err);
    }
  }, [fillsApi, positionsApi]);

  const handleApprove = useCallback(async (clientOrderId: string) => {
    try { await approvalsApi.approve(clientOrderId); } catch (err) { console.error(err); }
  }, []);

  const handleDeny = useCallback(async (clientOrderId: string) => {
    try { await approvalsApi.deny(clientOrderId); } catch (err) { console.error(err); }
  }, []);

  const handleAgentModeChange = useCallback(async (name: string, mode: AgentMode) => {
    try {
      const res = await agentsApi.setMode(name, mode);
      setAgents((prev) => ({
        ...prev,
        [name]: { ...(prev[name] ?? { agent_name: name, status: "", total_trades: 0, win_count: 0, loss_count: 0, realized_pnl: "0", last_decision_time: null }), mode: res.mode },
      }));
    } catch (err) {
      console.error("Mode change failed:", err);
    }
  }, []);

  const totalTrades = Object.values(agents).reduce((sum, a) => sum + a.total_trades, 0);

  return (
    <AppShell
      connectionState={connection}
      onConnect={connection.connect}
      onDisconnect={connection.disconnect}
      markets={markets}
      positions={positions}
      fills={fills}
      agents={agents}
      balance={balanceApi.data}
      tradingStatus={tradingStatusApi.data}
      totalTrades={totalTrades}
      onBuy={handleBuy}
      onAgentModeChange={handleAgentModeChange}
      onApprove={handleApprove}
      onDeny={handleDeny}
    />
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
