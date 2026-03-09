import type { AgentMode, AgentState } from "../../types/trading";

export interface AgentConfig {
  displayName: string;
  icon: string;
  description: string;
  chartColor: string;
  defaultMode: AgentMode;
  active: boolean;
  underConstruction?: boolean;
  isByob?: boolean;
}

interface AgentCardProps {
  agentName: string;
  config: AgentConfig;
  state: AgentState | null;
  onModeChange: (name: string, mode: AgentMode) => void;
}

export function AgentCard({ agentName, config, state, onModeChange }: AgentCardProps) {
  const mode = state?.mode ?? config.defaultMode;
  const statusColor =
    !config.active ? "var(--color-fg-subtle)"
    : mode === "auto" ? "var(--color-state-success)"
    : mode === "semi-auto" ? "var(--color-state-warning)"
    : "var(--color-state-error)";

  const winRate =
    state && state.win_count + state.loss_count > 0
      ? Math.round((state.win_count / (state.win_count + state.loss_count)) * 100)
      : null;

  const pnl = state ? parseFloat(state.realized_pnl) : 0;

  return (
    <div className="card agent-card" style={{ minWidth: 130, display: "flex", flexDirection: "column", gap: 4, padding: 8, opacity: config.active ? 1 : 0.6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 18 }}>{config.icon}</span>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {config.displayName}
          </div>
          <div style={{ fontSize: 9, color: "var(--color-fg-muted)" }}>{config.description}</div>
        </div>
        <span title={mode} style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor, flexShrink: 0 }} />
      </div>

      {config.underConstruction && (
        <div style={{ fontSize: 9, color: "var(--color-state-warning)", textAlign: "center" }}>🚧 Under Construction</div>
      )}
      {config.isByob && (
        <div style={{ fontSize: 9, color: "var(--color-fg-muted)", textAlign: "center" }}>🔧 Bring Your Own Bot</div>
      )}

      {state && (
        <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
          {winRate !== null && <span style={{ color: "var(--color-fg-muted)" }}>W:{winRate}%</span>}
          <span style={{ fontFamily: "var(--font-family-mono)", color: pnl >= 0 ? "var(--color-state-success)" : "var(--color-state-error)" }}>
            {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
          </span>
        </div>
      )}

      {config.active && (
        <div style={{ display: "flex", gap: 3 }}>
          {(["auto", "semi-auto", "safe"] as const).map((m) => (
            <button
              key={m}
              className={`btn btn-sm ${mode === m ? "btn-primary" : "btn-ghost"}`}
              style={{ flex: 1, fontSize: 9, padding: "2px 0" }}
              title={m}
              onClick={() => onModeChange(agentName, m)}
            >
              {m === "auto" ? "A" : m === "semi-auto" ? "S" : "⛔"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
