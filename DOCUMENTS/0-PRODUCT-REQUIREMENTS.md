# **Paulie's Prediction Partners** - Product Requirements Document

https://github.com/jimpauly/paulies-prediction-partners

https://jimpauly.github.io/paulies-prediction-partners/

Last update: 03-06-26

## _Chapter 0. Overview_

### Table of Contents:

- Chapter 0. Overview
  - Table of Contents
  - Markdown Format
  - System Prompt
    - Role
    - Tasks
    - Tools
  - Main User Needs

- Chapter 1. Front End
  - Front End Stack
  - WebPage
  - Regions & Elements
    - Overview
    - Header Bar
    - Nav Bar
    - Left Sidebar
    - Right Sidebar
    - Bottom Bar
    - Action Bar
    - Main Region
      - Design Studio
      - Trading Studio
      - Fly Studio
      - Converter Studio
    - Precision Tools
  - Themes
    - Token System
      - Runtime Selectors
      - Precedence Order
      - Color Palette Tokens
      - Required Baseline Tokens
  - Illumination
    - Controls
    - Effects Tokens
    - Development Tips
  - UI/UX Polish
  - Accessibility

- Chapter 2. Back Ends
  - Chapter 2 Intent
  - Product Scope for Initial Release
    - In Scope
    - Out of Scope (Initial Release)
  - Runtime Stack
  - Kalshi Integration Contract
    - Environment Isolation
    - API Surfaces Used by the App
  - Authentication and Key Management
    - REST Authentication
    - WebSocket Authentication
    - Secret Handling
  - WebSocket Transport Model
    - Connection Strategy
    - Commands and Channels
    - Orderbook Integrity
  - Data Contract and Precision Policy
  - Trading Engine Architecture
    - Components
    - Event Flow
  - Risk, Permissions, and Execution Controls
    - Permission Gates
    - Risk Checks (Pre-Submit)
    - Retry Policy
  - Rate Limits and Backpressure
  - Reconciliation and Historical Data Partition
    - Reconciliation Triggers
    - Reconciliation Inputs
    - Historical Boundary Handling
  - Persistence Layer
    - Storage Principles
    - Minimum Table Set
  - Backend Control API
    - Access Model
    - Required Capabilities
  - Observability, Security, and Operations
    - Observability
    - Security
    - Operations
  - Telemetry and Privacy Policy
  - Realistic Rollout Plan
    - Phase 1: Live-Default Controlled MVP
    - Phase 2: Controlled Live
    - Phase 3: Scale and Hardening
  - BTC Recurring Series Focus
  - Installation Tracking and Release Channel Management
    - Anonymous Installation Beacon
    - Release Check-In
  - Scaling Monitoring and Capacity Planning
    - Capacity Signals and Actions
    - Degradation Policy
    - Multi-Exchange Expansion (Future)

- Chapter 3. Design Studio

- Chapter 4. Trading Studio
  - Agent Interfaces
    - Full-Auto
    - Semi-Auto Approval Flow
  - Trading Strategy
  - Agent Prime
  - Agent Praxis
  - Agent Peritia
  - Ideas
    - API Key Auto-Fill
    - Agent Activation on Key Entry

- Chapter 5. Flight Studio
  - Superhero and Aircraft Flight Puget Sound Virtual Simulator.

- Chapter 6. Converter Studio

- Chapter 7. Open Chapter
  - Questions and Answers

### Markdown Format:

| Symbol   | Level   |
| :------- | :------ |
| `#`      | Book    |
| `##`     | Chapter |
| `###`    | Verse   |
| `####`   | Section |
| `#####`  | Topic   |
| `######` | Detail  |

### System Prompt:

#### Role:

1. You are a: Veteran Full-stack Programmer - with over 1,000 years experience in Software Engineering for Web Application Development, Design, and Maintenance.
2. You are an expert in using automated high-frequency trading algorithms/bots/agents for prediction market contracts on Kalshi.
3. You are an out-of-the-box artist, apprectiative master of past and present arts.

#### Tasks:

- **1st Stage:**
  - Develop up to Design Studio.
- **2nd Stage:** (Main Goal)
  - Deeply develop our smart, reinforced-learning, super-profitable,high-frequency, full-auto trading-agent studio.
  - **2.5th Stage:** Reach shippable quality.
    - Windows and Mac Desktop apps with setup wizards.
    - Individuals with minimal technical background should be able to easily install and interface with their copy in less than 5 minutes.
    - Include a published page through github for users who dont want to download an app.
    - Open-source, free-to-use, no-ads, all features available.
  - Expect hundreds of tweaks/fixes/upgrades/polishings/refinements/improvements.
  - Do not ever ask for stage 3. Continue developing, refining, improving in step 2.5.
  - Close security holes. Close data leak possibilities. Critique security and fix.
- **Stage 3:**
  - Ask if main user has successfully gained efficient profits. If not, stay in Stage 2.5\*
    - **Reminder:** 1st and 2nd stage **must be** 110% complete - shippable and exceeding industry-standard quality.
    - Must have capability for agents to continue trading for 24 hours even if devices are off. or webpage is closed.
  - Develop SuperHero + Aircraft Flight-Sim.
  - Develop File Converter app.

#### Tools:

    - This PRD.
    - Photos for inspiration — photos located in the root folder.
    - The Internet — search the internet.
    - Your feelings.
    - The hunger for unlimited money for people we love.

- Guidelines
  - Do not edit this document's original contents.
  - Yo, **do not** reword or remove, or add to, or edit PRD's contents!
  - If something in here is a bad idea, say `this is a bad idea`.
  - Variables should always be unabbreviated.
    - expanded variables with hypens is appreciated for readability.
  - Industry standard file base structure.
  - Work slow, detailed.

### Main User Needs:

- Money
  - A lot of fkn Money fkng help me I will buy Pro plans for a year I promise.
  - A UI that is Beautiful, Creative, Accurate, Responsive, Silly.
  - Did I say money already?
  - Money.

---

_End Chapter 0._

## _Chapter 1. Front End_

### Front End Stack:

**Begin with:**

- JavaScript Vanilla
- Tailwind CSS
- HTML5
- Native desktop app: **Electron** for cross-platform distribution (Windows, macOS, Linux)

### Desktop App Architecture:

#### Installation & Distribution

- **Installer Format:**
  - **Windows:** `.exe` installer with setup wizard
  - **macOS:** `.dmg` or `.pkg` installer
  - **Linux:** `.deb` or `.rpm` packages (optional for initial release)
- **Setup Wizard:** First-run experience, minimal (~2-3 minutes)
  - Option to auto-start on system boot
  - Environment selection (Live/Demo)
  - Opt-in for anonymous telemetry

#### File System & Data Storage

- **App Root Directory:**
  - **Windows:** `%APPDATA%/Paulies/` (e.g., `C:\Users\username\AppData\Roaming\Paulies\`)
  - **macOS:** `~/Library/Application Support/Paulies/`
  - **Linux:** `~/.config/paulies/`

- **Subdirectories:**
  - `config/` — environment variables, theme preferences, illumination state
  - `keys/` — encrypted API keys (never stored as plain text)
  - `logs/` — application logs and audit trails
  - `data/` — local database or cache (if applicable)
  - `docs/` — user-facing documentation

- **State Persistence:**
  - Theme, illumination, and UI state stored in `config/system-design.json` (resets on app restart)
  - Trading state, agent decisions, and performance metrics stored in backend persistence layer (survives app restart)
  - API keys:
    - **Option A (Recommended):** Use OS credential vault (Windows Credential Manager, macOS Keychain, Linux Secret Service)
    - **Option B:** Encrypt keys with local machine-dependent cipher and store in `keys/encrypted-credentials.json`
    - Never display keys after successful connection; only show `●●●●●●●●` masking

#### API Key Management

- **Input:** Bottom Bar text inputs appear only before successful connection
- **After Connection:** Inputs disappear; only live/demo indicator remains visible
- **Secure Handling:**
  - Keys cleared from memory on disconnect or app close
  - Page refresh clears all keys from session
  - No keys logged in console, analytics, or debug traces
  - Auto-fill from `.env` file (optional, for dev/testing only)

#### Background Service

- **Backend Process:**
  - Runs continuously as a hidden background process (asyncio Python daemon)
  - Persists even if UI window is closed (minimize/maximize button behavior only)
  - Auto-restart if it crashes (via app supervisor or systemd)
  - Accessible only via local IPC (127.0.0.1, no external network binding)

- **UI-Backend Communication:**
  - Local HTTP (`http://127.0.0.1:8000/api/...`) or WebSocket for real-time updates
  - No cross-origin concerns (same machine)
  - Full control API access: start/stop agents, switch environment, trigger reconciliation, read state

#### Updates & Versioning

- **Update Check:** On startup, contact `https://api.paulies.ai/release/check` (stubs if offline)
- **Delta Updates:** Use DEB/PKG native update mechanisms or Electron's built-in auto-updater
- **Graceful Degradation:** If update check fails, app launches normally with cached version info

#### Multi-Instance Prevention

- **Singleton Pattern:** Only one instance of the app may run at a time
  - Mutex lock file created at `~/.paulies/paulies.lock` on startup
  - If lock exists, prompt user and optionally reuse existing window
  - Prevents duplicate agent executions or data races

#### Security Considerations

- **Local-Only Binding:** Backend listens only on `127.0.0.1`, never `0.0.0.0`
- **Window Handling:** No DevTools in production build (disable with `nodeIntegration: false`)
- **Code Signing:** Production builds signed with developer certificate
- **Logs:** Redact all secrets from logs automatically

### WebPage:

```
+-------------------------------------------------------------+
|                                                             |
|   +-----------------------------------------------------+   |
|   |1. HEADER                                            |   |
|   +-----------------------------------------------------+   |
|                                                             |
|   +-----------+   +---------------------+   +-----------+   |
|   |3.SIDE BAR |   |2. NAV BAR           |   |5.INSPECTOR|   |
|   |           |   +---------------------+   |   PANEL   |   |
|   |           |                             |           |   |
|   |           |   +---------------------+   |           |   |
|   |           |   |   4. MAIN REGION    |   |           |   |
|   |           |   |                     |   |           |   |
|   |           |   |                     |   |           |   |
|   +-----------+   +---------------------+   +-----------+   |
|                                                             |
|   +----------------------------+    +-------------------+   |
|   |       7. BOTTOM BAR        |    |    6. ACTION      |   |
|   +----------------------------+    +-------------------+   |
|                                                             |
+-------------------------------------------------------------+
```

- **Viewport:** `1920px` wide × `1080px` tall
  - Full desktop window (titlebar + minimize/maximize/close buttons only; no browser bars)
  - All measurements are device pixels, not CSS pixels
- **Resize Behavior**
  - **Vertical resize** (viewport raised / lowered):
    - Only the **two sidebars** and the **main region** grow or shrink vertically.
    - The **Header**, **Nav Bar**, **Bottom Bar**, and **Action Bar** remain vertically static (fixed heights).
  - **Horizontal resize** (viewport wider / narrower):
    - The **Header**, **Nav Bar**, **Main Region**, and **Bottom Bar** (including **Action Bar**) stretch or shrink horizontally.
    - The **two sidebars** remain horizontally static (fixed widths of 320 px).
  - **Zoom** (Ctrl +/−, pinch):
    - Region proportions remain fixed; content within cards shrinks/expands.
    - The grid itself does not reflow — only the rendered scale of text, icons, and card internals changes.
- **Region Spacing**
  - `18px` equal gap between every pair of adjacent regions
  - `18px` padding from viewport edges to outermost regions
  - Applies to the CSS Grid `gap` property and inner flex gap for the Bottom Bar ↔ Action Bar split
- **Bezel Logic**
  - Regions: `6px` inner wrapper, `12px` outer wrapper
  - Cards or special components: `6px` inner wrapper, `6px` outer wrapper
- **Arrangement:** Use Flexbox, Masonry, Bento, Grid, or other techniques to creatively fit content with minimal negative space
  - Think compact Command Bridge, cockpit, trading floor dashboard suite — dense, compact, professional control interfaces
  - Multiple tools or techniques are allowed
  - Suggest improvements and teach us new techniques while developing
- **Typography**
  - Larger headers/titles should look like physical etched text on an actual control panel
  - Smaller headers/labels should look like label maker stickers

### Regions & Elements:

#### Overview:

| #   | Name          | Size                                                    | Scroll             |
| :-- | :------------ | :------------------------------------------------------ | :----------------- |
| 1   | Header        | ~ 1/12th of viewport height                             | No Scroll          |
| 2   | Nav Bar       | ~ 1/24th of viewport height                             | No Scroll          |
| 3   | Left Sidebar  | ~ 1/6th of viewport width                               | Vertical only      |
| 4   | Right Sidebar | ~ 1/6th of viewport width                               | Vertical only      |
| 5   | Bottom Bar    | ~ 1/6th of viewport height; ~ 4/6th of viewport width   | Horizontal Scroll  |
| 6   | Action Bar    | ~ 1/6th of viewport height, one-third width of viewport | No Scroll          |
| 7   | Main Stage    | No fixed dimensions                                     | Varies with studio |

#### Header Bar:

- **`Paulie's Prediction Partners 🤖`** — Title with robot emoji after the name. No subtext. Aligned left, vertically centered.
  - **Placeholder circle** — centered in the header bar between title and illumination panel.
  - **Illumination Control Panel** — Right-aligned, vertically centered. Overhead control panel aesthetic.
    - **"ILLUMINATION" sticker label** — vertical text on the left side of the panel card, reads bottom-to-top like a stickered label.
    - **Channels & Groups:** Horizontal flip switches (up=on, down=off) and rotary dimmer dials. No on/off text labels — let users discover.
    - **Channel labels** — positioned to the left of their channel, read vertically (bottom-to-top). Frees vertical height for detail.
    - **DAY/NVG:** Single flip switch toggling DAY (light) / NVG (dark) mode. Same circuit as the Light/Dark sidebar toggle.
    - **Master:** Switch OFF; dimmer at max (displayed as 10).
    - **Text:** Primary & secondary ON; dimmer at max.
    - **Bars:** Primary & secondary ON; dimmer at max.
    - **Flood:** ON; dimmer at max.
    - **Display:** ON; dimmer at max.
    - **Dimmer display values:** 10 (max) to 2.5 (min), nearest round number. No percent sign.
    - **Flip-switch housing height** matches dimmer dial + intensity sub-label height.
    - **Theming:** All panel colours pull from the active theme palette via CSS custom properties — no static hex colours.
    - Everything set to ON and MAX except Master ON/OFF.
    - Once Master is flipped ON, full illumination effects applied.
    - Must be accurate to real physics and electronics for illumination controls.

#### Nav Bar:

- **No header** in nav bar
  - **`HUD`** text label — Aligned left, vertically centered
  - **Telemetry** card — Aligned right, vertically centered
    - **PING:** Live `<canvas>` tiny sparkline using `navigator.connection.rtt`
      - Smooth bezier curves (curvy up-and-down motion, not jagged lines)
      - Static Y axis from 0ms (top) to 300ms (bottom) — values are inverted/flipped
      - X axis shows ~30 seconds of history (1-second sample intervals)
      - No axis labels, no axis lines — keep the sparkline minimal and cute
      - Shorter width canvas; only "PING" as a text label beside it
    - **SVC:** Backend health indicator dot
    - **DATE/TIME:** Real-time clock — Format `M/D` and 24-hour `HH:MM:SS`

#### Left Sidebar:

- **`System Design`** header — Aligned top, centered
  - **`Mode`:** Light/dark toggle (side-by-side, centered)
  - **`System Theme`:** Buttons to select system design theme
  - **3D Toggle:** Alters architectural elevation effects. Bezels make things look cooler automatically. One more simple idea to make 3D effective and not lame.
- **Light/Dark Mode Toggle Button**
  - **When in light mode:** displays a button that looks like dark mode.
  - **When in dark mode:** displays a button that looks like light mode.
- **3D/2D Toggle Button**
  - Alters architectural elevation effects. Bezels automatically enhance appearance.
- **24-Theme Selector Button Card**
  - 24 theme buttons representing 48 total palettes (24 themes × light/dark modes).
  - The Light/Dark mode toggle controls which variant displays.
  - Styled to represent each respective theme.
  - Affected by light and dark mode.
  - Button selectors accurately pull from and represent their theme regardless of current selection.
  - **When in light or day mode:** all theme buttons display in light mode.
  - **When in dark or night mode:** all theme buttons display in dark mode.
  - **Button styling:** `font-size: 12px`, padding `6px 2px 4px 2px`, `font-weight: 700`, centered.
- **Simple Visibility Toggles** for tools while developing
  - **Rulers:** X-axis and Y-axis precision rulers. Hidden by default; toggle to show/hide for alignment assistance during development.
  - **Grid:** Toggleable `60×60px` overlay for layout assistance during development.

#### Right Sidebar:

- **`Inspector Panel`** header — Aligned top, centered
  - **`To-Do List` App** (card, `width: 100%`)
    - **Spiral Notebook** — Spiral ring binding strip along top edge.
    - **File Dropdown Menu** — Top-left of notepad, above the editor.
      - **New Page** — Creates a new blank notebook page.
      - **Save as .txt** — Downloads all pages as plain text.
    - **Notebook Paper** — College-ruled lines; fills vertical space dynamically with inspector panel height. Line width stays constant (does not stretch horizontally).
    - **Text Toggle Toolbar** — Positioned underneath the notepad editor area.
      - **Bold Text Toggle:** Small square button. Can bold H1 and Aa sizes.
      - **H1 / Aa Toggle:** H1 size default; auto-switch to regular Aa style after first paragraph.
      - **Bullet List Toggler** (icon button) — Toggling preserves other paragraph lines.
      - **Task Checkbox** — Inserts a checkbox task line.
    - **Cannot load files**.
  - **Suggestion Box Card** — Pinned to bottom of inspector panel (visible across all tabs).
    - **Complaint Textarea** — Placeholder text: "type complaints here". Cynical tone, not hostile.
    - **Submit Grievance Button** — Exports textarea content via mailto to `chickensaurusrex@outlook.com`.
    - Display only the button and textarea (do not display email address).

#### Bottom Bar:

- **`Hangar Bay`** header — Aligned left, vertically centered
  - **`Agent Access`** card — For elements to control trading agents and their algorithms
    - **Graph display window** labeled **`+/- $`** professionally
    - **More ideas** to visualize or interface with agents
- **Connect API Keys**
  - After successful key login, all trading cards and components appear in bottom bar and main region.
  - Card with text inputs for user API keys
    - **Live/Demo mode selection:** After selection, text boxes ungray and can receive input.
    - **Single-line text box** for API key.
    - **Multi-line text box** for larger RSA key.
    - **`Connect Kalshi Stream` button** ungrays once correctly-formatted keys are entered.
- **Live/Demo Trading Mode Indicator Lights** — Pulsing, glowing indicator.
- **Agent Access**
  - **Individual agent controls**.
  - **Agent Access Card** — For interactive agent interface
    - 5 agents. 3 agents active on first build. access cards 4 and 5 are grayed out.
    - **Individual Agent Control Dials:** `Auto`, `Semi-Auto`, `Safe`.
    - **Agent Status Display** — Shows agent status in multiple ways.

#### Action Bar:

- **`Ignition`** header — Aligned top, centered
  - **Do not align gutter lines** between main region/sidebar with gutter lines between bottom bars.
- **Global Control for Agents:**
  - Oceanliner or Submarine Throttle design: `Full-Auto`, `Semi-Auto`, `Full-Stop` (default).
- **Profit/Loss Line Graph** — Display `No data` if no data available
  - **`+/- $`** professionally labeled.
  - One main line for portfolio balance (simple, charcoal).
  - Each agent gets their own colored line.
  - Accurate profit/loss data per agent; colors pulled from active theme color palette.
  - Five small buttons for X-axis views: `24 hours`, `1 week`, `1 month`, `1 year`, `all`.
  - Five small buttons for Y-axis views: `$10`, `$100`, `$1k`, `$10k`, `all`.
  - This is a packed region. Fit everything creatively, plus two more ways to visualize and interface with agents and performance.

#### Main Region:

- **Studio Tabs** header — Row of tab buttons at top of main region, horizontally aligned
  - **`Design`**, **`Trade`**, **`Fly`**, **`Convert`** — Switching tabs changes only the main region content (no page reload)
    - **Design:** Default studio. Creative modern webpage.
    - **Trading:** Trading active; main region switches to markets or series cards.
    - **Flight SIM:** Dashboard morphs into a cockpit (Agents must earn $2k profit to unlock).
      - **ISS live video feeds**
    - **Converter:** File converters, image converters, PDF filler, URL to MP3/MP4 converter.
- **`Viewing Port`** header — Aligned top, centered (within Design Studio)

##### Design Studio

- Creative cards and content showcasing UI/UX design.
- Keep main stage content centered horizontally and vertically.
- Prevent overflow and excessive scrolling; arrange content creatively.
- Keep main stage stocked with diverse elements, cards, and displays for visual testing.
- Prevent cards from overflowing region bounds; be creative with design.
- Fill full width and height; center both horizontally and vertically.
- **Creative Design Cards and Elements:**
  - **Hero:** Keep thin and compact to preserve vertical space.
  - **Map Gauges:** Battery, Network Downlink, Memory (no mocks), CPU, GPU, etc.
    - Diverse mechanical manometers and plumbing.
  - **Live Logs:** Terminal printing 7 events at a time (click, resize, focus). Keep compact; include errors/warnings.
  - **Web Elements:** Assorted, non-functional elements for visual testing.
  - **Palette Viewer:** Accurate with each theme selection and light/dark mode.
    - Random unique splat-shaped color swatches for selected palette (the 12 major or common selectors).
  - **MS Paint 1998 Clone:** Fully functional with tools (New, Open, Save, Save As, etc.). Should look exactly like Microsoft Paint 1998.
    - should have the maximize toggle in the top right that makes it fill to take up the entire main region. All other components leave the main region until the maximized is retoggled.
  - What else should we have in the design studio?

##### Trading Studio

- **Display:** `No data` until after successful API key connection, then auto-navigate to trading studio state.
- **No mock data ever.** Empty cards with full formatting, `No data` placeholder until API keys connect.
- **Sleek initialization animations** and glowing effects with brief glow intensity spikes.
- **Live vs Demo mode indicator and light:** Completely different data sets based on mode.
- **Category Nav Menu:** Horizontal scrolling
  - **Sub-Category Nav Menu:** Horizontal scrolling.
  - **Filter Options:** Volume, frequency, time-to-close.
- **Account Summary Bar:** Compact top strip showing live BALANCE, PORTFOLIO value, DAILY P/L. Updates on data refresh.
  - **Market Refresh Button** — manual refresh trigger in the summary bar; re-fetches series and resets greyed-out expired cards.
- **Series Cards:** 3 columns, full width of main region. Scroll down allowed.
  - Cards show information similar to Kalshi cards (see photos folder).
  - Tiny expand button in bottom right to expand card to fill main region.
  - After successful API key connection: collect as much data as allowed, as frequently as allowed.
  - Render only first 18 series cards to keep UI fast.
  - `Show More Markets` button at bottom loads additional 18 series cards.
  - **Markets that close mid-session grey out** in place; do not disappear. Clear on next refresh.

##### Fly Studio

- **Display:** `No data` until after successful API key connection.
- **ISS live feed** displayed (once API keys connected; Agents must earn $2k profit to unlock).

##### Converter Studio

- jpg to png converter. plus other common file converts.
- pdf filler
- url to mp3/mp4 converter

#### Precision Tools:

- **Rulers:** X-axis (top) and Y-axis (left); 18px wide
  - **Tick heights:** `6px` / `8px` / `12px` at every 10px.
  - **Shared Zero-square.**
  - **Accurate to device pixels.**
- **X-Axis End px Label:** Located in ruler at end of X-axis.
- **Y-Axis End px Label:** Located in ruler at end of Y-axis.
- **Grid:** Toggleable `60×60px` overlay aligned with rulers.
- **Dynamic Tracking:** Recalculate on `resize` and `visualViewport` change events.
- **Device-Pixel Assignment:** Align measurements to actual device pixels.

---

### Themes:

**When developing color palettes:**

- Read theme name explanations carefully.
- Develop one theme at a time, slowly.
- Create diverse, unique spectrums with complex color palettes.
- Light and dark modes can share many colors (borders, illumination, state colors, etc.).
- Pause developing themes at holographic during stage 1; finish remaining themes in stage 2.

| Theme Name           | Name Explanation                                                          |
| :------------------- | :------------------------------------------------------------------------ |
| Webpage Light        | 2026 webpage. Modern default. Diverse colors, professional                |
| Webpage Dark         | Modern default "Night Mode" reading. Like Google's dark mode              |
| Mosaic 1993 Light    | Windows 3.1 Silver chrome, chiseled borders. Teal BG (0, 128, 128)        |
| Mosaic 1993 Dark     | Exact inverse of Mosaic 1993 Light                                        |
| Gen7 Cockpit Light   | Gen 7 Fighter. Dark Gull Gray (FS 36231), MFD Green                       |
| Gen7 Cockpit Dark    | Night Vision/Stealth. Deep charcoal, NVG Green glow                       |
| USSR Cockpit Light   | Soviet Cold War. MiG Turquoise (#3d90a2). Stress-reducing blue            |
| USSR Cockpit Dark    | Night Intercept. Region bodies still (#3d90a2)                            |
| Neon Vice 1985 Light | GTA Neon Vice Neon City. Miami pastels, linen suits, art deco pinks       |
| Neon Vice 1985 Dark  | Ocean Drive Midnight. Misty purple haze, humid glow                       |
| Neon City 2085 Light | 2085 Utopia. Hopeful, chromium, electric neon                             |
| Neon City 2085 Dark  | 2085 Dystopia. Netrunner. Sharp laser edges                               |
| Coniforest Light     | Evergreens. Mt. Rainier (Cold green). Mist, Granite, Pine, Khaki          |
| Coniforest Dark      | PNW Night. Deep evergreen, cold shadows, campfire ash                     |
| Rainforest Light     | Amazon (Hot green). Humid, Pith Helmet Beige, Parrot Green                |
| Rainforest Dark      | Amazon Night. Deep canopy, bioluminescence, toxic accents                 |
| Art Deco Light       | Roaring Twenties. Ivory, lacquer black, champagne gold, geometric trim    |
| Art Deco Dark        | Ballroom. Piano black, brass lines, emerald accents, sharp symmetry       |
| Holographic Light    | Iridescent daylight. Pearl base with shifting teal spectral shimmer       |
| Holographic Dark     | Prism Noir. Charcoal base, spectral highlights, neon refraction edges     |
| Vapor Light          | Pastel arcade sunrise. Mint, peach, sky blue haze, soft retro gradients   |
| Vapor Dark           | Late-night vaporwave. Deep navy, hot pink, cyan glow, retro grid ambience |
| Paper Light          | The Office. Copier paper, toner black, ballpoint blue                     |
| Paper Dark           | Carbon. Deep indigo, faint blue transfer text                             |
| Ledger 1920 Light    | Wall St. Ledger. Manila folder, Banker Green, Typewriter                  |
| Ledger 1920 Dark     | Jazz Moderne / Gatsby. Matte Black Cardstock, Gold Foil                   |
| Blueprint Light      | Physical drafting table                                                   |
| Blueprint Dark       | AutoCAD / Terminal Aesthetic. High contrast lines                         |
| Chalkboard Light     | Greenboard. Chalk colors, aluminum                                        |
| Chalkboard Dark      | Classic Blackboard. Slate Black, dusty white chalk                        |
| Oceanic Light        | Maritime / Yacht Club. Navy Blue, White, Brass accents, coral             |
| Oceanic Dark         | The Abyss. Crushing depth. Black-Blue, Coral, Bioluminescence             |
| Volcano Light        | Active Caldera. Ash gray, Pumice, Sulfur, and Magma                       |
| Volcano Dark         | Magma Chamber. Basalt black, flowing lava, heat shimmer                   |
| Phosphor Light       | Dark terminal. P3 Amber CRT old computer                                  |
| Phosphor Dark        | Dark terminal. Green Phosphor old computer, retro blur                    |
| Steampunk Light      | Victorian Sci-Fi. Parchment, Brass, Mahogany, Steam                       |
| Steampunk Dark       | London Fog. Gaslight, Soot, Dark Leather, Copper                          |
| Dieselpunk Light     | WWI Trench. Khaki, Grease, Riveted Steel, Olive                           |
| Dieselpunk Dark      | Noir City. Oily Steel, Smog, Grime, Weak Yellow Light                     |
| Solarpunk Light      | Eco-Utopia. Cream ceramic, lush green, solar gold                         |
| Solarpunk Dark       | Night Garden. Bioluminescence, deep teal, soft amber                      |
| Stonepunk Light      | Bedrock Quarry. Sandstone, Slate, Leather, Clay                           |
| Stonepunk Dark       | Cave Fire. Soot black, Torch Orange, Ash White                            |
| Dreamcore Light      | Daydream. Pastel clouds, blinding light, nostalgia, Cotton Candy          |
| Dreamcore Dark       | Nightmare. The Void, static noise, watching eyes                          |
| Frutiger Aero Light  | Windows Vista / Web 2.0. Bubbly, Glossy, Sky Blue, Grass Green, Glass     |
| Frutiger Aero Dark   | Midnight Aurora. Glassy Black, Glowing Cyan, Deep Blue                    |

#### Token System:

##### Runtime Selectors:

- `system_theme`
- `mode` (`light`/`dark`)

##### Precedence Order:

1. base defaults
2. system theme preset selection
3. mode (`light`/`dark`)
4. runtime illumination/glow state

##### Color Palette Tokens:

_Intentional misnaming preserved_

- `modern-webpage`
- `mosaic-1993`
- `gen7-cockpit`
- `ussr-cockpit`
- `neonvice-1985`
- `neoncity-2085`
- `coniforest`
- `raneforest`
- `art-deco`
- `holographic`
  - Pause developing themes at holographic during stage 1; finish remaining themes in stage 2.
- `vapor`
- `paper`
- `ledger-1920`
- `blueprint`
- `chalkboard`
- `phosphor`
- `volcano`
- `oceanic`
- `steampunk`
- `dieselpunk`
- `solarpunk`
- `stonepunk`
- `dreamcore`
- `frutiger-aero`

##### Required Baseline Tokens:

- `color.bg.canvas`
- `color.bg.surface`
- `color.bg.brand`
- `color.fg.default`
- `color.fg.strong`
- `color.border.default`
- `color.border.muted`
- `color.border.focus`
- `color.link.default`
- `color.link.visited`
- `color.code.bg`
- `color.code.fg`
- `color.state.success`
- `color.state.warning`
- `color.state.error`
- `color.state.info`
- `color.selection.bg`
- `color.debug.marker`
- `fx.master.scale`
- `fx.glow.text.primary`
- `fx.glow.text.secondary`
- `fx.glow.bars.primary`
- `fx.glow.bars.secondary`
- `fx.glow.flood`
- `fx.glow.display`

### Illumination:

- Objective: simulate cockpit lighting physics for the web interface.
  - Illumination does not change when changing studio, theme, or palette.
  - DAY/Light mode reduces illumination intensity to 60%; NVG/Dark mode runs at 100% intensity.
  - Other names: Overhead Control Panel. Lighting Control Panel. Lighting Panel. Lighting Interface.
  - **Physics model:** glow that spreads follows an inverse-square approximation.
  - **Intensity Hierarchy:** DAY/Light mode sets base illumination intensity to 60%; NVG/Dark mode sets base to 100%. Dimmer dials then secondarily modulate intensity within the range of 0.25 to 1.00 (displayed as 2.5 to 10) on top of the mode-based intensity value. Always apply mode rules first, then dimmer dial rules.

#### Controls:

- Each layer/group has one On/Off Switch and one rotary Dimmer Dial.
- Text and Bar groups have two On/Off Switches and one dimmer dial.
- **All flip switches** are horizontal, flipping up (on) and down (off). No on/off labels.
- **Channel labels** sit to the left of their channel, read vertically (bottom-to-top).
- **Dimmer values** display as 10 (max) to 2.5 (min) — value × 10, nearest round number. No percent sign.
- **Panel colours** must reference the active theme palette (CSS custom properties) — no static hex colours.
  - **DAY/NVG** — single flip switch tied to the Light/Dark toggle. Same circuit — toggling one updates the other. Mutually exclusive modes.
  - **Master** - global ON/OFF Illumination switch, OFF default; Global DIM Dial, DIM MAX default.
  - **Text** - controls glow, luminance, and opacity for primary and secondary text groups; Find 100% of text elements and apply these effects.
    - **Primary Text** — Whichever text groups feel like primary text groups (high priority, important content).
    - **Secondary Text** — The rest of the text (descriptions, metadata, tertiary content). Effects: text-shadow glow, opacity modulation, luminance.
  - **Bar** - Structural glow. two-tier border illumination system
    - primary bars — all region border opacity and glow intensity; outer spread into gutter.
    - secondary bars — all card border opacity and glow intensity; Outer spread into regions' areas.
  - **Flood** - ambient fill within regions — controls opacity and brightness for atmospheric gradient centered wash over whole WebPage.
    - Simulated Post lights that flood their region with light.
  - **Display** - self-illumination intensity display-like components; simulates LCD/LED or MFD displays.
    - Displays are cards or content that are windows, dropdown menus, graphs, logs, etc.

#### Effects Tokens:

- `fx.master.scale` (default scale)
- `fx.glow.text.primary`
- `fx.glow.text.secondary`
- `fx.glow.bars.primary`
- `fx.glow.bars.secondary`
- `fx.glow.flood`
- `fx.glow.display`

#### Development Tips:

- Define ALL channels and their purposes upfront
- Document physics model clearly
- Design control UI before implementing effects
- Test with all switches OFF, not just ON
- Combine box-shadows properly (don't override)
- Initialize CSS variables on page load
- Define lighting channels upfront
- Plan physics model
- Define default states for all channels
- Plan for master control (global dimming, emergency mode)
- Establish CSS variable naming for effects
- **Base Intensity by Mode:** In dark mode, set illumination base to 100% intensity. In light mode, set base to 60% intensity. Dimmer dials then multiply or scale this base value within the 0.25–1.00 range (displayed as 2.5–10).
- Apply mode rules first (sets base intensity), then dimmer dial rules on top (scales the base).
- Keep JavaScript state in sync with HTML attributes
- Update UI when state changes (don't just change state silently)
- Always apply: base rules ? theme rules ? mode rules ? illumination rules
- Group variables by category
- Document variable purposes with brief dev notes in code
- Plan for scoped variables (component-level)
- Theme and illumination state persist when switching studios. They reset on new browser session
- One `index.html`. Studio tabs in the Main Region header switch state — no page reloads, no routing.
- The Header, Nav (HUD), sidebars, Bottom and Action Bar never change between studios. Only Main Region's content changes.
- Design Studio is the default landing state — our UI shows off itself with web design skills first.
- Trading Studio activates when API keys are connected. The Main Region becomes a live data interface that resembles navigating Kalshi.
- Agents run in the backend regardless of which studio is active.
- Flight Studio is a reward state — the Main Region transforms into a cockpit. The rest of the interface stays functional. Agents keep trading in the background.
- All studios share the same theme, illumination, and precision tool state. Switching studios never resets any system design controls.

### UI/UX Polish:

- Visual Polish:
  - Consistent spacing throughout
  - Alignment perfection (use grid/flexbox)
  - Smooth transitions/animations
  - Loading states for async operations
  - Empty states for no data
  - Error states with helpful messages
  - Success states with confirmation
  - Et cetera

- UX Details:
  - Hover states on all interactive elements
  - Focus states clearly visible
  - Active/pressed states
  - Disabled states (visually distinct)
  - Cursor changes appropriately
  - Tooltips for unclear elements
  - Confirmation for destructive actions
  - Et cetera

- Microinteractions:
  - Button press feedback
  - Form validation feedback
  - Success animations
  - Progress indicators
  - Page transitions
  - Scroll behavior
  - Et cetera

#### Accessibility:

- Semantic HTML:
  - Use semantic elements (`<header>`, `<nav>`, `<main>`, `<article>`, etc.)
  - Plan heading hierarchy (h1 ? h2 ? h3)
  - Define landmark regions
  - Use `<button>` for buttons, `<a>` for links
  - Proper form labels and associations

- ARIA & Screen Readers:
  - Add ARIA labels where needed (`aria-label`, `aria-labelledby`)
  - Define live regions (`aria-live`, `aria-atomic`)
  - Plan for focus management
  - Add skip links for navigation
  - Test with screen readers (NVDA, JAWS, VoiceOver)

- Keyboard Navigation:
  - All interactive elements keyboard accessible
  - Logical tab order
  - Visible focus indicators
  - Define keyboard shortcuts
  - Trap focus in modals
  - Escape key behavior

- Visual Accessibility:
  - Meet WCAG contrast ratios (AA or AAA)
  - Plan for color blindness
  - Support browser zoom (up to 200%)
  - Respect `prefers-color-scheme`
  - Plan for high contrast mode

_End Chapter 1._

---

## _Chapter 2. Back Ends_

### Chapter 2 Intent

This chapter defines a realistic backend blueprint for a shippable Kalshi trading application.

- Prioritize reliability over feature breadth.
- Keep Kalshi protocol details brief here; use `DOCUMENTS/KALSHI-DOCS.md` as the protocol source of truth.
- Ship in phases: Live-default operation with tightly controlled execution safeguards.

---

### Product Scope for Initial Release

#### In Scope

- Always-on backend process for market ingestion, agent execution, and state persistence
- Demo and Live environment support with strict isolation
- WebSocket market ingestion and user stream handling
- Order execution with retries, idempotency, and risk gates
- Local control API for UI and operator controls
- Production-grade logging, metrics, and audit trail

#### Out of Scope (Initial Release)

- Multi-exchange routing or automatic migration to other exchanges
- Hardcoded user-count scaling heuristics
- Forced cloud orchestration requirements
- Complex distributed microservice topology

---

### Runtime Stack

| Area             | Selection                                     |
| :--------------- | :-------------------------------------------- |
| Language         | Python 3.12+                                  |
| Runtime model    | `asyncio`                                     |
| API server       | FastAPI + Uvicorn                             |
| REST client      | `httpx`                                       |
| WebSocket client | `websockets`                                  |
| Database         | PostgreSQL (Supabase acceptable)              |
| DB driver        | `asyncpg`                                     |
| Config           | environment variables (`.env` for local only) |
| Logging          | structured JSON                               |
| Metrics/tracing  | Prometheus + OpenTelemetry                    |

Implementation notes:

- Pin exact runtime versions in lockfiles and deployment manifests.
- Keep secrets out of source control and process logs.
- Build outputs must remain in `.artifacts/`.

---

### Kalshi Integration Contract

#### Environment Isolation

| Environment | REST Base URL                                   | WebSocket Endpoint                                         |
| :---------- | :---------------------------------------------- | :--------------------------------------------------------- |
| Live        | `https://api.elections.kalshi.com/trade-api/v2` | Production endpoint from `websockets/websocket-connection` |
| Demo        | `https://demo-api.kalshi.co/trade-api/v2`       | Demo endpoint from `websockets/websocket-connection`       |

Rules:

- Live and Demo are separate exchanges with separate credentials and state.
- Data, caches, and PnL must never mix across environments.
- Environment selection is explicit and auditable.
- Default environment on first launch is `Live`.
- `Demo` remains available as an optional sandbox environment.

#### API Surfaces Used by the App

| Domain               | Required Endpoints                                                                                                                                                                          |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Market discovery     | `GET /markets`, `GET /markets/{ticker}`, `GET /events`, `GET /events/{event_ticker}`, `GET /series/{series_ticker}`                                                                         |
| Portfolio state      | `GET /portfolio/balance`, `GET /portfolio/orders`, `GET /portfolio/orders/{order_id}`, `GET /portfolio/fills`, `GET /portfolio/positions`                                                   |
| Order actions        | `POST /portfolio/orders`, `DELETE /portfolio/orders/{order_id}`                                                                                                                             |
| Exchange status      | `GET /exchange/status`, `GET /exchange/schedule`, `GET /exchange/user_data_timestamp`                                                                                                       |
| Historical partition | `GET /historical/cutoff`, `GET /historical/markets`, `GET /historical/markets/{ticker}`, `GET /historical/markets/{ticker}/candlesticks`, `GET /historical/fills`, `GET /historical/orders` |
| Limits               | `GET /account/limits`                                                                                                                                                                       |

- Detailed request and response shapes are maintained in `DOCUMENTS/KALSHI-DOCS.md`.

---

### Authentication and Key Management

#### REST Authentication

- All authenticated REST requests use Kalshi RSA-PSS headers:
  - `KALSHI-ACCESS-KEY`
  - `KALSHI-ACCESS-SIGNATURE`
  - `KALSHI-ACCESS-TIMESTAMP`
- Signature logic is centralized and covered by unit tests.

#### WebSocket Authentication

- Authenticate during WebSocket handshake using Kalshi-supported headers.
- Do not depend on a custom post-connect login flow.
- Treat keep-alive as WebSocket control-frame behavior (ping/pong), not application JSON ping.

#### Secret Handling

- Separate credential sets for Live and Demo.
- Secrets loaded at runtime from secure storage.
- Private key material is never persisted in app logs, analytics, or database tables.
- Key rotation must be supported without code changes.

---

### WebSocket Transport Model

#### Connection Strategy

- One persistent WebSocket session per active environment.
- Reconnect with exponential backoff and jitter.
- On reconnect: restore subscriptions, then run reconciliation.

#### Commands and Channels

Supported command set:

- `subscribe`
- `unsubscribe`
- `list_subscriptions`
- `update_subscription`

Primary channel set for this app:

- `ticker`
- `orderbook_delta`
- `trade`
- `market_lifecycle_v2`
- `fill`
- `user_orders`
- `market_positions`

Optional channel set (feature-gated):

- `communications`
- `order_group_updates`

Operational notes:

- Use `send_initial_snapshot=true` for `ticker` when initial top-of-book seed data is required.
- Use `skip_ticker_ack=true` for large subscription sets to reduce acknowledgement payload volume.
- Prefer `update_subscription` (`add_markets` / `delete_markets`) for dynamic market set changes without reconnecting.

#### Orderbook Integrity

- Build from `orderbook_snapshot` then apply `orderbook_delta`.
- Enforce monotonic `seq` per subscription.
- On sequence gap: mark stale, resubscribe, rebuild snapshot.
- Agents cannot execute from stale orderbook state.

---

### Data Contract and Precision Policy

- Fixed-point fields are canonical whenever available.
- Use `Decimal` for prices, costs, and contract quantities.
- Never use floating-point arithmetic for trading decisions or persistence.
- Preserve raw upstream values for auditability and replay.
- Treat `_fp` and `_dollars` fields as the primary contract.
- Legacy integer fields are compatibility-only and must never be required by core logic.

Canonical internal units:

- Money: fixed-point dollars (`Decimal`, 4 dp)
- Quantity: fixed-point contracts (`Decimal`, 2 dp)
- `market_positions` centi-cent integers are converted at presentation boundaries only.

---

### Trading Engine Architecture

#### Components

1. Ingestion service: WebSocket lifecycle, decode, validate, route.
2. State cache: current market and account state per environment.
3. Agent runtime: produce trade intents from state updates.
4. Risk gateway: permission checks and risk policy enforcement.
5. Execution service: order submit/cancel with idempotency and retry policy.
6. Reconciliation service: periodic and event-triggered consistency repair.
7. Persistence service: durable storage and query layer.
8. Control API: runtime controls and read APIs for UI.

#### Event Flow

```text
Kalshi WebSocket -> Ingestion -> State Cache -> Agent Runtime -> Risk Gateway -> Execution -> Kalshi REST
                                                      |
                                                      v
                                                 Persistence
                                                      |
                                                      v
                                                   Control API
```

---

### Risk, Permissions, and Execution Controls

#### Permission Gates

- Global trading enabled (disabled by default at startup)
- Environment healthy and authenticated
- Agent mode permits execution (`Auto`)
- Optional account-level kill switch

#### Risk Checks (Pre-Submit)

- Market tradability and status
- Max order notional
- Max per-market and per-event exposure
- Daily loss cap
- **Kalshi Position Limits:** Query market position limits via Kalshi API; reject orders that would exceed per-market position ceilings. Check current position snapshot before order submission.
- Duplicate request suppression via `client_order_id`
- Self-trade prevention policy (if configured)

Behavior:

- Reject with explicit reason codes.
- Write all blocks and rejects to `risk_events` and audit logs.
- Do not silently drop intents in production mode.

#### Retry Policy

- `429` (rate limit): honor `Retry-After` if present, exponential backoff with jitter, retry up to 5 times.
- `5xx` and network timeouts: exponential backoff with jitter, retry up to 3 times.
- `4xx` validation/auth errors: no retries (terminal failure).
- Retries must reuse the original `client_order_id`.
- Circuit breaker is always enabled in production:
  - Open if repeated submit failures exceed threshold in a short rolling window.
  - While open, block new agent-generated orders and allow only manual operator actions.
  - Auto-close after cooldown and health-check recovery.

---

### Rate Limits and Backpressure

- Read account limits from `GET /account/limits` at startup and on a fixed refresh interval.
- Do not hardcode account tier values.
- Maintain separate budgets for reads and writes; enforce both centrally in execution.
- Backpressure is always enabled:
  - Prioritize execution-critical paths (submit/cancel, fills, positions, reconciliation).
  - De-prioritize non-critical work (broad discovery sweeps, non-urgent refreshes) under pressure.
  - Emit warnings when sustained 429s or budget starvation are detected.

---

### Reconciliation and Historical Data Partition

#### Reconciliation Triggers

- Startup
- WebSocket reconnect
- Scheduled interval (default 60 minutes)
- Manual trigger from control API

#### Reconciliation Inputs

- `GET /portfolio/orders`
- `GET /portfolio/fills`
- `GET /portfolio/positions`
- `GET /exchange/user_data_timestamp`

#### Historical Boundary Handling

- Use `GET /historical/cutoff` to route historical reads.
- Pull historical orders/fills/markets from corresponding historical endpoints.
- Reconciliation must include both live and historical tiers when required.

---

### Persistence Layer

#### Storage Principles

- PostgreSQL is the source of truth.
- Environment partition is mandatory (`live` and `demo`).
- Writes are idempotent and replay-safe.
- All timestamps use UTC (`TIMESTAMPTZ`).

#### Minimum Table Set

| Table           | Purpose                                   |
| :-------------- | :---------------------------------------- |
| `markets`       | market metadata and lifecycle state       |
| `orderbooks`    | current orderbook state                   |
| `orders`        | order lifecycle state                     |
| `fills`         | fill records                              |
| `positions`     | current positions                         |
| `agent_state`   | per-agent runtime/config state            |
| `risk_events`   | denied intents and policy violations      |
| `system_config` | runtime settings                          |
| `audit_log`     | immutable operator and system audit trail |

---

### Backend Control API

#### Access Model

- Authenticated access only.
- Role-based authorization:
  - `viewer`: read-only
  - `operator`: runtime controls
  - `admin`: key/environment administration

#### Required Capabilities

- Start/stop/pause agents
- Set agent mode
- Enable/disable global trading
- Switch active environment view
- Trigger reconciliation
- Expose read-only state for UI
- Stream normalized runtime events (`/events`)

Event delivery requirements:

- At-least-once delivery semantics.
- UI must treat backend as source of truth.

---

### Observability, Security, and Operations

#### Observability

- Structured logs with request and correlation IDs.
- Metrics for reconnects, sequence gaps, submit latency, rejects, retries, reconciliation drift.
- Distributed traces across ingest to execution path.

#### Security

- TLS in transit.
- Secret redaction by default.
- Privileged actions are audited.
- Optional hardening: IP allowlist and MFA for admin paths.

#### Operations

- Changelog monitoring for Kalshi API changes.
- Contract tests against Demo before Live release.
- Deployment gate requires migrations, replay checks, and clean startup health.

---

### Telemetry and Privacy Policy (Product)

- Default mode is privacy-first.
- No mandatory installation beacon in core trading path.
- Optional telemetry may be offered as explicit opt-in and must:
  - exclude secrets and trading payload content
  - be documented clearly
  - fail open (never block startup or trading)

---

### Realistic Rollout Plan

#### Phase 1: Live-Default Controlled MVP

- Default selected environment is `Live`
- Global trading remains OFF until explicit operator enable
- Manual controls and full observability are required
- `Demo` remains available for optional pre-flight validation

#### Phase 2: Controlled Live

- Tight risk caps and kill switches
- Reduced order frequency until stability is proven
- Progressive increase in automation only after stable reconciliation and error metrics

#### Phase 3: Scale and Hardening

- Performance tuning, resilience tests, and incident runbooks
- Optional multi-user packaging and cloud deployment
- Additional channels/features enabled by flags

---

### BTC Recurring Series Focus

- BTC recurring series remains the primary strategy target.
- Discovery must paginate reliably and handle large market sets.
- Keep this as a strategy focus, not a hardcoded backend dependency.
- Backend architecture must remain general for additional series expansion.

---

### Installation Tracking and Release Channel Management

#### Anonymous Installation Beacon (Telemetry System)

Telemetry beacon is optional and disabled by default. It is only sent after explicit user opt-in.

**Beacon Specification:**

- **Trigger:** First startup after explicit telemetry opt-in
- **Frequency:** One-time per installation
- **Persistence:** Store `installation_uuid` and `telemetry_enabled` in local config
- **Endpoint:** `POST https://telemetry.<your-domain>/ping` (configurable per deployment)
- **Payload:**
  ```json
  {
    "installation_id": "uuid-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "app_release_channel": "stable|beta|dev",
    "environment": "live|demo",
    "timestamp": "2026-03-04T23:00:00Z"
  }
  ```
- **Timeout:** 5 seconds max; fail silently if unreachable
- **Error Handling:** Do not block application startup if telemetry fails
- **Retry:** None (one-time attempt only)

**Data Minimization:**

- No personal information collected
- No API keys, account credentials, or trading history
- No IP address logging (backend discards)
- Installation UUID is one-time random identifier, not tied to user identity
- Opt-out: Users can disable telemetry at any time by setting `telemetry_enabled=false`

**Transparency:**

Document in README and first-run wizard:

```markdown
### Anonymous Installation Analytics

Paulie's app can send a one-time anonymous installation ping on startup when telemetry is enabled.
This ping contains only a unique installation ID, release channel, and timestamp—no personal data.

To disable: Set `telemetry_enabled=false` in your local config.
```

---

#### Release Check-In (Update Channel)

Lightweight API call on startup to check for new releases and collect user count metrics.

**Release Endpoint Specification:**

- **Endpoint:** `GET https://api.<your-domain>/release/check`
- **Trigger:** On application startup (or on user request)
- **Frequency:** Once per session
- **Request:**
  ```json
  {
    "current_release_channel": "stable|beta|dev",
    "os": "linux|mac|windows",
    "env": "live|demo"
  }
  ```
- **Response:**
  ```json
  {
    "latest_release_channel": "stable",
    "download_url": "https://github.com/releases/latest",
    "changelog": "Bug fixes and security patches",
    "active_installations": 1247,
    "critical_alert": false,
    "alert_message": null
  }
  ```

**Metrics Collection:**

- Count unique release check requests per day
- Aggregate by environment (live/demo) and OS
- Publish aggregate metrics (not per-user): "X installations active today"
- Use for scaling analysis thresholds: trigger alerts when reaching 10k, 50k, 100k installations

**Failure Handling:**

- If release check fails, assume current release channel is valid (fail closed)
- Display cached release info if network unavailable
- Never block startup on release check failure

---

### Scaling Monitoring and Capacity Planning

#### Capacity Signals and Actions

| Signal                 | Warning Threshold                         | Action                                                            |
| :--------------------- | :---------------------------------------- | :---------------------------------------------------------------- |
| Sustained `429` rate   | >5% of order requests over 5 minutes      | Reduce non-critical traffic; maintain execution path priority     |
| Submit latency p95     | >2 seconds over 5 minutes                 | Slow agent order cadence and increase intent filtering strictness |
| Reconciliation drift   | Any unresolved drift after one cycle      | Pause new automation until consistency is restored                |
| WS gap/reconnect churn | Repeated sequence gaps or reconnect loops | Gate executions to markets with healthy data only                 |

#### Degradation Policy

- Degrade non-critical services first (broad scans, cosmetic updates, low-value polling).
- Keep order safety, fills, positions, and reconciliation on the highest priority tier.
- If system health degrades past threshold, move agents to safe mode (`SemiAuto` or `FullStop`) automatically.

#### Multi-Exchange Expansion (Future)

- Multi-exchange routing is not part of this release.
- Any future expansion must be feature-flagged, operator-approved, and isolated from Kalshi execution paths.

---

---

## _Chapter 3. Design Studio_

- Default State showing off our pretty main region and all our cool control interfaces.
- This isn't too complicated so it doesn't need it's own chapter.
- see ##### Design Studio for details

## _Chapter 4. Trading Studio_

- The entire reason why we are doing this: To make money.
- Three agents at first. Separate environments to avoid cross-contamination of performance.

### Agent Interfaces

- Agents will mostly be interfaced through their Agent Access content card in the bottom bar.
- interfaces for approval/deny bids in semi-auto

#### Full-Auto

- No approval needed to execute buys/sells.

#### Semi-Auto Approval Flow

- **User Interface:**
  - When an agent (Semi-Auto mode) requests approval, an approval overlay appears **within the relevant series card** in the Trading Studio.
  - Overlay includes:
    - **APPROVE** button (green, prominent)
    - **DENY** button (red, secondary)
    - **Agent Reasoning:** Display decision logic from agent logs (e.g., "Bullish Engulfing pattern detected + volume confirmation").
    - **Order Details:** Contract type (YES/NO), requested notional, current best bid/ask prices on card.

- **Approval Timing:**
  - If user does not act within **60 seconds**, the approval request expires and the card refreshes with new orderbook data.
  - No countdown timer (reduces stress); approval UI silently disappears after 60s.
  - Agent generates a new approval request if it re-evaluates the same market within the next cycle.

- **Agent Behavior:**
  - **Agents request approval before BUYING** YES or NO contracts.
  - **Agents execute SELLS without approval** (reduce capital at risk quickly if needed).
  - Semi-Auto mode acts as a "supervisor" gate: user controls entry, but not exits.

- **Execution:**
  - When user clicks APPROVE, order is submitted immediately using current orderbook snapshot.
  - When user clicks DENY, request is logged (for training data) and agent moves to next market.
  - Order execution respects all risk checks (max notional, exposure caps, position limits, daily loss cap).

### Trading Strategy

- Event-driven, selective frequency: trade only when signal quality and market quality thresholds are met.
- Hard stops are enforced by the risk gateway (daily loss cap, exposure caps, and global kill switch).
- Priority universe: recurring BTC and short-dated markets (typically under 3 days to close).
- Discovery may scan up to 40k markets, but execution must stay constrained to a curated, liquid subset.

### Agent Prime

- Default, Normal
- Literally just follows the other traders. Basically betting on the majority bets.
- Should be able to access and analyze and bet on every market.
- Majority Signal Logic
  - prime could watch total buy and sell volume direction within each minute
  - prime could place bets aligned with whichever side the majority is trading in that window
  - This idea is that the group consensus of a market tends toward the most accurate answer

### Agent Praxis

- this one only goes for the markets that are sports.
- its going to get really good at at sports

### Agent Peritia

- We will put heart into this one and try to get this one to focus on the 15 minute recurring BTC price up/down yes/no series.
- This is the main main main main #1 goal of this project.
- Eventually will be really good at all the crypto.
- Uses candlestick patterns to inform decision making

#### Agent Peritia Decision Logic

**Primary Strategy: Candlestick Pattern Recognition + Volume Confirmation**

1. **Data Input:** On every BTC 15-min market update, scan the most recent candlestick
2. **Pattern Detection:** Identify patterns from the Candlestick Pattern Dictionary (Engulfing, Morning Star, Hammer, Shooting Star, etc.)
3. **Volume Confirmation:** Cross-reference pattern with volume trend:
   - Pattern + Volume UP (above 20-bar moving average) → **Strong signal**
   - Pattern + Volume DOWN or FLAT → **Weak signal (skip)**
4. **Decision Rules:**
   - **Bullish pattern + strong volume confirmation:** Place YES order at current best price
   - **Bearish pattern + strong volume confirmation:** Place NO order at current best price
   - **Conflicting signals (e.g., Engulfing Up but volume down):** Hold (no trade)
5. **Trade Sizing:** Fixed notional per trade ($X per order) until profitability is proven; then scale up
6. **Baseline Fallback:** If no patterns detected, use simple momentum (20-bar SMA crossover) as baseline:
   - Price > SMA 20 → slight YES bias
   - Price < SMA 20 → slight NO bias
7. **Performance Tracking & Adaptation:**
   - Track win rate per pattern over 50-trade sample
   - Disable patterns with <45% accuracy
   - Log every decision, pattern match, and outcome for training data
   - Incrementally add complexity only after baseline strategy is understood and profitable

**Candlestick Pattern Reference**

The following patterns inform Peritia's decision logic. Master these before expanding strategy.

Abandoned Baby
A rare reversal pattern characterized by a gap followed by a Doji, which is then followed by another gap in the opposite direction. The shadows on the Doji must completely gap below or above the shadows of the first and third day.

Dark Cloud Cover
A bearish reversal pattern that continues the uptrend with a long white body. The next day opens at a new high, then closes below the midpoint of the body of the first day.

Doji
Doji form when the open and close of a security are virtually equal. The length of the upper and lower shadows can vary, and the resulting candlestick looks like either a cross, inverted cross, or a plus sign. Doji convey a sense of indecision or tug-of-war between buyers and sellers. Prices move above and below the opening level during the session but close at or near the opening level.

Downside Tasuki Gap
A continuation pattern with a long, black body followed by another black body that has gapped below the first one. The third day is white and opens within the body of the second day, then closes in the gap between the first two days, but does not close the gap.

Dragonfly Doji
A Doji where the open and close price are at the high of the day. Like other Doji days, this one normally appears at market turning points.

Engulfing Pattern
A reversal pattern that can be bearish or bullish, depending upon whether it appears at the end of an uptrend (bearish engulfing pattern) or a downtrend (bullish engulfing pattern). The first day is characterized by a small body, followed by a day whose body completely engulfs the previous day's body and closes in the opposite direction of the trend. This pattern is similar to the outside reversal chart pattern, but does not require the entire range (high and low) to be engulfed, just the open and close.

Evening Doji Star
A three-day bearish reversal pattern similar to the Evening Star. The uptrend continues with a large white body. The next day opens higher, trades in a small range, then closes at its open (Doji). The next day closes below the midpoint of the body of the first day.

Evening Star
A bearish reversal pattern that continues an uptrend with a long white body day followed by a gapped up small body day, then a down close with the close below the midpoint of the first day.

Falling Three Methods
A bearish continuation pattern. A long black body is followed by three small body days, each fully contained within the range of the high and low of the first day. The fifth day closes at a new low.

Gravestone Doji
A doji line develops when the Doji is at, or very near, the low of the day.

Hammer
Hammer candlesticks form when a security moves significantly lower after the open but rallies to close well above the intraday low. The resulting candlestick looks like a square lollipop with a long stick. If this candlestick forms during a decline, it is called a Hammer.

Hanging Man
Hanging Man candlesticks form when a security moves significantly lower after the open but rallies to close well above the intraday low. The resulting candlestick looks like a square lollipop with a long stick. If this candlestick forms during an advance, it is called a Hanging Man.

Harami
A two-day pattern that has a small body day completely contained within the range of the previous body, and is the opposite color.

Harami Cross
A two-day pattern that's similar to the Harami. The difference is that the last day is a Doji.

Inverted Hammer
A one-day bullish reversal pattern. In a downtrend, the open is lower, then it trades higher, but closes near its open, therefore looking like an inverted lollipop.

Long Body / Long Day
A large price move from open to close, i.e., the length of the candle body is long.

Long-Legged Doji
This candlestick has long upper and lower shadows with the Doji in the middle of the day's trading range, clearly reflecting the indecision of traders.

Long Shadows
Candlesticks with a long upper shadow and short lower shadow indicate that buyers dominated during the first part of the session, bidding prices higher. Conversely, candlesticks with long lower shadows and short upper shadows indicate that sellers dominated during the first part of the session, driving prices lower.

Marubozu
A candlestick with no shadow extending from the body at the open, close, or both. The name means close-cropped or close-cut in Japanese, though other interpretations refer to it as Bald or Shaven Head.

Morning Doji Star
A three-day bullish reversal pattern that's similar to the Morning Star. The first day is in a downtrend with a long black body. The next day opens lower with a Doji with a small trading range. The last day closes above the midpoint of the first day.

Morning Star
A three-day bullish reversal pattern consisting of three candlesticks—a long-bodied black candle extending the current downtrend, a short middle candle that gapped down on the open, and a long-bodied white candle that gapped up on the open and closed above the midpoint of the body of the first day.

Piercing Line
A bullish two-day reversal pattern. The first day, in a downtrend, is a long black day. The next day opens at a new low, then closes above the midpoint of the body of the first day.

Rising Three Methods
A bullish continuation pattern in which a long white body is followed by three small body days, each fully contained within the range of the high and low of the first day. The fifth day closes at a new high.

Shooting Star
A single-day pattern that can appear in an uptrend. It opens higher, trades much higher, and then closes near its open. It looks just like the Inverted Hammer, except it's bearish.

Short Body / Short Day
A short day represents a small price move from open to close, where the length of the candle body is short.

Short body/short day candlestick pattern from StockCharts.com
Spinning Top
Candlestick lines that have small bodies with upper and lower shadows that exceed the length of the body. Spinning tops signal indecision.

Stars
A candlestick that gaps away from the previous candlestick is said to be in a star position. Depending on the previous candlestick, the star position candlestick gaps up or down and appears isolated from the previous price action.

Stick Sandwich
A bullish reversal pattern with two black bodies surrounding a white body. The closing prices of the two black bodies must be equal. A support price is apparent, and the probability for prices to reverse is high.

Three Black Crows
A bearish reversal pattern consists of three consecutive long black bodies where each day closes at or near its low and opens within the body of the previous day.

Three White Soldiers
A bullish reversal pattern consisting of three consecutive long white bodies. Each should open within the previous body, and the close should be near the high of the day.

Upside Gap Two Crows
A three-day bearish pattern that only happens in an uptrend. The first day is a long white body followed by a gap open with the small black body. The gap remains above the first day after the close. The third day is also a black candlestick with a body larger than the second day and engulfs it. The last day's close is still above the first long white day.

Upside Tasuki Gap
A continuation pattern with a long white body followed by another white body that has gapped above the first one. The third day is black and opens within the body of the second day, then closes in the gap between the first two days but does not close the gap.

### Ideas

- prime and peritia run as separate asyncio tasks in the backend. They never share state or interfere with each other.
- Both agents operate in Demo environment first. Neither touches Live until Demo performance is validated over a meaningful sample.
- prime is the control. Its job is to lose slowly or break even — establishing a baseline that peritia must beat to prove its strategy is real.
- peritia reads the BTC recurring series orderbook and recent trade history on every market update. Decisions are made from live data only, never cached assumptions.
- comparison data — win rate, fills, PnL, order count — is displayed side by side in the Bottom Bar P/L graph, one colored line per agent.
- All agents write or log every decision and its outcome to the database. This creates a training record even before any ML is involved.
- peritia's strategy should be developed incrementally: start with one simple signal, measure it, then add complexity only when the simpler version is understood.

#### API Key Auto-Fill

- Consider an `.env` file in root that the UI could read to auto-fill API key inputs
  - One set for Live keys, one set for Demo keys
- API keys could be cleared from memory on disconnect

#### Agent Activation on Key Entry

- As soon as API keys are successfully entered, agents could activate automatically in Semi-Auto mode
- In Semi-Auto, agents may need approval before buying Yes or No contracts
  - Agents do not need approval to sell Yes or No contracts

_End Chapter 4_

---

## _Chapter 5. Flight Studio_

### Superhero and Aircraft Flight Puget Sound Virtual Simulator.

- _`No Flight Plan` displayed until the agents make 2,000 dollars so we can develop this and play. Live view of the ISS video feeds if possible._
- ISS live feed (NASA HDEV or equivalent public stream) renders as a main viewport inside the cockpit, treated as the "window."
- Flight Sim can run while the rest of the interface — controls, agents, illumination — stays fully operational while flying.
- The Flight Sim is deliberately gated — must get the trading system working, flight sim is not a development priority.

---

## _Chapter 6. Converter Studio_

File converters, image converters, PDF filler, URL to MP3/MP4 converter.

Do not worry about developing until stage 2.5 is completed.

---

## _Chapter 7. Open Chapter_

- If adding, create brief checkboxes at the very bottom for new features, ideas, Et cetera.
  - If adding a complex idea, create multiple checkboxes and use nesting.

### Questions and Answers

- How does the backend run persistently? Is it a local process the user starts manually, a system service, or something that launches when the webpage opens? What happens if it crashes?

A: Right now this runs as a local always-on process. Until revenue and infrastructure budget justify managed hosting, the machine must stay online continuously. Later we can migrate the runtime to cloud infrastructure with supervised restart and persistent uptime.

- What is the profit withdrawal and risk management strategy? The agents will trade real money in Live mode — is there a max drawdown limit, a daily loss cap, or a stop condition before the account is emptied?

A: We trade in contracts. YES or NO. The only stop condition is if we are under 5 dollars. Simple. I trust the agents to make good decisions and see how their descisions are affecting our balance p/l while learning and getting positively reinforced and rewarded for being profitable.

- Where does this run? Is this a personal machine that stays on 24/7, a server, or a cloud instance? The backend needs to be always-on for agents to trade continuously.

A: Yeah the device has to be on until we get to a development point where we can get versions to run on cloud servers that stay on even when the device is off.

- What happens to theme and illumination state between sessions? Is it persisted in localStorage, the database, or reset every time the page loads?

A: Theme and illumination state reset everytime the page a new state is initialized. if the UI reopens, not refreshes, Styles always reset.
A: Theme and illumination state dont change when changing studios.
A: The backend never resets like that tho cause we need all our trading data to look back on.

- Beyond the three agents, what would more agents look like? Is the architecture designed to add agents easily, or would adding a third require significant refactoring?

A: 5 agents access cards aligned horizontally. the spots for 4 and 5 are 2 grayed out slots. these 2 grayed cards are less wide than the original 3 agent slots, all same height. Only focus on the 3 agents until they get good enough to clone and use the slots 4 and 5 for a/b testing and our initial a/b/c testing.

- The Bottom Bar needs to fit API key inputs, agent controls,and a Live/Demo indicator does it need a scrollable or expandable design?

A: No scroll; no expand. It will fit i promise. Pack everything creatively. This is a cockpit but it's only 1080p wide and 944 px tall so we gotta be creative. Cockpits are extremely packed with instruments, dials, screens, switches, indicators, lights, sticks, buttons, levers, knobs, rotary dials and countles more components.

- Semi-Auto mode is defined as a permission state for agents — but what does the approval flow actually look like? Does a trade intent pop up somewhere and wait for a click, and what happens if the user doesn't respond in time?

A: In semi-auto, the user will be watching on the front end, so an agent finds yes or no contracts they want to buy, then the series cards for those contracts appears at the top, with approve or deny buttons. also we need details of why they want to execute trade like a reason or a log for why they think this. they already should be logging, so here it can pull from that log and display it softly.

- The theme buttons in the Left Sidebar need to visually represent their own theme regardless of what's currently active — how does a Volcano button look while the Mosaic 1993 Light theme is selected?

A: If mosiac theme is active, and light mode is selected, the volcano button represents volcano light mode. If mosaic theme is active and dark mode is toggled, volcano button would represent volcano dark mode.

- Kalshi markets settle and expire constantly — what does the Trading Studio look like when a market the user was watching closes mid-session? Does the card disappear, grey out, or move?

A: Maybe they grey out until refresh is hit. Oh we need a series refresh or a market refresh button.

A: The cards are to ensure data is accurate in the backend, and to tell our agents yes/no in semi-auto. They are also mmeant to look exactly like kalshi, so when i screenshot, it looks like we're wrapped around kalshi or on top of kalshi with this dashboard so people understand better what is happening.

A: Only 18 are rendered, including the cards agents need confirmation on cause those would be brou8ght to the top.

- The Right Sidebar to-do list app — is it decorative, or should it persist notes between
  sessions and potentially connect to trading context like tagging a market or an agent decision?

A: it is fully funcational. make it so good that it would get you an A+ if you developed a to-do list app for a college test. local, saves txt files.

- The project is for personal use, but the backend Control API is a local HTTP server — is there any plan or risk of accidentally exposing it, and should there be a startup check that confirms it is only bound to `127.0.0.1`?

A: If this get's profitable we need to ship it to society that want their own pc app. so probably use docker. This will be open-scource and free.

Mode Selection vs Indicator Redundancy

"Live/Demo mode selection" and "Live/Demo Trading Mode Indicator Lights" - Are these the same component or different?

A: seperate because the live demo mode selection and text boxes for api input will dissapear after successfull connection so we will need an indicator

- The illumination system has a DAY/NVG toggle in the header — but NVG implies a specific color shift across the entire UI. Does NVG mode override the active theme's color palette entirely, or layer on top of it?

A: NVG is just a cool way to switch to dark mode - no additional effects.

- State Reconciliation runs every 60 minutes and on reconnect — but what does the UI show during a reconciliation cycle? Does trading pause, does a spinner appear, or does it happen silently in the background?

A: maybe a pulsing glowing blue-green indicator light showing its active and working properly, or a yellow or red color if not working properly

- Prime "follows the majority bets" — but on Kalshi, the orderbook only shows bids. What specific data point defines majority? Best yes bid size? Total open interest? Recent fill direction?

A: Maybe bets is supposed to say bids. We need to think about this. I guess calculate the total majority average buys and sells, and try to follow that as it happens? It's like betting on whatever the majority of that market is guessing because the majority group mind would have the closest answer.

- The series cards in Trading Studio show "information similar to Kalshi's cards" — but Kalshi's UI and API data shapes are different. What exact fields get displayed on each card, and where does each field come from in the API response?

A: Photos with examples for how kalshi's UI organizes and navigates the series cards. As close as we can realistically get. Never mock any data.

- The precision tools — rulers, grid, — are designed for the Design Studio. Do they stay visible or automatically hide when switching to Trading Studio or Flight Studio?

A: They stay visible

- Private API keys are typed into text inputs in the Bottom Bar. Is there a plan for how these are handled in memory — masked after entry, never logged, cleared on disconnect — or is key security left undefined?

A: I'm not sure, what would the majority of people want if this was released to everyone

- Prime is described as "betting on the majority bets" — but on Kalshi, the best bid/ask spread is the market. What specific orderbook signal defines the majority, and how stale is too stale to act on?

A: I dont know, use best judgment and try to follow majority volume. Bet/bid on the house.

- The backend reconciles state against Kalshi every 60 minutes and on reconnect — but what if reconciliation reveals a fill that the agent didn't intend, or a position that shouldn't exist? Is there an alert, an auto-cancel, or just a log entry?

A: I'm not sure what this means, maybe this needs to be thought about.

- The project is personal use only — but is there any plan to run multiple browser tabs or windows simultaneously? Would two open tabs cause duplicate agent commands or state conflicts through the Backend Control API?

A: If someone clicks our link for a desktop app, nobosdy's apps are connected, They get a beautiful shell that lets them easily interface actions for bots that connect to their personal kalshi accounts.

- Chapter 7 is defined as "New Ideas, Questions, Complaints, Hopes" — what is the actual workflow for moving something from Chapter 7 into a real chapter with checkboxes and specs? Who decides, and when?

A: We are doing tht right now. Little by little i will integrate these updated ideas and questions into the prd for future devs to review for clarification.

---

_End Chapter 7_

_End PRD_
