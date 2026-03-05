/* ============================================================
   Illumination System — Cockpit lighting physics
   Channel: Master, Text (pri/sec), Bars (pri/sec), Flood, Display
   Physics: inverse-square glow spread approximation
   Intensity: DAY/Light=60%, NVG/Dark=100%, Dimmers scale 0.25–1.00
   ============================================================ */

const Illumination = (() => {
  const state = {
    masterOn: false,
    masterDim: 1.0,
    textPrimaryOn: true,
    textSecondaryOn: true,
    textDim: 1.0,
    barsPrimaryOn: true,
    barsSecondaryOn: true,
    barsDim: 1.0,
    floodOn: true,
    floodDim: 1.0,
    displayOn: true,
    displayDim: 1.0,
  };

  // Dimmer step: rotate through 0.25, 0.50, 0.75, 1.00
  const DIMMER_STEPS = [0.25, 0.50, 0.75, 1.00];

  function initialize() {
    bindToggles();
    bindDimmers();
    recalculate();
  }

  function bindToggles() {
    bindToggle('toggle-master', 'masterOn', () => {
      document.body.setAttribute('data-illumination-master', state.masterOn ? 'on' : 'off');
    });
    bindToggle('toggle-text-primary', 'textPrimaryOn');
    bindToggle('toggle-text-secondary', 'textSecondaryOn');
    bindToggle('toggle-bars-primary', 'barsPrimaryOn');
    bindToggle('toggle-bars-secondary', 'barsSecondaryOn');
    bindToggle('toggle-flood', 'floodOn');
    bindToggle('toggle-display', 'displayOn');
  }

  function bindToggle(elementId, stateKey, extraCallback) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const handler = () => {
      state[stateKey] = !state[stateKey];
      element.classList.toggle('active', state[stateKey]);
      element.setAttribute('aria-checked', state[stateKey]);
      if (extraCallback) extraCallback();
      recalculate();
    };

    element.addEventListener('click', handler);
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handler(); }
    });
  }

  function bindDimmers() {
    bindDimmer('dial-master', 'masterDim');
    bindDimmer('dial-text', 'textDim');
    bindDimmer('dial-bars', 'barsDim');
    bindDimmer('dial-flood', 'floodDim');
    bindDimmer('dial-display', 'displayDim');
  }

  function bindDimmer(elementId, stateKey) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const handler = () => {
      const currentIndex = DIMMER_STEPS.indexOf(state[stateKey]);
      const nextIndex = (currentIndex + 1) % DIMMER_STEPS.length;
      state[stateKey] = DIMMER_STEPS[nextIndex];

      // Rotate dial visual
      const rotation = (state[stateKey] - 0.25) / 0.75 * 270 - 45;
      element.style.transform = `rotate(${rotation}deg)`;
      element.setAttribute('aria-valuenow', Math.round(state[stateKey] * 100));

      recalculate();
    };

    element.addEventListener('click', handler);
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handler(); }
    });
  }

  function recalculate() {
    const mode = document.body.getAttribute('data-mode') || 'light';
    const baseIntensity = mode === 'dark' ? 1.0 : 0.6;
    const masterScale = state.masterOn ? state.masterDim : 0;
    const effectiveScale = baseIntensity * masterScale;

    // Calculate per-channel intensities
    const textPrimaryIntensity = state.textPrimaryOn ? effectiveScale * state.textDim : 0;
    const textSecondaryIntensity = state.textSecondaryOn ? effectiveScale * state.textDim : 0;
    const barsPrimaryIntensity = state.barsPrimaryOn ? effectiveScale * state.barsDim : 0;
    const barsSecondaryIntensity = state.barsSecondaryOn ? effectiveScale * state.barsDim : 0;
    const floodIntensity = state.floodOn ? effectiveScale * state.floodDim : 0;
    const displayIntensity = state.displayOn ? effectiveScale * state.displayDim : 0;

    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--fx-master-scale', effectiveScale);
    root.style.setProperty('--text-primary-intensity', textPrimaryIntensity);
    root.style.setProperty('--text-secondary-intensity', textSecondaryIntensity);
    root.style.setProperty('--bars-primary-intensity', barsPrimaryIntensity);
    root.style.setProperty('--bars-secondary-intensity', barsSecondaryIntensity);
    root.style.setProperty('--flood-intensity', floodIntensity);
    root.style.setProperty('--display-intensity', displayIntensity);

    // Generate glow color from theme
    const computedStyle = getComputedStyle(document.body);
    const glowColor = computedStyle.getPropertyValue('--color-border-focus').trim() || '#3b82f6';

    root.style.setProperty('--fx-glow-text-primary', `0 0 ${4 * textPrimaryIntensity}px ${glowColor}`);
    root.style.setProperty('--fx-glow-text-secondary', `0 0 ${2 * textSecondaryIntensity}px ${glowColor}`);
    root.style.setProperty('--fx-glow-bars-primary', `0 0 ${6 * barsPrimaryIntensity}px ${glowColor}`);
    root.style.setProperty('--fx-glow-bars-secondary', `0 0 ${4 * barsSecondaryIntensity}px ${glowColor}`);
    root.style.setProperty('--fx-glow-flood', `rgba(${hexToRgb(glowColor)}, ${0.08 * floodIntensity})`);
    root.style.setProperty('--fx-glow-display', `0 0 ${6 * displayIntensity}px ${glowColor}`);
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const bigint = parseInt(hex, 16);
    const red = (bigint >> 16) & 255;
    const green = (bigint >> 8) & 255;
    const blue = bigint & 255;
    return `${red}, ${green}, ${blue}`;
  }

  return { initialize, recalculate };
})();
