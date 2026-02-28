/**
 * illumination.js — Lighting Panel Logic
 * Polly Prediction Partners v0.03.01
 * 
 * Channels: master, text-primary, text-secondary, bars-primary, bars-secondary, flood, display
 * Each channel has: enabled (bool), dimmer (0.25–1.0)
 * Physics: inverse-square approximation via CSS calc()
 */

const illumination = (() => {
  const root = document.documentElement;

  const state = {
    masterEnabled: false,
    masterDimmer: 1.0,
    dayNvg: 'day', // 'day' | 'nvg'
    channels: {
      'text-primary':   { enabled: true,  dimmer: 1.0 },
      'text-secondary': { enabled: true,  dimmer: 1.0 },
      'bars-primary':   { enabled: true,  dimmer: 1.0 },
      'bars-secondary': { enabled: true,  dimmer: 1.0 },
      'flood':          { enabled: true,  dimmer: 1.0 },
      'display':        { enabled: true,  dimmer: 1.0 },
    }
  };

  // CSS variable names for each channel
  const CHANNEL_CSS_VAR = {
    'text-primary':   '--fx-glow-text-primary',
    'text-secondary': '--fx-glow-text-secondary',
    'bars-primary':   '--fx-glow-bars-primary',
    'bars-secondary': '--fx-glow-bars-secondary',
    'flood':          '--fx-glow-flood',
    'display':        '--fx-glow-display',
  };

  function computeIntensity(channel) {
    if (!state.masterEnabled) return 0;
    const ch = state.channels[channel];
    if (!ch || !ch.enabled) return 0;
    // inverse-square-ish: master * channel dimmer
    const raw = state.masterDimmer * ch.dimmer;
    // clamp to max intensity based on mode
    const maxIntensity = parseFloat(getComputedStyle(root).getPropertyValue('--mode-max-intensity')) || 0.6;
    return Math.min(raw, maxIntensity);
  }

  function applyAll() {
    // Master scale
    root.style.setProperty('--fx-master-scale', state.masterDimmer);
    root.style.setProperty('--fx-master-enabled', state.masterEnabled ? '1' : '0');
    root.style.setProperty('--fx-master-dimmer', state.masterDimmer);

    Object.keys(CHANNEL_CSS_VAR).forEach(channel => {
      root.style.setProperty(CHANNEL_CSS_VAR[channel], computeIntensity(channel));
    });

    // Update flood body class
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
      appRoot.classList.toggle('glow-flood', state.masterEnabled && state.channels['flood'].enabled);
    }
  }

  function toggleMaster() {
    state.masterEnabled = !state.masterEnabled;
    const body = document.getElementById('switch-body-master');
    if (body) {
      body.classList.toggle('switch-on', state.masterEnabled);
      body.classList.toggle('switch-off', !state.masterEnabled);
    }
    const btn = document.getElementById('switch-master');
    if (btn) btn.setAttribute('aria-pressed', state.masterEnabled);
    applyAll();
  }

  function toggleChannel(channel) {
    if (!state.channels[channel]) return;
    state.channels[channel].enabled = !state.channels[channel].enabled;
    const switchId = `switch-body-${channel}`;
    const body = document.getElementById(switchId);
    if (body) {
      body.classList.toggle('switch-on', state.channels[channel].enabled);
      body.classList.toggle('switch-off', !state.channels[channel].enabled);
    }
    applyAll();
  }

  function setDimmer(channel, value) {
    const v = Math.max(0.25, Math.min(1.0, value));
    if (channel === 'master') {
      state.masterDimmer = v;
    } else if (state.channels[channel]) {
      state.channels[channel].dimmer = v;
    }
    applyAll();
  }

  function setDayNVG(mode) {
    state.dayNvg = mode;
    const btnDay = document.getElementById('btn-day');
    const btnNvg = document.getElementById('btn-nvg');
    if (btnDay) btnDay.classList.toggle('active', mode === 'day');
    if (btnNvg) btnNvg.classList.toggle('active', mode === 'nvg');
    // Sync to light/dark mode
    if (window.themes) themes.setMode(mode === 'day' ? 'light' : 'dark');
  }

  function syncDayNvg(mode) {
    state.dayNvg = mode === 'light' ? 'day' : 'nvg';
    const btnDay = document.getElementById('btn-day');
    const btnNvg = document.getElementById('btn-nvg');
    if (btnDay) btnDay.classList.toggle('active', state.dayNvg === 'day');
    if (btnNvg) btnNvg.classList.toggle('active', state.dayNvg === 'nvg');
  }

  function updateMaxIntensity() {
    applyAll();
  }

  // Rotary dial interaction
  function initDials() {
    document.querySelectorAll('.rotary-dial').forEach(dial => {
      let isDragging = false;
      let startY = 0;
      let startValue = parseFloat(dial.dataset.value) || 1.0;

      dial.addEventListener('mousedown', e => {
        isDragging = true;
        startY = e.clientY;
        startValue = parseFloat(dial.dataset.value) || 1.0;
        e.preventDefault();
      });

      document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const delta = (startY - e.clientY) / 100; // drag up = increase
        const newVal = Math.max(0.25, Math.min(1.0, startValue + delta));
        dial.dataset.value = newVal.toFixed(2);
        // Rotate: 0.25 → -135deg, 1.0 → 135deg
        const angle = ((newVal - 0.25) / 0.75) * 270 - 135;
        dial.style.setProperty('--dial-angle', `${angle}deg`);
        // Apply to channel
        const channelId = dial.id.replace('dial-', '');
        setDimmer(channelId, newVal);
      });

      document.addEventListener('mouseup', () => { isDragging = false; });

      // Phase 6: Keyboard control — ↑/↓ arrows adjust value, Home/End jump to min/max
      const DIAL_STEP_SMALL = 0.05; // 5% per key press
      const DIAL_STEP_LARGE = 0.10; // 10% per key press (with Shift)
      dial.addEventListener('keydown', e => {
        const step = e.shiftKey ? DIAL_STEP_LARGE : DIAL_STEP_SMALL;
        let val = parseFloat(dial.dataset.value) || 1.0;
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
          e.preventDefault();
          val = Math.min(1.0, val + step);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
          e.preventDefault();
          val = Math.max(0.25, val - step);
        } else if (e.key === 'Home') {
          e.preventDefault();
          val = 0.25;
        } else if (e.key === 'End') {
          e.preventDefault();
          val = 1.0;
        } else {
          return;
        }
        dial.dataset.value = val.toFixed(2);
        const angle = ((val - 0.25) / 0.75) * 270 - 135;
        dial.style.setProperty('--dial-angle', `${angle}deg`);
        // Update aria-valuenow (0–100 scale)
        dial.setAttribute('aria-valuenow', Math.round((val - 0.25) / 0.75 * 100));
        const channelId = dial.id.replace('dial-', '');
        setDimmer(channelId, val);
      });
    });
  }

  function init() {
    applyAll();
    initDials();
  }

  return { init, toggleMaster, toggleChannel, setDimmer, setDayNVG, syncDayNvg, updateMaxIntensity, applyAll, state };
})();
