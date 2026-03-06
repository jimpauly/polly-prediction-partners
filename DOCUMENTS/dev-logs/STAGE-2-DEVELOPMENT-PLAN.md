# Stage 2 Development Plan — Paulie's Prediction Partners

> **Scope:** Deeply develop the Trading Agent Studio (Chapters 2 & 4 of PRD)
> **Stack:** Vanilla JS + Tailwind CSS frontend, Python 3.12+ asyncio backend
> **Goal:** Smart, reinforced-learning, profitable, high-frequency trading agents

---

## Phase 1: Complete Theme System (Stage 2 themes)

### 1.1 Remaining 14 Themes
- [x] `vapor` light/dark — Pastel arcade / late-night vaporwave
- [x] `paper` light/dark — The Office copier / Carbon transfer
- [x] `ledger-1920` light/dark — Wall St Ledger / Gatsby noir
- [x] `blueprint` light/dark — Drafting table / AutoCAD terminal
- [x] `chalkboard` light/dark — Greenboard / Classic blackboard
- [x] `phosphor` light/dark — P3 Amber CRT / Green phosphor terminal
- [x] `volcano` light/dark — Active caldera / Magma chamber
- [x] `oceanic` light/dark — Maritime yacht club / The abyss
- [x] `steampunk` light/dark — Victorian sci-fi / London fog
- [x] `dieselpunk` light/dark — WWI trench / Noir city
- [x] `solarpunk` light/dark — Eco-utopia / Night garden
- [x] `stonepunk` light/dark — Bedrock quarry / Cave fire
- [x] `dreamcore` light/dark — Pastel daydream / Nightmare void
- [x] `frutiger-aero` light/dark — Windows Vista / Midnight aurora

### 1.2 Theme Button Integration
- [x] All 24 theme buttons in sidebar
- [x] Button previews react to light/dark mode
- [x] Theme switching verified across all 48 palettes

---

## Phase 2: Agent Peritia — Full Candlestick Pattern Library

### 2.1 Complete Pattern Detection (27 total patterns)
- [x] Hammer, Inverted Hammer, Shooting Star, Hanging Man
- [x] Engulfing (bullish/bearish)
- [x] Morning Star, Evening Star
- [x] Doji, Marubozu
- [x] Three White Soldiers, Three Black Crows
- [x] Piercing Line, Dark Cloud Cover
- [x] Harami (bullish/bearish)
- [x] Abandoned Baby (bullish/bearish)
- [x] Dragonfly Doji, Gravestone Doji, Long-Legged Doji
- [x] Harami Cross (bullish/bearish)
- [x] Evening Doji Star, Morning Doji Star
- [x] Spinning Top
- [x] Rising Three Methods, Falling Three Methods
- [x] Stick Sandwich
- [x] Upside Tasuki Gap, Downside Tasuki Gap

### 2.2 Pattern Performance Tracking
- [x] Per-pattern win/loss tracking
- [x] Auto-disable patterns below 45% accuracy after 50 trades
- [x] Decision logging for training data

---

## Phase 3: Backend — Kalshi Integration (In Progress)

### 3.1 REST Client
- [x] Full Kalshi REST API wrapper (markets, portfolio, orders, exchange)
- [x] RSA-PSS request signing
- [x] Retry logic (429/5xx with exponential backoff)

### 3.2 WebSocket Client
- [x] Persistent connection with auto-reconnect
- [x] All primary channels (ticker, orderbook, trade, lifecycle, fill, orders, positions)
- [x] Sequence tracking and stale detection

### 3.3 State Cache
- [x] Thread-safe in-memory cache
- [x] Async-lock guarded mutations
- [x] Snapshot export for UI

### 3.4 Risk Gateway
- [x] Permission gates (global, environment, agent, kill switch)
- [x] Pre-submit risk checks (7+ checks)
- [x] Circuit breaker with rolling window
- [x] Daily P&L tracking with auto-reset

### 3.5 Execution Service
- [x] Route by agent mode (auto/semi-auto/safe)
- [x] Semi-auto approval workflow with timeout
- [x] Fill handling and PnL computation

### 3.6 Reconciliation Service
- [x] Drift detection and repair
- [x] Historical boundary handling
- [x] Paginated data fetching

### 3.7 Control API
- [x] State endpoints for UI
- [x] Agent controls (mode, start, stop)
- [x] Trading controls (enable, disable)
- [x] WebSocket event streaming

### 3.8 Remaining Backend Work
- [x] Database persistence (PostgreSQL/asyncpg)
- [x] Rate limit budget enforcement (token bucket)
- [x] Prometheus metrics integration
- [x] Graceful shutdown with signal handlers
- [x] Startup reconciliation trigger
- [x] Dynamic position sizing (beyond fixed 1.00 count)

---

## Phase 4: Trading Studio UI (Future)

- [x] Closer match to Kalshi card layout (per reference photos)
- [x] Series section headers (e.g., "BTC", "Sports")
- [x] Potential returns display ($100 → $135)
- [x] Market icon/badges per series
- [x] More filter options matching Kalshi (Closing soon, Open markets, frequency)
- [x] Live/Demo mode indicator glow enhancements

---

## Phase 5: Shippable Quality (Stage 2.5)

- [x] Electron desktop app wrapper
- [x] Setup wizard (first-run experience, 4-step flow)
- [x] Windows .exe and macOS .dmg installers (config complete)
- [x] Auto-updater integration (GitHub Releases check at startup)
- [x] Security audit and hardening (CSP, localhost binding, sandbox mode)
- [ ] Performance profiling and optimization
