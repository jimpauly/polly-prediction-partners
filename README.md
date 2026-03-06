# Paulie's Prediction Partners

Prediction market trading platform built on custom algorithms (web + desktop + API services).

---

## 📊 Project Completion

**Overall: `83%`**

```
[████████████████░░░░] 83%
```

| Stage                                            | Completion |
| :----------------------------------------------- | :--------- |
| 1st Stage — Design Studio                        | `100%` ✅  |
| 2nd Stage — Trading Agent Studio                 | `95%` ✅   |
| 2.5th Stage — Shippable Quality                  | `82%` 🟡   |
| Stage 3 — Profitability · Flight-Sim · Converter | `0%` ❌    |

---

### 1st Stage — Design Studio `100%` ✅

> Develop up to Design Studio.

```
[████████████████████] 100%
```

|     | Feature                                                                          | %    |
| :-- | :------------------------------------------------------------------------------- | :--- |
| ✅  | Project scaffolding — HTML, Tailwind CSS, viewport                               | 100% |
| ✅  | WebPage layout — grid, resize behavior, region spacing                           | 100% |
| ✅  | Header Bar — _Paulie's_, robot emoji, Illumination Control Panel                 | 100% |
| ✅  | Nav Bar — _Navigation_, Studio Selector, Telemetry                               | 100% |
| ✅  | Left Sidebar — _System Design_ (Mode, Theme, 3D, Visibility Toggles)             | 100% |
| ✅  | Right Sidebar — _Inspector Panel_ (To-Do List App, Send-an-Idea)                 | 100% |
| ✅  | Bottom Bar — _Hangar Bay_ (Agent Access, API Keys, Indicators)                   | 100% |
| ✅  | Action Bar — _Ignition_ (Global Throttle, P/L Graph)                             | 100% |
| ✅  | Main Region — _Viewing Port_ / Design Studio                                     | 100% |
| ✅  | Design Studio — Hero, Map Gauges, Live Logs, MS Paint 1998 Clone, Palette Viewer | 100% |
| ✅  | Themes — 10 themes × 2 modes (through Holographic)                               | 100% |
| ✅  | Illumination — 7-channel physics-based glow system                               | 100% |
| ✅  | Precision Tools — Rulers (X/Y-axis), Grid overlay                                | 100% |
| ✅  | Studio Switching — Design, Trade, Fly, Convert (no page reload)                  | 100% |
| ✅  | UI/UX Polish & Accessibility                                                     | 100% |

---

### 2nd Stage — Trading Agent Studio `95%` ✅

> Deeply develop our algorithm-driven trading agent studio built for Kalshi prediction markets.

```
[███████████████████░] 95%
```

|     | Feature                                                                                                           | %    |
| :-- | :---------------------------------------------------------------------------------------------------------------- | :--- |
| ✅  | Theme System Expansion — 14 remaining themes (Vapor → Frutiger Aero), 24 total × 2 modes                          | 100% |
| ✅  | Agent Peritia — 27 candlestick pattern detectors, per-pattern performance tracking, volume confirmation           | 100% |
| ✅  | Agent Prime — majority-signal follower                                                                            | 100% |
| ✅  | Agent Praxis — sports specialist                                                                                  | 100% |
| ✅  | Kalshi Integration — REST client (RSA-PSS signing, retry logic) + WebSocket client (reconnect, sequence tracking) | 100% |
| ✅  | State Cache — thread-safe in-memory cache with async-lock guarded mutations                                       | 100% |
| ✅  | Risk Gateway — permission gates, 7+ pre-submit checks, circuit breaker, daily loss cap                            | 100% |
| ✅  | Execution Service — Auto / Semi-Auto / Safe routing, approval workflow with 60s timeout                           | 100% |
| ✅  | Reconciliation Service — drift detection, historical boundary handling, paginated fetching                        | 100% |
| ✅  | Backend Control API — 20+ endpoints, agent controls, WebSocket event streaming                                    | 100% |
| ✅  | Persistence Layer — PostgreSQL / asyncpg, idempotent writes, environment partitioning                             | 100% |
| ✅  | Rate Limiter + Prometheus Metrics — token bucket, priority queuing, conditional mounting                          | 100% |
| ✅  | Trading Studio UI — market cards, series headers, potential returns, filters, buy/sell, balance, P/L graph        | 100% |
| ✅  | Trading Studio UI — open positions panel, trade history, agent reasoning in approval overlay                      | 100% |
| ✅  | Agent Dashboard — mode controls (A/S/⛔), win rate, P&L chart, heatmap, live stats                                | 100% |
| ✅  | Order form input validation — quantity (1–100 contracts), price sanity checks                                     | 100% |

---

### 2.5th Stage — Shippable Quality `82%` 🟡

> Windows and Mac Desktop apps with setup wizards. Individuals with minimal technical background should be able to easily install and interface with their copy in less than 5 minutes. Include a published page through GitHub for users who don't want to download an app. Open-source, free-to-use, no-ads, all features available. Close security holes. Close data leak possibilities.

```
[████████████████░░░░] 82%
```

|     | Feature                                                                                  | %    |
| :-- | :--------------------------------------------------------------------------------------- | :--- |
| ✅  | Windows `.exe` installer with setup wizard                                               | 90%  |
| ✅  | macOS `.dmg` / `.pkg` installer with setup wizard                                        | 90%  |
| ✅  | Published GitHub Page — for users who don't want to download an app                      | 100% |
| ✅  | Open-source, free-to-use, no-ads, all features available                                 | 100% |
| ✅  | Close security holes / close data leak possibilities                                     | 80%  |
| 🟡  | Hundreds of tweaks / fixes / upgrades / polishings / refinements / improvements          | 70%  |
| ✅  | Test suite — 91 backend unit tests (risk gateway, rate limiter, position sizer, schemas) | 80%  |
| ✅  | Auto-updater — GitHub Releases check at startup with download dialog                     | 100% |
| ❌  | Code signing — macOS Gatekeeper + Windows SmartScreen                                    | 0%   |
| ✅  | Capability for agents to continue trading for 24 hours — systemd service file provided   | 75%  |

---

### Stage 3 — Profitability Gate · Flight-Sim · Converter `0%` ❌

> Ask if main user has successfully gained efficient profits. If not, stay in Stage 2.5. 1st and 2nd stage must be 110% complete — shippable and exceeding industry-standard quality. _(110% = exceeds industry standard, not just shipped)_

```
[░░░░░░░░░░░░░░░░░░░░] 0%
```

|     | Feature                                                           | %   |
| :-- | :---------------------------------------------------------------- | :-- |
| ❌  | Profitability validation — agents generating efficient profits    | 0%  |
| ❌  | Develop SuperHero + Aircraft Flight Puget Sound Virtual Simulator | 0%  |
| ❌  | Develop File Converter app                                        | 0%  |

---

## Repository Layout

- `index.html`: Root landing page.
- `README.md`, `SECURITY.md`: Project information files.
- `DOCUMENTS/`: Product requirements, references, and development logs.
- `webpage/`: Main code workspace.
  - `apps/web/public/`: Web UI assets and entrypoint.
  - `apps/desktop/`: Electron desktop shell.
  - `services/api/backend/`: FastAPI backend and trading services.
  - `services/api/backend/tests/`: Backend unit test suite (91 tests).
  - `services/api/paulies-backend.service`: systemd service for 24/7 trading.

## Quick Start

```bash
git clone https://github.com/jimpauly/paulies-prediction-partners.git
cd paulies-prediction-partners/webpage
npm install
npm start
```

## Backend Only

```bash
cd webpage
npm run start:backend
```

## Web Preview Only

```bash
cd webpage
npm run start:web
```

## Run Backend Tests

```bash
cd webpage/services/api
pip install -r backend/requirements.txt
python -m pytest backend/tests/ -v
```

## 24-Hour Trading (Linux systemd)

To keep agents trading continuously even when your laptop is off, deploy the
backend to a Linux server and install the bundled systemd unit:

```bash
sudo cp webpage/services/api/paulies-backend.service /etc/systemd/system/
# Edit the file to set correct User, WorkingDirectory, and EnvironmentFile paths
sudo systemctl daemon-reload
sudo systemctl enable --now paulies-backend
journalctl -u paulies-backend -f  # follow logs
```

## Build Desktop Installers

```bash
cd webpage
npm run build:win
npm run build:mac
npm run build:linux
```

## License

MIT
