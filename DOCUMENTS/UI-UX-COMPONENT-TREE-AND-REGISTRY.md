# Paulie's Prediction Partners

## Element Tree + Design Specifications

_Scratch-build PRD — no prior implementation_

---

> Region → Card → Component → Element

---

```
COMPONENT TREE
│
├── ══════════════════════════════════════════════════
│   R01 · HEADER BAR
│   ══════════════════════════════════════════════════
│   │
│   ├── Brand Logo / Studio Title  [left, fills first 1/3; placeholder circle centred between title and illumination panel]
│   │   ├── "Paulie's Studios"  [default / design studio]
│   │   ├── "Paulie's Prediction Partners 🤖"  [trade studio; robot emoji appended]
│   │   ├── "Paulie's Flight Simulator"  [flight studio]
│   │   └── "Paulie's File Converting Studio"  [convert studio]
│   │
│   └── Illumination Switchboard  [right-aligned, fully inside region with top and bottom spacings — header wraps around it]
│       ├── Top strip  [thin blank header strip, edge just for architecture]
│       ├── "ILLUMINATION" sticker label  [vertical text, reads bottom→top on left edge of panel card]
│       ├── Illumination Groups  [horizontal layout]
│       │   ├── DAY/NVG group
│       │   │   └── Element: Flip switch (two‑state)
│       │   │       ├── Default state: DAY (light)
│       │   │       └── Behavior: toggles theme mode; synchronized with Left Sidebar Light/Dark toggle
│       │   │
│       │   ├── MASTER group
│       │   │   └── Element: Master control cluster
│       │   │       ├── Flip switch (master)  [OFF by default; once flipped ON the rest of the channels fully illuminate]
│       │   │       ├── Indicator LED (beneath switch)
│       │   │       ├── Dimmer dial (numeric range 2‑10)
│       │   │       └── Nixie readout (2‑digit display beneath dial)
│       │   │           ├── Default states: Switch OFF; Dimmer Max at 10 readout=10
│       │   │           ├── Behavior: when OFF, other channels are visually subdued; when ON, enables per-channel intensities scaled by masterScale=1
│       │   │           └── Visual: master indicator ring (bronze) + status LED (off=dim bronze, on=`--pp-glow-teal`)
│       │   │
│       │   ├── TEXT group (Primary & Secondary)
│       │   │   ├── Role definitions:
│       │   │   │   ├── Primary text = headers, large scripts, any text at the top of a hierarchy
│       │   │   │   └── Secondary text = all other body text below primary level
│       │   │   ├── Components per channel: Flip switch (on/off), Dimmer dial (2.5–10), Nixie readout
│       │   │   ├── Default: Primary = ON (dimmer=10), Secondary = ON (dimmer=10)
│       │   │   ├── Visual:
│       │   │   │   ├── small channel LED (bronze when off; `--pp-glow-teal` when on + master on)
│       │   │   │   ├── text opacity increases slightly when channel ON (≈90% vs 70% off)
│       │   │   │   └── glow: outward radial spread grows with dimmer value; intensity ∝ dimmer/10
│       │   │   └── Notes: labels read vertically left of their channel (bottom→top) to save vertical space
│       │   │
│       │   ├── BARS group (Primary & Secondary)
│       │   │   └── Element: Accent bar channel (two per region)
│       │   │       ├── Flip switch
│       │   │       ├── Dimmer dial
│       │   │       └── Nixie readout
│       │   │           ├── Default: Primary=ON(10), Secondary=ON(10)
│       │   │           └── Behavior: accent bar light; dimmer linearly scales intensity and bloom radius
│       │   │
│       │   ├── FLOOD group
│       │   │   └── Element: Flood channel
│       │   │       ├── Flip switch
│       │   │       ├── Dimmer dial
│       │   │       └── Nixie readout
│       │   │           ├── Default: ON(10)
│       │   │           └── Behavior: wide soft illumination; radius increases with dimmer
│       │   │
│       │   └── DISPLAY group
│       │       └── Element: Display backlight channel
│       │           ├── Flip switch
│       │           ├── Dimmer dial
│       │           └── Nixie readout
│       │               ├── Default: ON(10)
│       │               └── Behavior: powers small screen/card backlights, not standard text/buttons
│       │
│       ├── Channel / common rules
│       │   ├── Dimmer range: 2 (min) → 10 (max). Values displayed in nixie readout as whole number or single decimal (e.g., 2, 3, 4 ... 10)
│       │   ├── Step: 1 increments (UI knob snaps to 1)
│       │   ├── No percentage unit displayed (numeric only)
│       │   ├── Flip‑switch housing height matches dimmer dial + intensity sub‑label height
│       │   ├── Labels aligned relative to dials; indicator dots spaced uniformly beneath dials
│       │   ├── All colors pull from CSS theme tokens (no hardcoded hexes) — e.g., `--pp-illum-bg`, `--pp-illum-accent`, `--pp-glow-teal`
│       │   └── Animation: dimmer transitions tween over 100ms ease‑out; switch toggles animate 60ms with a tiny end-bounce
│       │
│       ├── Node & physics notes
│       │   ├── Illumination engine exposure: channels emit values (intensity, color, radius)
│       │   └── `masterScale` (0 or 1) multiplies all channel intensities at render time
│       │
│       ├── Default summary (quick reference)
│       │   ├── Master: OFF, readout=10
│       │   ├── DAY/NVG: DAY
│       │   ├── Text.Primary: ON (10)
│       │   ├── Text.Secondary: ON (10)
│       │   ├── Bars.Primary: ON (10)
│       │   ├── Bars.Secondary: ON (10)
│       │   ├── Flood: ON (10)
│       │   └── Display: ON (10)
│       │
│       ├── Glow layering: Primary and Secondary bars
│       │   ├── Concept: Regions provide the *primary bar glow* (broad, larger radius), while *cards* provide the *secondary bar glow* (localized, tighter radius)
│       │   ├── Primary bar glow (all regions)
│       │   │   ├── Scope: entire region border and outer spread
│       │   │   ├── Radius: large (soft falloff), affects region edges, outer ring, and major accents
│       │   │   └── Visual: outer borders glow and spread outer-directional gradient
│       │   ├── Secondary bar glow (card)
│       │   │   ├── Scope: card border and outer spread stopping at region edge
│       │   │   ├── Radius: affects card borders and outer highlights
│       │   │   └── Visual: sharper rim light and thin edge glow used for affordance
│       │   ├── Interaction rules
│       │   │   ├── When Master = OFF: no glow or illumination effects
│       │   │   └── When Master = ON: glows apply per intensity formulas; toggling individual channels updates respective intensities immediately
│       │   └── Implementation notes
│       │       └── Use GPU friendly gradients and avoid full‑screen postprocessing bloom; prefer local glows composited with CSS/SVG layers
│       │
│       ├── Diagnostics & dev features
│       │   └── Hidden dev overlay shows raw channel values (intensity, masterScale) when `--debug-illum` CSS var is set
│       │
│       └── Bottom nameplate  "ILLUMINATION SWITCHBOARD"
```

> **R01 Accessibility**
> - All interactive controls (switches, dials, tabs) must expose `aria-*` labels and be reachable by keyboard
> - Focus ring visible on each control; colors chosen to meet WCAG contrast
> - Contrast ratios for ON states must meet WCAG AA for text over illuminated surfaces
> - DAY/NVG flip switch: `aria-label="Day/Night toggle"`
> - Master cluster: `aria-label="Master illumination control"`, keyboard focus ring visible
> - Decorative text marked `aria-hidden` or `role="presentation"`
> - Locked states (Fly tab) must have tooltips and `aria-disabled="true"`

---

```
│
├── ══════════════════════════════════════════════════
│   R02 · NAV BAR
│   ══════════════════════════════════════════════════
│   │
│   ├── HUD label  [left — decorative]
│   │   └── Element: text "HUD" (uppercase)
│   │
│   ├── Studio Tabs  [left cluster — crisp, uniform SVGs sized consistently with nav text]
│   │   └── Element: tab group container
│   │       ├── DESIGN tab  [default active]
│   │       │   ├── Label: "DESIGN"
│   │       │   ├── Icon: Palette SVG
│   │       │   ├── Active indicator: blue underline bar, centered under label, full tab width
│   │       │   └── Behavior: click switches main region to Design studio (Default Studio)
│   │       ├── TRADE tab
│   │       │   ├── Label: "TRADE"
│   │       │   ├── Active indicator: appears when selected
│   │       │   └── Behavior: click navigates to trading studio
│   │       ├── FLY tab  [locked]
│   │       │   ├── Label: "FLY" with padlock icon overlay
│   │       │   ├── Disabled state: low opacity, pointer-events:none
│   │       │   └── Tooltip: "Unlock after $2k profit"
│   │       └── CONVERT tab
│   │           ├── Label: "CONVERT"
│   │           └── Behavior: click opens converter studio
│   │
│   ├── Panel Visibility Toggles  [after tabs, before telemetry — inspired by VSCode's panel toggles]
│   │   ├── Header Bar toggle
│   │   ├── Left Sidebar toggle
│   │   ├── Right Sidebar toggle
│   │   └── Bottom Bar toggle
│   │   └── Notes: Nav Bar, Main Region, and Action Bar (Ignition) are not togglable
│   │           In portrait mode these 3 are shown; the remaining 4 regions auto-hide
│   │
│   └── Telemetry Strip  [right]
│       ├── Market Mode Indicator  [FIRST — live / demo / offline, multi-cold-colored LED indicator]
│       ├── PING sparkline + value
│       │   ├── Visualization: `<canvas>` with slow smooth bezier curves (no jagged lines)
│       │   ├── Y axis: fixed 300ms (top) to 0ms (bottom)
│       │   ├── X axis: ~15s history, 1s sampling interval
│       │   └── Styling: no labels, equal width to ping script, only the word "PING" then the chart
│       ├── SVC health dot
│       ├── Mach 4.20  [static/decorative]
│       └── DATE/TIME  [live, M/D HH:MM] No seconds
```

> **R02 Accessibility**
> - HUD label: `aria-hidden="true"` or `role="presentation"`
> - Tab group: `role="tablist"`; each tab: `role="tab"` with `aria-selected` and `tabindex` management
> - DESIGN: `role="tab" aria-selected="true" tabindex="0"`
> - TRADE / CONVERT: `role="tab" aria-selected="false" tabindex="-1"`
> - Visibility toggle buttons: `aria-label="Toggle [region name]"` per button
> - Telemetry elements are read-only; mark `aria-hidden` where appropriate
> - Keyboard navigation: Left/Right arrows cycle through tabs; Enter activates

---

```
│
├── ══════════════════════════════════════════════════
│   R03 · LEFT SIDEBAR
│   ══════════════════════════════════════════════════
│   │
│   └── System Design
│       ├── Region title  "SYSTEM DESIGN"  [top, centered, bold, wide kerning]
│       │
│       ├── MODES card  [single card container]
│       │   ├── Element: Light/Dark toggle single button
│       │   │   ├── State: toggles between light/dark mode
│       │   │   ├── Label: shows 🌙 Dark (represents dark theme in light mode), ☀️ Light (represents light theme in dark mode)
│       │   │   └── Behavior: mirrors DAY/NVG switch in illumination panel
│       │   └── Element: 3D/2D toggle single button
│       │       ├── State: toggles architectural elevation effects
│       │       └── Visual: adds/removes depth shadows and bezels
│       │
│       └── SYSTEM THEME card
│           ├── Container: theme-button grid (2 columns)
│           └── Element: Theme button [×24]
│               ├── Visual: looks like a little representation of the theme through its color and typography
│               ├── Structure: soft border colored accent
│               ├── Behavior: click applies that theme (light or dark variant determined by mode); uses backgrounds, text, and border colors of the theme
│               └── Size/spacing: equal width, responsive to widest label; weight 700, centered
```

> **R03 Accessibility**
> - Sidebar container: `aria-label="System Design"`, `role="complementary"`
> - Light/Dark and 3D/2D toggles: focusable, `aria-pressed` announces state
> - 3D/2D toggle: visible focus style and `aria-describedby` tooltip
> - Theme buttons: `aria-label="Select theme [theme name]"`, `aria-pressed` or `role="radio"` in group; keyboard focus ring

---

```
│
├── ══════════════════════════════════════════════════
│   R04 · RIGHT SIDEBAR — INSPECTOR PANEL
│   ══════════════════════════════════════════════════
│   │
│   ├── Region title  "INSPECTOR PANEL"  [top, centered, bold, wide kerning]
│   │
│   ├── Tab behavior
│   │   ├── Only one tab active at a time; switching hides old panel and reveals new panel without page reload
│   │   ├── Keyboard nav: arrow left/right cycles tabs, Enter activates
│   │   └── Locked tabs are non-interactive and show tooltip on hover
│   │
│   ├── Tabs  [monochromatic icons, centered above notepad]
│   │   │
│   │   ├── Element: Notes tab  [default active]
│   │   │   ├── Label: notebook icon
│   │   │   ├── Behavior: shows NOTES panel when selected
│   │   │   └── NOTES panel
│   │   │       └── Note Editor
│   │   │           ├── Pagination dots  [top]
│   │   │           ├── File upload button  [opens dialog]
│   │   │           ├── Notepad area  [yellow, red margin, ruled lines with left/right margins]
│   │   │           ├── Formatting toolbar  [B · H1 · bullet · box — centered]
│   │   │           ├── Page controls  [Save · ◄ · Page X of Y · ► · delete]
│   │   │           └── Behavior: freeform note-taking with one-click-save-as-markdown-file, cannot load external files
│   │   │
│   │   ├── Element: Positions tab  [+ count badge]
│   │   │   ├── Label: Chart icon
│   │   │   ├── Badge: dynamic count of open positions
│   │   │   ├── Behavior: shows POSITIONS panel and expanded P/L Chart when selected
│   │   │   └── POSITIONS panel  [hidden by default]
│   │   │       ├── Positions list  [or empty state: "no positions"]
│   │   │       └── P/L Chart  [or empty state: "no positions"]
│   │   │
│   │   └── Element: History tab
│   │       ├── Label: clock/history icon
│   │       ├── Behavior: shows HISTORY panel when selected, a log screen for all orders and reasonings; live and accurate, in natural language
│   │       └── HISTORY panel  [hidden by default]
│   │           └── History list  [or empty state: "no history"]
│   │
│   └── Send card  [pinned to bottom]
│       ├── Textarea
│       │   ├── Placeholder text: "ideas and requests"
│       │   └── Behavior: user input retained until send
│       └── "Send to Paulie" button
│           └── Behavior: mailto export to chickensaurusrex@outlook.com
```

> **R04 Accessibility**
> - Tablist: `role="tablist"`; Notes tab: `role="tab" aria-selected="true" tabindex="0"`; Positions and History tabs: `role="tab" aria-selected="false" tabindex="-1"`
> - Pagination dots and file-upload button: `aria-label` and keyboard focus
> - Inactive panels (Positions, History): `aria-hidden="true"`; active panel: `aria-live="polite"`
> - Textarea: `aria-label="Feedback"`; Send button: `aria-label="Submit feedback"`

---

```
│
├── ══════════════════════════════════════════════════
│   R05 · BOTTOM BAR — HANGAR BAY
│   ══════════════════════════════════════════════════
│   │
│   ├── Region title
│   └── Cards row  [all cards visible simultaneously; no scrolling]
│       │
│       ├── AGENT ACCESS card
│       │   ├── Header strip  [top cockpit edge]
│       │   ├── Card header  "Agent Access"  +  A / S / ⛔ legend
│       │   ├── Agent grid  [7 cards — one per module]
│       │   │   │   Default card view: H1 agent emoji inline with one-word category name · indicator light · 3-position switch
│       │   │   │   Hover window: sub-label description + win rate + PNL elements + value indicators (indicator light remains; link script removed)
│       │   │   ├── Agent card 1 — 🔮 Peritia
│       │   │   │   ├── Header: emoji + name centered at top
│       │   │   │   └── Telegraph switch component  [three vertical panels]
│       │   │   │       ├── Panel 1: AUTO (top) with centered LED indicator
│       │   │   │       ├── Panel 2: STANDBY (middle) with centered LED indicator
│       │   │   │       └── Panel 3: OFF (bottom) with centered LED indicator
│       │   │   │       └── Behavior: selecting a panel lights its LED and sets agent state
│       │   │   ├── Agent card 2 — ⚙️ Volume  [same header & telegraph structure]
│       │   │   ├── Agent card 3 — 🚀 Crypto  [same header & telegraph structure]
│       │   │   ├── Agent card 4 — 📈 Financials  [same header & telegraph structure]
│       │   │   ├── Agent card 5 — 🗳️ Politics  [same header & telegraph structure]
│       │   │   ├── Agent card 6 — 🧠 B.Y.O.B  [same header & telegraph structure]
│       │   │   └── Agent card 7 — 🛰️ 007-Gemini (Gemini model via API keys)  [same header & telegraph structure]
│       │   │   └── Behavior: panel press changes state; LED reflects current mode
│       │   └── Bottom nameplate  "AGENT ACCESS BAY"
│       │
│       ├── P/L MFD card
│       │   ├── Card header  "P/L MFD"
│       │   ├── Y-axis buttons  [$10 · $100 · $1k · $10k · ALL]  [total width = width of line chart]
│       │   ├── P/L line chart  [per-agent colored lines; auto-updates]
│       │   └── X-axis buttons  [24h · 1w · 1m · 1y · ALL]  [total width = width of line chart]
│       │   └── Behavior: controls redraw chart smoothly with new bounds
│       │
│       └── CONNECT API KEYS card
│           ├── Card header  "Connect API Keys"
│           ├── Mode selector  [Live · Demo — auto-selects Demo]
│           ├── API Key input  [masked; center-top placeholder; unified border-radius]
│           ├── RSA key textarea  [masked; center-top placeholder; unified border-radius]
│           └── "Connect Kalshi Stream" button  [script centered; right margin increased]
│           └── Behavior: validates keys, toggles connection state, shows success/error toast
```

> **R05 Accessibility**
> - Container: `role="region"` with `aria-label="Hangar Bay"`
> - Agent cards: switches have descriptive `aria-label`; indicator lights are decorative (`aria-hidden`)
> - Hover details reachable via keyboard focus: `aria-describedby` or `aria-expanded` state
> - Y-axis buttons: `aria-label="Select P/L scale"`; X-axis buttons: `aria-label="Select timeframe"`; both support `aria-pressed`
> - API Key inputs: `aria-label="API key input"` and `aria-label="RSA key input"`; Connect button: `aria-label="Connect Kalshi Stream"`, supports `aria-disabled` when inactive
> - Scrollable card row: `role="group"`, keyboard left/right navigation

---

```
│
├── ══════════════════════════════════════════════════
│   R06 · ACTION BAR — IGNITION
│   ══════════════════════════════════════════════════
│   │
│   └── Ignition panel
│       ├── Header: "IGNITION" + mode display + status dot
│       ├── Global throttle (engine-order-telegraph) — three-position control
│       │   ├── Visual: 4-quartered-pie shape with third slice absent, connected to the body of an old timey cruise-liner engine-order-telegraph
│       │   ├── Positions: AUTO, SEMI-AUTO, STOP  (STOP default)
│       │   ├── Interaction: keyboard (Left/Right to change, Space/Enter to select)
│       │   └── State: emits `global-throttle-change` event with payload {mode}
│       ├── Safety interlocks
│       │   ├── Lock toggle: prevents mode change when engaged
│       │   └── Confirmation flow for AUTO → full engagement (toast + aria-live)
│       ├── Status readouts
│       │   ├── Engine status (text + icon)
│       │   ├── Last-action timestamp
│       │   └── Connectivity indicator (decorative)
│       └── Theming tokens
│           ├── --ignition-bg, --ignition-accent, --ignition-focus
│           └── Elevation/3D toggles adapt via `data-3d="true"`
```

> **R06 Accessibility**
> - Panel: `role="region"` + `aria-label="Ignition"`
> - Status dot: `aria-live="polite"`
> - Lock toggle: `aria-pressed`
> - Control slices: `role="radiogroup"` / `role="radio"` with `aria-checked`
> - Focusable elements have visible focus ring and ≥4.5:1 contrast
> - All actions announced via `aria-live="polite"` when state changes

---

```
│
└── ══════════════════════════════════════════════════
    R07 · MAIN REGION
    ══════════════════════════════════════════════════
    │
    ├── Region label  "PERISCOPE VIEWING PORT"  [design studio only; decorative]
    │
    ├── ── DESIGN STUDIO ──
    │   │
    │   ├── Top bento grid
    │   │   │
    │   │   ├── ACTIVE PALETTE card  [left col — irregular paint‑palette shape]
    │   │   │   ├── Theme name badge  [top right]
    │   │   │   └── Swatch blobs  [~14 tiny splotch‑shaped swatches, irregular shapes like paint drops; hex values hidden; color-accurate to active theme]
    │   │   │       ├── Behavior: click → copies hex silently → brief toast
    │   │   │       └── Notes: swatches remain pocket‑sized; card outline resembles an artist's palette
    │   │   │
    │   │   └── Right column stack
    │   │       │
    │   │       ├── MAN-O'-METERS card
    │   │       │   └── 4‑leaf clover gauge cluster  [art deco plumbing behind]
    │   │       │       ├── BATT  [center/top — main meter; label integrated into meter body]
    │   │       │       ├── NET   [arching under, unique design]
    │   │       │       ├── MEM   [arching under, unique design]
    │   │       │       └── CPU   [arching under, unique design]
    │   │       │           ├── Values display inside each meter face (no external labels)
    │   │       │           ├── All 3 arching meters unique in architecture, like they measure completely different things
    │   │       │           └── Layout: meters packed tightly like a four‑leaf clover with decorative piping
    │   │       │
    │   │       └── Bottom row
    │   │           │
    │   │           ├── SYSTEM LOGS card  [old curved CRT monitor aesthetic — square with rounded edges; card wraps the log window]
    │   │           │   ├── Log terminal  [7 entries, timestamp + icon + text; increased inner padding]
    │   │           │   └── Behavior: displays backend and API messages in real time
    │   │           │
    │   │           └── WEB ELEMENTS card
    │   │               ├── Buttons  [primary · secondary · danger · ghost · disabled]
    │   │               │   └── Notes: contrast, spacing, and hover states match style token guidelines
    │   │               ├── Form inputs  [text input · select · checkbox · radio]
    │   │               │   └── Notes: placeholder and corner radius consistent across controls
    │   │               └── Alerts  [success]
    │   │                   └── Notes: color contrast meets accessibility standards
    │   │
    │   └── MS PAINT 1998 card  [full width below bento]
    │       ├── Maximize toggle  [fills entire main region]
    │       ├── Menu bar
    │       ├── Tool palette
    │       ├── Color palette
    │       └── Canvas
    │
    ├── ── TRADING STUDIO ──
    │   │
    │   ├── ACCOUNT SUMMARY BAR  [top strip, sticky]
    │   │   ├── Balance widget  [cash amount, icon; updates live]
    │   │   ├── Portfolio value widget  [total holdings]
    │   │   └── Daily P/L widget  [delta amount with color coding]
    │   │       └── Tooltip on hover shows breakdown by agent
    │   │
    │   ├── TOP‑LEVEL NAV (sometimes labelled "Trending/New/All")  [horizontal scroll of pill buttons]
    │   │   ├── Mirrors Kalshi's primary header links (Crypto, Sports, Finance, Politics, etc.) — Kalshi does not use the word "markets", so we avoid it here too
    │   │   ├── Each pill acts as a section selector; selecting changes the dataset shown below
    │   │   ├── Keyboard left/right to change selection; selected pill has `aria-selected="true"` and focus highlight
    │   │   └── Icons may accompany text for visual clarity; pills wrap/responsive on narrow viewports
    │   │
    │   ├── SECONDARY NAV / TAGS  [row beneath top‑level nav]
    │   │   ├── Provides finer segmentation within the chosen section (Crypto → BTC, ETH, SOL)
    │   │   ├── Scrollable if overflow; behaves like the top‑level nav for keyboard and focus
    │   │   └── Includes an "All" or "Show all" pill to clear the secondary filter
    │   │
    │   ├── FILTER CONTROLS  [row of selectors and search tools]
    │   │   ├── Volume dropdown  [Any/High→Low/Low→High]
    │   │   ├── Frequency dropdown  [choices such as Hourly, Daily, Weekly, Monthly]
    │   │   ├── Time‑to‑expiration slider  [range input with min/max labels; allows trimming soon‑closing items]
    │   │   ├── Keyword search field  [placeholder "Search..." allows free‑text matching across titles]
    │   │   ├── Sort toggle  [cycles through preset orderings; icon reflects current direction]
    │   │   └── Advanced filter panel  [expandable/collapsible; contains additional knobs like price range, tags]
    │   │
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
    │   │
    │   └── FOOTER  [optional pagination or load-more button]
    │
    ├── ── FLY STUDIO ──  [locked until $2k profit]
    │   ├── Lock screen  [progress bar toward $2k]
    │   └── Cockpit  [post-unlock — ISS feeds, flight sim; embedded video with captions and controls keyboard accessible]
    │
    └── ── CONVERT STUDIO ──
        └── [placeholder — file/image/PDF/URL converters]
```

> **R07 Accessibility**
> - Container: `role="main"`; each studio section has `aria-labelledby` linking to its header
> - Region label "PERISCOPE VIEWING PORT": `aria-hidden="true"`
> - All interactive controls (toggles, nav buttons, filters): keyboard focusable with visible focus rings; `aria-pressed` or `aria-selected` expose state
> - Markets grid and other live data areas: `aria-live` announces updates; rows use proper table semantics
> - Fly lock screen: `aria-live="polite"` updates; `aria-valuenow`, `aria-valuetext` for progress bar
> - Non-interactive graphics: `aria-hidden="true"`
> - Placeholder content in Convert studio satisfies basic accessibility patterns

---

```
GLOBAL
├── Viewport [7-region]
├── Theme token system  [24 themes × 2 modes]
├── Illumination engine  [6 channels]
├── Toast system
└── WebSocket / API layer
```

> **Global**
> - Unified design token system for borders, shadows, and illumination — no ad-hoc values
> - `-webkit-font-smoothing: antialiased` applied globally
> - Consistent global gap values between all top-level regions
> - All colors reference CSS theme tokens; no hardcoded hexes anywhere in the codebase

---

---

## Chapter 9 · Kalshi API Integration

### Overview

All live data in the Trading Studio is sourced from the Kalshi Trade API v2. The base URL for production is `https://api.elections.kalshi.com/trade-api/v2`. Authentication requires an API key (passed via the CONNECT API KEYS card) and an RSA private key for request signing.

---

### 9.1 · Authentication & Connection

```
CONNECT API KEYS card  →  Kalshi API
├── API key input     →  X-Kalshi-Access-Key header
├── RSA key textarea  →  RSA-PSS request signing (SHA-256)
├── Mode selector
│   ├── Demo          →  wss://demo-api.kalshi.co/trade-api/ws/v2
│   └── Live          →  wss://api.elections.kalshi.com/trade-api/ws/v2
└── "Connect Kalshi Stream" button
    ├── On success: SVC health dot → green; Market Mode Indicator → live or demo
    └── On failure: toast error; SVC health dot → red
```

- API keys are never stored in plaintext; held in memory only for the session lifetime.
- `GET /portfolio/balance` returns `balance` (available cash, in cents) and `portfolio_value` (total holdings, in cents); divide by 100 before displaying in the Account Summary Bar.

---

### 9.2 · Market Grid — Field Mapping

Each card in the Market Grid maps to a market object returned by `GET /markets` or pushed via the `ticker` WebSocket channel.

```
Market card  →  Kalshi market object
├── Title text              ←  subtitle
├── Icon                    ←  event_ticker  (used to resolve category icon)
├── Odds display            ←  yes_bid_dollars  (current best bid, in dollars)
├── Yes button price        ←  yes_ask_dollars
├── No button price         ←  (100¢ − yes_bid_dollars, expressed in dollars)
├── Time remaining          ←  close_time  (ISO-8601; countdown derived client-side)
├── Volume indicator        ←  volume_24h_fp  (fixed-point; divide by 100 for display)
└── Expansion / order book  ←  yes_bid_size_fp · yes_ask_size_fp
```

- `ticker` is the unique market identifier; use it as the React key and for all subsequent order calls.
- `event_ticker` identifies the parent event; use to group cards under the same Secondary Nav tag.
- `open_time` and `close_time` drive the Time‑to‑expiration slider bounds in Filter Controls.
- `result` is populated on settlement (`yes`, `no`, or `void`); settled markets should be removed from the live grid or visually marked closed.
- `settlement_timer_seconds` is the grace period after `close_time` before the final result is posted; surface this in the countdown expansion.

---

### 9.3 · Fills & History Panel

The History tab (Inspector Panel) displays a natural-language log of all fills, sourced from `GET /portfolio/fills` (live fills) and `GET /historical/fills` (fills older than `trades_created_ts`).

```
History list entry  →  Kalshi fill object
├── fill_id          →  deduplication key; never display raw
├── order_id         →  link to originating order in order detail
├── ticker           →  resolve to subtitle for human-readable label
├── count_fp         →  quantity filled (fixed-point, divide by 100)
├── yes_price_fixed  →  canonical fill price in fixed-point dollars
└── created_time     →  timestamp for natural-language log entry
```

- `client_order_id` may be used for agent-to-fill attribution (each agent stamps its own `client_order_id` prefix).
- Boundary between live and historical fills is defined by `trades_created_ts` from `GET /historical/cutoff`.

---

### 9.4 · WebSocket Channels

The WebSocket connection subscribes to named channels via a `subscribe` command after the handshake.

```
WebSocket channel subscriptions
├── ticker
│   ├── Payload: real-time yes_bid_dollars, yes_ask_dollars, volume_24h_fp, close_time per ticker
│   ├── Consumer: Market Grid  →  live odds updates without full re-fetch
│   └── Subscribe with: { "cmd": "subscribe", "params": { "channels": ["ticker"], "tickers": [...] } }
├── orderbook_delta
│   ├── Payload: incremental yes_bid_size_fp / yes_ask_size_fp depth updates
│   ├── Consumer: Expansion panel order book
│   └── Subscribe per ticker on card expand
├── market_position
│   ├── Payload: position (net contracts), cost_basis (centi-cents), post_position (fixed-point)
│   ├── Consumer: Positions tab list + P/L MFD chart
│   └── Fires on every fill or settlement affecting the user's position
├── user_fills
│   ├── Payload: fill_id, ticker, count_fp, yes_price_fixed, created_time
│   ├── Consumer: History panel log; P/L MFD per-agent colored lines
│   └── Each entry appended to natural-language history in real time
└── user_orders
    ├── Payload: order_id, ticker, status, count_fp, yes_price_fixed
    ├── Consumer: Positions tab badge count
    └── Badge = count of orders where status is "resting"
```

- All channels require authentication; the connection itself always authenticates even for public data channels.
- On reconnect, re-subscribe to all previously active channels; do not assume channel state persists.
- `orders_updated_ts` from `GET /historical/cutoff` defines the boundary: resting orders always available at `GET /portfolio/orders`; completed orders older than this timestamp at `GET /historical/orders`.

---

### 9.5 · Account Summary Bar — Field Mapping

```
Account Summary Bar  →  GET /portfolio/balance
├── Balance widget          ←  balance  (cents ÷ 100 → dollars)
├── Portfolio value widget  ←  portfolio_value  (cents ÷ 100 → dollars)
└── Daily P/L widget        ←  (portfolio_value − previous_portfolio_value snapshot)
    └── Tooltip breakdown   ←  per-agent P/L derived from user_fills filtered by client_order_id prefix
```

---

### 9.6 · Top‑Level Nav & Secondary Nav — Category Routing

```
Top‑Level Nav pill  →  Kalshi category / series routing
├── Crypto     →  series_ticker prefix: KXBTC, KXETH, KXSOL, etc.
├── Sports     →  category filter on GET /events
├── Financials →  series_ticker prefix: KXINX, KXSPY, etc.
├── Politics   →  category: politics
└── (others)   →  map event_ticker prefix to pill label

Secondary Nav tag  →  event_ticker grouping
├── BTC        →  event_ticker contains "BTC"
├── ETH        →  event_ticker contains "ETH"
└── SOL        →  event_ticker contains "SOL"
```

- `series_ticker` identifies the overarching series (e.g., all BTC price-range markets share a series); use it to populate Secondary Nav tags dynamically.
- The Frequency dropdown maps to market `close_time` delta: Hourly = close_time within 1h of open_time, Daily = within 24h, etc.

---

### 9.7 · Error Handling & System Logs

```
System Logs card  →  API / WebSocket event stream
├── Successful handshake     →  log "Kalshi stream connected [mode]"
├── Authentication failure   →  log error code + message; SVC dot → red
├── 429 rate-limit           →  log "Rate limit hit — backing off"; pause agent
├── Insufficient balance     →  log "available_balance_too_low"; hard-stop agent
├── Order fill               →  log fill_id resolved to subtitle + count_fp + yes_price_fixed
└── Market settlement        →  log ticker + result
```

- Surface raw API response bodies in the System Logs card during development (can be toggled off in production via a log-level setting).
- SVC health dot in Nav Bar reflects the live WebSocket connection state, not just page-load success.
