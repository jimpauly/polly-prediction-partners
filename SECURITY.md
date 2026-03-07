# Security Policy — Paulie's Prediction Partners

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |

---

## How the app handles your data

### API Keys & Credentials

- **Never stored on disk** — Your Kalshi API key and RSA private key stay in memory while the app is running and nowhere else.
- **Never logged** — Credentials are excluded from all log output.
- **Never sent anywhere by us** — All communication goes directly between your machine and Kalshi's servers.
- **Cleared on disconnect** — When you disconnect or close the app, credentials are wiped from memory.
- **Masked in the UI** — Your API key shows as `****` with only the last 4 characters visible.

### Network

- **Local-only backend** — The Python backend listens on `127.0.0.1:8000` (localhost only). Nothing on your network can reach it.
- **Content Security Policy** — The web UI uses a strict CSP header.
- **Kalshi RSA-PSS authentication** — API calls to Kalshi are signed with your RSA private key using RSA-PSS.

### Desktop App

- **Sandbox mode** — The Electron window runs with `contextIsolation: true` and `sandbox: true`.
- **No Node.js in renderer** — The UI cannot touch system resources directly.
- **Single instance lock** — Only one copy of the app can run at a time.
- **DevTools disabled** — Blocked in production builds.

### Trading Safeguards

- **Circuit breakers** — Trading stops automatically if daily losses hit your configured cap.
- **Position limits** — Maximum order size and total exposure are enforced.
- **Rate limiting** — API calls are throttled to stay within Kalshi's limits.
- **Semi-auto mode** — You can review and approve every trade before it goes through.

---

## Found something wrong?

Two ways to reach us:

### Email

Send a message to **chickensaurusrex@outlook.com** with the subject line **Security Issue — Paulie's Prediction Partners**. Describe what you found and we'll get back to you within 48 hours.

### "Send an Idea" button in the app

Open the Inspector panel on the right side of the screen, click **"Send an Idea"**, and your email app will open with our address already filled in.

---

## What we don't collect

- No analytics or tracking
- No telemetry sent anywhere
- No advertising
- No user accounts on our end
- No data leaves your computer (except to Kalshi's API when you choose to connect)
