/* ==========================================================================
   Paulie's Prediction Partners — Illumination Controller
   ==========================================================================
   Drives the 7-channel cockpit lighting system defined in illumination.css.
   Channels: Master, Text Primary, Text Secondary, Bars Primary,
             Bars Secondary, Flood, Display.

   Master defaults ON; every channel defaults ON at MAX (1.00).
   DAY mode (data-mode="light") → 60 % base.  NVG (dark) → 100 %.
   Dimmers scale 0.25 – 1.00 (displayed as 2.5 – 10).  State persists via localStorage.

   Uses the CSS computed-variables physics model from illumination.css:
     --fx-master-switch, --fx-master-dim, --fx-mode-base  (master layer)
     --fx-ch-<channel>                                     (per-channel)
     --fx-glow-<channel> = master-scale × channel-dim      (computed by CSS)

   Exposes window.IlluminationController with public API.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Constants
     ------------------------------------------------------------------------ */

  const STORAGE_KEY = "ppp-illumination";

  const CHANNELS = [
    { id: "text-primary", key: "textPrimary", dimGroup: "text" },
    { id: "text-secondary", key: "textSecondary", dimGroup: "text" },
    { id: "bars-primary", key: "barsPrimary", dimGroup: "bars" },
    { id: "bars-secondary", key: "barsSecondary", dimGroup: "bars" },
    { id: "flood", key: "flood", dimGroup: "flood" },
    { id: "display", key: "display", dimGroup: "display" },
  ];

  const DIMMER_MIN = 0.25;
  const DIMMER_MAX = 1.0;

  /** Pixels of vertical drag equivalent to full-range dimmer sweep. */
  const DIMMER_DRAG_SCALE = 150;

  /* ------------------------------------------------------------------------
     State
     ------------------------------------------------------------------------ */

  const DEFAULT_STATE = {
    mode: "day", // 'day' | 'nvg'
    master: { on: false, dim: 1.0 },
    textPrimary: { on: true, dim: 1.0 },
    textSecondary: { on: true, dim: 1.0 },
    textDim: 1.0,
    barsPrimary: { on: true },
    barsSecondary: { on: true },
    barsDim: 1.0,
    flood: { on: true, dim: 1.0 },
    display: { on: true, dim: 1.0 },
  };

  let state = loadState();

  function cloneState(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function applyStartupDefaults() {
    state = cloneState(DEFAULT_STATE);
    saveState();
  }

  /* ------------------------------------------------------------------------
     Storage helpers
     ------------------------------------------------------------------------ */

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return Object.assign({}, DEFAULT_STATE, JSON.parse(raw));
    } catch (_) {
      /* storage unavailable — silently degrade */
    }
    return Object.assign({}, DEFAULT_STATE);
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      /* silent */
    }
  }

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */

  function clampDim(value) {
    const v = parseFloat(value);
    if (isNaN(v)) return DIMMER_MAX;
    return Math.min(DIMMER_MAX, Math.max(DIMMER_MIN, v));
  }

  /* ------------------------------------------------------------------------
     CSS application — sets custom properties on :root
     Uses the CSS computed-variables model: JS only sets the inputs,
     CSS calc() handles the multiplication chain automatically.
     ------------------------------------------------------------------------ */

  function applyCSS() {
    const root = document.documentElement.style;

    // Master layer
    root.setProperty("--fx-master-switch", state.master.on ? "1" : "0");
    root.setProperty("--fx-master-dim", (state.master.dim ?? 1.0).toFixed(3));

    // Per-channel values: channel on/off × shared group dimmer × individual dimmer
    CHANNELS.forEach((ch) => {
      const c = state[ch.key];
      const groupDim = state[ch.dimGroup + "Dim"] ?? 1.0;
      const channelDim = c.dim ?? 1.0;
      const value = c.on ? channelDim * groupDim : 0;
      root.setProperty("--fx-ch-" + ch.id, value.toFixed(3));
    });
  }

  /* ------------------------------------------------------------------------
     Event dispatch — fires custom 'illuminationchange' event
     ------------------------------------------------------------------------ */

  function dispatchChange() {
    try {
      document.dispatchEvent(
        new CustomEvent("illuminationchange", {
          detail: IlluminationController.getState(),
        }),
      );
    } catch (_) {
      /* CustomEvent not supported */
    }
  }

  /* ------------------------------------------------------------------------
     Update cycle — apply CSS → persist → sync UI → notify
     ------------------------------------------------------------------------ */

  function update() {
    applyCSS();
    saveState();
    syncPanelUI();
    dispatchChange();
  }

  /* ------------------------------------------------------------------------
     Panel UI sync — keeps DOM controls in lock-step with internal state
     ------------------------------------------------------------------------ */

  function syncPanelUI() {
    // DAY/NVG single toggle
    const dnToggle = document.getElementById("day-nvg-toggle");
    if (dnToggle) dnToggle.dataset.mode = state.mode;

    // Flip switches
    syncSwitch("master", state.master.on);
    syncSwitch("textPrimary", state.textPrimary.on);
    syncSwitch("textSecondary", state.textSecondary.on);
    syncSwitch("barsPrimary", state.barsPrimary.on);
    syncSwitch("barsSecondary", state.barsSecondary.on);
    syncSwitch("flood", state.flood.on);
    syncSwitch("display", state.display.on);

    // Dimmers
    syncDimmer("master", state.master.dim);
    syncDimmer("text", state.textDim);
    syncDimmer("bars", state.barsDim);
    syncDimmer("flood", state.flood.dim);
    syncDimmer("display", state.display.dim);

    // Sync panel-level data-master attribute for CSS active state
    const panel = document.getElementById("illum-panel");
    if (panel) panel.dataset.master = state.master.on ? "on" : "off";
  }

  function syncSwitch(channel, on) {
    const el = document.querySelector(
      `.flip-switch[data-channel="${channel}"]`,
    );
    if (el) el.dataset.state = on ? "on" : "off";
  }

  function syncDimmer(name, value) {
    const el = document.querySelector(`.dimmer-dial-wrap[data-name="${name}"]`);
    if (!el) return;
    const dial = el.querySelector(".dimmer-dial");
    const valEl = el.querySelector(".dimmer-value");
    const angle = -135 + value * 270; // -135° = min, +135° = max
    if (dial) dial.style.transform = `rotate(${angle}deg)`;
    // Display as 10 (max) down to 2.5 (min) — value × 10, nearest round number
    if (valEl) {
      const display = value * 10;
      // Show integer when whole, one decimal otherwise (e.g. 2.5)
      valEl.textContent =
        display === Math.floor(display)
          ? String(Math.round(display))
          : display.toFixed(1);
    }
  }

  /* ------------------------------------------------------------------------
     Event wiring — connects DOM controls to state
     ------------------------------------------------------------------------ */

  function wireSwitch(el) {
    el.addEventListener("click", () => {
      const ch = el.dataset.channel;
      toggleChannel(ch);
    });
  }

  function toggleChannel(ch) {
    switch (ch) {
      case "master":
        state.master.on = !state.master.on;
        break;
      case "textPrimary":
        state.textPrimary.on = !state.textPrimary.on;
        break;
      case "textSecondary":
        state.textSecondary.on = !state.textSecondary.on;
        break;
      case "barsPrimary":
        state.barsPrimary.on = !state.barsPrimary.on;
        break;
      case "barsSecondary":
        state.barsSecondary.on = !state.barsSecondary.on;
        break;
      case "flood":
        state.flood.on = !state.flood.on;
        break;
      case "display":
        state.display.on = !state.display.on;
        break;
    }
    update();
  }

  /** Wire a rotary dimmer for drag interaction */
  function wireDimmer(wrap) {
    const name = wrap.dataset.name;
    let dragging = false;
    let startY = 0;
    let startVal = 0;

    const getVal = () => {
      switch (name) {
        case "master":
          return state.master.dim;
        case "text":
          return state.textDim;
        case "bars":
          return state.barsDim;
        case "flood":
          return state.flood.dim;
        case "display":
          return state.display.dim;
        default:
          return 1.0;
      }
    };

    const setVal = (v) => {
      v = Math.max(0, Math.min(1, v));
      switch (name) {
        case "master":
          state.master.dim = v;
          break;
        case "text":
          state.textDim = v;
          break;
        case "bars":
          state.barsDim = v;
          break;
        case "flood":
          state.flood.dim = v;
          break;
        case "display":
          state.display.dim = v;
          break;
      }
      // Lightweight path for drag: only apply CSS + sync this dimmer
      applyCSS();
      syncDimmer(name, v);
      saveState();
      dispatchChange();
    };

    wrap.addEventListener("mousedown", (e) => {
      dragging = true;
      startY = e.clientY;
      startVal = getVal();
      e.preventDefault();
    });

    // Touch support
    wrap.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches || e.touches.length === 0) return;
        dragging = true;
        startY = e.touches[0].clientY;
        startVal = getVal();
        e.preventDefault();
      },
      { passive: false },
    );

    wrap.addEventListener(
      "touchmove",
      (e) => {
        if (!dragging || !e.touches || e.touches.length === 0) return;
        const dy = startY - e.touches[0].clientY;
        setVal(startVal + dy / DIMMER_DRAG_SCALE);
        e.preventDefault();
      },
      { passive: false },
    );

    wrap.addEventListener("touchend", () => {
      dragging = false;
    });

    // Wheel support
    wrap.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.05 : -0.05;
        setVal(getVal() + delta);
      },
      { passive: false },
    );

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const dy = startY - e.clientY; // upward = increase
      setVal(startVal + dy / DIMMER_DRAG_SCALE);
    });

    document.addEventListener("mouseup", () => {
      dragging = false;
    });

    // Double-click resets to max
    wrap.addEventListener("dblclick", () => setVal(1.0));
  }

  /** Wire DAY/NVG single toggle */
  function wireDayNvg() {
    const toggle = document.getElementById("day-nvg-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      state.mode = state.mode === "day" ? "nvg" : "day";
      document.documentElement.dataset.mode =
        state.mode === "nvg" ? "dark" : "light";
      update();
      if (window.ThemeManager)
        window.ThemeManager.setMode(state.mode === "nvg" ? "dark" : "light");
    });
  }

  /* ------------------------------------------------------------------------
     Initialization
     ------------------------------------------------------------------------ */

  function init() {
    // Force a consistent startup state (no illumination flash).
    applyStartupDefaults();

    // Wire switches
    document.querySelectorAll(".flip-switch[data-channel]").forEach(wireSwitch);

    // Wire dimmers
    document
      .querySelectorAll(".dimmer-dial-wrap[data-name]")
      .forEach(wireDimmer);

    // Wire DAY/NVG
    wireDayNvg();

    // Apply initial state
    applyCSS();
    syncPanelUI();

    // Listen for mode changes from ThemeManager
    document.addEventListener("modechange", () => {
      // CSS adjusts --fx-mode-base via [data-mode] selector automatically.
      // Re-dispatch so consumers can react to the changed effective values.
      dispatchChange();
    });
  }

  /* ------------------------------------------------------------------------
     Public API
     ------------------------------------------------------------------------ */

  const IlluminationController = {
    init,

    /**
     * Return the full illumination state including computed effective values.
     * effectiveValue = masterOn × channelOn × channelDim × groupDim × baseFactor.
     */
    getState() {
      const modeBase = state.mode === "nvg" ? 1.0 : 0.6;
      const masterMul = (state.master.on ? state.master.dim : 0) * modeBase;
      const channels = {};
      CHANNELS.forEach((ch) => {
        const c = state[ch.key];
        const groupDim = state[ch.dimGroup + "Dim"] ?? 1.0;
        const channelDim = c.dim ?? 1.0;
        channels[ch.id] = {
          on: c.on,
          dim: channelDim,
          groupDim: groupDim,
          effective: masterMul * (c.on ? channelDim * groupDim : 0),
        };
      });
      return {
        masterOn: state.master.on,
        masterDim: state.master.dim,
        mode: state.mode,
        baseFactor: modeBase,
        masterScale: masterMul,
        channels: channels,
      };
    },

    toggleChannel,

    /**
     * Set a channel's dimmer value (0 – 1.0).
     */
    setDim(name, value) {
      const v = Math.max(0, Math.min(1, value));
      switch (name) {
        case "master":
          state.master.dim = v;
          break;
        case "text":
          state.textDim = v;
          break;
        case "bars":
          state.barsDim = v;
          break;
        case "flood":
          state.flood.dim = v;
          break;
        case "display":
          state.display.dim = v;
          break;
      }
      update();
    },

    /**
     * Set the master switch on/off.
     */
    setMaster(on) {
      state.master.on = !!on;
      update();
    },

    /**
     * Set the DAY/NVG mode.
     */
    setMode(mode) {
      state.mode = mode;
      update();
    },
  };

  window.IlluminationController = IlluminationController;
})();
