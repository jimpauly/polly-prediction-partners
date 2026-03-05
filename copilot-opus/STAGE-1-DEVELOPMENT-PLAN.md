# Stage 1 Development Plan — Paulie's Prediction Partners

> **Scope:** Develop up to Design Studio (Chapter 1 of PRD)
> **Stack:** Vanilla JavaScript, Tailwind CSS, HTML5
> **Target:** Single `index.html` — no routing, no page reloads

---

## Phase 1: Foundation & Layout Shell

### 1.1 Project Scaffolding
- [x] Create `copilot-opus/` project structure
- [x] `index.html` — single-page entry point
- [x] `css/` — Tailwind config + custom styles
- [x] `js/` — vanilla JS modules
- [x] `assets/` — icons, fonts if needed
- [x] Tailwind CSS via CDN (Play CDN for dev speed)
- [x] Set viewport meta to 1920×1080 device pixels

### 1.2 Seven-Region Layout (CSS Grid + Flexbox)
- [x] Outer viewport container: 1920×1080
- [x] Region 1 — Header Bar: ~1/12 viewport height (90px), full width
- [x] Region 2 — Nav Bar: ~1/24 viewport height (45px), spans center column
- [x] Region 3 — Left Sidebar: ~1/6 viewport width (320px), vertical scroll
- [x] Region 4 — Main Region: fills remaining center space
- [x] Region 5 — Right Sidebar (Inspector Panel): ~1/6 viewport width (320px), vertical scroll
- [x] Region 6 — Action Bar: ~1/6 viewport height (180px), 1/3 viewport width
- [x] Region 7 — Bottom Bar: ~1/6 viewport height (180px), ~4/6 viewport width, horizontal scroll
- [x] Bezel logic: regions get 6px inner + 12px outer wrappers
- [x] Cards get 6px inner + 6px outer wrappers

### 1.3 Typography System
- [x] Etched text style for larger headers/titles (looks like physical control panel text)
- [x] Label-maker sticker style for smaller headers/labels
- [x] Font stack selection

---

## Phase 2: Theme Engine

### 2.1 CSS Custom Property Architecture
- [x] Token system with CSS custom properties (`--color-bg-canvas`, etc.)
- [x] Required baseline tokens (all 24 from PRD)
- [x] Effects tokens (`fx.master.scale`, `fx.glow.*`)
- [x] Runtime selectors: `system_theme` + `mode` (light/dark)
- [x] Precedence: base → theme → mode → illumination

### 2.2 Theme Palettes (10 themes × 2 modes = 20 palettes for Stage 1)
- [x] `modern-webpage` light/dark (default)
- [x] `mosaic-1993` light/dark
- [x] `gen7-cockpit` light/dark
- [x] `ussr-cockpit` light/dark
- [x] `neonvice-1985` light/dark
- [x] `neoncity-2085` light/dark
- [x] `coniforest` light/dark
- [x] `raneforest` light/dark (intentional misspelling per PRD)
- [x] `art-deco` light/dark
- [x] `holographic` light/dark

### 2.3 Theme Application
- [x] Apply themes via data attributes on body/root
- [x] Theme buttons in sidebar preview their own palette regardless of active theme
- [x] Light/dark mode controls which variant all theme buttons show

---

## Phase 3: Region Content — Header Bar

### 3.1 Title Section (left-aligned)
- [x] "Paulie's" title — large, beautifully designed, etched text style
- [x] Large robot emoji 🤖

### 3.2 Illumination Control Panel (right-aligned)
- [x] Visual design: overhead cockpit control panel aesthetic
- [x] DAY/NVG toggle switch (aircraft style) — tied to Light/Dark mode
- [x] Light/Dark toggle (standard UI) — same circuit as DAY/NVG
- [x] Master: ON/OFF switch (default OFF) + rotary dimmer dial (default MAX)
- [x] Text: Primary ON/OFF + Secondary ON/OFF + shared dimmer (all ON, MAX)
- [x] Bars: Primary ON/OFF + Secondary ON/OFF + shared dimmer (all ON, MAX)
- [x] Flood: ON/OFF + dimmer (ON, MAX)
- [x] Display: ON/OFF + dimmer (ON, MAX)
- [x] Consistent spacing, sizing across all controls

---

## Phase 4: Region Content — Nav Bar

### 4.1 Navigation Label
- [x] "Navigation" text label, left-aligned, vertically centered

### 4.2 Studio Selector
- [x] Card with chunky radio buttons: Design, Trade, Fly, Convert
- [x] Design is default selected
- [x] Switching studios changes only Main Region content (no page reload)

### 4.3 Telemetry Card (right-aligned)
- [x] PING: Live `<canvas>` sparkline using `navigator.connection.rtt`
- [x] SPD: Static "MACH 4.20" text
- [x] DATE/TIME: Real-time clock M/D HH:MM (24hr, no seconds)

---

## Phase 5: Region Content — Left Sidebar

### 5.1 System Design Header
- [x] "System Design" header, top-centered

### 5.2 Mode Toggle
- [x] Light/Dark toggle (side-by-side, centered)
- [x] When in light mode: button looks like dark mode invitation
- [x] When in dark mode: button looks like light mode invitation

### 5.3 3D/2D Toggle
- [x] Toggle for architectural elevation/bezel effects

### 5.4 Theme Selector Button Card
- [x] 10 theme buttons (Stage 1 — up through holographic)
- [x] Each button styled to represent its own theme
- [x] Button styling: font-size 12px, padding 6px 2px 4px 2px, font-weight 700, centered
- [x] Buttons react to current light/dark mode for preview

### 5.5 Visibility Toggles
- [x] Rulers toggle (hidden by default)
- [x] Grid toggle (hidden by default)

---

## Phase 6: Region Content — Right Sidebar

### 6.1 Inspector Panel Header
- [x] "Inspector Panel" header, top-centered

### 6.2 To-Do List App
- [x] Spiral notebook visual design
- [x] Bold text toggle button (square)
- [x] H1/Aa size toggle (H1 default, switches after first paragraph)
- [x] Bullet list toggler
- [x] Save as .txt file (download)
- [x] Cannot load files
- [x] Functional text editing

### 6.3 Send-an-Idea Card
- [x] Send button that opens mailto: link
- [x] Email address not displayed (hidden in code)

---

## Phase 7: Region Content — Bottom Bar

### 7.1 Hangar Bay Header
- [x] "Hangar Bay" header, left-aligned

### 7.2 API Key Connection Card
- [x] Live/Demo mode radio selection
- [x] API key single-line text input (grayed until mode selected)
- [x] RSA key multi-line text input (grayed until mode selected)
- [x] "Connect Kalshi Stream" button (grayed until valid keys entered)
- [x] Inputs disappear after successful connection (stub behavior)

### 7.3 Live/Demo Indicator
- [x] Pulsing/glowing indicator light
- [x] Separate from mode selector

### 7.4 Agent Access Cards
- [x] 5 agent slots aligned horizontally
- [x] 3 active: Prime, Praxis, Peritia
- [x] 2 grayed-out placeholder slots (narrower)
- [x] Individual agent control dials: Auto, Semi-Auto, Safe
- [x] Agent status display per card
- [x] +/- $ graph display window per agent

---

## Phase 8: Region Content — Action Bar

### 8.1 Ignition Header
- [x] "Ignition" header, top-centered

### 8.2 Global Agent Throttle
- [x] Oceanliner/submarine throttle design
- [x] Three positions: Full-Auto, Semi-Auto, Full-Stop (default)

### 8.3 Profit/Loss Line Graph
- [x] Canvas-based line graph
- [x] "No data" placeholder when empty
- [x] "+/- $" label
- [x] X-axis buttons: 24h, 1w, 1m, 1y, all
- [x] Y-axis buttons: $10, $100, $1k, $10k, all
- [x] Portfolio line + per-agent colored lines (from theme palette)

---

## Phase 9: Region Content — Main Region (Design Studio)

### 9.1 Viewing Port Header
- [x] "Viewing Port" header, top-centered

### 9.2 Hero Card
- [x] Thin, compact hero — preserves vertical space

### 9.3 System Gauges
- [x] Battery gauge
- [x] Network downlink gauge
- [x] Memory gauge (real data via Performance API)
- [x] CPU gauge (real data where available)
- [x] Mechanical manometer aesthetic

### 9.4 Live Logs Terminal
- [x] Terminal-style card printing last 7 events
- [x] Captures click, resize, focus events
- [x] Includes errors/warnings with color coding
- [x] Compact layout

### 9.5 Web Elements Showcase
- [x] Assorted non-functional UI elements for visual testing
- [x] Buttons, sliders, progress bars, badges, etc.

### 9.6 Palette Viewer
- [x] Shows active theme's 12 major color tokens
- [x] Splat-shaped swatches
- [x] Updates on theme/mode change

### 9.7 MS Paint 1998 Clone
- [x] Classic MS Paint UI recreation
- [x] Canvas drawing surface
- [x] Tool palette: pencil, brush, eraser, fill, text, shapes
- [x] Color palette bar
- [x] Menu bar: File (New, Save), Edit, View
- [x] Maximize toggle to fill entire main region
- [x] Other cards hide when maximized

---

## Phase 10: Illumination System

### 10.1 Physics Model
- [x] Inverse-square glow spread approximation
- [x] DAY/Light mode: base intensity 60%
- [x] NVG/Dark mode: base intensity 100%
- [x] Dimmer dials scale within 0.25–1.00 range on top of base

### 10.2 Channel Implementation
- [x] Master: global ON/OFF + dimmer
- [x] Text Primary: glow, luminance, opacity for primary text
- [x] Text Secondary: glow, luminance, opacity for secondary text
- [x] Bars Primary: region border glow + outer spread into gutter
- [x] Bars Secondary: card border glow + spread into regions
- [x] Flood: ambient fill gradients within regions
- [x] Display: self-illumination for display-like components

### 10.3 State Management
- [x] CSS variables for all illumination channels
- [x] JS state synced with HTML data attributes
- [x] Illumination persists across studio changes
- [x] Resets on new browser session

---

## Phase 11: Precision Tools

### 11.1 Rulers
- [x] X-axis ruler (top), Y-axis ruler (left), 18px wide
- [x] Tick marks: 6px/8px/12px at every 10px intervals
- [x] Shared zero-square at origin
- [x] End px labels
- [x] Device-pixel accurate

### 11.2 Grid Overlay
- [x] 60×60px grid aligned with rulers
- [x] Toggleable from left sidebar

### 11.3 Dynamic Tracking
- [x] Recalculate on resize and visualViewport change events

---

## Phase 12: Studio Switching

- [x] Design Studio: default, fully built
- [x] Trading Studio: "No data" placeholder state
- [x] Fly Studio: "No data" placeholder state
- [x] Converter Studio: placeholder state
- [x] Only Main Region changes; all other regions persist
- [x] Theme/illumination/precision tools persist across switches

---

## Phase 13: UI/UX Polish & Accessibility

### 13.1 Visual Polish
- [x] Consistent spacing throughout
- [x] Smooth transitions/animations
- [x] Loading states, empty states, error states
- [x] Hover, focus, active, disabled states on all interactive elements

### 13.2 Accessibility
- [x] Semantic HTML elements
- [x] ARIA labels where needed
- [x] Keyboard navigation
- [x] Logical tab order
- [x] Visible focus indicators

---

## Phase 14: Final Verification
- [ ] Re-read PRD Chapter 1 (third time)
- [ ] Cross-check every requirement
- [ ] Fix any gaps
