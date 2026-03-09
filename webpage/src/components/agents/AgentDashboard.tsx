import type { AgentMode, AgentState } from "../../types/trading";
import { AgentCard, type AgentConfig } from "./AgentCard";
import { AGENT_CONFIGS } from "../../constants";

// Re-export for consumers that still type against AgentConfig
export type { AgentConfig };

interface AgentDashboardProps {
  connected: boolean;
  agents: Record<string, AgentState>;
  onModeChange: (name: string, mode: AgentMode) => void;
}

export function AgentDashboard({ connected, agents, onModeChange }: AgentDashboardProps) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      {!connected && (
        <div style={{ fontSize: 11, color: "var(--color-fg-subtle)", alignSelf: "center", padding: "0 8px" }}>
          Connect to activate agents
        </div>
      )}
      {Object.entries(AGENT_CONFIGS).map(([name, cfg]) => (
        <AgentCard
          key={name}
          agentName={name}
          config={cfg}
          state={agents[name] ?? null}
          onModeChange={onModeChange}
        />
      ))}
    </div>
  );
}
