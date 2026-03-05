# 🛡️ Security Policy — Paulie's Prediction Partners

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅ Yes    |

We actively maintain security updates for the latest release.

---

## 🔐 How We Keep Your Data Safe

### API Keys & Credentials

- **Never stored on disk** — Your Kalshi API key and RSA private key are held in memory only while the app is running.
- **Never logged** — Credentials are excluded from all log output by design.
- **Never sent to third parties** — All communication is between your machine and Kalshi's official API servers.
- **Cleared on disconnect** — When you disconnect or close the app, credentials are wiped from memory.
- **Masked in the UI** — Your API key is displayed as `****` with only the last 4 characters visible.

### Network Security

- **Local-only backend** — The Python backend listens on `127.0.0.1:8000` (localhost). It cannot be accessed from other computers on your network.
- **Content Security Policy** — The web UI uses a strict CSP to prevent cross-site scripting attacks.
- **Kalshi RSA-PSS authentication** — All API calls to Kalshi are signed with your RSA private key using the standard RSA-PSS algorithm.

### Desktop App Security

- **Sandbox mode** — The Electron browser window runs with `contextIsolation: true` and `sandbox: true`.
- **No Node.js in renderer** — The UI cannot access system resources directly.
- **Single instance lock** — Only one copy of the app can run at a time.
- **DevTools disabled** — Developer tools are blocked in production builds.

### Trading Safety

- **Circuit breakers** — Trading automatically stops if daily losses exceed your configured cap.
- **Position limits** — Maximum order size and total exposure are enforced.
- **Rate limiting** — API calls are throttled to stay within Kalshi's rate limits.
- **Semi-auto mode** — Review and approve every trade before it executes.

---

## 🐛 How to Report a Security Problem

Found something that doesn't look right? Here are two easy ways to let us know:

### Option 1: Send Us an Email

1. Open your email app (Gmail, Outlook, Yahoo Mail, etc.)
2. Create a new message to: **chickensaurusrex@outlook.com**
3. In the subject line, write: **Security Issue — Paulie's Prediction Partners**
4. Describe what you found — what happened, what you expected, and any steps to reproduce it
5. Hit Send! 📧

### Option 2: Use the "Send an Idea" Button in the App

1. Open Paulie's Prediction Partners
2. Look at the right side of the screen — there's a panel called **Inspector**
3. Find the button that says **"Send an Idea"** and click it
4. Your email app will open with our address already filled in
5. Just type what you found and hit Send! 📧

### What Happens Next

- We'll acknowledge your report within **48 hours**
- We'll investigate and let you know if it's something we can fix
- If it's a real security issue, we'll prioritize a fix and credit you (if you'd like!)
- We'll never share your personal information

---

## 🚫 What We Don't Collect

- No analytics or tracking
- No telemetry sent to external servers
- No advertising
- No user accounts on our end
- No data leaves your computer (except to Kalshi's API when you choose to connect)
