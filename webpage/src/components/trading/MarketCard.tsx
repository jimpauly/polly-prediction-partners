import { useRef, useEffect } from "react";
import type { Market } from "../../types/trading";

interface MarketCardProps {
  market: Market;
  onBuy: (ticker: string, side: "yes" | "no", priceDollars: string) => void;
}

function timeRemaining(closeTime: string): string {
  const diff = new Date(closeTime).getTime() - Date.now();
  if (diff <= 0) return "Closed";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function MarketCard({ market, onBuy }: MarketCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const yesBid = parseFloat(market.yes_bid_dollars);
  const yesPct = Math.round(yesBid * 100);
  const noPct = 100 - yesPct;
  const potentialYes = yesBid > 0 ? ((1 - yesBid) / yesBid * 100).toFixed(0) : "—";
  const potentialNo = (1 - yesBid) > 0 ? (yesBid / (1 - yesBid) * 100).toFixed(0) : "—";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    // Simulated sparkline from last_price and bid spread
    const base = parseFloat(market.last_price_dollars) || yesBid;
    const points = Array.from({ length: 20 }, (_, i) => {
      const noise = (Math.sin(i * 2.3 + base * 10) * 0.08 + Math.cos(i * 1.1 + base * 5) * 0.05);
      return Math.max(0.05, Math.min(0.95, base + noise));
    });
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 0.1;
    ctx.beginPath();
    ctx.strokeStyle = "var(--color-accent-primary)";
    ctx.lineWidth = 1.5;
    points.forEach((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [market.last_price_dollars, market.yes_bid_dollars, yesBid]);

  return (
    <div className="card series-card" style={{ fontSize: 12 }}>
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 10, color: "var(--color-fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {market.event_ticker}
        </span>
        <span className={`badge ${market.status === "active" ? "badge--success" : "badge--muted"}`} style={{ fontSize: 9 }}>
          {market.status}
        </span>
        <span style={{ fontSize: 10, color: "var(--color-fg-subtle)", whiteSpace: "nowrap" }}>
          {timeRemaining(market.close_time)}
        </span>
      </div>
      <div className="card-body">
        <div style={{ fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{market.yes_sub_title}</div>
        <canvas ref={canvasRef} width={220} height={36} style={{ display: "block", width: "100%", height: 36, marginBottom: 6 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--color-border-muted)", overflow: "hidden" }}>
            <div style={{ width: `${yesPct}%`, height: "100%", background: yesPct > 60 ? "var(--color-state-success)" : yesPct < 40 ? "var(--color-state-error)" : "var(--color-state-warning)", borderRadius: 3 }} />
          </div>
          <span style={{ fontWeight: 700, fontFamily: "var(--font-family-mono)" }}>{yesPct}¢</span>
        </div>
        <div style={{ display: "flex", gap: 8, fontSize: 10, color: "var(--color-fg-muted)", marginBottom: 6 }}>
          <span>$100 → +${potentialYes} YES</span>
          <span>/ +${potentialNo} NO</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            className="btn btn-sm btn-primary"
            style={{ flex: 1, fontSize: 11 }}
            onClick={() => onBuy(market.ticker, "yes", market.yes_ask_dollars)}
          >
            YES {yesPct}¢
          </button>
          <button
            className="btn btn-sm btn-secondary"
            style={{ flex: 1, fontSize: 11 }}
            onClick={() => onBuy(market.ticker, "no", market.no_ask_dollars)}
          >
            NO {noPct}¢
          </button>
        </div>
      </div>
    </div>
  );
}
