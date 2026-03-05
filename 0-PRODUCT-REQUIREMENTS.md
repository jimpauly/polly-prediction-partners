# **Polly Prediction Partners** - Product Requirements Document

https://github.com/jimpauly/polly-prediction-partners.git

Last update: 03-02-26

## *Chapter 0. Overview*

### Table of Contents:

- Chapter 0. Overview

    - Table of Contents
    - .md format
    - System Prompt
        - Role
        - Tasks
        - Tools
        - Guidelines
    - Philosophy
    - Main User Needs

- Chapter 1. Front End UI/UX

    - Front End Stack
    - WebPage
    - Themes
    - Illumination
    - Accessibility
    - UI/UX Polish

- Chapter 2. Back Ends

    - Back End Stack
    - Trading Engine Overview
    - State Reconciliation System
    - Market Discovery System
    - Backend Control API
    - Supporting Kalshi API Documents

- Chapter 3. Design Studio

    - Design Studio Overview

- Chapter 4. Trading Studio

    - Data Collection
    - Agent Interfaces
    - Trading Strategy
    - Agent Prime
    - Agent Peritia
    - Performance Metrics & Displays

- Chapter 5. SuperHero + Aircraft Flight-Sim

    - Flight Sim Overview

- Chapter 6. File Converter App

    - File Converter Overview

- Chapter 7. Brainstorming Space

    - Questions and Answers
    - Cool ideas

### Markdown Format:

| Symbol | Level |
| :----- | :---- |
| `#` | Book |
| `##` | Chapter |
| `###` | Verse |
| `####` | Section |
| `#####` | Topic |
| `######` | Detail |

### System Prompt:

#### Role:

1. You are a: Veteran Full-stack Programmer - with over 1,000 years experience in Software Engineering for Web Application Development, Design, and Maintenance.
2. You are an expert in using automated high-frequency trading algorithms/bots/agents for prediction market contracts on Kalshi.

#### Tasks:

- **1st Stage:**
    - Develop up to Design Studio.
- **2nd Stage:** (Main Goal)
    - Deeply develop our smart, reinforced-learning, super-profitable,high-frequency, full-auto trading-agent studio.
    - **2.5th Stage:** Reach shippable quality.
        - Windows and Mac Desktop apps with setup wizards.
        - Individuals with minimal technical background should be able to easily install and interface with their copy in less than 5 minutes.
        - Open-source, free-to-use, no-ads, all features available. 
    - Expect hundreds of tweaks/fixes/upgrades/polishings/refinements/improvements.
    - Do not ever ask for stage 3. Continue developing, refining, improving in step 2.5.
    - Close security holes. Close data leak possibilities. Critique security and fix.
- **Stage 3:**
    - Ask if main user has successfully gained efficient profits. If not, stay in Stage 2.5*
        - **Reminder:** 1st and 2nd stage **must be** 110% complete - shippable and exceeding industry-standard quality.
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
*End Chapter 0.*

## *Chapter 1. Front End*

### Front End Stack:

**Begin with:**

- JavaScript Vanilla
- Tailwind CSS
- HTML/HTMX

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

- **Viewport:** `1920px` wide × `944px` tall
    - Height accounts for taskbar, browser bars, etc. (not full `1080px`)
    - Region size, gutter size, and card size should remain fixed
    - Content within cards should shrink/expand on zoom
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

| # | Name | Size | Scroll |
| :- | :--- | :--- | :----- |
| 1 | Header | ~ 1/12th of viewport height | No Scroll |
| 2 | Nav Bar | ~ 1/24th of viewport height | No Scroll |
| 3 | Left Sidebar | ~ 1/6th of viewport width | Vertical only |
| 4 | Right Sidebar | ~ 1/6th of viewport width | Vertical only |
| 5 | Bottom Bar | ~ 1/6th of viewport height; ~ 4/6th of viewport width | Horizontal Scroll|
| 6 | Action Bar | ~ 1/6th of viewport height, one-third width of viewport | No Scroll |
| 7 | Main Stage | No fixed dimensions | Varies with studio |

#### Header Bar:

- **`Polly Prediction Partners`** — Beautiful, professionally designed header and title. Aligned left, vertically centered.
    - **Large Robot emoji**
    - **Illumination Control Panel** — Right-aligned, vertically centered. Looks like an overhead control panel. See photos for inspiration.
        - **Channels & Groups:** Chunky flip toggles and rotary dimmer dials.
        - **DAY/NVG:** Secondary light/dark toggle, tied to and equal with main light/dark circuit. Default: Day.
        - **Master:** Switch OFF; dimmer at max.
        - **Text:** Primary & secondary ON; dimmer at max.
        - **Bars:** Primary & secondary ON; dimmer at max.
        - **Flood:** ON; dimmer at max.
        - **Display:** ON; dimmer at max.
        - Ensure consistency in spacing and heights/sizes of switches and dials.
        - Everything set to ON and MAX except Master ON/OFF.
        - Once Master is flipped ON, full illumination effects applied.
        - Must be accurate to real physics and electronics for illumination controls.

#### Nav Bar:

- **No header** in nav bar
    - **`Navigation`** text label — Aligned left, vertically centered
    - **Studio Selector** — Card with chunky radio buttons for `Design`, `Trade`, `Fly`, `Convert`. Aligned left, vertically centered.
        - **Design:** Default studio. Creative modern webpage.
        - **Trading:** Trading active; main region switches to markets or series cards.
        - **Flight SIM:** Dashboard morphs into a cockpit (Agents must earn $2k profit to unlock).
            - **ISS live video feeds**
        - **Converter:** File converters, image converters, PDF filler, URL to MP3/MP4 converter.
    - **Telemetry** card — Aligned right, vertically centered
        - **PING:** Live `<canvas>` tiny sparkline using `navigator.connection.rtt` (calming, slow-smooth animation, real-time).
        - **SPD:** Static text `"MACH 4.20"` (only allowed mock data ever).
        - **DATE/TIME:** Real-time clock — Format `M/D` and 24-hour `HH:MM`. Exclude seconds (it's stressful).

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
- **22-Theme Selector Button Card**
    - Styled to represent each respective theme.
    - Affected by light and dark mode.
    - Button selectors accurately pull from and represent their theme regardless of current selection.
    - **When in light or day mode:** all theme buttons display in light mode.
    - **When in dark or night mode:** all theme buttons display in dark mode.
    - **Button styling:** `font-size: 12px`, padding `6px 2px 4px 2px`, `font-weight: 700`, centered.
- **Simple Visibility Toggles** for tools while developing
    - Accurate ruler and grid.

#### Right Sidebar:

- **`Inspector Panel`** header — Aligned top, centered
    - **`To-Do List` App** (card, `width: 100%`)
        - **Spiral Notebook** pages look like they're in or connected to a spiral notebook.
        - **Bold Text Toggle:** Small square button. Can bold H1 and Aa sizes.
        - **H1 / Aa Toggle:** H1 size default; auto-switch to regular Aa style after first paragraph.
        - **Bullet List Toggler** (icon button below notepad) — Toggling preserves other paragraph lines.
        - **Saves file** as `.txt` in Documents.
        - **Cannot load files**.
    - **Send-an-Idea Card**
        - Exports message in an email to `chickensaurusrex@outlook.com` for main user.
        - Display only the send-an-idea button (do not display email address).

#### Bottom Bar:

- **`Hangar Bay`** header — Aligned left, vertically centered
    - **`Agent Access`** card — For elements to control AI trading agents or algorithms
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

- **`Viewing Port`** header — Aligned top, centered

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
- **Series Cards:** 3 columns, full width of main region. Scroll down allowed.
    - Cards show information similar to Kalshi cards (see photos folder).
    - Tiny expand button in bottom right to expand card to fill main region.
    - After successful API key connection: collect as much data as allowed, as frequently as allowed.
    - Render only first 18 series cards to keep UI fast.
    - `Show More Markets` button at bottom loads additional 18 series cards.

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

| Theme Name           | Name Explanation                                                           |
| :------------------- | :------------------------------------------------------------------------- |
| Webpage Light        | 2026 webpage. Modern default. Diverse colors, professional   |
| Webpage Dark         | Modern default "Night Mode" reading. Like Google's dark mode |
| Mosaic 1993 Light    | Windows 3.1 Silver chrome, chiseled borders. Teal BG (0, 128, 128) |
| Mosaic 1993 Dark     | Exact inverse of Mosaic 1993 Light                          |
| Gen7 Cockpit Light   | Gen 7 Fighter. Dark Gull Gray (FS 36231), MFD Green          |
| Gen7 Cockpit Dark    | Night Vision/Stealth. Deep charcoal, NVG Green glow         |
| USSR Cockpit Light   | Soviet Cold War. MiG Turquoise (#3d90a2). Stress-reducing blue |
| USSR Cockpit Dark    | Night Intercept. Region bodies still (#3d90a2)              |
| Neon Vice 1985 Light | GTA Neon Vice Neon City. Miami pastels, linen suits, art deco pinks |
| Neon Vice 1985 Dark  | Ocean Drive Midnight. Misty purple haze, humid glow          |
| Neon City 2085 Light | 2085 Utopia. Hopeful, chromium, electric neon               |
| Neon City 2085 Dark  | 2085 Dystopia. Netrunner. Sharp laser edges                 |
| Coniforest Light     | Evergreens. Mt. Rainier (Cold green). Mist, Granite, Pine, Khaki |
| Coniforest Dark      | PNW Night. Deep evergreen, cold shadows, campfire ash        |
| Rainforest Light     | Amazon (Hot green). Humid, Pith Helmet Beige, Parrot Green  |
| Rainforest Dark      | Amazon Night. Deep canopy, bioluminescence, toxic accents   |
| Art Deco Light       | Roaring Twenties. Ivory, lacquer black, champagne gold, geometric trim |
| Art Deco Dark        | Ballroom. Piano black, brass lines, emerald accents, sharp symmetry |
| Holographic Light    | Iridescent daylight. Pearl base with shifting teal spectral shimmer |
| Holographic Dark     | Prism Noir. Charcoal base, spectral highlights, neon refraction edges |
| Vapor Light          | Pastel arcade sunrise. Mint, peach, sky blue haze, soft retro gradients |
| Vapor Dark           | Late-night vaporwave. Deep navy, hot pink, cyan glow, retro grid ambience |
| Paper Light          | The Office. Copier paper, toner black, ballpoint blue       |
| Paper Dark           | Carbon. Deep indigo, faint blue transfer text               |
| Ledger 1920 Light    | Wall St. Ledger. Manila folder, Banker Green, Typewriter    |
| Ledger 1920 Dark     | Jazz Moderne / Gatsby. Matte Black Cardstock, Gold Foil     |
| Blueprint Light      | Physical drafting table                                     |
| Blueprint Dark       | AutoCAD / Terminal Aesthetic. High contrast lines           |
| Chalkboard Light     | Greenboard. Chalk colors, aluminum                          |
| Chalkboard Dark      | Classic Blackboard. Slate Black, dusty white chalk          |
| Oceanic Light        | Maritime / Yacht Club. Navy Blue, White, Brass accents, coral |
| Oceanic Dark         | The Abyss. Crushing depth. Black-Blue, Coral, Bioluminescence |
| Volcano Light        | Active Caldera. Ash gray, Pumice, Sulfur, and Magma         |
| Volcano Dark         | Magma Chamber. Basalt black, flowing lava, heat shimmer     |
| Phosphor Light       | Dark terminal. P3 Amber CRT old computer                    |
| Phosphor Dark        | Dark terminal. Green Phosphor old computer, retro blur      |
| Steampunk Light      | Victorian Sci-Fi. Parchment, Brass, Mahogany, Steam         |
| Steampunk Dark       | London Fog. Gaslight, Soot, Dark Leather, Copper            |
| Dieselpunk Light     | WWI Trench. Khaki, Grease, Riveted Steel, Olive             |
| Dieselpunk Dark      | Noir City. Oily Steel, Smog, Grime, Weak Yellow Light       |
| Solarpunk Light      | Eco-Utopia. Cream ceramic, lush green, solar gold            |
| Solarpunk Dark       | Night Garden. Bioluminescence, deep teal, soft amber        |
| Stonepunk Light      | Bedrock Quarry. Sandstone, Slate, Leather, Clay             |
| Stonepunk Dark       | Cave Fire. Soot black, Torch Orange, Ash White              |
| Dreamcore Light      | Daydream. Pastel clouds, blinding light, nostalgia, Cotton Candy |
| Dreamcore Dark       | Nightmare. The Void, static noise, watching eyes            |
| Frutiger Aero Light  | Windows Vista / Web 2.0. Bubbly, Glossy, Sky Blue, Grass Green, Glass |
| Frutiger Aero Dark   | Midnight Aurora. Glassy Black, Glowing Cyan, Deep Blue     |

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

*Intentional misnaming preserved*

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
    - Illumination does not change when changing studio, mode, theme, or palette.
    - Other names: Overhead Control Panel. Lighting Control Panel. Lighting Panel. Lighting Interface.
    - **Physics model:** glow that spreads follows an inverse-square approximation
    - Dimmer dials' values: `.25` up to `1.00`.

#### Controls:

- Each layer/group has one On/Off Switch and one rotary Dimmer Dial.
- Text and Bar groups have two On/Off Switches and one dimmer dial.
    
    -  **DAY/NVG** - toggle is tied and equal to Light/Dark toggle.
        -  Visually flips to show which mode is currently active. The two modes override each other
    -  **Master** - global ON/OFF Illumination switch, OFF default; Global DIM Dial, DIM MAX default.
    -  **Text** - controls glow, luminance, and opacity for primary and secondary text groups; Find 100% of text elements and apply these effects.
        -  primary text — main content/headings/labels
        -  secondary text — descriptions/metadata/tertiary; effects — text-shadow glow, opacity modulation, luminance.
    -  **Bar** - Structural glow. two-tier border illumination system
        -  primary bars — all region border opacity and glow intensity; outer spread into gutter.
        -  secondary bars — all card border opacity and glow intensity; Outer spread into regions' areas.
    -  **Flood** - ambient fill within regions — controls opacity and brightness for atmospheric gradient centered wash over whole WebPage.
        - Simulated Post lights that flood their region with light.
    -  **Display** - self-illumination intensity display-like components; simulates LCD/LED or MFD displays.
        -   Displays are cards or content that are windows, dropdown menus, graphs, logs, etc.

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
- Apply effects to both light mode (`.6` limited intensity) and dark mode (`1.0` full intensity)
- Keep JavaScript state in sync with HTML attributes
- Update UI when state changes (don't just change state silently)
- Always apply: base rules → theme rules → mode rules → illumination rules
- Group variables by category
- Document variable purposes with brief dev notes in code
- Plan for scoped variables (component-level)
- Theme and illumination state persist when switching studios. They reset on new browser session
-  One `index.html`. Studio selector in Nav Bar switches state — no page reloads, no routing.
-  The Header, Nav, sidebars, Bottom and Action Bar never change between studios. Only Main Region's content changes.
-  Design Studio is the default landing state — our UI shows off itself with web design skills first.
-  Trading Studio activates when API keys are connected. The Main Region becomes a live data interface that resembles navigating Kalshi.
- Agents run in the backend regardless of which studio is active.
- Flight Studio is a reward state — the Main Region transforms into a cockpit. The rest of the interface stays functional. Agents keep trading in the background.
- All studios share the same theme, illumination, and precision tool state. Switching studios never resets any system design controls.

### UI/UX Polish:

- Visual Polish:

    -  Consistent spacing throughout
    -  Alignment perfection (use grid/flexbox)
    -  Smooth transitions/animations
    -  Loading states for async operations
    -  Empty states for no data
    -  Error states with helpful messages
    -  Success states with confirmation
    -  Et cetera

- UX Details:

    -  Hover states on all interactive elements
    -  Focus states clearly visible
    -  Active/pressed states
    -  Disabled states (visually distinct)
    -  Cursor changes appropriately
    -  Tooltips for unclear elements
    -  Confirmation for destructive actions
    -  Et cetera

- Microinteractions:

    -  Button press feedback
    -  Form validation feedback
    -  Success animations
    -  Progress indicators
    -  Page transitions
    -  Scroll behavior
    -  Et cetera

#### Accessibility:

- Semantic HTML:

    -  Use semantic elements (`<header>`, `<nav>`, `<main>`, `<article>`, etc.)
    -  Plan heading hierarchy (h1 → h2 → h3)
    -  Define landmark regions
    -  Use `<button>` for buttons, `<a>` for links
    -  Proper form labels and associations

- ARIA & Screen Readers:

    -  Add ARIA labels where needed (`aria-label`, `aria-labelledby`)
    -  Define live regions (`aria-live`, `aria-atomic`)
    -  Plan for focus management
    -  Add skip links for navigation
    -  Test with screen readers (NVDA, JAWS, VoiceOver)

- Keyboard Navigation:

    -  All interactive elements keyboard accessible
    -  Logical tab order
    -  Visible focus indicators
    -  Define keyboard shortcuts
    -  Trap focus in modals
    -  Escape key behavior

- Visual Accessibility:

    -  Meet WCAG contrast ratios (AA or AAA)
    -  Plan for color blindness
    -  Support browser zoom (up to 200%)
    -  Respect `prefers-color-scheme`
    -  Plan for high contrast mode


*End Chapter 1.*



---

## *Chapter 2. Back Ends*

### Back End Stack

-  **Language:** Python 3.14
-  **Package Manager:** pip + `requirements.txt`
-  **Primary Database:** PostgreSQL
-  **Database Platform:** Supabase
-  **Real-Time Transport:** WebSockets
-  **Async Runtime:** `asyncio`
-  **WebSocket Client:** `websockets`
-  **Database Driver:** `asyncpg`
-  **Official Kalshi SDK:** `kalshi-python` (handles auth, signing, REST wrappers)
-  **Environment config:** `.env` file + `python-dotenv`. Never commit secrets.
-  **Logging:** `logging` module with structured JSON output via `python-json-logger`.
-  **Build artifacts:** must live in `.artifacts/` to keep the project clean.

---

### Kalshi API Reference

#### Base URLs

| Environment | Base URL |
| :---------- | :------- |
| Live        | `https://api.elections.kalshi.com/trade-api/v2` |
| Demo        | `https://demo-api.kalshi.co/trade-api/v2` |

- The system must support both environments simultaneously via configuration.
- Live and Demo environments are fully separate.
- No state, keys, orders, or positions are shared between environments.
- The active environment is controlled by the Trading Permission Layer.

#### Authentication

Kalshi uses RSA-PSS asymmetric key authentication. Every request must be signed.

**Required Headers on every authenticated request:**

| Header | Value |
| :----- | :---- |
| `KALSHI-ACCESS-KEY` | Your API key ID (UUID string) |
| `KALSHI-ACCESS-SIGNATURE` | Base64-encoded RSA-PSS signature |
| `KALSHI-ACCESS-TIMESTAMP` | Current Unix timestamp in milliseconds (string) |

**Signature construction:**

1. Build the message string: `timestamp + method + path`
   - `timestamp` — millisecond Unix timestamp as a string (same value sent in header)
   - `method` — HTTP method, uppercase: `GET`, `POST`, `DELETE`
   - `path` — URL path only, no query string: `/trade-api/v2/portfolio/orders`
2. Sign the message using RSA-PSS with SHA-256 digest and the user's private RSA key.
3. Base64-encode the raw signature bytes.
4. Send as `KALSHI-ACCESS-SIGNATURE`.

**Example message string:**
```
1718300000000POST/trade-api/v2/portfolio/orders
```

**Python signing pseudocode:**
```python
import time, base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding

timestamp = str(int(time.time() * 1000))
message = (timestamp + method.upper() + path).encode("utf-8")
signature = private_key.sign(message, padding.PSS(
    mgf=padding.MGF1(hashes.SHA256()),
    salt_length=padding.PSS.DIGEST_LENGTH
), hashes.SHA256())
encoded = base64.b64encode(signature).decode("utf-8")
```

- The private key is a PEM-formatted RSA private key provided by Kalshi.
- The API Key ID is the UUID string shown in the Kalshi dashboard.
- Two key pairs must be stored: one for Live, one for Demo.
- Keys must never be stored in source code. Load from environment variables only.

#### REST Endpoints

All paths are relative to the base URL for the active environment.

##### Markets & Events

| Method | Path | Description |
| :----- | :--- | :---------- |
| `GET` | `/markets` | List all markets. Paginated via `cursor`. Supports filters. |
| `GET` | `/markets/{ticker}` | Get a single market by ticker. |
| `GET` | `/events` | List all events. Paginated. |
| `GET` | `/events/{event_ticker}` | Get a single event and its markets. |
| `GET` | `/series/{series_ticker}` | Get a series and associated events. |

Key query parameters for `/markets`:
- `status` — filter by market status: `open`, `closed`, `settled`
- `series_ticker` — filter by series
- `event_ticker` — filter by event
- `limit` — max records per page (max 1000)
- `cursor` — pagination cursor from previous response

Kalshi terminology note:
- A **Series** is a recurring group of events (e.g. recurring BTC price markets).
- An **Event** is a specific instance of a series (e.g. BTC price on Dec 16).
- A **Market** is a single yes/no contract within an event.
- Kalshi does not use the word `category` internally. Their UI shows categories but the API uses series and event tickers.

##### Portfolio & Orders

| Method | Path | Description |
| :----- | :--- | :---------- |
| `GET` | `/portfolio/balance` | Get current account balance. |
| `GET` | `/portfolio/positions` | Get all current positions. |
| `GET` | `/portfolio/orders` | Get open and historical orders. |
| `GET` | `/portfolio/orders/{order_id}` | Get a single order by ID. |
| `POST` | `/portfolio/orders` | Create a new order. |
| `DELETE` | `/portfolio/orders/{order_id}` | Cancel an open order. |
| `GET` | `/portfolio/fills` | Get fill history. |

##### Order Request Body

```json
{
  "ticker": "BTCZ-24DEC1600-T60000",
  "client_order_id": "your-unique-id",
  "type": "limit",
  "action": "buy",
  "side": "yes",
  "count": 10,
  "yes_price": 43
}
```

Field notes:
- `ticker` — the market ticker string.
- `client_order_id` — your own UUID. Used for idempotency. Required.
- `type` — `limit` or `market`.
- `action` — `buy` or `sell`.
- `side` — `yes` or `no`.
- `count` — number of contracts.
- `yes_price` — price in cents (integer, 1–99). For `no` side orders, use `no_price`.

##### Exchange Info

| Method | Path | Description |
| :----- | :--- | :---------- |
| `GET` | `/exchange/status` | Get exchange operational status. |
| `GET` | `/exchange/schedule` | Get trading hours. |

#### Fixed-Point Pricing

- All prices on Kalshi are integers representing cents.
- Price range: `1` to `99`.
- A `yes_price` of `43` means 43 cents per contract.
- Contracts pay out `$1.00` (100 cents) if they resolve YES, `$0.00` if NO.
- Implied probability = `yes_price / 100`.
- A `yes_price` of `43` implies a 43% probability of YES resolution.
- `no_price` = `100 - yes_price` always.
- Spread = `yes_ask - yes_bid`.
- Never use floats for price storage. Store all prices as integers.

#### Official Python SDK

Kalshi provides an official Python SDK: `kalshi-python`.

```
pip install kalshi-python
```

The SDK handles:
- RSA-PSS auth signing
- Header construction
- REST endpoint wrappers
- Basic request/response models

The SDK does **not** handle:
- WebSocket connection management
- Reconnection and resubscription logic
- Rate limiting and retry logic
- Local market cache
- Agent runtime

Use the SDK for REST calls. Write WebSocket handling manually using the `websockets` library.

#### Rate Limits
| :--- | :---- |
| REST reads (GET) | 20 requests per second |
| REST writes (POST, DELETE) | 10 requests per second |
| Order submission | 10 orders per second |
| WebSocket connections | 1 per API key |
| WebSocket subscriptions | Up to 10,000 market tickers per connection |

- Rate limit headers are returned in responses: `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- Exceeding limits returns HTTP `429 Too Many Requests`.
- The Execution Engine must track remaining budget and throttle accordingly.
- Orders must never be retried instantly on `429`. Implement exponential backoff.

#### Rate Limiting Strategy

The system implements two token buckets in the Execution Engine — one for reads, one for writes.

**Read Token Bucket (GET requests):**
- Capacity: 20 tokens
- Refill rate: 20 tokens per second
- Each GET request consumes 1 token

**Write Token Bucket (POST/DELETE requests):**
- Capacity: 10 tokens
- Refill rate: 10 tokens per second
- Each order submission or cancellation consumes 1 token

**Retry Logic:**

| Error | Strategy |
| :---- | :-------- |
| `429 Too Many Requests` | Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms. Max 5 retries. |
| `500 Internal Server Error` | Retry after 500ms. Max 3 retries. |
| `503 Service Unavailable` | Retry after 1000ms. Max 3 retries. |
| `Network timeout` | Retry after 250ms. Max 3 retries. |
| `400 Bad Request` | Do not retry. Log and discard. |
| `401 Unauthorized` | Do not retry. Alert system. Halt trading. |
| `404 Not Found` | Do not retry. Log and discard. |

- All retries must use the same `client_order_id` to ensure idempotency.
- If max retries exceeded, the order is marked as `FAILED` in the Persistence Layer.
- The UI is notified of failed orders via the Event Broadcast Interface.

---

### WebSocket Connection

#### WebSocket Endpoints

| Environment | WebSocket URL |
| :---------- | :------------ |
| Live        | `wss://api.elections.kalshi.com/trade-api/ws/v2` |
| Demo        | `wss://demo-api.kalshi.co/trade-api/ws/v2` |

#### WebSocket Authentication

After establishing the TCP connection, the client must immediately send a `login` command.

```json
{
  "id": 1,
  "cmd": "login",
  "params": {
    "api_key": "your-api-key-uuid",
    "signature": "base64-encoded-rsa-pss-signature",
    "timestamp": "1718300000000"
  }
}
```

- Signature is constructed identically to REST auth but with method `GET` and path `/trade-api/ws/v2`.
- If login fails, the server closes the connection.
- If login is not sent within a timeout period, the server closes the connection.
- After a successful login, the server responds with a confirmation message.

#### WebSocket Message Format

All WebSocket messages are JSON objects with this base structure:

**Client → Server (Commands):**
```json
{
  "id": 1,
  "cmd": "subscribe",
  "params": { }
}
```

**Server → Client (Messages):**
```json
{
  "id": 1,
  "type": "subscribed",
  "msg": { }
}
```

- `id` is an integer you assign. Responses echo your `id` back.
- Increment `id` for each new command sent.
- Server-pushed updates use `id: 0`.

#### WebSocket Channels & Subscription Format

##### Subscribing to Channels

```json
{
  "id": 2,
  "cmd": "subscribe",
  "params": {
    "channels": ["ticker"],
    "market_tickers": ["BTCZ-24DEC1600-T60000", "HIGHNY-24DEC-T75"]
  }
}
```

- Multiple channels may be included in a single subscribe command.
- Multiple market tickers may be included in a single subscribe command.
- Up to 10,000 market tickers per WebSocket connection.
- Subscriptions are additive. Re-subscribing does not cancel previous subscriptions.

##### Unsubscribing from Channels

```json
{
  "id": 3,
  "cmd": "unsubscribe",
  "params": {
    "channels": ["ticker"],
    "market_tickers": ["BTCZ-24DEC1600-T60000"]
  }
}
```

##### Channel Reference

| Channel | Scope | Description |
| :------ | :---- | :---------- |
| `ticker` | Public | Best bid/ask and last price updates per market. |
| `orderbook_delta` | Public | Incremental orderbook changes per market. |
| `trade` | Public | Public trades executed on the exchange. |
| `market_lifecycle` | Public | Market open, close, halt, and settlement events. |
| `user:order` | Private | Updates to your own orders (created, filled, cancelled). |
| `user:fill` | Private | Your fill events. |
| `user:position` | Private | Your position changes. |

- Private channels (`user:*`) require successful login before subscribing.
- Public channels do not require login but login is still recommended for a single persistent connection.

##### Channel Message Shapes

**`ticker` update:**
```json
{
  "type": "ticker",
  "msg": {
    "market_ticker": "BTCZ-24DEC1600-T60000",
    "yes_bid": 42,
    "yes_ask": 44,
    "last_price": 43,
    "volume": 1200,
    "open_interest": 340,
    "ts": 1718300000000
  }
}
```
> ⚠️ **Verify before building:** The `ticker` channel may return `yes_ask` as a convenience field directly. If so, use it directly and skip the derivation for ticker updates only. The orderbook reciprocity rule (no asks, derive from opposing bids) applies to `orderbook_delta` channel data. Confirm actual `ticker` payload shape against live docs before trusting derived vs direct.

**`orderbook_delta` — snapshot then deltas:**

The first message after subscribing to `orderbook_delta` for a market is a **full snapshot** of the current orderbook. All subsequent messages are incremental deltas.

```json
{
  "type": "orderbook_delta",
  "msg": {
    "market_ticker": "BTCZ-24DEC1600-T60000",
    "seq": 101,
    "yes": [[43, 50], [42, 120]],
    "no": [[57, 80], [58, 200]]
  }
}
```
- On first message (`seq` = 1 or low): treat as full orderbook state. Replace any existing local orderbook entirely.
- On subsequent messages: apply as incremental updates. A quantity of `0` means remove that price level.
- `yes` and `no` arrays contain only **bids** for each side. `[price, quantity]` pairs.
- `no_bid` prices imply `yes_ask` prices via reciprocity: `yes_ask_level = 100 - no_bid_price`.

**`trade` update:**
```json
{
  "type": "trade",
  "msg": {
    "market_ticker": "BTCZ-24DEC1600-T60000",
    "yes_price": 43,
    "count": 10,
    "taker_side": "yes",
    "ts": 1718300000000
  }
}
```

**`market_lifecycle` update:**
```json
{
  "type": "market_lifecycle",
  "msg": {
    "market_ticker": "BTCZ-24DEC1600-T60000",
    "status": "closed",
    "ts": 1718300000000
  }
}
```

**`user:order` update:**
```json
{
  "type": "user:order",
  "msg": {
    "order_id": "uuid",
    "client_order_id": "your-uuid",
    "market_ticker": "BTCZ-24DEC1600-T60000",
    "action": "buy",
    "side": "yes",
    "type": "limit",
    "yes_price": 43,
    "count": 10,
    "remaining_count": 5,
    "status": "resting",
    "ts": 1718300000000
  }
}
```

**`user:fill` update:**
```json
{
  "type": "user:fill",
  "msg": {
    "fill_id": "uuid",
    "order_id": "uuid",
    "market_ticker": "BTCZ-24DEC1600-T60000",
    "action": "buy",
    "side": "yes",
    "yes_price": 43,
    "count": 5,
    "is_taker": true,
    "ts": 1718300000000
  }
}
```

#### Connection Keep-Alive

- Kalshi expects a heartbeat ping every 10 seconds.
- The client sends:
```json
{ "id": 99, "cmd": "ping" }
```
- The server responds:
```json
{ "id": 99, "type": "pong" }
```
- If no pong is received within 5 seconds, assume the connection is dead.
- Reconnect immediately with exponential backoff: 500ms, 1s, 2s, 4s, 8s, max 30s.
- After reconnect, re-login and re-subscribe to all previous channels.
- Track all active subscriptions in memory so they can be restored after reconnect.

#### Orderbook Sequence Gap Detection

- Every `orderbook_delta` message includes a `seq` field.
- On first message for a market, record `seq` as the baseline.
- Each subsequent message must have `seq = previous_seq + 1`.
- If a gap is detected, the local orderbook is in an inconsistent state.
- On gap detection: discard local orderbook for that market, re-subscribe, and rebuild from new snapshots.

---

### Trading Engine Overview

The Trading Engine runs independently of the UI and continues operating even when the UI is closed.

The Trading Engine is the continuously running backend system responsible for:
- Ingesting live market data from Kalshi WebSocket
- Maintaining a local state cache
- Running trading agents
- Executing trades on Kalshi via REST API
- Persisting all trading activity to PostgreSQL

**Data flow:**
```
Kalshi WebSocket
    → WebSocket Data Ingestion Layer
        → Local Market Cache
            → Agent Runtime System
                → Trading Permission Layer
                    → Execution Engine
                        → Kalshi REST API
                            → Persistence Layer
                                → Backend Control API
                                    → UI
```

The Trading Engine is event-driven. Agents react to market updates, not polling timers.
The Trading Engine must be capable of running continuously for days without interruption.

---

### WebSocket Data Ingestion Layer

- Maintains a single persistent WebSocket connection per environment (Live or Demo).
- Responsible for: login, subscription management, keep-alive, reconnection, and message routing.
- Must never block. All incoming messages processed asynchronously via `asyncio` and an `asyncio.Queue`.
- No trading logic exists in this layer.
- On message receipt: validate JSON structure, identify channel type, forward to Local Market Cache via the async queue.
- On connection drop: log event, begin reconnect with backoff, restore all subscriptions after reconnect.
- Tracks all active subscriptions in a Python `set` of `(channel, market_ticker)` tuples for restoration.

---

### Local Market Cache

The Local Market Cache is an in-memory data store that maintains the latest known state of all subscribed markets.

- Single source of truth for all agents and the Backend Control API.
- Updated exclusively by the WebSocket Data Ingestion Layer.
- Agents and the UI only read from this cache. They never write to it.
- Cache is a Python `dict` keyed by `market_ticker`, protected by an `asyncio.Lock`.
- Reads are fast. Writes acquire the lock briefly to update a single entry atomically.
- Cache must support at least 40,000 market entries simultaneously (covering the full Kalshi market universe including BTC recurring series).

#### Orderbook Reciprocity

Kalshi orderbooks only expose **bids**. There are no ask fields. Asks are derived from the opposing side's bids.

- `yes_ask` does not exist as a field. It is implied: `yes_ask = 100 - best_no_bid`.
- `no_ask` does not exist as a field. It is implied: `no_ask = 100 - best_yes_bid`.
- **Spread** = `(100 - best_no_bid) - best_yes_bid`
- A yes bid at 60¢ is functionally a no ask at 40¢.
- Never store or display `yes_ask` or `no_ask` as raw API values. Always compute them.

**MarketState dataclass:**
```python
from dataclasses import dataclass, field
from collections import deque
from typing import Optional

@dataclass
class MarketState:
    market_ticker: str
    event_ticker: str
    series_ticker: str
    market_status: str          # "open", "closed", "settled", "halted"
    yes_bid: int                # direct from API, cents
    no_bid: int                 # direct from API, cents
    yes_ask: int                # derived: 100 - no_bid
    no_ask: int                 # derived: 100 - yes_bid
    last_price: int
    volume: int
    open_interest: int
    spread: int                 # derived: yes_ask - yes_bid
    midpoint: float             # derived: (yes_bid + yes_ask) / 2.0
    implied_probability: float  # derived: yes_bid / 100.0
    last_updated_timestamp: int # unix millis
    orderbook: Optional[dict] = None
    recent_trades: deque = field(default_factory=lambda: deque(maxlen=100))
```

- Derived fields (`spread`, `midpoint`, `implied_probability`) are computed on each cache write, not by agents.
- `recent_trades` is a fixed-length circular buffer (last 100 trades per market).

---

### Market Discovery System

The Market Discovery System discovers, loads, and continuously maintains the universe of available Kalshi markets.

- Runs at system startup and on a configurable polling interval (default: every 5 minutes).
- Uses Kalshi REST API `GET /markets` and `GET /events` with pagination.
- Paginates using the `cursor` field until all markets are retrieved.
- Stores all discovered markets in the Persistence Layer.
- Determines which markets to subscribe to in the WebSocket Data Ingestion Layer.
- Automatically detects new markets and subscribes them without system restart.
- Marks expired or settled markets as `INACTIVE`.

**Market internal states:**

| State | Meaning |
| :---- | :------ |
| `ACTIVE` | Open and tradable. Subscribed via WebSocket. |
| `WATCHLIST` | Strategically relevant. Subscribed via WebSocket. Agents prioritize. |
| `INACTIVE` | Closed, settled, or expired. Not subscribed. Kept in DB for history. |
| `IGNORED` | Intentionally excluded by configuration. Never subscribed. |

- Market Discovery drives WebSocket subscription list.

---

### Agent Runtime System

The Agent Runtime System manages all trading agents and controls their execution lifecycle.

- Agents are independent, asynchronous decision-making units.
- Each agent runs as its own `asyncio.Task`.
- Agents read from the Local Market Cache and produce trade intents.
- Agents do not communicate directly with Kalshi.
- Agents do not write to the Local Market Cache.
- Agents must fail safely. An unhandled exception in one agent must not crash other agents.

**Agent execution loop:**
1. Wait for a market cache update notification (via a broadcast channel).
2. Read relevant markets from Local Market Cache.
3. Evaluate internal trading logic.
4. Optionally produce a `TradeIntent`.
5. Send `TradeIntent` to Trading Permission Layer.
6. Update internal agent state.
7. Return to step 1.

**TradeIntent dataclass:**
```python
from dataclasses import dataclass
from uuid import UUID
import time

@dataclass
class TradeIntent:
    agent_id: UUID
    client_order_id: UUID   # pre-generated for idempotency
    market_ticker: str
    action: str             # "buy" or "sell"
    side: str               # "yes" or "no"
    order_type: str         # "limit" or "market"
    price: int              # cents, 1-99
    count: int              # number of contracts
    confidence: float       # agent's internal score, 0.0-1.0
    generated_at: int = field(default_factory=lambda: int(time.time() * 1000))
```

**Agent lifecycle states:**

| State | Meaning |
| :---- | :------ |
| `INITIALIZING` | Loading config and preparing resources. |
| `ACTIVE` | Monitoring markets and generating decisions. |
| `IDLE` | Running but not currently generating decisions. |
| `PAUSED` | Suspended by user or system command. |
| `ERROR` | Encountered a failure. Awaiting recovery or restart. |
| `STOPPED` | Fully shut down. |

**Agent Registry** stores per agent:
- `agent_id` (UUID)
- `agent_name`
- `enabled` (bool)
- `mode` (`Auto`, `SemiAuto`, `FullStop`)
- `configuration` (JSON blob)
- `created_at` timestamp
- `last_decision_at` timestamp

On system startup, the Agent Runtime loads all agents from the Agent Registry in the Persistence Layer.

---

### Trading Permission Layer

The Trading Permission Layer is a gate between the Agent Runtime System and the Execution Engine.

- All trade intents must pass through this layer before any execution.
- This layer enforces three levels of permission:

| Level | Check |
| :---- | :---- |
| Global | Is global trading enabled? |
| Environment | Is the environment configured (Live or Demo)? Are API keys loaded? |
| Agent | Is this specific agent in `Auto` mode? |

- If any check fails, the trade intent is silently dropped (no error to agent).
- Agents may continue running and generating intents even when trading is disabled.
- The global kill switch immediately halts all trading. No queued intents proceed.
- The Trading Permission Layer state is controlled by the Backend Control API.

---

### Execution Engine

The Execution Engine is the only component allowed to send orders to Kalshi.

**Execution flow:**
1. Receive `TradeIntent` from Trading Permission Layer.
2. Validate intent fields (price range, count > 0, valid ticker).
3. Check for duplicate `client_order_id` (idempotency guard).
4. Acquire rate limit token from token bucket.
5. Construct Kalshi REST order request body.
6. Build authentication headers (sign with active environment's private key).
7. Submit `POST /portfolio/orders` to Kalshi.
8. On success: store order in Persistence Layer, notify Backend Control API.
9. On failure: apply retry logic, mark as `FAILED` if retries exhausted.

The Execution Engine maintains in-memory records of:
- Open orders (indexed by `order_id` and `client_order_id`)
- Recent fills
- Current positions (updated via `user:fill` and `user:position` WebSocket channels)
- Realized PnL per agent
- Unrealized PnL per market

On system startup, Execution Engine loads open orders and positions from Persistence Layer, then reconciles against Kalshi via State Reconciliation System.

---

### State Reconciliation System

The State Reconciliation System ensures local state matches Kalshi state after startups, restarts, or network failures.

**Reconciliation steps:**
1. Load local open orders from Persistence Layer.
2. Fetch open orders from Kalshi `GET /portfolio/orders`.
3. Compare order IDs. Mark locally-open orders not found on Kalshi as `CANCELLED` or `FILLED`.
4. Load local positions from Persistence Layer.
5. Fetch positions from Kalshi `GET /portfolio/positions`.
6. Overwrite local positions with Kalshi values. Kalshi is always source of truth.
7. Fetch recent fills from `GET /portfolio/fills` and backfill any missing fill records.
8. Log all discrepancies found.

Reconciliation runs:
- Once at system startup (before agents are activated).
- Once every 60 minutes during runtime.
- Immediately after any detected WebSocket reconnection.

---

### Persistence Layer

The Persistence Layer uses PostgreSQL (via Supabase) as permanent storage for all trading activity.

- All writes are asynchronous. The Persistence Layer must never block the Execution Engine.
- All database access uses `asyncpg` for async PostgreSQL queries.
- Live and Demo environments use separate database schemas (`live` and `demo`).

#### Database Schema

##### Markets Table

```sql
CREATE TABLE markets (
    market_ticker       TEXT PRIMARY KEY,
    event_ticker        TEXT NOT NULL,
    series_ticker       TEXT NOT NULL,
    title               TEXT NOT NULL,
    subtitle            TEXT,
    market_status       TEXT NOT NULL,       -- OPEN, CLOSED, SETTLED, HALTED
    open_time           TIMESTAMPTZ,
    close_time          TIMESTAMPTZ,
    settlement_price    SMALLINT,            -- cents, nullable until settled
    internal_state      TEXT NOT NULL        -- ACTIVE, WATCHLIST, INACTIVE, IGNORED
        DEFAULT 'ACTIVE',
    discovery_time      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_sync_time      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_markets_series ON markets (series_ticker);
CREATE INDEX idx_markets_status ON markets (market_status);
CREATE INDEX idx_markets_internal_state ON markets (internal_state);
```

##### Orders Table

```sql
CREATE TABLE orders (
    order_id            UUID PRIMARY KEY,
    client_order_id     UUID NOT NULL UNIQUE,
    agent_id            UUID NOT NULL,
    market_ticker       TEXT NOT NULL REFERENCES markets (market_ticker),
    action              TEXT NOT NULL,       -- buy, sell
    side                TEXT NOT NULL,       -- yes, no
    order_type          TEXT NOT NULL,       -- limit, market
    price               SMALLINT NOT NULL,   -- cents, 1-99
    count               INTEGER NOT NULL,
    remaining_count     INTEGER NOT NULL,
    status              TEXT NOT NULL,       -- pending, resting, filled, cancelled, failed
    environment         TEXT NOT NULL,       -- live, demo
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_agent ON orders (agent_id);
CREATE INDEX idx_orders_market ON orders (market_ticker);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_environment ON orders (environment);
```

##### Fills Table

```sql
CREATE TABLE fills (
    fill_id             UUID PRIMARY KEY,
    order_id            UUID NOT NULL REFERENCES orders (order_id),
    market_ticker       TEXT NOT NULL REFERENCES markets (market_ticker),
    action              TEXT NOT NULL,       -- buy, sell
    side                TEXT NOT NULL,       -- yes, no
    price               SMALLINT NOT NULL,   -- cents
    count               INTEGER NOT NULL,
    is_taker            BOOLEAN NOT NULL,
    environment         TEXT NOT NULL,       -- live, demo
    filled_at           TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_fills_order ON fills (order_id);
CREATE INDEX idx_fills_market ON fills (market_ticker);
CREATE INDEX idx_fills_environment ON fills (environment);
```

##### Positions Table

```sql
CREATE TABLE positions (
    market_ticker       TEXT NOT NULL,
    environment         TEXT NOT NULL,       -- live, demo
    yes_count           INTEGER NOT NULL DEFAULT 0,
    no_count            INTEGER NOT NULL DEFAULT 0,
    average_yes_price   SMALLINT,            -- cents
    average_no_price    SMALLINT,            -- cents
    realized_pnl        INTEGER NOT NULL DEFAULT 0,    -- cents
    unrealized_pnl      INTEGER NOT NULL DEFAULT 0,    -- cents
    last_updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (market_ticker, environment)
);
```

##### Agent State Table

```sql
CREATE TABLE agent_state (
    agent_id                UUID PRIMARY KEY,
    agent_name              TEXT NOT NULL,
    enabled                 BOOLEAN NOT NULL DEFAULT false,
    mode                    TEXT NOT NULL DEFAULT 'FullStop',  -- Auto, SemiAuto, FullStop
    configuration           JSONB NOT NULL DEFAULT '{}',
    lifecycle_state         TEXT NOT NULL DEFAULT 'STOPPED',
    last_decision_at        TIMESTAMPTZ,
    internal_state_blob     JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

##### System Config Table

```sql
CREATE TABLE system_config (
    config_key      TEXT PRIMARY KEY,
    config_value    TEXT NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Example rows (never store actual key values in code):
-- INSERT INTO system_config VALUES ('active_environment', 'demo', now());
-- INSERT INTO system_config VALUES ('global_trading_enabled', 'false', now());
```

---

### Backend Control API

The Backend Control API is a local HTTP server (bound to `127.0.0.1`) that the UI communicates with.

- Must never be exposed to the internet.
- Accepts commands from the UI and forwards them to backend systems.
- Streams backend events to the UI via Server-Sent Events (SSE) or a local WebSocket.
- Does not contain trading logic.
- Does not communicate directly with Kalshi.

#### Control Commands

**Agent commands:**
```
POST /control/agents/{agent_id}/start
POST /control/agents/{agent_id}/stop
POST /control/agents/{agent_id}/pause
POST /control/agents/{agent_id}/set_mode     body: { "mode": "Auto" | "SemiAuto" | "FullStop" }
POST /control/agents/{agent_id}/enable
POST /control/agents/{agent_id}/disable
```

**Trading commands:**
```
POST /control/trading/enable
POST /control/trading/disable
```

**System commands:**
```
POST /control/keys/connect     body: { "environment": "live"|"demo", "api_key": "...", "private_key": "..." }
POST /control/keys/disconnect  body: { "environment": "live"|"demo" }
POST /control/environment/set  body: { "environment": "live"|"demo" }
```

#### State Query Interface (Read-Only)

```
GET /state/agents
GET /state/agents/{agent_id}
GET /state/positions
GET /state/orders?status=open
GET /state/orders/{order_id}
GET /state/fills?limit=50
GET /state/markets?status=open&limit=20&cursor=...
GET /state/balance
GET /state/system
```

System state response:
```json
{
  "environment": "demo",
  "global_trading_enabled": false,
  "websocket_connected": true,
  "api_keys_loaded": true,
  "markets_discovered": 40213,
  "active_agents": 2,
  "uptime_seconds": 3600
}
```

#### Event Broadcast Interface

The Backend Control API pushes live events to the UI via a local WebSocket at `/events`.

Events broadcast:

| Event Type | Trigger |
| :--------- | :------ |
| `market_update` | Local Market Cache updated for a subscribed market. |
| `agent_decision` | An agent produced a TradeIntent. |
| `order_submitted` | Execution Engine submitted an order to Kalshi. |
| `order_filled` | A fill was received for an open order. |
| `order_cancelled` | An order was cancelled. |
| `order_failed` | An order failed after all retries. |
| `position_update` | A position changed. |
| `agent_state_change` | An agent changed lifecycle state. |
| `system_status` | Connection status, environment changes, kill switch events. |
| `reconciliation_complete` | State Reconciliation finished a cycle. |

- The UI must never be the source of truth. These events are one-way: backend → UI.
- The backend continues operating if the UI disconnects.

---

### Live vs Demo Environment Isolation

- Live and Demo are fully isolated.
- Separate API keys per environment.
- Separate WebSocket connections per environment (one per environment, not per agent).
- Separate database schemas in PostgreSQL: `live.*` and `demo.*` table prefixes.
- Separate Local Market Cache instances (or a single cache keyed by `(ticker, environment)`).
- Separate PnL tracking per environment.
- The active environment for the UI display is controlled by a toggle in the Backend Control API.
- An agent may be assigned to one or both environments via configuration.
- Data from Live and Demo must never be mixed in any table or display.

---

### BTC Recurring Series Note

- The recurring BTC price yes/no series is one of Kalshi's highest-volume recurring series.
- It exists deep in the market list — potentially past market index 40,000.
- The Market Discovery System must paginate through the full market list to discover it.
- Once discovered, its series ticker must be stored and used to subscribe to all active event markets within that series.
- Agent peritia is specifically designed to operate on this series.
- Pagination must be robust: retrieve all pages, handle cursor expiry, retry on failure.
- This is primary primary goal

---

*End Chapter 2*



---

## *Chapter 3. Design Studio*

- Default State showing off our pretty main region and all our cool control interfaces.
- This isn't too complicated so it doesn't need it's own chapter.
- see ##### Design Studio for details

## *Chapter 4. Trading Studio*

- The entire reason why we are doing this: To make money.
- Three Agents at first. Seperate environments to avoid cross-contamination of performance.

### Agent Interfaces

-  Agents will mostly be interfaced through their Agent Access content card in the bottom bar.
- interfaces for approval/deny bids in semi-auto

#### Full-Auto

-  No approval needed to execute buys/sells.

#### Semi-Auto Approval Flow

-  Semi-Auto approval flow could surface the relevant series card at the top of Trading Studio
    -  Card could include approve and deny buttons
    -  Card could show the agent's reasoning for wanting to execute the trade
-  Agents could request approval before buying Yes or No contracts
-  Agents could sell Yes or No contracts without requiring approval

### Trading Strategy

- High high Frequency, multiple yes/no buy/sell per minute.
- The only hard stop condition could be an account balance under $5
- only series that close in less than 3 days
- might have to scan up to 40k series
    
### Agent Prime

- Default, Normal
- Literally just follows the other traders. Basically betting on the majority bets.
- Should be able to access and analyze and bet on every market.
- Majority Signal Logic
    -  prime could watch total buy and sell volume direction within each minute
    -  prime could place bets aligned with whichever side the majority is trading in that window
    -  This idea is that the group consensus of a market tends toward the most accurate answer

### Agent Praxis

- this one only goes for the markets that are sports.
- its going to get really good at at sports

### Agent Peritia

- We will put heart into this one and try to get this one to focus on the 15 minute recurring BTC price up/down yes/no series.
- This is the main main main main #1 goal of this project.
- Eventually will be really good at all the crypto.
- uses candlestick patterns to inform decision making

- Candlestick Pattern Dictionary
Explore the comprehensive Candlestick Pattern Dictionary from StockCharts' ChartSchool. Master the art of candlestick patterns and make confident trading decisions.

The StockCharts Candlestick Pattern Dictionary provides brief descriptions of many common candlestick patterns.

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

-  prime and peritia run as separate asyncio tasks in the backend. They never share state or interfere with each other.
-  Both agents operate in Demo environment first. Neither touches Live until Demo performance is validated over a meaningful sample.
-  prime is the control. Its job is to lose slowly or break even — establishing a baseline that peritia must beat to prove its strategy is real.
-  peritia reads the BTC recurring series orderbook and recent trade history on every market update. Decisions are made from live data only, never cached assumptions.
- comparison data — win rate, fills, PnL, order count — is displayed side by side in the Bottom Bar P/L graph, one colored line per agent.
-  All agents write or log every decision and its outcome to the database. This creates a training record even before any ML is involved.
-  peritia's strategy should be developed incrementally: start with one simple signal, measure it, then add complexity only when the simpler version is understood.

#### API Key Auto-Fill

-  Consider an `.env` file in root that the UI could read to auto-fill API key inputs
    -  One set for Live keys, one set for Demo keys
-  API keys could be cleared from memory on disconnect

#### Agent Activation on Key Entry

-  As soon as API keys are successfully entered, agents could activate automatically in Semi-Auto mode
-  In Semi-Auto, agents may need approval before buying Yes or No contracts
    -  Agents do not need approval to sell Yes or No contracts

*End Chapter 4*

---

## *Chapter 5. Flight Studio*

### Superhero and Aircraft Flight Puget Sound Virtual Simulator.

-  *`No Flight Plan` displayed until the agents make 2,000 dollars so we can develop this and play. Live view of the ISS video feeds if possible.*
-   ISS live feed (NASA HDEV or equivalent public stream) renders as a main viewport inside the cockpit, treated as the "window."
-  Flight Sim can run while the rest of the interface — controls, agents, illumination — stays fully operational while flying.
-  The Flight Sim is deliberately gated — must get the trading system working, flight sim is not a development priority.

---

## *Chapter 6. Converter Studio*

File converters, image converters, PDF filler, URL to MP3/MP4 converter.

Do not worry about developing until stage 2.5 is completed.

---

## *Chapter 7. Open Chapter*

- If adding, create brief checkboxes at the very bottom for new features, ideas, Et cetera.
    - If adding a complex idea, create multiple checkboxes and use nesting.

### Questions and Answers

-  How does the backend run persistently? Is it a local process the user starts manually, a system service, or something that launches when the webpage opens? What happens if it crashes?

A: I have no idea yet. Until version 0.02.01 (Once we get profitable), We will need to figure out how to keep this running, even when my laptop is off. If it is easier, i can have my laptop on 24/7 until we develop a more complex system for v0.03.01. But that isn't until way later.

-  What is the profit withdrawal and risk management strategy? The agents will trade real money in Live mode — is there a max drawdown limit, a daily loss cap, or a stop condition before the account is emptied?

A: We trade in contracts. YES or NO. The only stop condition is if we are under 5 dollars. Simple. I trust the agents to make good decisions and see how their descisions are affecting our balance p/l while learning and getting positively reinforced and rewarded for being profitable.

-  Where does this run? Is this a personal machine that stays on 24/7, a server, or a cloud instance? The backend needs to be always-on for agents to trade continuously.

A: Yeah the device has to be on until we get to a development point where we can get versions to run on cloud servers that stay on even when the device is off.

-  What happens to theme and illumination state between sessions? Is it persisted in localStorage, the database, or reset every time the page loads?

A: Theme and illumination state reset everytime the page a new state is initialized. if the UI reopens, not refreshes, Styles always reset.
A: Theme and illumination state dont change when changing studios.
A: The backend never resets like that tho cause we need all our trading data to look back on.

-  Beyond the three agents, what would more agents look like? Is the architecture designed to add agents easily, or would adding a third require significant refactoring?

A: 5 agents access cards aligned horizontally. the spots for 4 and 5 are 2 grayed out slots. these 2 grayed cards are less wide than the original 3 agent slots, all same height. Only focus on the 3 agents until they get good enough to clone and use the slots 4 and 5 for a/b testing and our initial a/b/c testing.

- The Bottom Bar needs to fit API key inputs, agent controls,and a Live/Demo indicator does it need a scrollable or expandable design?

A: No scroll; no expand. It will fit i promise. Pack everything creatively. This is a cockpit but it's only 1080p wide and 944 px tall so we gotta be creative. Cockpits are extremely packed with instruments, dials, screens, switches, indicators, lights, sticks, buttons, levers, knobs, rotary dials and countles more components.

-  Semi-Auto mode is defined as a permission state for agents — but what does the approval flow actually look like? Does a trade intent pop up somewhere and wait for a click, and what happens if the user doesn't respond in time?

A: In semi-auto, the user will be watching on the front end, so an agent finds yes or no contracts they want to buy, then the series cards for those contracts appears at the top, with approve or deny buttons. also we need details of why they want to execute trade like a reason or a log for why they think this. they already should be logging, so here it can pull from that log and display it softly.

-  The theme buttons in the Left Sidebar need to visually represent their own theme regardless of what's currently active — how does a Volcano button look while the Mosaic 1993 Light theme is selected?

A: If mosiac theme is active, and light mode is selected, the volcano button represents volcano light mode. If mosaic theme is active and dark mode is toggled, volcano button would represent volcano dark mode.

-  Kalshi markets settle and expire constantly — what does the Trading Studio look like when a market the user was watching closes mid-session? Does the card disappear, grey out, or move?

A: Maybe they grey out until refresh is hit. Oh we need a series refresh or a market refresh button.

A: The cards are to ensure data is accurate in the backend, and to tell our agents yes/no in semi-auto. They are also mmeant to look exactly like kalshi, so when i screenshot, it looks like we're wrapped around kalshi or on top of kalshi with this dashboard so people understand better what is happening.

A: Only 18 are rendered, including the cards agents need confirmation on cause those would be brou8ght to the top.

-  The Right Sidebar to-do list app — is it decorative, or should it persist notes between 
sessions and potentially connect to trading context like tagging a market or an agent decision?

A: it is fully funcational. make it so good that it would get you an A+ if you developed a to-do list app for a college test. local, saves txt files.

-  The project is for personal use, but the backend Control API is a local HTTP server — is there any plan or risk of accidentally exposing it, and should there be a startup check that confirms it is only bound to `127.0.0.1`?

A: If this get's profitable we need to ship it to society that want their own pc app. so probably use docker. This will be open-scource and free. 

Mode Selection vs Indicator Redundancy

"Live/Demo mode selection" and "Live/Demo Trading Mode Indicator Lights" - Are these the same component or different?

A: seperate because the live demo mode selection and text boxes for api input will dissapear after successfull connection so we will need an indicator

-  The illumination system has a DAY/NVG toggle in the header — but NVG implies a specific color shift across the entire UI. Does NVG mode override the active theme's color palette entirely, or layer on top of it?

A: NVG is just a cool way to switch to dark mode - no additional effects.

-  State Reconciliation runs every 60 minutes and on reconnect — but what does the UI show during a reconciliation cycle? Does trading pause, does a spinner appear, or does it happen silently in the background?

A: maybe a pulsing glowing blue-green indicator light showing its active and working properly, or a yellow or red color if not working properly

-  Prime "follows the majority bets" — but on Kalshi, the orderbook only shows bids. What specific data point defines majority? Best yes bid size? Total open interest? Recent fill direction?

A: Maybe bets is supposed to say bids. We need to think about this. I guess calculate the total majority average buys and sells, and try to follow that as it happens? It's like betting on whatever the majority of that market is guessing because the majority group mind would have the closest answer.

-  The series cards in Trading Studio show "information similar to Kalshi's cards" — but Kalshi's UI and API data shapes are different. What exact fields get displayed on each card, and where does each field come from in the API response?

A: Photos with examples for how kalshi's UI organizes and navigates the series cards. As close as we can realistically get. Never mock any data.

-  The precision tools — rulers, grid, — are designed for the Design Studio. Do they stay visible or automatically hide when switching to Trading Studio or Flight Studio?

A: They stay visible

-  Private API keys are typed into text inputs in the Bottom Bar. Is there a plan for how these are handled in memory — masked after entry, never logged, cleared on disconnect — or is key security left undefined?

A: I'm not sure, what would the majority of people want if this was released to everyone

-  Prime is described as "betting on the majority bets" — but on Kalshi, the best bid/ask spread is the market. What specific orderbook signal defines the majority, and how stale is too stale to act on?

A: I dont know, use best judgment and try to follow majority volume. Bet/bid on the house.

-  The backend reconciles state against Kalshi every 60 minutes and on reconnect — but what if reconciliation reveals a fill that the agent didn't intend, or a position that shouldn't exist? Is there an alert, an auto-cancel, or just a log entry?

A: I'm not sure what this means, maybe this needs to be thought about.

-  The project is personal use only — but is there any plan to run multiple browser tabs or windows simultaneously? Would two open tabs cause duplicate agent commands or state conflicts through the Backend Control API?

A: If someone clicks our link for a desktop app, nobosdy's apps are connected, They get a beautiful shell that lets them easily interface actions for bots that connect to their personal kalshi accounts.

-  Chapter 7 is defined as "New Ideas, Questions, Complaints, Hopes" — what is the actual workflow for moving something from Chapter 7 into a real chapter with checkboxes and specs? Who decides, and when?

A: We are doing tht right now. Little by little i will integrate these updated ideas and questions into the prd for future devs to review for clarification.

---

*End Chapter 7*

*End PRD*