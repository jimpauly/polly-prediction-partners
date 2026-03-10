import React, { useState } from "react";
import type { ConnectionState } from "../../hooks/useConnection";
import type { AgentState, Balance, Fill, Market, Order, Position, TradingStatusResponse } from "../../types/trading";
import { useTelemetry } from "../../hooks/useTelemetry";
import { useTheme } from "../../hooks/useTheme";
import { AGENT_CONFIGS } from "../../constants";

interface AppShellProps {
  connectionState: ConnectionState;
  onConnect: (apiKeyId: string, pem: string, env: "live" | "demo") => Promise<void>;
  onDisconnect: () => Promise<void>;
  markets: Record<string, Market>;
  positions: Record<string, Position>;
  fills: Fill[];
  agents: Record<string, AgentState>;
  orders?: Record<string, Order>;
  balance: Balance | null;
  tradingStatus: TradingStatusResponse | null;
  totalTrades: number;
  onBuy: (ticker: string, side: "yes" | "no", priceDollars: string) => void;
  onCancelOrder?: (orderId: string) => void;
  onAgentModeChange: (name: string, mode: import("../../types/trading").AgentMode) => void;
  onApprove: (orderId: string) => void;
  onDeny: (orderId: string) => void;
}

const STUDIO_TABS = [
  { id: "Design", label: "🎨 Design" },
  { id: "Trade",  label: "📈 Trade" },
  { id: "Fly",    label: "✈️ Fly" },
  { id: "Convert",label: "🔄 Convert" },
] as const;
type StudioTab = typeof STUDIO_TABS[number]["id"];

export function AppShell({
  connectionState,
  onConnect,
  onDisconnect,
  markets,
  positions,
  fills,
  agents,
  orders: _orders,
  balance,
  tradingStatus,
  totalTrades,
  onBuy,
  onCancelOrder: _onCancelOrder,
  onAgentModeChange,
  onApprove: _onApprove,
  onDeny: _onDeny,
}: AppShellProps) {
  const { pingMs, backendHealthy, dateTimeStr } = useTelemetry();
  const { theme, mode, themes, setTheme, toggleMode } = useTheme();
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>("Trade");
  const [inspectorTab, setInspectorTab] = useState<"positions" | "history">("positions");

  return (
    <div className="app-shell" style={{ display: "grid", gridTemplate: "auto 45px 1fr 180px / 320px 1fr 320px", height: "100vh", overflow: "hidden" }}>

      {/* HEADER — spans all 3 columns */}
      <header className="region region-header" style={{ gridColumn: "1 / -1" }}>
        <h1 className="app-title">
          <span className="app-title__accent">Paulie's</span> Prediction Partners 🤖
        </h1>
        <div className="header-center-placeholder" />
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px", fontSize: 12, color: "var(--color-fg-muted)" }}>
          {connectionState.connected && (
            <span className="badge badge--success" style={{ textTransform: "capitalize" }}>
              {connectionState.environment}
            </span>
          )}
          {connectionState.apiKeyIdMasked && (
            <span style={{ fontFamily: "var(--font-family-mono)" }}>{connectionState.apiKeyIdMasked}</span>
          )}
        </div>
      </header>

      {/* NAV BAR — spans all 3 columns */}
      <nav className="region region-nav" style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 16, padding: "0 16px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--color-fg-muted)", textTransform: "uppercase" }}>
          HUD
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "var(--color-fg-subtle)" }}>PING:</span>
        <span style={{ fontSize: 11, fontFamily: "var(--font-family-mono)", color: pingMs !== null ? "var(--color-state-success)" : "var(--color-fg-subtle)" }}>
          {pingMs !== null ? `${pingMs}ms` : "—"}
        </span>
        <span
          title={backendHealthy ? "Backend healthy" : "Backend unreachable"}
          style={{
            width: 8, height: 8, borderRadius: "50%",
            background: backendHealthy ? "var(--color-state-success)" : "var(--color-state-error)",
            display: "inline-block",
          }}
        />
        <span style={{ fontSize: 11, fontFamily: "var(--font-family-mono)", color: "var(--color-fg-muted)" }}>{dateTimeStr}</span>
      </nav>

      {/* LEFT SIDEBAR — System Design */}
      <aside className="region region-left" style={{ gridColumn: "1", gridRow: "3", overflowY: "auto" }}>
        <div className="region-title">System Design</div>
        <div className="card" style={{ margin: 8 }}>
          <div className="card-header" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-fg-muted)" }}>Theme</div>
          <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {themes.map((t) => (
              <button
                key={t}
                className={`btn btn-sm ${theme === t ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setTheme(t)}
                style={{ fontSize: 10, padding: "3px 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                title={t}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="card-footer">
            <button className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={toggleMode}>
              {mode === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN — Studio */}
      <main className="region region-main" style={{ gridColumn: "2", gridRow: "3", overflowY: "auto" }}>
        <div className="main-region-header" style={{ display: "flex", gap: 4, padding: "8px 12px", borderBottom: "1px solid var(--color-border-muted)" }}>
          {STUDIO_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`axis-btn ${activeStudioTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveStudioTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="studio-view" style={{ padding: 12 }}>
          {activeStudioTab === "Trade" && (
            <TradingView
              connected={connectionState.connected}
              markets={markets}
              onBuy={onBuy}
            />
          )}
          {activeStudioTab === "Design" && (
            <div className="card">
              <div className="card-header">Design Studio</div>
              <div className="card-body" style={{ color: "var(--color-fg-muted)", fontSize: 13 }}>
                Customize your trading environment using the System Design panel on the left.
              </div>
            </div>
          )}
          {activeStudioTab === "Fly" && (
            <div className="card">
              <div className="card-header">Fly Mode</div>
              <div className="card-body" style={{ color: "var(--color-fg-muted)", fontSize: 13 }}>
                Automated trading controls coming soon.
              </div>
            </div>
          )}
          {activeStudioTab === "Convert" && (
            <div className="card">
              <div className="card-header">Convert</div>
              <div className="card-body" style={{ color: "var(--color-fg-muted)", fontSize: 13 }}>
                Order conversion tools coming soon.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* RIGHT SIDEBAR — Inspector */}
      <aside className="region region-right" style={{ gridColumn: "3", gridRow: "3", overflowY: "auto" }}>
        <div className="region-title">Inspector</div>
        <div style={{ display: "flex", gap: 4, padding: "8px 8px 0" }}>
          {(["positions", "history"] as const).map((t) => (
            <button
              key={t}
              className={`axis-btn ${inspectorTab === t ? "active" : ""}`}
              onClick={() => setInspectorTab(t)}
              style={{ textTransform: "capitalize", fontSize: 11 }}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ padding: 8 }}>
          {inspectorTab === "positions" ? (
            <PositionsTab connected={connectionState.connected} positions={positions} />
          ) : (
            <HistoryTab connected={connectionState.connected} fills={fills} />
          )}
        </div>
      </aside>

      {/* FOOTER — spans all 3 columns */}
      <footer className="region region-foot" style={{ gridColumn: "1 / -1", gridRow: "4", display: "flex", gap: 0, overflow: "hidden" }}>
        {/* Agent Dashboard */}
        <div style={{ flex: 1, overflowX: "auto", display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
          <AgentBar connected={connectionState.connected} agents={agents} onModeChange={onAgentModeChange} />
        </div>
        {/* P/L MFD */}
        <div className="card card--compact" style={{ minWidth: 120, margin: 4 }}>
          <div className="card-header" style={{ fontSize: 10 }}>P/L</div>
          <div className="card-body" style={{ fontSize: 13, fontFamily: "var(--font-family-mono)" }}>
            {tradingStatus ? (
              <span style={{ color: parseFloat(tradingStatus.daily_pnl) >= 0 ? "var(--color-state-success)" : "var(--color-state-error)" }}>
                ${parseFloat(tradingStatus.daily_pnl).toFixed(2)}
              </span>
            ) : "—"}
          </div>
        </div>
        {/* Connect panel */}
        <div className="card card--compact" style={{ minWidth: 220, margin: 4, overflowY: "auto" }}>
          <ConnectCompact
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            connected={connectionState.connected}
            loading={connectionState.loading}
          />
        </div>
        {/* Account */}
        <div className="card card--compact" style={{ minWidth: 140, margin: 4 }}>
          <div className="card-header" style={{ fontSize: 10 }}>Account</div>
          <div className="card-body" style={{ fontSize: 12, fontFamily: "var(--font-family-mono)" }}>
            {balance ? (
              <>
                <div>Bal: ${parseFloat(balance.balance).toFixed(2)}</div>
                <div>Port: ${parseFloat(balance.portfolio_value).toFixed(2)}</div>
              </>
            ) : <span style={{ color: "var(--color-fg-subtle)" }}>—</span>}
            <div style={{ color: "var(--color-fg-muted)", fontSize: 10 }}>Trades: {totalTrades}</div>
          </div>
        </div>
        {/* Mode indicator */}
        <div style={{ display: "flex", alignItems: "center", padding: "0 12px", fontSize: 11, color: "var(--color-fg-muted)", borderLeft: "1px solid var(--color-border-muted)" }}>
          <span style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {connectionState.environment ?? "offline"}
          </span>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline sub-components (to avoid excessive file count at this stage)
// ---------------------------------------------------------------------------

interface TradingViewProps {
  connected: boolean;
  markets: Record<string, Market>;
  onBuy: (ticker: string, side: "yes" | "no", priceDollars: string) => void;
}

function TradingView({ connected, markets, onBuy }: TradingViewProps) {
  const marketList = Object.values(markets);
  if (!connected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 16 }}>
        <div style={{ fontSize: 32 }}>📊</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-fg-muted)" }}>Connect to start trading</div>
        <div style={{ fontSize: 13, color: "var(--color-fg-subtle)" }}>Enter your API credentials in the panel below.</div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 12, color: "var(--color-fg-muted)" }}>
        {marketList.length} market{marketList.length !== 1 ? "s" : ""} loaded
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
        {marketList.slice(0, 30).map((m) => (
          <MiniMarketCard key={m.ticker} market={m} onBuy={onBuy} />
        ))}
      </div>
    </div>
  );
}

function MiniMarketCard({ market, onBuy }: { market: Market; onBuy: (ticker: string, side: "yes" | "no", price: string) => void }) {
  const yesPct = Math.round(parseFloat(market.yes_bid_dollars) * 100);
  const noPct = 100 - yesPct;
  return (
    <div className="card" style={{ fontSize: 12 }}>
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, fontSize: 11, color: "var(--color-fg-muted)" }}>{market.event_ticker}</span>
        <span className={`badge ${market.status === "active" ? "badge--success" : "badge--muted"}`} style={{ fontSize: 10 }}>{market.status}</span>
      </div>
      <div className="card-body">
        <div style={{ fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{market.yes_sub_title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--color-border-muted)", overflow: "hidden" }}>
            <div style={{ width: `${yesPct}%`, height: "100%", background: "var(--color-accent-primary)", borderRadius: 3 }} />
          </div>
          <span style={{ fontFamily: "var(--font-family-mono)", fontWeight: 700 }}>{yesPct}¢</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button className="btn btn-sm btn-primary" style={{ flex: 1, fontSize: 11 }} onClick={() => onBuy(market.ticker, "yes", market.yes_ask_dollars)}>
            YES {yesPct}¢
          </button>
          <button className="btn btn-sm btn-secondary" style={{ flex: 1, fontSize: 11 }} onClick={() => onBuy(market.ticker, "no", market.no_ask_dollars)}>
            NO {noPct}¢
          </button>
        </div>
      </div>
    </div>
  );
}

function PositionsTab({ connected, positions }: { connected: boolean; positions: Record<string, Position> }) {
  const posArr = Object.values(positions);
  if (!connected) return <EmptyState label="Connect to view positions" />;
  if (posArr.length === 0) return <EmptyState label="No open positions" />;
  return (
    <div style={{ fontSize: 11 }}>
      {posArr.map((p) => (
        <div key={p.ticker} className="card card--compact" style={{ marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px" }}>
            <span style={{ fontFamily: "var(--font-family-mono)", overflow: "hidden", textOverflow: "ellipsis" }}>{p.ticker}</span>
            <span style={{ color: parseFloat(p.realized_pnl_dollars) >= 0 ? "var(--color-state-success)" : "var(--color-state-error)", fontFamily: "var(--font-family-mono)" }}>
              {parseFloat(p.realized_pnl_dollars) >= 0 ? "+" : ""}${parseFloat(p.realized_pnl_dollars).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryTab({ connected, fills }: { connected: boolean; fills: Fill[] }) {
  if (!connected) return <EmptyState label="Connect to view history" />;
  if (fills.length === 0) return <EmptyState label="No fills yet" />;
  return (
    <div style={{ fontSize: 11 }}>
      {fills.slice(0, 50).map((f) => (
        <div key={f.fill_id} className="card card--compact" style={{ marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 4, padding: "6px 8px" }}>
            <span style={{ fontFamily: "var(--font-family-mono)", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{f.ticker}</span>
            <span className={`badge ${f.side === "yes" ? "badge--info" : "badge--warning"}`}>{f.side.toUpperCase()}</span>
            <span style={{ fontFamily: "var(--font-family-mono)" }}>{f.count_fp}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center", padding: 24, color: "var(--color-fg-subtle)", fontSize: 12 }}>{label}</div>
  );
}

interface AgentBarProps {
  connected: boolean;
  agents: Record<string, AgentState>;
  onModeChange: (name: string, mode: import("../../types/trading").AgentMode) => void;
}

function AgentBar({ connected, agents, onModeChange }: AgentBarProps) {
  const agentNames = Object.keys(AGENT_CONFIGS);
  return (
    <>
      {agentNames.map((name) => {
        const cfg = AGENT_CONFIGS[name];
        const state = agents[name] ?? null;
        const mode = state?.mode ?? "safe";
        const winRate = state && (state.win_count + state.loss_count) > 0
          ? Math.round(state.win_count / (state.win_count + state.loss_count) * 100)
          : null;
        return (
          <div key={name} className="card card--compact agent-card" style={{ minWidth: 120, display: "flex", flexDirection: "column", gap: 2, padding: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span>{cfg.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cfg.displayName}</span>
              <span
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: !connected ? "var(--color-fg-subtle)" : mode === "auto" ? "var(--color-state-success)" : mode === "semi-auto" ? "var(--color-state-warning)" : "var(--color-state-error)",
                  flexShrink: 0,
                }}
              />
            </div>
            {winRate !== null && (
              <div style={{ fontSize: 10, color: "var(--color-fg-muted)" }}>Win: {winRate}%</div>
            )}
            {state && (
              <div style={{ fontSize: 10, fontFamily: "var(--font-family-mono)", color: parseFloat(state.realized_pnl) >= 0 ? "var(--color-state-success)" : "var(--color-state-error)" }}>
                {parseFloat(state.realized_pnl) >= 0 ? "+" : ""}${parseFloat(state.realized_pnl).toFixed(2)}
              </div>
            )}
            {connected && (
              <div style={{ display: "flex", gap: 2 }}>
                {(["auto", "semi-auto", "safe"] as const).map((m) => (
                  <button
                    key={m}
                    className={`btn btn-sm ${mode === m ? "btn-primary" : "btn-ghost"}`}
                    style={{ flex: 1, fontSize: 9, padding: "2px 0" }}
                    onClick={() => onModeChange(name, m)}
                    title={m}
                  >
                    {m === "auto" ? "A" : m === "semi-auto" ? "S" : "⛔"}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

interface ConnectCompactProps {
  onConnect: (apiKeyId: string, pem: string, env: "live" | "demo") => Promise<void>;
  onDisconnect: () => Promise<void>;
  connected: boolean;
  loading: boolean;
}

function ConnectCompact({ onConnect, onDisconnect, connected, loading }: ConnectCompactProps) {
  const [env, setEnv] = React.useState<"live" | "demo">("demo");
  const [keyId, setKeyId] = React.useState("");
  const [pem, setPem] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);

  if (connected) {
    return (
      <div style={{ padding: "4px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 10, color: "var(--color-state-success)", fontWeight: 700 }}>● CONNECTED</div>
        <button className="btn btn-sm btn-danger" disabled={loading} onClick={() => onDisconnect().catch((e: unknown) => setErr(String(e)))}>
          {loading ? "…" : "Disconnect"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "4px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
        {(["demo", "live"] as const).map((e) => (
          <label key={e} style={{ display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
            <input type="radio" checked={env === e} onChange={() => setEnv(e)} style={{ margin: 0 }} />
            <span style={{ textTransform: "capitalize" }}>{e}</span>
          </label>
        ))}
      </div>
      <input className="input" placeholder="API Key ID" value={keyId} onChange={(e) => setKeyId(e.target.value)} style={{ fontSize: 11, padding: "3px 6px" }} />
      <textarea className="input" placeholder="Private Key PEM" value={pem} onChange={(e) => setPem(e.target.value)} style={{ fontSize: 10, padding: "3px 6px", resize: "none", height: 40, fontFamily: "var(--font-family-mono)", WebkitTextSecurity: "disc" as never }} />
      {err && <div style={{ fontSize: 10, color: "var(--color-state-error)" }}>{err}</div>}
      <button
        className="btn btn-sm btn-primary"
        disabled={loading || !keyId || !pem}
        onClick={() => {
          setErr(null);
          onConnect(keyId, pem, env).catch((e: unknown) => setErr(String(e)));
        }}
      >
        {loading ? "Connecting…" : "Connect"}
      </button>
    </div>
  );
}
