/**
 * ThemeManager — Paulie's Prediction Partners
 * Manages theme and light/dark mode.
 * Storage keys: 'ppp-theme', 'ppp-mode'
 */
(function () {
  'use strict';

  const THEMES = [
    'modern-webpage',
    'mosaic-1993',
    'gen7-cockpit',
    'ussr-cockpit',
    'neonvice-1985',
    'neoncity-2085',
    'coniforest',
    'raneforest',
    'art-deco',
    'holographic',
  ];

  const DEFAULT_THEME = 'modern-webpage';
  const DEFAULT_MODE  = 'dark';

  let currentTheme = localStorage.getItem('ppp-theme') || DEFAULT_THEME;
  let currentMode  = localStorage.getItem('ppp-mode')  || DEFAULT_MODE;

  function applyTheme(theme, mode) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.mode  = mode;
    // Sync sidebar buttons
    document.querySelectorAll('.theme-btn[data-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    // Sync mode toggles
    document.querySelectorAll('.toggle-pill-btn[data-mode]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    // Sync sidebar small toggle
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle) modeToggle.classList.toggle('on', mode === 'dark');
  }

  function setTheme(theme) {
    if (!THEMES.includes(theme)) return;
    currentTheme = theme;
    localStorage.setItem('ppp-theme', theme);
    applyTheme(currentTheme, currentMode);
  }

  function setMode(mode) {
    if (mode !== 'light' && mode !== 'dark') return;
    currentMode = mode;
    localStorage.setItem('ppp-mode', mode);
    applyTheme(currentTheme, currentMode);
  }

  function toggleMode() {
    setMode(currentMode === 'dark' ? 'light' : 'dark');
  }

  function init() {
    applyTheme(currentTheme, currentMode);

    // Wire theme buttons
    document.querySelectorAll('.theme-btn[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });

    // Wire mode pill buttons
    document.querySelectorAll('.toggle-pill-btn[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    // Wire small toggle
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle) {
      modeToggle.addEventListener('click', toggleMode);
    }
  }

  window.ThemeManager = { init, setTheme, setMode, toggleMode,
    getTheme: () => currentTheme,
    getMode:  () => currentMode,
    themes:   THEMES,
  };
})();
