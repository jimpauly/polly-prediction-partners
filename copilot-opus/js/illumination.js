/**
 * IlluminationController — Paulie's Prediction Partners
 * Manages 7 channels: master, textPrimary, textSecondary,
 *                     barsPrimary, barsSecondary, flood, display
 * Storage key: 'ppp-illumination'
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'ppp-illumination';

  const DEFAULT_STATE = {
    mode: 'day',          // 'day' | 'nvg'
    master:        { on: false, dim: 1.0 },
    textPrimary:   { on: true,  dim: 1.0 },
    textSecondary: { on: true,  dim: 1.0 },
    textDim:       1.0,
    barsPrimary:   { on: true },
    barsSecondary: { on: true },
    barsDim:       1.0,
    flood:         { on: true,  dim: 1.0 },
    display:       { on: true,  dim: 1.0 },
  };

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return Object.assign({}, DEFAULT_STATE, JSON.parse(raw));
    } catch (_) {}
    return Object.assign({}, DEFAULT_STATE);
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  /**
   * Apply CSS custom properties to :root based on current state.
   * When master is OFF → all fx scales = 0 regardless of channels.
   */
  function applyCSS() {
    const root = document.documentElement;
    const masterOn = state.master.on;
    const masterDim = masterOn ? (state.master.dim ?? 1.0) : 0;
    const modeBase = state.mode === 'nvg' ? 1.0 : 0.6;

    root.style.setProperty('--fx-master-scale', masterDim.toFixed(3));
    root.style.setProperty('--fx-mode-base', modeBase.toFixed(2));

    const calc = (ch, extraDim = 1.0) =>
      masterOn && ch.on ? ((ch.dim ?? 1.0) * extraDim * masterDim).toFixed(3) : '0';

    root.style.setProperty('--fx-glow-text-primary',
      calc(state.textPrimary, state.textDim));
    root.style.setProperty('--fx-glow-text-secondary',
      calc(state.textSecondary, state.textDim));
    root.style.setProperty('--fx-glow-bars-primary',
      masterOn && state.barsPrimary.on
        ? (state.barsDim * masterDim).toFixed(3) : '0');
    root.style.setProperty('--fx-glow-bars-secondary',
      masterOn && state.barsSecondary.on
        ? (state.barsDim * masterDim).toFixed(3) : '0');
    root.style.setProperty('--fx-glow-flood',  calc(state.flood));
    root.style.setProperty('--fx-glow-display', calc(state.display));
  }

  /** Sync all panel widgets to match current state */
  function syncPanelUI() {
    // DAY/NVG
    document.querySelectorAll('.day-nvg-option').forEach(el => {
      const val = el.dataset.value;
      el.dataset.active = (val === state.mode) ? 'true' : 'false';
    });

    // Flip switches
    syncSwitch('master',        state.master.on);
    syncSwitch('textPrimary',   state.textPrimary.on);
    syncSwitch('textSecondary', state.textSecondary.on);
    syncSwitch('barsPrimary',   state.barsPrimary.on);
    syncSwitch('barsSecondary', state.barsSecondary.on);
    syncSwitch('flood',         state.flood.on);
    syncSwitch('display',       state.display.on);

    // Dimmers
    syncDimmer('master',   state.master.dim);
    syncDimmer('text',     state.textDim);
    syncDimmer('bars',     state.barsDim);
    syncDimmer('flood',    state.flood.dim);
    syncDimmer('display',  state.display.dim);
  }

  function syncSwitch(channel, on) {
    const el = document.querySelector(`.flip-switch[data-channel="${channel}"]`);
    if (el) el.dataset.state = on ? 'on' : 'off';
  }

  function syncDimmer(name, value) {
    const el = document.querySelector(`.dimmer-dial-wrap[data-name="${name}"]`);
    if (!el) return;
    const dial = el.querySelector('.dimmer-dial');
    const valEl = el.querySelector('.dimmer-value');
    const angle = -135 + (value * 270); // -135° = min, +135° = max
    if (dial) dial.style.transform = `rotate(${angle}deg)`;
    if (valEl) valEl.textContent = Math.round(value * 100) + '%';
  }

  /** Wire a flip switch click handler */
  function wireSwitch(el) {
    el.addEventListener('click', () => {
      const ch = el.dataset.channel;
      toggleChannel(ch);
    });
  }

  function toggleChannel(ch) {
    switch (ch) {
      case 'master':        state.master.on        = !state.master.on;        break;
      case 'textPrimary':   state.textPrimary.on   = !state.textPrimary.on;   break;
      case 'textSecondary': state.textSecondary.on = !state.textSecondary.on; break;
      case 'barsPrimary':   state.barsPrimary.on   = !state.barsPrimary.on;   break;
      case 'barsSecondary': state.barsSecondary.on = !state.barsSecondary.on; break;
      case 'flood':         state.flood.on         = !state.flood.on;         break;
      case 'display':       state.display.on       = !state.display.on;       break;
    }
    saveState(); applyCSS(); syncPanelUI();
  }

  /** Wire a rotary dimmer for drag interaction */
  function wireDimmer(wrap) {
    const name = wrap.dataset.name;
    let dragging = false;
    let startY = 0;
    let startVal = 0;

    const getVal = () => {
      switch (name) {
        case 'master':  return state.master.dim;
        case 'text':    return state.textDim;
        case 'bars':    return state.barsDim;
        case 'flood':   return state.flood.dim;
        case 'display': return state.display.dim;
        default:        return 1.0;
      }
    };

    const setVal = (v) => {
      v = Math.max(0, Math.min(1, v));
      switch (name) {
        case 'master':  state.master.dim  = v; break;
        case 'text':    state.textDim     = v; break;
        case 'bars':    state.barsDim     = v; break;
        case 'flood':   state.flood.dim   = v; break;
        case 'display': state.display.dim = v; break;
      }
      saveState(); applyCSS(); syncDimmer(name, v);
    };

    wrap.addEventListener('mousedown', (e) => {
      dragging = true;
      startY   = e.clientY;
      startVal = getVal();
      e.preventDefault();
    });

    // Wheel support
    wrap.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.05 : -0.05;
      setVal(getVal() + delta);
    }, { passive: false });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dy = startY - e.clientY; // upward = increase
      setVal(startVal + dy / 150);
    });

    document.addEventListener('mouseup', () => { dragging = false; });

    // Double-click resets to max
    wrap.addEventListener('dblclick', () => setVal(1.0));
  }

  /** Wire DAY/NVG toggle */
  function wireDayNvg() {
    document.querySelectorAll('.day-nvg-option').forEach(el => {
      el.addEventListener('click', () => {
        const val = el.dataset.value;
        state.mode = val;
        // Also update the html data-mode attribute for theme system
        document.documentElement.dataset.mode = val === 'nvg' ? 'dark' : 'light';
        saveState(); applyCSS(); syncPanelUI();
        // Notify ThemeManager if available
        if (window.ThemeManager) window.ThemeManager.setMode(val === 'nvg' ? 'dark' : 'light');
      });
    });
  }

  /** Initialize: wire all controls and apply initial state */
  function init() {
    // Wire switches
    document.querySelectorAll('.flip-switch[data-channel]').forEach(wireSwitch);

    // Wire dimmers
    document.querySelectorAll('.dimmer-dial-wrap[data-name]').forEach(wireDimmer);

    // Wire DAY/NVG
    wireDayNvg();

    // Apply
    applyCSS();
    syncPanelUI();
  }

  window.IlluminationController = {
    init,
    getState: () => Object.assign({}, state),
    toggleChannel,
    setDim(name, value) {
      const v = Math.max(0, Math.min(1, value));
      switch (name) {
        case 'master':  state.master.dim  = v; break;
        case 'text':    state.textDim     = v; break;
        case 'bars':    state.barsDim     = v; break;
        case 'flood':   state.flood.dim   = v; break;
        case 'display': state.display.dim = v; break;
      }
      saveState(); applyCSS(); syncDimmer(name, v);
    },
    setMode(mode) {
      state.mode = mode;
      saveState(); applyCSS(); syncPanelUI();
    },
  };
})();
