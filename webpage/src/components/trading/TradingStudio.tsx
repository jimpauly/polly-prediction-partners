import { useState } from "react";
import type { Market } from "../../types/trading";
import { MarketCard } from "./MarketCard";
import { MARKETS_PAGE_SIZE } from "../../constants";

const CATEGORIES = ["All", "Crypto", "Sports", "Politics", "Economics", "Weather", "Entertainment", "Tech", "Science"] as const;
type Category = typeof CATEGORIES[number];

interface TradingStudioProps {
  connected: boolean;
  markets: Market[];
  onBuy: (ticker: string, side: "yes" | "no", priceDollars: string) => void;
}

function categoryMatch(market: Market, cat: Category): boolean {
  if (cat === "All") return true;
  const ev = market.event_ticker.toLowerCase();
  const cat2 = cat.toLowerCase();
  if (cat2 === "crypto") return ev.includes("btc") || ev.includes("eth") || ev.includes("crypto");
  if (cat2 === "sports") return ev.includes("nfl") || ev.includes("nba") || ev.includes("mlb") || ev.includes("sport");
  if (cat2 === "politics") return ev.includes("elect") || ev.includes("gov") || ev.includes("pres") || ev.includes("polit");
  if (cat2 === "economics") return ev.includes("fed") || ev.includes("cpi") || ev.includes("gdp") || ev.includes("econ");
  if (cat2 === "weather") return ev.includes("temp") || ev.includes("weather") || ev.includes("storm");
  if (cat2 === "entertainment") return ev.includes("oscars") || ev.includes("grammy") || ev.includes("movie");
  if (cat2 === "tech") return ev.includes("ai") || ev.includes("tech") || ev.includes("aapl") || ev.includes("goog");
  if (cat2 === "science") return ev.includes("nasa") || ev.includes("space") || ev.includes("science");
  return true;
}

export function TradingStudio({ connected, markets, onBuy }: TradingStudioProps) {
  const [category, setCategory] = useState<Category>("All");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Market | null>(null);

  const filtered = markets.filter((m) => categoryMatch(m, category));
  const visible = filtered.slice(0, page * MARKETS_PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  if (!connected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 16, padding: 24 }}>
        <div style={{ fontSize: 48 }}>📊</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-fg-default)" }}>Connect to start trading</div>
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)", textAlign: "center", maxWidth: 320 }}>
          Enter your Kalshi API credentials in the Connect panel to load markets.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Category tabs */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`axis-btn ${category === cat ? "active" : ""}`}
            style={{ fontSize: 11 }}
            onClick={() => { setCategory(cat); setPage(1); }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Markets */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--color-fg-subtle)", fontSize: 13 }}>
          No markets found in this category.
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
            {visible.map((m) => (
              <div key={m.ticker} style={{ position: "relative" }}>
                <MarketCard market={m} onBuy={onBuy} />
                <button
                  className="btn btn-sm btn-ghost"
                  style={{ position: "absolute", top: 4, right: 4, fontSize: 10, padding: "2px 6px" }}
                  onClick={() => setExpanded(m)}
                  title="Expand"
                >
                  ⤢
                </button>
              </div>
            ))}
          </div>
          {hasMore && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setPage((p) => p + 1)}>
                Show More ({filtered.length - visible.length} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* Expanded overlay */}
      {expanded && (
        <div
          style={{ position: "fixed", inset: 0, background: "var(--color-bg-overlay)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setExpanded(null)}
        >
          <div
            style={{ background: "var(--color-bg-surface)", borderRadius: "var(--border-radius-lg)", padding: 24, maxWidth: 480, width: "90vw", maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{expanded.yes_sub_title}</div>
              <button className="btn btn-sm btn-ghost" onClick={() => setExpanded(null)}>✕</button>
            </div>
            <MarketCard market={expanded} onBuy={(t, s, p) => { onBuy(t, s, p); setExpanded(null); }} />
            <div style={{ marginTop: 12, fontSize: 11, color: "var(--color-fg-muted)" }}>
              <div>Ticker: {expanded.ticker}</div>
              <div>Volume 24h: {expanded.volume_24h_fp}</div>
              <div>Open Interest: {expanded.open_interest_fp}</div>
              <div>Closes: {new Date(expanded.close_time).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
