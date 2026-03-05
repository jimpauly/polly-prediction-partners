# 🚀 Paulie's Prediction Partners — Setup Guide

## Quick Start (5 Minutes)

### Option A: Use the Web App (No Download)

1. Visit **[jimpauly.github.io/paulies-prediction-partners](https://jimpauly.github.io/paulies-prediction-partners)**
2. Click **"Launch Web App"**
3. Start the backend on your computer (see below)
4. Enter your Kalshi API credentials and start trading!

### Option B: Download the Desktop App

1. Go to [Releases](https://github.com/jimpauly/paulies-prediction-partners/releases)
2. Download the installer for your system:
   - **Windows**: `.exe` installer
   - **macOS**: `.dmg` file
   - **Linux**: `.AppImage` file
3. Run the installer — the backend starts automatically
4. Enter your Kalshi API credentials and start trading!

### Option C: Run from Source

```bash
# Clone the repository
git clone https://github.com/jimpauly/paulies-prediction-partners.git
cd paulies-prediction-partners/copilot-opus

# Install Python backend dependencies
pip install -r backend/requirements.txt

# Start the backend (from the copilot-opus directory)
python -m uvicorn backend.main:main --host 127.0.0.1 --port 8000 &

# Open the frontend
# Either open index.html in your browser, or:
cd ..
python -m http.server 3000
# Then visit http://localhost:3000/copilot-opus/index.html
```

---

## Getting Your Kalshi API Keys

1. Sign up at [kalshi.com](https://kalshi.com)
2. Go to **Settings → API Keys**
3. Generate a new API key pair
4. Save your **API Key ID** and **RSA Private Key**
5. Use **Demo** mode first to test without real money!

---

## 24-Hour Background Trading

The AI agents can trade around the clock, even when your browser is closed.

### How It Works

The Python backend runs as an independent process on your computer. When you
connect via the UI and set agents to **Full-Auto** mode, the backend continues
executing trades even if:

- You close the browser tab
- You minimize the desktop app
- Your screen is off

### Keeping It Running

**Desktop App**: The backend daemon starts when you launch the app and stops
when you quit. On macOS, closing the window keeps the backend alive — quit
the app from the menu to fully stop.

**From Source**: Run the backend in a persistent terminal session:

```bash
# Using nohup (keeps running after terminal closes)
cd /path/to/paulies-prediction-partners/copilot-opus
nohup python -m uvicorn backend.main:main --host 127.0.0.1 --port 8000 &

# Using screen (recommended)
screen -S paulies
cd /path/to/paulies-prediction-partners/copilot-opus
python -m uvicorn backend.main:main --host 127.0.0.1 --port 8000
# Press Ctrl+A, then D to detach
# Reconnect later: screen -r paulies

# Using systemd (Linux, for true 24/7)
# See below for the systemd service file
```

### Systemd Service (Linux — True 24/7)

Create `/etc/systemd/system/paulies.service`:

```ini
[Unit]
Description=Paulie's Prediction Partners Trading Backend
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/paulies-prediction-partners/copilot-opus
ExecStart=/usr/bin/python3 -m uvicorn backend.main:main --host 127.0.0.1 --port 8000
Restart=always
RestartSec=10
Environment=PAULIES_ENVIRONMENT=demo

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable paulies
sudo systemctl start paulies
```

### Safety Features

Even in 24/7 mode, the backend has multiple safety layers:

- **Daily loss cap**: Trading stops automatically when losses hit the limit
- **Circuit breaker**: Halts all trading if anomalies are detected
- **Position limits**: Maximum exposure is enforced per-market and globally
- **Rate limiting**: API calls stay within Kalshi's rate limits
- **Graceful shutdown**: All positions are safely managed on SIGTERM/SIGINT

---

## Building Desktop Installers

```bash
# Install Node.js dependencies
npm install

# Build for your platform
npm run build:win    # Windows .exe
npm run build:mac    # macOS .dmg
npm run build:linux  # Linux .AppImage

# Build for all platforms
npm run build:all
```

**Requirements:**
- Node.js 18+
- Python 3.12+
- On macOS: Xcode command line tools
- On Windows: Visual Studio Build Tools

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (Browser / Electron)              │
│  HTML + CSS + Vanilla JS + Tailwind         │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Design   │ │ Trading  │ │ Analysis │   │
│  │ Studio   │ │ Studio   │ │ Studio   │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└─────────────┬───────────────────────────────┘
              │ HTTP + WebSocket (127.0.0.1:8000)
              │ (local only — never exposed to network)
┌─────────────┴───────────────────────────────┐
│  Backend (Python / FastAPI / Uvicorn)        │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  3 AI Trading Agents                │   │
│  │  ┌─────────┐ ┌────────┐ ┌────────┐ │   │
│  │  │ Prime   │ │ Praxis │ │Peritia │ │   │
│  │  │ (Volume)│ │(Sports)│ │(Candle)│ │   │
│  │  └─────────┘ └────────┘ └────────┘ │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Risk     │ │Execution │ │Reconcile │   │
│  │ Gateway  │ │ Service  │ │ Service  │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Kalshi   │ │ Kalshi   │ │ State    │   │
│  │ REST     │ │WebSocket │ │ Cache    │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────┘
```

---

## License

MIT — Free to use, modify, and distribute. No ads. No premium tiers.
