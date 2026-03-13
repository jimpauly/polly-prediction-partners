# Paulie's Prediction Partners

> ⚠️ Front‑end work in progress: existing repo contains new `frontend/` folder with early layout.

backend remains deprecated. Most of our attention is on rebuilding the web UI from scratch in the `frontend/` directory.

> 

---

## 📊 Front‑end Progress (Stage 1)

Current status is **Phase 3 (cards) in progress**. Quadrant II is now a fully laid‑out cockpit cell with all seven regions visible and correctly aligned; the studio selector, toggles, and first set of cards (including the Illumination Switchboard) are in place.

### Progress counters (component tree implementation)

No lists, only counters:

- **Regions:** 7/7 complete in position and proportions
- **Cards:** 13/13 present (all Quadrant II cards implemented)
- **Components:** ~90% present (switchboard channels, toggles, dials, nixies, charts, agent telegraph)
- **Elements:** ~60% present (still evolving glow physics + polish)

| Phase | Description                                      | Status         |
| :---- | :----------------------------------------------- | :------------- |
| 1     | Skeleton – scaffolding, tooling, quad grid       | ✅ done        |
| 2     | Regions for Quadrant II (layout + toggles)       | ✅ in progress |
| 3     | Cards for Quadrant II (registry skeleton)        | All need to be present without cutoff or outside region borders|
| 4     | Components 100% present                          | 50%    |
| 5     | Elements near 100% present                       | 20%    | 
| 6‑7   | Components + polish (themes, illumination, UX)   | ⏳ upcoming    | 

 **Tests:** Unit tests cover region layout, visibility toggles, theme switch, and core UI interactions.

---

## Quick Dev Guide

### ✅ Recommended (dev mode with hot reload)
```bash
cd frontend
npm install
npm run dev
```
Then visit the URL printed in the terminal (e.g. `http://localhost:5174`).

---

## Project layout (front‑end only)

```
frontend/
├─ src/          # TSX source (Vite + TS)
├─ index.html    # entrypoint used for dev + static preview
├─ styles.css    # shared styles (quad grid, region layout)
├─ package.json  # dependencies + scripts
└─ vite.config.ts
```

---

## Notes
- The app is built at 1/4 scale by default so Quadrant II behaves like a tiny cockpit. Use the fullscreen toggle (top-right) to see the full‑scale version.
- The current focus is Phase 2 layout completion before adding more card content or theme polish.


## Quick Dev Guide

The front‑end is a static React app that can be consumed in one of two modes:

- **Instant static preview** – open `frontend/index.html` directly or serve it with Live Server (port 5500 by default). This version uses the pre‑built `src/main.js` bundle and pulls React/ReactDOM from a CDN. No tooling is required, making it perfect for fast layout work or quick UI experiments.

- **Full TypeScript development** – run `npm install` in the `frontend/` folder to install the build tooling (Vite, ts‑jest, etc.). After that you can use `npm run dev` to start a hot‑reloading dev server and `npm run test` to exercise the unit tests. Edit `src/main.tsx` and the compiler/bundler will handle JSX/TS conversion automatically.

`src/styles.css` is common to both workflows; it defines the quadrant grid and basic reset.

You only need to install npm packages if you intend to work on the TypeScript source. Otherwise, the CDN‑based static bundle continues to function independently.

Once the page is running you can click studio buttons or use arrow keys to change studios. Nav‑bar toggles hide/show the support regions.

Phase 3 has introduced a reusable `Card` component and scaffolded placeholder cards across *all* Quadrant II regions, along with subcomponents for studio tabs, visibility toggles, toggle switches, inspector tabs, and a telemetry strip. The ten‑component skeleton now closely mirrors the registry tree – only details and data remain to be filled.

---

## Repository Layout (front‑end only)

```
frontend/
├─ src/
│  ├─ main.js        # application logic using React from CDN (static bundle)
│  ├─ main.tsx       # TypeScript source (requires npm install)
│  ├─ components/    # reusable React components (Card, toggles, tabs, etc.)
│  └─ styles.css     # CSS reset and quadrant grid
├─ index.html        # entry point loaded by Live Server
```

Other folders remain from earlier versions and are not currently used.

---

## License

MIT

