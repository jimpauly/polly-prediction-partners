# Paulie's Prediction Partners

## Component Tree + Polish Register

_Updated: 03-11-26 · Incorporates Octo-Issue feedback_

*This document describes the target state of every UI component as if the site were fully built; it is a requirements outline rather than a set of tasks.*

---

## PART I — ELEMENT TREE

> Region → Card → Component → Element

---

## R01 · HEADER BAR

```
HEADER BAR
├── Brand Logo / Studio Title  [left, fills first 1/3]
│   ├── "Paulie's Studios"  [default / design studio]
│   ├── "Paulie's Prediction Partners 🤖"  [trade studio; robot emoji appended]
│   ├── "Paulie's Flight Simulator"  [flight studio]
│   └── "Paulie's File Converting Studio"  [convert studio]
└── Illumination Switchboard [right-aligned, fully inside region with top and bottom spacings — header wraps around it]
    ├── Top strip  [thin blank header strip, edge just for architecture]
    ├── Illumination Groups  [horizontal layout]
    │   ├── DAY/NVG group
    │   │   ├── Element: Flip switch (two‑state)
    │   │   │   ├── Default state: DAY (light)
    │   │   │   ├── Behavior: toggles theme mode; synchronized with Left Sidebar Light/Dark toggle
    │   │   │   └── Accessibility: `aria-label="Day/Night toggle"`
    │   ├── MASTER group
    │   │   ├── Element: Master control cluster
    │   │   │   ├── Flip switch (master)
    │   │   │   ├── Indicator LED (beneath switch)
    │   │   │   ├── Dimmer dial (numeric range 2‑10)
    │   │   │   └── Nixie readout (2‑digit display beneath dial)
    │   │   │       ├── Default states: Switch OFF; Dimmer Max at 10 readout=10
    │   │   │       ├── Behavior: when OFF, other channels are visually subdued; when ON, enables per-channel intensities scaled by masterScale=1
    │   │   │       ├── Visual: master indicator ring (bronze) + status LED (off=dim bronze, on=#00D4FF glow)
    │   │   │       └── Accessibility: `aria-label="Master illumination control"`, keyboard focus ring visible
    │   ├── TEXT group (Primary & Secondary)
    │   │   ├── Role definitions:
    │   │   │   ├── Primary text = headers, large scripts, any text at the top of a hierarchy
    │   │   │   └── Secondary text = all other body text below primary level
    │   │   ├── Components per channel: Flip switch (on/off), Dimmer dial (2.5–10), Nixie readout
    │   │   ├── Default: Primary = ON (dimmer=10), Secondary = ON (dimmer=10)
    │   │   ├── Visual:
    │   │   │   ├── small channel LED (bronze when off; #00D4FF glow when on + master on)
    │   │   │   ├── text opacity should increase slightly when channel ON (≈90% vs 70% off)
    │   │   │   └── glow: outward radial spread grows with dimmer value; e.g. radius = dimmer*2px, intensity ∝ dimmer/10
    │   │   └── Notes: labels read vertically left of their channel (bottom→top) to save vertical space
    │   ├── BARS group (Primary & Secondary)
    │   │   ├── Element: Accent bar channel (two per region)
    │   │   │   ├── Flip switch
    │   │   │   ├── Dimmer dial
    │   │   │   └── Nixie readout
    │   │   │       ├── Default: Primary=ON(10), Secondary=ON(10)
    │   │   │       └── Behavior: accent bar light; dimmer linearly scales intensity and bloom radius
    │   ├── FLOOD group
    │   │   ├── Element: Flood channel
    │   │   │   ├── Flip switch
    │   │   │   ├── Dimmer dial
    │   │   │   └── Nixie readout
    │   │   │       ├── Default: ON(10)
    │   │   │       └── Behavior: wide soft illumination; radius increases with dimmer
    │   ├── DISPLAY group
    │   │   ├── Element: Display backlight channel
    │   │   │   ├── Flip switch
    │   │   │   ├── Dimmer dial
    │   │   │   └── Nixie readout
    │   │   │       ├── Default: ON(10)
    │   │   │       └── Behavior: powers small screen/card backlights, not standard text/buttons
    │   └── "ILLUMINATION" sticker label  [vertical text, reads bottom→top on left edge of panel card]
    ├── Channel/common rules
    │   ├── Dimmer range: 2 (min) → 10 (max). Values displayed in nixie readout as whole number or single decimal (e.g., 2, 3, 4 ... 10)
    │   ├── Step: 1 increments (UI knob snaps to 1)
    │   ├── No percentage unit displayed (numeric only)
    │   ├── Flip‑switch housing height matches dimmer dial + intensity sub‑label height
    │   ├── All colors pull from CSS theme tokens (no hardcoded hexes) — e.g., `--pp-illum-bg`, `--pp-illum-accent`, `--pp-glow-teal`
    │   └── Animation: dimmer transitions tween over 100ms ease‑out; switch toggles animate 60ms with a tiny end-bounce
    ├── Node & physics notes
    │   └── Illumination engine exposure: channels emit values (intensity, color, radius).
    ├── Theming & accessibility
    │   ├── All interactive controls must have keyboard access, visible focus ring, and `aria-*` labels
    │   ├── Contrast ratios for ON states must meet WCAG AA for text over illuminated surfaces
    ├── Diagnostics & dev features
    │   ├── Hidden dev overlay shows raw channel values (intensity, masterScale) when `--debug-illum` CSS var is set
    ├── Default summary (quick reference)
    │   ├── Master: OFF, readout=10
    │   ├── DAY/NVG: DAY
    │   ├── Text.Primary: ON (10)
    │   ├── Text.Secondary: ON (10)
    │   ├── Bars.Primary: ON (10)
    │   ├── Bars.Secondary: ON (10)
    │   ├── Flood: ON (10)
    │   └── Display: ON (10)
    ├── Glow layering: Primary and Secondary bars
    │   ├── Concept: Regions provide the *primary bar glow* (broad, larger radius,), while *cards* provide the *secondary bar glow* (localized, tighter radius).
    │   ├── Primary bar glow (all regions)
    │   │   ├── Scope: entire region border and outer spread (e.g., Header Bar)
    │   │   ├── Radius: large (soft falloff), affects region edges, outer ring, and major accents
    │   │   └── Visual: Outer borders glow and spread outer-directional gradient
    │   ├── Secondary bar glow (card)
    │   │   ├── Scope: Card border and outer spread stopping at region edge.
    │   │   ├── Radius: affects card borders and outer highlights
    │   │   └── Visual: sharper rim light and thin edge glow used for affordance
    │   ├── Interaction rules
    │   │   ├── When Master = OFF: no glow or illumination effects.
    │   │   ├── When Master = ON: glows apply per intensity formulas; toggling individual channels updates respective intensities immediately
    │   └── Implementation notes
    │       ├── Use GPU friendly gradients and avoid full‑screen postprocessing bloom; prefer local glows composited with CSS/SVG layers
    │  # Notes: `masterScale` (0 or 1) multiplies all channel intensities at render time.
    └── Bottom nameplate  "ILLUMINATION SWITCHBOARD"
```

### Accessibility notes — Header Bar

- All interactive controls (switches, dials, tabs) must expose `aria-*` labels and be reachable by keyboard.
- Focus ring visible on each control; colors chosen to meet WCAG contrast.
- Decorative text (HUD label) marked `aria-hidden` or `role="presentation"`.
- Locked states (Fly tab) must have tooltips and `aria-disabled="true"`.

---

## R02 · NAV BAR

```
NAV BAR
├── HUD label  [left]
│   ├── Element: text "HUD" (uppercase)
├── Studio Tabs  [left cluster]
│   ├── Element: tab group container
│   │   ├── DESIGN tab  [default active]
│   │   │   ├── Label: "DESIGN"
│   │   │   ├── Icon: Palette SVG
│   │   │   ├── Active indicator: blue underline bar, centered under label, full tab width
│   │   │   ├── Behavior: click switches main region to Design studio (Default Studio)
│   │   │   └── Accessibility: `role="tab" aria-selected="true" tabindex="0"`
│   │   ├── TRADE tab
│   │   │   ├── Label: "TRADE"
│   │   │   ├── Active indicator: appears when selected
│   │   │   ├── Behavior: click navigates to trading studio
│   │   │   └── Accessibility: `role="tab" aria-selected="false" tabindex="-1"`
│   │   ├── FLY tab  [locked]
│   │   │   ├── Label: "FLY" with padlock icon overlay
│   │   │   ├── Disabled state: low opacity, pointer-events:none
│   │   │   └── Tooltip: "Unlock after $2k profit"
│   │   └── CONVERT tab
│   │       ├── Label: "CONVERT"
│   │       ├── Behavior: click opens converter studio
│   │       └── Accessibility: `role="tab" aria-selected="false" tabindex="-1"`
├── Panel Visibility Toggles  [after tabs, before telemetry, insipred by vscode's panel toggle's]
│   ├── Header Bar toggle
│   ├── Left Sidebar toggle
│   ├── Right Sidebar toggle
│   └── Bottom Bar toggle
└── Telemetry Strip  [right]
    ├── Market Mode Indicator  [FIRST — live / demo / offline, multi-cold-colored led indicator]
    ├── PING sparkline + value
    │   ├── Visualization: `<canvas>` with slow smooth bezier curves (no jagged lines)
    │   ├── Y axis: fixed 0ms (top) to 300ms (bottom), inverted (low at top)
    │   ├── X axis: ~15s history, 1s sampling interval
    │   ├── Styling: no labels, equal width to ping script, only the word "PING" then the chart
    ├── SVC health dot
    ├── Mach 4.20  [static/decorative]
    └── DATE/TIME  [live, M/D HH:MM] No seconds
```

### Accessibility notes — Nav Bar

- HUD label is decorative; add `aria-hidden="true"` or `role="presentation"`.
- Tab group uses `role="tablist"` and each tab `role="tab"` with proper `aria-selected` and `tabindex` management.
- Visibility toggle buttons labelled clearly (e.g., `aria-label="Toggle header bar"`).
- Telemetry elements are read-only; mark `aria-hidden` where appropriate.
- Keyboard navigation: Left/Right arrows cycle through tabs; Enter activates.

---

## R03 · LEFT SIDEBAR

```
LEFT SIDEBAR
└── System Design
    ├── Region title  "SYSTEM DESIGN"  [top, centered, bold, wide kerning]
    ├── MODES card  [single card container]
    │   ├── Element: Light/Dark toggle sigle button
    │   │   ├── State: toggles between light/dark mode
    │   │   ├── Label: shows 🌙 Dark and represents the dark theme in light mode, ☀️ Light and represents the light theme in dark mode
    │   │   ├── Behavior: mirrors DAY/NVG switch in illumination panel
    │   │   └── Accessibility: `aria-label="Toggle light/dark mode"`;
    │   └── Element: 3D/2D toggle single button
    │       ├── State: toggles architectural elevation effects
    │       ├── Visual: adds/removes depth shadows and bezels
    │       └── Accessibility: `aria-label="Toggle 3D view"`
    └── SYSTEM THEME card
        ├── Container: theme-button grid (2 columns grid)
        ├── Element: Theme button [×24]
        │   ├── Visual: Looks like a little representation of the theme through it's color and typography
        │   ├── Structure: soft border colored accent
        │   ├── Behavior: click applies that theme (light or dark variant determined by mode) uses backgrounds, text, and border colors of the theme.
        │   ├── Size/spacing: equal width, responsive to widest label.
        │   ├── Styling: font 12px, padding 4px, weight 700, centered
        │   └── Accessibility: `aria-label="Select theme [theme name]"`, keyboard focus ring
```

### Accessibility notes — Left Sidebar

- Ensure Light/Dark and 3D/2D toggles are focusable and announce their state (`aria-pressed`).
- Theme buttons include `aria-pressed` or `role="radio"` in a group to indicate selection.
- Sidebar container labelled `aria-label="System Design"` and given a `role="complementary"` landmark.
- Provide visible focus styles for all buttons; include tooltip or `aria-describedby` text for 3D/2D toggle.

## R04 · RIGHT SIDEBAR — INSPECTOR PANEL

```
RIGHT SIDEBAR
├── Region title  "INSPECTOR PANEL"  [top, centered, bold, wide kerning]
├── Tab behavior
│   ├── Only one tab active at a time; switching hides old panel and reveals new panel without page reload.
│   ├── Keyboard nav: arrow left/right cycles tabs, Enter activates.
│   ├── Locked tabs (e.g. Fly) are non-interactive and show tooltip on hover.
├── Tabs  [monochromatic icons, centered above notepad]
│   ├── Element: Notes tab  [default active]
│   │   ├── Label: notebook icon
│   │   ├── Behavior: shows NOTES panel when selected
│   │   └── Accessibility: `role="tab" aria-selected="true" tabindex="0"`
│   │   └── NOTES panel
│   │       ├── Note Editor
│   │       │   ├── Pagination dots  [top — fix clipping]
│   │       │   ├── File upload button  [opens dialog]
│   │       │   ├── Notepad area  [yellow, red margin, ruled lines with left/right margins]
│   │       │   ├── Formatting toolbar  [B · H1 · bullet · box — centered]
│   │       │   ├── Page controls  [Save · ◄ · Page X of Y · ► · delete]
│   │       │   └── Behavior: freeform note-taking with one-click-save-as-markdown-file, cannot load external files
│   ├── Element: Positions tab  [+ count badge]
│   │   ├── Label: Chart icon
│   │   ├── Badge: dynamic count of open positions
│   │   ├── Behavior: shows POSITIONS panel and expanded P/L Chart when selected
│   │   └── Accessibility: `role="tab" aria-selected="false" tabindex="-1"`
│   │   └── POSITIONS panel  [hidden by default]
│   │       ├── Positions list  [or empty state: "no positions"]
│   │       └── P/L Chart  [or empty state: "no positions"]
│   └── Element: History tab
│       ├── Label: clock/history icon
│       ├── Behavior: shows HISTORY panel when selected, a log screen for all orders and reasonings; live and accurate, in natural language
│       └── Accessibility: `role="tab" aria-selected="false" tabindex="-1"`
│       └── HISTORY panel  [hidden by default]
│           └── History list  [or empty state: "no history"]
└── Send card  [pinned to bottom]
    ├── Textarea  ["ideas and requests"]
    │   ├── Placeholder text: "ideas and requests"
    │   └── Behavior: user input retained until send
    └── "Send to Paulie" button
        ├── Behavior: mailto export to chickensaurusrex@outlook.com
        └── Accessibility: `aria-label="Send feedback"`
```

### Accessibility notes — Right Sidebar

- Tablist must use `role="tablist"` with proper `role="tab"` children and `aria-selected` updates.
- Pagination dots and file-upload button require `aria-label` and keyboard focus.
- Inactive panels (Positions, History) should carry `aria-hidden="true"`; active panel set `aria-live="polite"`.
- Textarea labeled `aria-label="Feedback"`; send button has `aria-label="Submit feedback"`.

---

## R05 · BOTTOM BAR — HANGAR BAY

```
BOTTOM BAR  "HANGAR BAY"
├── Region title
└── Cards row  [all cards visible simultaneously; no scrolling]
    ├── AGENT ACCESS card
    │   ├── Header strip  [top cockpit edge]
    │   ├── Card header  "Agent Access"  +  A / S / ⛔ legend
    │   ├── Agent grid  [7 cards — one per module]
    │   │   ├── Agent card 1 — 🔮 Peritia
    │   │   │   ├── Header: emoji + name centered at top
    │   │   │   ├── Telegraph switch component  [three vertical panels]
    │   │   │   │   ├── Panel 1: AUTO (top) with centered LED indicator
    │   │   │   │   ├── Panel 2: STANDBY (middle) with centered LED indicator
    │   │   │   │   └── Panel 3: OFF (bottom) with centered LED indicator
    │   │   │   ├── Behavior: selecting a panel lights its LED and sets agent state
    │   │   ├── Agent card 2 — ⚙️ Volume  [same header & telegraph structure]
    │   │   ├── Agent card 3 — 🚀 Crypto  [same header & telegraph structure]
    │   │   ├── Agent card 4 — 📈 Financials (and works in the Economics category too but don't say that)  [same header & telegraph structure]
    │   │   ├── Agent card 5 — �️ Politics  [same header & telegraph structure]
    │   │   ├── Agent card 6 — 🧠 B.Y.O.B  [same header & telegraph structure]
    │   │   └── Agent card 7 — 🛰️ 007-Gemini (This is the gemini model hooked up thru API keys)  [same header & telegraph structure]
    │   │   └── Behavior: panel press changes state; LED reflects current mode; hover reveals win/PNL details
    │   └── Bottom nameplate  "AGENT ACCESS BAY"
    │
    ├── P/L MFD card
    │   ├── Card header  "P/L MFD"
    │   ├── Y-axis buttons  [$10 · $100 · $1k · $10k · ALL]  [full width; `aria-label="Select P/L scale"`]
    │   ├── P/L line chart  [per-agent colored lines, no heat chart, no '+/- $' label; auto-updates]
    │   └── X-axis buttons  [24h · 1w · 1m · 1y · ALL]  [full width; `aria-label="Select timeframe"`]
    │   └── Behavior: controls redraw chart smoothly with new bounds
    │
    ├── CONNECT API KEYS card
    │   ├── Card header  "Connect API Keys"
    │   ├── Mode selector  [Live · Demo — auto-select Demo; `aria-label="Select connection mode"`]
    │   ├── API Key input  [masked, center-top placeholder; unified border-radius; `aria-label="API key input"`]
    │   ├── RSA key textarea  [masked, center-top placeholder; unified border-radius; `aria-label="RSA key input"`]
    │   └── "Connect Kalshi Stream" button  [script centered, right margin increased; `aria-label="Connect Kalshi Stream"`]
    │   └── Behavior: validates keys, toggles connection state, shows success/error toast
    │
    └── MARKET MODE card  [→ REMOVED — content moved to Nav Bar telemetry strip]
```

### Accessibility notes — Bottom Bar

- Container uses `role="region"` with `aria-label="Hangar Bay"`.
- Agent cards: switches have descriptive `aria-label`; indicator lights are decorative (`aria-hidden`).
- Hover details should be reachable via keyboard focus and `aria-describedby` or `aria-expanded` state.
- Chart axis buttons are focusable with `aria-pressed` states and proper labels.
- API Key inputs labeled with `aria-label`; Connect button labeled and supports `aria-disabled` when inactive.
- Scrollable card row supports `role="group"` and keyboard left/right navigation.

---

---

## R06 · ACTION BAR — IGNITION

```
ACTION BAR "IGNITION" — compact status & control rail
└── Ignition panel (role="region" aria-label="Ignition")
    ├── Header: "IGNITION" + mode display + status dot (aria-live="polite")
    ├── Global throttle (engine-order-telegraph) — three-position control
    │   ├── Positions: AUTO, SEMI-AUTO, STOP (STOP default)
    │   ├── Visual: tactile carousel with raised bezels and focusable slices
    │   ├── Interaction: keyboard (Left/Right to change, Space/Enter to select)
    │   └── State: emits `global-throttle-change` event with payload {mode}
    ├── Safety interlocks
    │   ├── Lock toggle: prevents mode change when engaged (aria-pressed)
    │   └── Confirmation flow for AUTO → full engagement (toast + aria-live)
    ├── Status readouts
    │   ├── Engine status (text + icon)
    │   ├── Last-action timestamp
    │   └── Connectivity indicator (decorative: aria-hidden)
    ├── Theming tokens
    │   ├── --ignition-bg, --ignition-accent, --ignition-focus
    │   └── Elevation/3D toggles adapt via `data-3d="true"`
    └── Accessibility
        ├── Panel uses `role="region"` + `aria-label="Ignition"`
        ├── Control slices: `role="radiogroup"` / `role="radio"` with `aria-checked`
        ├── Focusable elements have visible focus ring and >=4.5:1 contrast
        └── All actions announced via `aria-live="polite"` when state changes
```

---

## R07 · MAIN REGION

```
MAIN REGION
├── Region label  "PERISCOPE VIEWING PORT"  [design studio only]
│
├── ── DESIGN STUDIO ──
│   ├── Top bento grid
│   │   ├── ACTIVE PALETTE card  [left col — irregular paint‑palette shape]
│   │   │   ├── Theme name badge  [top right]
│   │   │   ├── Swatch blobs  [~14 tiny splotch‑shaped swatches, irregular shapes like paint drops; hex values hidden]
│   │   │   │   ├── Behavior: click → copies hex silently → brief toast
│   │   │   │   └── Notes: swatches resize to remain pocket‑sized, card outline resembles an artist’s palette
│   │   │   └── (updated per polish: card and swatches take on irregular, non‑rectangular shapes)
│   │   └── Right column stack
│   │       ├── MAN-O'-METERS card
│   │       │   └── 4‑leaf clover gauge cluster  [art deco plumbing behind]
│   │       │       ├── BATT  [center/top — main meter; label integrated into meter body]
│   │       │       ├── NET   [arching under, unique design]
│   │       │       ├── MEM   [arching under, unique design]
│   │       │       └── CPU   [arching under, unique design]
│   │       │           ├── Values display inside each meter face (no external labels)
│   │       │           └── Layout: meters packed tightly like a four‑leaf clover with decorative piping
│   │       └── Bottom row
│   │           ├── SYSTEM LOGS card  [old curved CRT monitor aesthetic]
│   │           │   ├── Log terminal  [7 entries, padding-left fix, timestamp + icon + text]
│   │           │   ├── Notes: increased inner padding; card wraps the log window; monitor shape revised to square with rounded edges
│   │           │   └── Behavior: displays backend and API messages in real time
│   │           └── WEB ELEMENTS card
│   │               ├── Buttons  [primary · secondary · danger · ghost · disabled]
│   │               │   └── Notes: ensure contrast, spacing, and hover states match style token guidelines
│   │               ├── Form inputs  [text input · select · checkbox · radio]
│   │               │   └── Notes: placeholder and corner radius consistent across controls
│   │               └── Alerts  [success]
│   │                   └── Notes: color contrast meets accessibility standards
│   └── MS PAINT 1998 card  [full width below bento]
│       ├── Maximize toggle  [fills entire main region]
│       ├── Menu bar
│       ├── Tool palette
│       ├── Color palette
│       └── Canvas
│
├── ── TRADING STUDIO ──
│   ├── ACCOUNT SUMMARY BAR  [top strip, sticky]
│   │   ├── Balance widget  [cash amount, icon; updates live]
│   │   ├── Portfolio value widget  [total holdings]
│   │   └── Daily P/L widget  [delta amount with color coding]
│   │       └── Tooltip on hover shows breakdown by agent
│   ├── TOP‑LEVEL NAV (sometimes labelled "Trending/New/All")  [horizontal scroll of pill buttons]
│   │   ├── Mirrors Kalshi’s primary header links (Crypto, Sports, Finance, Politics, etc.) — Kalshi does not use the word “markets”, so we avoid it here too.
│   │   ├── Each pill acts as a section selector; selecting changes the dataset shown below.
│   │   ├── Keyboard left/right to change selection; selected pill has `aria-selected="true"` and focus highlight.
│   │   └── Icons may accompany text for visual clarity; pills wrap/responsive on narrow viewports.
│   ├── SECONDARY NAV / TAGS  [row beneath top‑level nav]
│   │   ├── Provides finer segmentation within the chosen section (Crypto → BTC, ETH, SOL)
│   │   ├── Scrollable if overflow; behaves like the top‑level nav for keyboard and focus.
│   │   └── Includes an “All” or “Show all” pill to clear the secondary filter.
│   ├── FILTER CONTROLS  [row of selectors and search tools]
│   │   ├── Volume dropdown  [Any/High→Low/Low→High]
│   │   ├── Frequency dropdown  [choices such as Hourly, Daily, Weekly, Monthly]
│   │   ├── Time‑to‑expiration slider  [range input with min/max labels; allows trimming soon‑closing items]
│   │   ├── Keyword search field  [placeholder "Search..." allows free‑text matching across titles]
│   │   ├── Sort toggle  [cycles through preset orderings; icon reflects current direction]
│   │   └── Advanced filter panel  [expandable/collapsible; contains additional knobs like price range, tags]
│   ├── MARKET GRID  [primary content area]
│   │   ├── Layout: responsive card columns; each market card is a semantic `<article>` with `role="region"` and `aria-labelledby` pointing to its title
│   │   ├── Market card components:
│   │   │   ├── Icon representing underlying asset
│   │   │   ├── Title text  [e.g. "BTC Up or Down - 15 minutes"]
│   │   │   ├── Odds display  [percentage or price; screen reader label "Chance" preceding value]
│   │   │   ├── Yes/No buttons  [actionable, large tap targets]
│   │   │   ├── Price info  [shows min $100 → projected payout; small text]
│   │   │   ├── Time remaining countdown  [`aria-live="polite"` updating] with expand/controls
│   │   │   └── Expansion icon for details  [opens modal or inline details with full order book]
│   │   ├── Grid updates live via WebSocket; entire grid region marked `aria-live="polite"`
│   │   └── Empty state  [displayed when no markets match filters; text "no markets"]
│   └── FOOTER  [optional pagination or load-more button]
│
├── ── FLY STUDIO ──  [locked until $2k profit]
│   ├── Lock screen  [progress bar toward $2k; `aria-live="polite"` updates, `aria-valuenow`/min/max]
│   └── Cockpit  [post-unlock — ISS feeds, flight sim; embedded video with captions and controls keyboard accessible]
│
└── ── CONVERT STUDIO ──
    └── [placeholder — file/image/PDF/URL converters; form elements with `aria-label`
]

### Accessibility notes — Main Region
- Container uses `role="main"`; each studio section has `aria-labelledby` linking to its header.
- Region label decorative, marked `aria-hidden="true"`.
- All interactive controls (toggles, nav buttons, filters) are keyboard focusable with visible focus rings and expose state via `aria-pressed` or `aria-selected`.
- Markets grid and other live data areas use `aria-live` to announce updates; rows use proper table semantics.
- Fly lock screen progress accompanies `aria-valuenow` and `aria-valuetext` updates for screen readers.
- Non-interactive graphics labeled `aria-hidden="true"` where appropriate.
- Placeholder content in Convert studio should still satisfy basic accessibility patterns once implemented.
```

---

## GLOBAL

```
GLOBAL
├── Viewport [7-region]
├── Theme token system  [24 themes × 2 modes]
├── Illumination engine  [6 channels]
├── Toast system
└── WebSocket / API layer
```

---

---

## PART II — POLISH REGISTER

---

## Chapter 1 · Header Bar

**Brand Logo**

- should fill the first 1/3 space
- Default should now say "Paulies Studios" — design studio is default
- When switching studios: "Paulie's Prediction Partners" / "Paulies Flight Simulator" / "Paulie's File Converting Studio"
- Append robot emoji (🤖) to the trade‑studio title version
- Include the placeholder circle element centred between the title and illumination panel

**Illumination Panel Container**

- Floats and completely obscures the main viewport content beneath it — header should fit fully around it
- Add vertical "ILLUMINATION" sticker label on left edge of panel card
- Dimmer readouts should show 10‑to‑2.5 values with no percentage sign
- Master switch logic: OFF by default, once flipped ON the rest of the channels fully illuminate

**Flip-Switches & Dimmer-Dials (DAY/NVG, MASTER, TEXT, BARS, FLOOD, DISPLAY)**

- Text labels are squished and misaligned horizontally with their dials
- Indicator dots below dials have uneven spacing
- Standardize label alignment relative to dials and space dots uniformly

---

## Chapter 2 · Nav Bar

**Left Tabs (HUD, DESIGN, TRADE, FLY, CONVERT)**

- The blue active indicator line under "DESIGN" is faint and slightly misaligned — could fill more space and be more noticeable
- Increase contrast and thickness of the active tab line to make the current location obvious, make centered under tab script
- The miniature icons next to HUD, DESIGN, etc., are scaled poorly and look slightly blurry
- Replace with crisp, uniform SVGs sized consistently with the nav text
- If SVGs will help more things look the same proportions no matter what size of landscape viewport, then let's implement SVGs

**Panel Visibility Toggles**

- Remove collapse/expand arrows from sidebars — do 4 toggles in the nav bar after the clock instead
- Panel visibility toggles in the nav bar should show/hide: Header Bar, Left Side Bar, Right Side Bar, and Bottom Bar
- The Nav Bar, Main Region, and Action Bar (Ignition) — these 3 regions should not be toggled away
- These 3 regions should actually be the 3 that are shown if the viewport feels it is in Portrait mode, the remaining 4 regions should auto-hide

**Right Metrics (PING, Mach, DATE/TIME)**

- We could add another component in here — if we take the idea from the market mode card, and develop an indicator that would go first, before ping, this indicator shows 'market mode', live/demo/or no illumination
- Market Mode card removed from Bottom Bar; content absorbed here
- The "PING" graphic feels cramped
- Vertical centering between "Mach 4.20" and the time is uneven
- Normalize padding and lock vertical alignment for all right-side text and graphics

---

## Chapter 3 · Left Sidebar

**MODES card**

- Spacing between "Dark" and "3D Off" buttons and the card edges feels slightly unbalanced — a lot of vertical space underneath
- Refactor for minimum padding and spacing for left/right and top/bottom and inner margins for these toggle buttons, the script in them

**SYSTEM THEME card**

- Theme selection buttons crammed too tightly vertically — increase vertical margin

---

## Chapter 4 · Inspector Panel

**Tabs**

- The icons for Notes, Positions, and History mix flat and 3D illustration styles — use a single, monochromatic icon library for all UI tabs
- Center tiny nav icons above the notepad

**Note Editor**

- Top decorative rings graphic is physically cut off/clipping at the top — adjust the container height or SVG scaling to prevent cutoff
- Notebook background horizontal lines run completely edge-to-edge — add a subtle left/right margin to the repeating line background to mimic real paper margins
- Editor toolbar (B, H1, bullets) & pagination not centered horizontally relative to the notepad paper lines — apply flexbox or text-align center to the toolbar container

**Input Box ("ideas and requests")**

- _(details TBD)_

**"Send email" Button**

- Increase size of script
- Rename to 'Send to Paulie'

---

## Chapter 5 · Bottom Bar (Hangar Bay)

**AGENT ACCESS card**

- Remove sublabels that are the descriptions — only leave the one-worded category specialty for agents. Volume is just Volume. Crypto is just Crypto.
- If hovered over for a pause, then we can have all these elements in the hover window:
  -  Put the sub-label description in this window
  -  Set the win rate and PNL elements in the window and their value indicators
  -  Remove the link script. Keep the light.
- Default agent card view: H1 agent emoji inline with one-word category name · indicator light · 3-position switch
- Ensure all 7 agent modules have only one svg + script header at the top then a 3-switch component underneath
- Horizontal scrollbar in the Agent Access bay overlaps the container's bottom padding — increase bottom padding on the scroll container so the bar doesn't sit directly on the outer border

**P/L MFD card**

- Remove the heat chart component to the right of the line chart
- Remove the script '+/- $' we do not need this
- Dollar/Timeframe Buttons: total width should be the width of the line chart

**CONNECT API KEYS card**

- It should be auto filled to Demo Mode
- Live and Demo script font could be larger, the left margin could be increased
- "Connect Kalshi Stream" Button: script could fill more space in the button and the right margin could increase the same amount
- Input fields have different corner radii — unify border-radius for all text inputs
- Center-top align default scripts for both fields

**MARKET MODE card**

- Move into nav bar as a component that is placed first in the telemetry card, so it would be before ping

---

## Chapter 6 · Action Bar (Ignition)

**Main Toggle Pill (AUTO, SEMI, STOP)**

- Should look like a 4 quartered pie, with the third slice not present, but is instead connected to the body of an old timey cruise-liner throttle engine-order-telegraph

---

## Chapter 7 · Main Region

**ACTIVE PALETTE card**

- Let's get the swatches smaller, like a swatch, not regular shaped, and randomly shaped like a splotch
- Make the card itself also an irregular illogical shape like a palette
- Use the internet for inspiration
- Color swatches must be accurate to the active theme

**MAN-O'-METERS card**

- Remove the value labels underneath each meter — it should instead show in the meter
- The main-label itself should be integrated into the meter's body
- Make meters close together like a wide 4 leaf clover with art deco plumbing running behind them, 3 meters arching underneath the main 'Batt' meter
- All 3 should be unique in architecture like they measure completely different things

**SYSTEM LOGS card**

- Log text jammed directly against the left inner border of the box — increase inner padding (specifically padding-left) on the log container
- Make look like an old-curved-terminal-monitor, square with rounded edges
- Log window is also jammed in the system logs card, and the card should wrap around the log window

**WEB ELEMENTS card**

- Inputs (Text, Select, Checkbox, Radio): _(details TBD)_
- Web Elements Buttons: _(details TBD)_
- Alert Contrast: _(details TBD)_

---

## Chapter 8 · Global

**Global Borders**

- Use of solid lines, drop shadows, and glowing effects makes the UI look disjointed with inconsistencies
- Audit all borders, and establish a unified design token system for borders, shadows, and illumination tokens
- Read chapter 1 in PRD for requested illumination physics

**Global Typography**

- Font weights vary arbitrarily

**Font Rendering**

- Small text across the UI looks heavily pixelated/aliased
- Apply `-webkit-font-smoothing: antialiased;` globally to clean up small text rendering

**Panel Spacing**

- The negative space between major region containers is uneven
- Apply consistent global gap values (e.g., 16px or 24px) between all top-level regions

---

## Chapter 9 · Backend


