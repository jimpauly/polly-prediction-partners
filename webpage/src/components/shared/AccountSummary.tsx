import type { Balance, TradingStatusResponse } from "../../types/trading";

interface AccountSummaryProps {
  balance: Balance | null;
  tradingStatus: TradingStatusResponse | null;
  totalTrades: number;
}

export function AccountSummary({ balance, tradingStatus, totalTrades }: AccountSummaryProps) {
  const bal = balance ? parseFloat(balance.balance) : null;
  const portVal = balance ? parseFloat(balance.portfolio_value) : null;
  const dailyPnl = tradingStatus ? parseFloat(tradingStatus.daily_pnl) : null;

  return (
    <div className="card">
      <div className="card-header" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Account</div>
      <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--color-fg-muted)", marginBottom: 2 }}>Balance</div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-family-mono)" }}>
            {bal !== null ? `$${bal.toFixed(2)}` : "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--color-fg-muted)", marginBottom: 2 }}>Portfolio</div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-family-mono)" }}>
            {portVal !== null ? `$${portVal.toFixed(2)}` : "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--color-fg-muted)", marginBottom: 2 }}>Today P/L</div>
          <div style={{
            fontSize: 14, fontWeight: 700, fontFamily: "var(--font-family-mono)",
            color: dailyPnl !== null ? (dailyPnl >= 0 ? "var(--color-state-success)" : "var(--color-state-error)") : undefined,
          }}>
            {dailyPnl !== null ? `${dailyPnl >= 0 ? "+" : ""}$${dailyPnl.toFixed(2)}` : "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--color-fg-muted)", marginBottom: 2 }}>Trades</div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-family-mono)" }}>
            {totalTrades}
          </div>
        </div>
      </div>
    </div>
  );
}
