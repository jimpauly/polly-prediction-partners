# Development Plan

> // TODO: [@paulie] Update the first 3 with what actually happend not in theory but in reality to get to the point in development currently at. use 7 steps for each phase with nested details, and 2 overview tips to watch out for at the end for that phase.
> // (this comment is just for you; once done you can delete it)

## Stage 1

- Quadrant II is the only area being developed (the other quadrants are placeholders). The goal is to make **everything naturally tiny**, with components built to fit the quadrant, not scaled.
- This project is explicitly designed to run at **1/4 scale** in the browser; there are no global scaling hacks (`transform: scale(0.25)` etc.). Everything must be built tiny by default.
- The nav bar needs to fit its contents without leaking to the edges; the content must be smaller as needed, not the container larger.
- NOTE: the build has already proven this is possible — we now have a fully working tiny nav with studio tabs, a cross-shaped panel toggle cluster, and a compact telemetry strip that all fit without changing region proportions.

### Phase 1 - Skeleton (what actually happened)

1. Created `frontend/index.html` with a single `<div id="app"></div>`, and moved the entrypoint into `frontend/` (previously it lived at repo root).
2. Built `frontend/src/main.tsx` to mount React into `#app` and establish the Quadrant II grid structure.
3. Created `frontend/src/styles.css` with the four-quadrant CSS grid, reset styles, and default tiny spacing (2px padding, tiny scrollbars).
4. Configured Vite (`frontend/vite.config.ts`), TypeScript (`tsconfig.json`), and Jest (`jest.config.js`) so the project runs and tests execute.
5. Added a Jest test (`src/App.test.tsx`) that asserts all 7 regions exist and that the nav visibility toggles work.
6. Implemented the “tiny cockpit” baseline by using small `rem` values everywhere and a `--scale` variable to keep sizing consistent without scaling hacks.
7. Verified the app runs via `npm run dev` and the full test suite passes via `npm run test`.

**Tips (what we learned):**
- Keep layout logic in CSS. The more you rely on JS for sizing, the harder it becomes to keep everything tiny and stable.
- Don’t trust DOM layout in Jest; tests should assert structure, aria labels, and expected elements, not pixel positions.

---

### Phase 2 - Regions (what actually happened)

1. Implemented functional region components: `HeaderRegion`, `Nav` (HUD), `LeftSidebar`, `RightSidebar`, `MainRegion`, `BottomBar`, and `ActionBar` placeholders.
2. Built a central `#quadrant-ii-inner` grid container that places the regions precisely and ensures consistent padding/gaps.
3. Implemented nav visibility toggles (header/sidebars/bottom) and wired them to the UI state so regions can be shown/hidden dynamically.
4. Created a responsive layout that degrades gracefully on narrow viewports (regions stack and scroll instead of overflowing).
5. Added skeleton cards in each region (e.g., Illumination Switchboard, System Theme, Notes, Hangar Bay, etc.) to validate that the card layout works in each area.
6. Added tests to validate DOM structure and toggle behavior; used aria labels and role checks rather than layout measurements.
7. Tuned row heights and bottom split so sidebars and main region share the same bottom edge and the footer split is roughly 2/3 + 1/3.

**Tips (what we learned):**
- When you keep everything in a single top-level grid, the layout stays predictable; nested grids lead to subtle overflow issues.
- Visual fitting should be done by shrinking the contents, not by expanding the container; otherwise the cockpit stops feeling tiny.

---

### Phase 3 - Cards (what actually happened)

1. Built a reusable `Card` component with a title bar, optional icon, and body slot.
2. Implemented all major quadrant-II cards (Illumination, Modes, System Theme, Notes, Agents, P/L, Logs, etc.) and added placeholder content where needed.
3. Applied consistent card styling (bezel border, internal padding, drop shadow) using CSS variables so the “tiny cockpit” look could be tuned globally.
4. Ensured cards inside scrollable regions floor their overflow properly; used `overflow: auto` and kept card headers visible without affecting scroll.
5. Added keyboard focus and aria labels on interactive controls (tabs, toggles, buttons, inputs) to keep accessibility in place.
6. Wired state flows for the key UI controls: theme toggles, studio tab selection, visibility toggles, telemetry simulation, and illumination dials.
7. Expanded unit tests to cover card presence, card headers, and the core interactivity (toggle visibility, tab switching, theme switching).

**Tips (what we learned):**
- When cards are tiny, focus rings and hit targets become critical; small buttons need padding-rich hits even if the visuals are small.
- CSS variables make refining the “tiny cockpit aesthetic” far easier than overhauling styles in multiple places.

---

### Phase 4 - Component Polishing (where we are now)

1. Iterated the nav bar repeatedly: made it compact, kept nav height constant, and ensured contents fit without overflow.
2. Converted the visibility toggles into a cross layout with MAX in the center and made the four toggles rectangular (tiny toggle “panels”).
3. Shrunk every element in the nav (tabs, buttons, telemetry) to a micro scale while keeping text readable and click targets usable.
4. Reintroduced tab labels (they were hidden) and ensured tabs remain functional even at tiny sizes.
5. Refined the telemetry strip to be a low-contrast status ticker, removed decorative dots, and tightened spacing.
6. Ensured nav content does not touch the bar edges; only tabs have top padding to align with the nav.
7. Kept all tests green after every layout change by relying on structure/ARIA, not computed layout.

**Tips (what we learned):**
- When you’re trying to fit too much into a small nav, reduce **content size first**, not container size. The container must remain stable.
- Don’t be afraid to make elements functionally tiny — as long as the hit area is reasonable (use padding or larger click regions), it can still be usable.

> NOTE: We’ve now built the “tiny cockpit” nav that fits all requested controls (studio tabs, cross toggles, MAX, telemetry) within the fixed nav height. The remaining work is purely micro‑spacing and polish.

---

### Current status: Phase 4.6 (nav polishing + tiny cockpit fit)
- The nav bar is fully functional, fits within the quadrant height, and all components (tabs, toggles, telemetry) are operational and tiny.
- Ongoing adjustments are focused purely on micro‑spacing and alignment, not on structural layout.

---

<!-- The rest of the plan (Phase 5+) is deferred until Phase 4 polishing is complete. -->

#### Cards to build/enhance (by region)

- **Header Bar**
  - Illumination Switchboard (main card, with toggle groups)

- **Nav (HUD) Bar**
  - Studio tab strip + telemetry strip card
  - Visibility toggle & mini controls bar (H/L/R/B)

- **Left Sidebar**
  - Modes card
  - System Theme card

- **Main Region**
  - Active Palette card
  - Man‑o‑Meters card
  - System Logs card
  - Web Elements card
  - Periscope Viewing Port card (main canvas)

- **Right Sidebar**
  - Notes card
  - Positions card
  - History card
  - Send card

- **Bottom Bar (Hangar Bay)**
  - Agent Access card (grid of agent tiles)
  - P/L MFD card
  - Connect API Keys card
  - Ignition card

- **Action Bar**
  - Global Throttle card (radio-style controls + lock)

### Phase 4 - Components for Quadrant II

- Start with System Design theme implementation; focus on first two themes in detail.
- Implement accessible attributes (`aria-*`) per registry notes.
- Wire simple state logic for theme toggle, studio tab navigation, panel toggles.
- **Do not use mock data at any stage.**
- Create unit tests for component states and accessibility.

Progess at number of cards, components, and children elements:

Cards: 12 out of 13 (only Web Elements left to fully populate)

Components: ~18 out of 20+ (added SystemLogsCard, WebElementsCard, plus previously listed items)

Elements: ~45 out of ~70 required by registry (logs list, buttons, inputs, checkbox added)

### Phase 5 - Element Polishes

- Refine typography and spacing (font-size normalization, bezel paddings).
- Add focus ring styles and keyboard navigation for controls.
- Implement day/night flip behavior syncing mode toggles and illumination controls.
- Build the dynamic ping chart and telemetry strip with real‑time simulation.
- Validate WCAG contrast ratios for text over illuminated surfaces.

### Phase 6 - More Element Polishes

- Enhance card contents: notes editor with markdown export, positions list placeholder, history log layout.
- Add agent access grid with sample cards.
- Implement master‑dimmer logic visual placeholder (no real illumination yet).
- Introduce debug overlay for illumination engine values under CSS variable toggle.
- Review and adjust responsive behavior across phone‑to‑laptop viewports.

### Phase 7 - Even more element polishes, still should only be with first 2 themes.

- Incorporate feedback/photos and any new registry requests.
- Refactor components based on usability findings; fix layout edge cases.
- Add animation details (switch bounce, dimmer transitions).
- Conduct comprehensive accessibility review and fix ARIA issues.

### Phase 8 - Finish All Themes and Illumination Effects

- Define CSS tokens for all 48 (+ mode) themes; implement theme switching logic.
- Build illumination engine: channels, master scale, glow layering, dials controlling intensity.
- Style components entirely from theme tokens.
- Render glows using CSS/SVG gradients; ensure GPU‑friendly performance.
- Write automated tests verifying theme application and illumination toggling.

### Phase 9 - Final polish and readiness for Stage 2

- Bug hunt and polish remaining UI/UX glitches.
- Prepare design documentation and developer notes for Stage 2 work (sample data connectors, etc.).
- Add onboarding sequence/instructions in the index page.
- Ensure build passes lint, type‑check, and simple e2e smoke tests.
- Tag release commit and update project README with Stage 1 completion notes.

## Stage 2

## Stage 2

### Phase 1

### Phase 2

### Phase 3

### Phase 4

### Phase 5

### Phase 6

### Phase 7

### Phase 8

### Phase 9

## Stage 2.5


## Stage 3

