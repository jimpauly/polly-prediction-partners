# 🔒 Privacy Policy — Paulie's Prediction Partners

**Effective Date:** 2024-01-01
**Last Updated:** 2024-01-01

This Privacy Policy explains what information Paulie's Prediction Partners ("the App") collects, how it is used, and your rights under applicable privacy laws including the **General Data Protection Regulation (GDPR)**, the **California Consumer Privacy Act (CCPA)**, and other applicable regulations.

---

## 1. Who We Are

Paulie's Prediction Partners is a free and open-source AI-assisted prediction market trading platform. The App is provided at no cost and is licensed under the [MIT License](./LICENSE).

**Contact:** chickensaurusrex@outlook.com

---

## 2. The Short Version

**We collect nothing. Your data stays on your computer.**

- No analytics or usage tracking
- No telemetry sent to external servers
- No advertising networks
- No user accounts on our servers
- No cookies (the App runs locally, not on a web server you visit)
- The only external network traffic occurs when _you_ choose to connect to Kalshi's API

---

## 3. What Information We Process

### 3.1 Information We Do NOT Collect

We do not collect, store, process, or transmit:

| Category             | Examples                                      | Collected? |
| -------------------- | --------------------------------------------- | ---------- |
| Personal identifiers | Name, email, phone number, IP address         | ❌ No      |
| Financial data       | Bank account, credit card, payment info       | ❌ No      |
| Usage analytics      | Page views, clicks, session duration, crashes | ❌ No      |
| Device information   | Hardware specs, OS version, device IDs        | ❌ No      |
| Location data        | GPS, city, country                            | ❌ No      |
| Behavioral data      | How you use the App, patterns, preferences    | ❌ No      |

### 3.2 Information That Stays on Your Computer

The following is stored **only on your local machine** and is never transmitted to us:

| Data                              | Storage Location                            | Purpose                          |
| --------------------------------- | ------------------------------------------- | -------------------------------- |
| App theme and display preferences | Local browser/Electron storage              | Remember your settings           |
| Illumination control settings     | Local browser/Electron storage              | Remember your panel settings     |
| Setup wizard completion state     | `userData/wizard-state.json` on your device | Skip re-running first-time setup |
| To-Do list items                  | Local browser storage                       | Your personal task list          |

You can delete this data at any time by clearing your app data or uninstalling the application.

### 3.3 Your Kalshi Credentials (API Key & RSA Private Key)

Your Kalshi API key and RSA private key are:

- **Held in memory only** while the App is running — never written to disk
- **Never transmitted** to us or any third party
- **Cleared from memory** when you disconnect or close the App
- **Masked in the UI** — displayed as `****` with only the last 4 characters visible

When you connect to Kalshi, your credentials travel **directly from your computer to Kalshi's official API servers** (api.kalshi.com). We have no involvement in or visibility into that connection.

---

## 4. Third-Party Services

### 4.1 Kalshi

When you connect to the Kalshi prediction market platform, you are subject to **Kalshi's own Privacy Policy and Terms of Service**:

- Kalshi Privacy Policy: https://kalshi.com/privacy-policy
- Kalshi Terms of Service: https://kalshi.com/terms-of-service

All trading activity, market data, and account information is governed by Kalshi's policies, not ours.

### 4.2 GitHub

This software is hosted on GitHub. When you visit the GitHub repository or download the App, GitHub may collect data according to the **GitHub Privacy Statement**: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement

We have no control over GitHub's data collection.

### 4.3 No Other Third Parties

We do not integrate with, or send your data to, any other third-party services — including but not limited to:

- Advertising networks
- Analytics platforms (Google Analytics, Mixpanel, Segment, etc.)
- Social media platforms
- Cloud storage providers
- Crash reporting services

---

## 5. Legal Basis for Processing (GDPR)

Since we do not collect any personal data about you, there is no personal data processing that requires a legal basis under GDPR Article 6.

The only scenario where GDPR might apply is if you **contact us by email** to report a security issue. In that case:

- **Legal basis:** Legitimate interest (responding to your security report)
- **Data processed:** Your email address and the content of your message
- **Retention:** We will delete your email once the security issue is resolved, or upon your request
- **No sharing:** We will not share your email with any third party

---

## 6. Your Rights (GDPR & CCPA)

Even though we collect no personal data, you have rights that we respect:

### GDPR Rights (EU/EEA/UK residents)

| Right                        | What it means                             | How to exercise                       |
| ---------------------------- | ----------------------------------------- | ------------------------------------- |
| Right of Access              | Know what personal data we hold about you | Email us — we hold none               |
| Right to Erasure             | Have your data deleted                    | Email us — there is nothing to delete |
| Right to Rectification       | Correct inaccurate data                   | Email us — we hold no data            |
| Right to Data Portability    | Receive your data in a portable format    | Email us — we hold none               |
| Right to Object              | Object to processing                      | Email us — we do no processing        |
| Right to Restrict Processing | Limit how your data is used               | Email us — no processing occurs       |

### CCPA Rights (California residents)

| Right                       | Status                                     |
| --------------------------- | ------------------------------------------ |
| Right to Know               | We collect no personal information         |
| Right to Delete             | Nothing to delete                          |
| Right to Opt-Out of Sale    | We never sell personal information         |
| Right to Non-Discrimination | We provide no tiered service based on data |

**To exercise any of these rights:** Email chickensaurusrex@outlook.com

---

## 7. Children's Privacy

The App is not directed at children under the age of 13 (or 16 in the EU/EEA). We do not knowingly collect any personal information from children. Since we collect no personal data at all, this is automatically satisfied.

The App involves financial trading activity and is intended for adult users who understand the risks of prediction market trading.

---

## 8. Data Security

Since we collect no personal data, there is no personal data to secure on our end. For information about how the App secures your local data and Kalshi credentials, see [SECURITY.md](./SECURITY.md).

---

## 9. Financial & Trading Disclaimer

Paulie's Prediction Partners is a **tool to assist with prediction market trading on Kalshi**. It is not financial advice.

- **Trading involves risk.** You may lose money.
- **Past performance is not indicative of future results.**
- **The App's trading agents are experimental.** They are provided as-is, with no guarantee of profitability.
- **You are solely responsible** for all trading decisions made using this App.
- **Consult a qualified financial advisor** before making significant financial decisions.

---

## 10. Open Source

This App is free and open-source software licensed under the [MIT License](./LICENSE). You can:

- View the source code: https://github.com/jimpauly/paulies-prediction-partners
- Inspect exactly what data the App accesses and transmits
- Fork and modify the code for your own use

Because the code is open source, anyone can independently verify our privacy claims by reading the source code.

---

## 11. Converter Studio — Legal Notice

The Converter Studio feature is designed to convert **files you own** between formats (e.g., audio, video, document formats).

**Important legal notice regarding content conversion:**

- **Only convert content you own or have explicit permission to convert.**
- Converting copyrighted material (e.g., ripping audio from commercially licensed videos, converting streaming content) may violate copyright law, the Digital Millennium Copyright Act (DMCA), or the terms of service of the content platform.
- The App does not endorse or facilitate copyright infringement.
- You are solely responsible for ensuring you have the legal right to convert any content you process with this App.

---

## 12. Changes to This Policy

If we update this Privacy Policy, we will:

- Update the "Last Updated" date at the top of this document
- Commit the change to the public GitHub repository so anyone can review it

Since we collect no personal data, changes to this policy are unlikely to affect your rights in any meaningful way.

---

## 13. Contact Us

For any questions about this Privacy Policy, your rights, or a security issue:

**Email:** chickensaurusrex@outlook.com
**Subject line:** Privacy — Paulie's Prediction Partners

We will respond within 48 hours.

---

_This privacy policy was written to be human-readable. If you have questions about any section, please reach out._
