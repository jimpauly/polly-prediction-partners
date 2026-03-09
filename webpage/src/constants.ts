/**
 * Shared constants for Paulie's Prediction Partners React app.
 *
 * Centralising these avoids duplication between hooks and components
 * and provides a single place to adjust behavioural thresholds.
 */

// ---------------------------------------------------------------------------
// Theme / appearance
// ---------------------------------------------------------------------------

/** All 24 supported theme IDs. Must stay in sync with themes.css. */
export const THEME_IDS = [
  "webpage",
  "mosaic-1993",
  "gen7-cockpit",
  "ussr-cockpit",
  "neon-vice-1985",
  "neon-city-2085",
  "coniforest",
  "rainforest",
  "art-deco",
  "holographic",
  "vapor",
  "paper",
  "ledger-1920",
  "blueprint",
  "chalkboard",
  "phosphor",
  "volcano",
  "oceanic",
  "aurora",
  "desert",
  "cherry-blossom",
  "hive",
  "dusk",
  "amethyst",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];
export type ModeId = "light" | "dark";

// ---------------------------------------------------------------------------
// Agent configuration (mirrors agents.js in the vanilla JS app)
// ---------------------------------------------------------------------------

export interface AgentConfig {
  displayName: string;
  icon: string;
  description: string;
  chartColor: string;
  defaultMode: "auto" | "semi-auto" | "safe";
  active: boolean;
  underConstruction?: boolean;
  isByob?: boolean;
}

export const AGENT_CONFIGS: Record<string, AgentConfig> = {
  peritia: {
    displayName: "PERITIA",
    icon: "🎯",
    description: "BTC 15-min Candlestick",
    chartColor: "#22c55e",
    defaultMode: "semi-auto",
    active: true,
  },
  prime: {
    displayName: "PRIME",
    icon: "📊",
    description: "Majority Signal",
    chartColor: "#3b82f6",
    defaultMode: "semi-auto",
    active: true,
  },
  praxis: {
    displayName: "PRAXIS",
    icon: "🧠",
    description: "Sports Markets",
    chartColor: "#a855f7",
    defaultMode: "safe",
    active: true,
  },
  patiens: {
    displayName: "PATIENS",
    icon: "🕰️",
    description: "Long-term Holds",
    chartColor: "#f59e0b",
    defaultMode: "safe",
    active: false,
    underConstruction: true,
  },
  pavis: {
    displayName: "PAVIS",
    icon: "🛡️",
    description: "Defensive Strategy",
    chartColor: "#64748b",
    defaultMode: "safe",
    active: false,
    underConstruction: true,
  },
  byob: {
    displayName: "BRING-YOUR-OWN-BOT",
    icon: "🤖",
    description: "Custom LLM Agent",
    chartColor: "#06b6d4",
    defaultMode: "safe",
    active: true,
    isByob: true,
  },
  agnt007: {
    displayName: "AGNT007",
    icon: "🕵️",
    description: "Stealth Operations",
    chartColor: "#64748b",
    defaultMode: "safe",
    active: false,
    underConstruction: true,
  },
};

// ---------------------------------------------------------------------------
// Networking / polling intervals
// ---------------------------------------------------------------------------

/** Milliseconds between WebSocket reconnection attempts. */
export const RECONNECT_DELAY_MS = 5_000;

/** Milliseconds between backend ping/health checks. */
export const PING_INTERVAL_MS = 5_000;

// ---------------------------------------------------------------------------
// Trading / data limits
// ---------------------------------------------------------------------------

/** Maximum number of recent fills kept in client-side state. */
export const MAX_FILLS = 500;

/** Maximum number of fills displayed in the positions panel history tab. */
export const MAX_DISPLAYED_FILLS = 100;

/** Number of market cards per page in the Trading Studio. */
export const MARKETS_PAGE_SIZE = 12;
