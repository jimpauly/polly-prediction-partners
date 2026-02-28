/**
 * themes.js — Theme switching logic
 * Polly Prediction Partners v0.03.01
 */

const themes = (() => {
  const THEMES = [
    'modern-webpage', 'mosaic-1993', 'gen7-cockpit', 'ussr-cockpit',
    'neonvice-1985', 'neoncity-2085', 'coniforest', 'raneforest',
    'streamline-moderne', 'chrome', 'holographic', 'vapor',
    'paper', 'ledger-1920', 'blueprint', 'chalkboard',
    'phosphor', 'volcano', 'oceanic', 'glacier',
    'steampunk', 'dieselpunk', 'solarpunk', 'stonepunk',
    'dreamcore', 'frutiger-aero'
  ];

  const THEME_LABELS = {
    'modern-webpage': 'Modern Web',
    'mosaic-1993': 'Mosaic 1993',
    'gen7-cockpit': 'Gen7 Cockpit',
    'ussr-cockpit': 'USSR Cockpit',
    'neonvice-1985': 'Neon Vice',
    'neoncity-2085': 'Neon City',
    'coniforest': 'Coniforest',
    'raneforest': 'Raneforest',
    'streamline-moderne': 'Art Deco',
    'chrome': 'Chrome',
    'holographic': 'Holographic',
    'vapor': 'Vapor',
    'paper': 'Paper',
    'ledger-1920': 'Ledger 1920',
    'blueprint': 'Blueprint',
    'chalkboard': 'Chalkboard',
    'phosphor': 'Phosphor',
    'volcano': 'Volcano',
    'oceanic': 'Oceanic',
    'glacier': 'Glacier',
    'steampunk': 'Steampunk',
    'dieselpunk': 'Dieselpunk',
    'solarpunk': 'Solarpunk',
    'stonepunk': 'Stonepunk',
    'dreamcore': 'Dreamcore',
    'frutiger-aero': 'Frutiger Aero'
  };

  // Per-theme color snapshots for self-styling theme buttons
  // Each entry: [bg, fg, border] for light mode and dark mode
  const THEME_COLORS = {
    'modern-webpage':    { light: ['#ffffff', '#1a1a1a', '#d1d5db'], dark: ['#1a1a2e', '#e8eaf0', '#3a3a5c'] },
    'mosaic-1993':       { light: ['#c0c0c0', '#000000', '#808080'], dark: ['#000080', '#c0c0c0', '#808080'] },
    'gen7-cockpit':      { light: ['#3d4a56', '#00ff41', '#566878'], dark: ['#0d1117', '#39ff14', '#1e2d1e'] },
    'ussr-cockpit':      { light: ['#3d90a2', '#f5f0e0', '#2a6b7a'], dark: ['#0a1f26', '#5bb8cc', '#2a5060'] },
    'neonvice-1985':     { light: ['#fde8d8', '#2d1b69', '#f0c0a0'], dark: ['#0d0221', '#ff2d78', '#3d0a5c'] },
    'neoncity-2085':     { light: ['#e8ecf0', '#050510', '#c0c8d8'], dark: ['#050510', '#00ffff', '#0a0a30'] },
    'coniforest':        { light: ['#e8ede8', '#1a3d1a', '#b0c0b0'], dark: ['#0a160a', '#4aaa4a', '#1a3d1a'] },
    'raneforest':        { light: ['#f0f7e8', '#004422', '#b8d8a0'], dark: ['#020f02', '#7fff00', '#0a2a0a'] },
    'streamline-moderne':{ light: ['#f5f0e0', '#1a1008', '#c9a84c'], dark: ['#0a0805', '#c9a84c', '#3d2a10'] },
    'chrome':            { light: ['#e8eaed', '#202124', '#bdc1c6'], dark: ['#1c1c1e', '#00d4ff', '#3c3c3e'] },
    'holographic':       { light: ['#f0f4f8', '#1a2a3a', '#b0d0e8'], dark: ['#0a0a0f', '#ff6ec7', '#2a1a3a'] },
    'vapor':             { light: ['#fef3e2', '#2a1040', '#f0c0a0'], dark: ['#1a0533', '#ff2979', '#3d0a5c'] },
    'paper':             { light: ['#fafafa', '#1a1a1a', '#e0e0e0'], dark: ['#0d1117', '#3b82f6', '#1e1b4b'] },
    'ledger-1920':       { light: ['#f4e8cc', '#2d1a08', '#c9a84c'], dark: ['#0a0a0a', '#c9a84c', '#2d2010'] },
    'blueprint':         { light: ['#e8f0f8', '#003153', '#8090c0'], dark: ['#0a0e17', '#00bfff', '#0a2040'] },
    'chalkboard':        { light: ['#3d6b4f', '#f5f5dc', '#5a9070'], dark: ['#1a1a1a', '#e8e8d8', '#3a3a3a'] },
    'phosphor':          { light: ['#1a0f00', '#ffb000', '#3d2800'], dark: ['#001a00', '#33ff00', '#003300'] },
    'volcano':           { light: ['#8c8680', '#1a0a00', '#6a5a50'], dark: ['#0d0905', '#ff6b00', '#2a1500'] },
    'oceanic':           { light: ['#f0f5ff', '#003087', '#a0b8d8'], dark: ['#010714', '#ff4757', '#0a1628'] },
    'glacier':           { light: ['#f8fbff', '#1a2a4a', '#c0d8f0'], dark: ['#020b1a', '#7ab8f5', '#0a2040'] },
    'steampunk':         { light: ['#f2e8d0', '#1a0a00', '#c8a878'], dark: ['#1a1208', '#b8860b', '#3a2808'] },
    'dieselpunk':        { light: ['#c8b99a', '#2d2520', '#a09080'], dark: ['#0d0a08', '#8b7355', '#3d3530'] },
    'solarpunk':         { light: ['#f5f2e8', '#1a3a1a', '#a8c890'], dark: ['#0a1a0f', '#00e5b0', '#0a3020'] },
    'stonepunk':         { light: ['#d4b896', '#2a1a0a', '#a89070'], dark: ['#0a0805', '#ff6b35', '#2a1508'] },
    'dreamcore':         { light: ['#fce4ec', '#1a0a1a', '#f0a0c8'], dark: ['#050005', '#ff80ab', '#1a001a'] },
    'frutiger-aero':     { light: ['#e8f4fd', '#0a2040', '#90c8f0'], dark: ['#050a14', '#00e5ff', '#0a2040'] }
  };

  let currentTheme = 'modern-webpage';
  let currentMode = 'light';

  function init() {
    currentTheme = document.documentElement.dataset.theme || 'modern-webpage';
    currentMode = document.documentElement.dataset.mode || 'light';
    renderThemeButtons();
    updateModeButtons();
    updateActiveButton();
  }

  function setTheme(themeName) {
    if (!THEMES.includes(themeName)) return;
    currentTheme = themeName;
    document.documentElement.dataset.theme = themeName;
    updateActiveButton();
    // Notify palette viewer
    if (window.paletteViewer) window.paletteViewer.update();
  }

  function setMode(mode) {
    currentMode = mode;
    document.documentElement.dataset.mode = mode;
    updateModeButtons();
    // Update illumination max intensity
    if (window.illumination) window.illumination.updateMaxIntensity();
    // Sync DAY/NVG toggle
    if (window.illumination) window.illumination.syncDayNvg(mode);
  }

  // Called from UI buttons — also marks that the user chose manually
  function setModeManual(mode) {
    document.documentElement.dataset.userMode = 'manual';
    setMode(mode);
  }

  function toggleMode() {
    setMode(currentMode === 'light' ? 'dark' : 'light');
  }

  function getMode() { return currentMode; }
  function getTheme() { return currentTheme; }

  function updateModeButtons() {
    const lightBtn = document.getElementById('mode-btn-light');
    const darkBtn = document.getElementById('mode-btn-dark');
    if (lightBtn) {
      lightBtn.classList.toggle('active', currentMode === 'light');
      lightBtn.setAttribute('aria-pressed', currentMode === 'light');
    }
    if (darkBtn) {
      darkBtn.classList.toggle('active', currentMode === 'dark');
      darkBtn.setAttribute('aria-pressed', currentMode === 'dark');
    }
  }

  function updateActiveButton() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeTarget === currentTheme);
    });
  }

  function renderThemeButtons() {
    const container = document.getElementById('theme-buttons-container');
    if (!container) return;
    container.innerHTML = '';
    THEMES.forEach(themeName => {
      const btn = document.createElement('button');
      btn.className = 'theme-btn';
      btn.dataset.themeTarget = themeName;
      btn.dataset.themeSelf = themeName;
      btn.textContent = THEME_LABELS[themeName] || themeName;
      btn.title = themeName;
      btn.setAttribute('aria-label', `Switch to ${THEME_LABELS[themeName]} theme`);
      btn.onclick = () => setTheme(themeName);
      applyThemeSelfStyle(btn, themeName);
      container.appendChild(btn);
    });
  }

  function applyThemeSelfStyle(btn, themeName) {
    const colors = THEME_COLORS[themeName];
    if (!colors) return;
    // Get current mode
    const modeColors = colors[currentMode] || colors.light;
    const [bg, fg, border] = modeColors;
    btn.style.cssText = `
      background: ${bg};
      color: ${fg};
      border: 2px solid ${border};
      font-size: 11px;
      padding: 5px 4px;
      font-weight: 700;
      text-align: center;
      border-radius: 4px;
      cursor: pointer;
      line-height: 1.2;
      transition: opacity 0.15s, transform 0.1s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
  }

  // Re-apply self-styles when mode changes
  function refreshThemeButtonStyles() {
    document.querySelectorAll('.theme-btn[data-theme-self]').forEach(btn => {
      applyThemeSelfStyle(btn, btn.dataset.themeSelf);
    });
    updateActiveButton();
  }

  return { init, setTheme, setMode, setModeManual, toggleMode, getMode, getTheme, renderThemeButtons, refreshThemeButtonStyles };
})();
