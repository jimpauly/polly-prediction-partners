import { useState } from "react";
import type { Fill, Position } from "../../types/trading";
import { MAX_DISPLAYED_FILLS } from "../../constants";

interface PositionsPanelProps {
  connected: boolean;
  positions: Record<string, Position>;
  fills: Fill[];
}

export function PositionsPanel({ connected, positions, fills }: PositionsPanelProps) {
  const [tab, setTab] = useState<"positions" | "history">("positions");
  const posArr = Object.values(positions);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", gap: 4, padding: "8px 8px 0" }}>
        {(["positions", "history"] as const).map((t) => (
          <button
            key={t}
            className={`axis-btn ${tab === t ? "active" : ""}`}
            style={{ fontSize: 11, textTransform: "capitalize" }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {!connected ? (
          <div style={{ textAlign: "center", padding: 24, color: "var(--color-fg-subtle)", fontSize: 12 }}>
            Connect to view {tab}
          </div>
        ) : tab === "positions" ? (
          posArr.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "var(--color-fg-subtle)", fontSize: 12 }}>
              No open positions
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ color: "var(--color-fg-muted)", borderBottom: "1px solid var(--color-border-muted)" }}>
                  <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: 600 }}>Ticker</th>
                  <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 600 }}>Size</th>
                  <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 600 }}>P/L</th>
                </tr>
              </thead>
              <tbody>
                {posArr.map((p) => {
                  const pnl = parseFloat(p.realized_pnl_dollars);
                  return (
                    <tr key={p.ticker} style={{ borderBottom: "1px solid var(--color-border-muted)" }}>
                      <td style={{ padding: "5px 6px", fontFamily: "var(--font-family-mono)", fontSize: 10, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.ticker}
                      </td>
                      <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "var(--font-family-mono)" }}>
                        {p.position}
                      </td>
                      <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "var(--font-family-mono)", color: pnl >= 0 ? "var(--color-state-success)" : "var(--color-state-error)" }}>
                        {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          fills.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "var(--color-fg-subtle)", fontSize: 12 }}>
              No fills yet
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ color: "var(--color-fg-muted)", borderBottom: "1px solid var(--color-border-muted)" }}>
                  <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: 600 }}>Ticker</th>
                  <th style={{ textAlign: "center", padding: "4px 6px", fontWeight: 600 }}>Side</th>
                  <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 600 }}>Qty</th>
                </tr>
              </thead>
              <tbody>
                {fills.slice(0, MAX_DISPLAYED_FILLS).map((f) => (
                  <tr key={f.fill_id} style={{ borderBottom: "1px solid var(--color-border-muted)" }}>
                    <td style={{ padding: "5px 6px", fontFamily: "var(--font-family-mono)", fontSize: 10, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.ticker}
                    </td>
                    <td style={{ padding: "5px 6px", textAlign: "center" }}>
                      <span className={`badge ${f.side === "yes" ? "badge--success" : "badge--danger"}`} style={{ fontSize: 9 }}>
                        {f.side.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "var(--font-family-mono)" }}>
                      {f.count_fp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
