/* ==========================================================================
   Paulie's Prediction Partners — Theme Manager
   ==========================================================================
   Manages 24 themes × 2 modes (light / dark).
   Applies selection via data-theme and data-mode attributes on <html>.
   Persists preference in localStorage.
   Exposes window.ThemeManager with public API.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Theme Registry
     ------------------------------------------------------------------------ */
  var THEMES = [
    { id: "webpage",         name: "Webpage",         description: "2026 webpage. Modern default. Diverse colors, professional" },
    { id: "mosaic-1993",     name: "Mosaic 1993",     description: "Windows 3.1 Silver chrome, chiseled borders. Teal BG (0,128,128)" },
    { id: "gen7-cockpit",    name: "Gen-7 Cockpit",   description: "Gen 7 Fighter. Dark Gull Gray (FS 36231), MFD Green / NVG Night Vision" },
    { id: "ussr-cockpit",    name: "USSR Cockpit",    description: "Soviet Cold War. MiG Turquoise (#3d90a2). Stress-reducing blue / Night Intercept" },
    { id: "neon-vice-1985",  name: "Neon Vice 1985",  description: "GTA Neon Vice. Miami pastels, linen suits, art deco pinks / Ocean Drive Midnight" },
    { id: "neon-city-2085",  name: "Neon City 2085",  description: "2085 Utopia. Hopeful, chromium, electric neon / Dystopia. Netrunner. Sharp laser edges" },
    { id: "coniforest",      name: "Coniforest",      description: "Evergreens. Mt. Rainier cold green, Mist, Granite, Pine / PNW Night" },
    { id: "rainforest",      name: "Rainforest",      description: "Amazon hot green. Humid, Pith Helmet Beige, Parrot Green / Amazon Night bioluminescence" },
    { id: "art-deco",        name: "Art Deco",        description: "Roaring Twenties. Ivory, lacquer black, champagne gold / Ballroom. Piano black, brass" },
    { id: "holographic",     name: "Holographic",     description: "Iridescent daylight. Pearl base, shifting teal shimmer / Prism Noir. Neon refraction" },
    { id: "vapor",           name: "Vapor",           description: "Pastel arcade sunrise. Mint, peach, sky blue / Late-night vaporwave. Deep navy, hot pink" },
    { id: "paper",           name: "Paper",           description: "The Office. Copier paper, toner black, ballpoint blue / Carbon. Deep indigo" },
    { id: "ledger-1920",     name: "Ledger 1920",     description: "Wall St. Ledger. Manila, Banker Green, Typewriter / Jazz Moderne. Matte Black, Gold Foil" },
    { id: "blueprint",       name: "Blueprint",       description: "Physical drafting table / AutoCAD. Terminal aesthetic, high contrast lines" },
    { id: "chalkboard",      name: "Chalkboard",      description: "Greenboard. Chalk colors, aluminum / Classic Blackboard. Slate black, dusty chalk" },
    { id: "phosphor",        name: "Phosphor",        description: "P3 Amber CRT old computer / Green Phosphor CRT terminal, retro blur" },
    { id: "volcano",         name: "Volcano",         description: "Active Caldera. Ash gray, Pumice, Sulfur, Magma / Magma Chamber. Basalt, lava" },
    { id: "oceanic",         name: "Oceanic",         description: "Maritime / Yacht Club. Navy, White, Brass, Coral / The Abyss. Black-Blue, Bioluminescence" },
    { id: "steampunk",       name: "Steampunk",       description: "Victorian Sci-Fi. Parchment, Brass, Mahogany, Steam / London Fog. Gaslight, Copper" },
    { id: "dieselpunk",      name: "Dieselpunk",      description: "WWI Trench. Khaki, Grease, Riveted Steel, Olive / Noir City. Oily Steel, Smog, Grime" },
    { id: "solarpunk",       name: "Solarpunk",       description: "Eco-Utopia. Cream ceramic, lush green, solar gold / Night Garden. Bioluminescence, teal" },
    { id: "stonepunk",       name: "Stonepunk",       description: "Bedrock Quarry. Sandstone, Slate, Leather, Clay / Cave Fire. Soot black, Torch Orange" },
    { id: "dreamcore",       name: "Dreamcore",       description: "Daydream. Pastel clouds, blinding light, Cotton Candy / Nightmare. The Void, static noise" },
    { id: "frutiger-aero",   name: "Frutiger Aero",   description: "Windows Vista / Web 2.0. Bubbly, Glossy, Sky Blue, Grass Green / Midnight Aurora" }
  ];

  var STORAGE_KEY_THEME = "ppp-theme";
  var STORAGE_KEY_MODE  = "ppp-mode";
  var DEFAULT_THEME = "webpage";
  var DEFAULT_MODE  = "light";
  var VALID_MODES   = ["light", "dark"];

  var themeIndex = {};
  THEMES.forEach(function (t) { themeIndex[t.id] = t; });

  /* Representative colors per theme — used to style selector buttons */
  var THEME_COLORS = {
    "webpage":        { light: { bg: "#f8f9fa", fg: "#1a1a2e", accent: "#3b82f6" }, dark: { bg: "#1e293b", fg: "#f1f5f9", accent: "#60a5fa" } },
    "mosaic-1993":    { light: { bg: "#008080", fg: "#000000", accent: "#000080" }, dark: { bg: "#3a3a3a", fg: "#c0c0c0", accent: "#6666cc" } },
    "gen7-cockpit":   { light: { bg: "#5c6053", fg: "#d8e0c8", accent: "#4fc845" }, dark: { bg: "#111a0e", fg: "#33ff33", accent: "#33ff33" } },
    "ussr-cockpit":   { light: { bg: "#3d90a2", fg: "#f0faff", accent: "#cc2200" }, dark: { bg: "#3d90a2", fg: "#ffffff", accent: "#ff2200" } },
    "neon-vice-1985": { light: { bg: "#f0d8c8", fg: "#2a0a1a", accent: "#e8187a" }, dark: { bg: "#160025", fg: "#f8e0f0", accent: "#ff1493" } },
    "neon-city-2085": { light: { bg: "#e4dcf8", fg: "#1a0a30", accent: "#7c3aed" }, dark: { bg: "#10082a", fg: "#e0d8ff", accent: "#a855f7" } },
    "coniforest":     { light: { bg: "#e8e4d8", fg: "#1a2e14", accent: "#2d6a4f" }, dark: { bg: "#162412", fg: "#d4e8cc", accent: "#52b788" } },
    "rainforest":     { light: { bg: "#dff0df", fg: "#0c2810", accent: "#059669" }, dark: { bg: "#0c1e10", fg: "#c8f0cc", accent: "#34d399" } },
    "art-deco":       { light: { bg: "#f0e8d0", fg: "#1a1408", accent: "#b8960a" }, dark: { bg: "#141210", fg: "#f0e8c8", accent: "#d4aa00" } },
    "holographic":    { light: { bg: "#f0f0ff", fg: "#2a1a3a", accent: "#8b5cf6" }, dark: { bg: "#120e1e", fg: "#e8e0ff", accent: "#a78bfa" } },
    "vapor":          { light: { bg: "#ffe8f4", fg: "#3a1040", accent: "#e040a0" }, dark: { bg: "#28103a", fg: "#ffc8e8", accent: "#ff50c0" } },
    "paper":          { light: { bg: "#f5ede0", fg: "#2a2018", accent: "#8a4a2a" }, dark: { bg: "#24201a", fg: "#e8dcc8", accent: "#c87a4a" } },
    "ledger-1920":    { light: { bg: "#ecdcbe", fg: "#2a1e0c", accent: "#6a4a1e" }, dark: { bg: "#100e00", fg: "#f0d860", accent: "#e8c000" } },
    "blueprint":      { light: { bg: "#dce8f4", fg: "#0a1a30", accent: "#1a5aa8" }, dark: { bg: "#0e2244", fg: "#d0e4ff", accent: "#5a9aea" } },
    "chalkboard":     { light: { bg: "#d0dac4", fg: "#1a2a14", accent: "#3a6a2a" }, dark: { bg: "#224028", fg: "#f0ece0", accent: "#d0ccb8" } },
    "phosphor":       { light: { bg: "#1a1000", fg: "#ffb300", accent: "#ffaa00" }, dark: { bg: "#001400", fg: "#33ff33", accent: "#33ff33" } },
    "volcano":        { light: { bg: "#f0e0d4", fg: "#2a0e06", accent: "#d4380a" }, dark: { bg: "#1e0e08", fg: "#ffd0b8", accent: "#ff5020" } },
    "oceanic":        { light: { bg: "#dceef4", fg: "#082030", accent: "#0077b6" }, dark: { bg: "#081a2a", fg: "#c8e4f0", accent: "#48cae4" } },
    "steampunk":      { light: { bg: "#e4d4b8", fg: "#2a1a0a", accent: "#b87333" }, dark: { bg: "#1e160c", fg: "#e0c898", accent: "#d4883a" } },
    "dieselpunk":     { light: { bg: "#d0cec8", fg: "#1a1a1a", accent: "#704a18" }, dark: { bg: "#1c1c1a", fg: "#c8c8c4", accent: "#c87830" } },
    "solarpunk":      { light: { bg: "#e8f4d4", fg: "#142a08", accent: "#3a9a20" }, dark: { bg: "#12200e", fg: "#d0eeb8", accent: "#60d840" } },
    "stonepunk":      { light: { bg: "#dcd4c4", fg: "#2a2018", accent: "#7a5a30" }, dark: { bg: "#201a16", fg: "#d0c4b4", accent: "#c09050" } },
    "dreamcore":      { light: { bg: "#f0e4ff", fg: "#30204a", accent: "#b060d0" }, dark: { bg: "#080408", fg: "#d8c8e8", accent: "#8820c0" } },
    "frutiger-aero":  { light: { bg: "#dceefa", fg: "#0a1e3a", accent: "#0078d4" }, dark: { bg: "#0e1e30", fg: "#d0e8fc", accent: "#40a8f0" } }
  };

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */

  function isValidTheme(id) {
    return themeIndex.hasOwnProperty(id);
  }

  function isValidMode(mode) {
    return VALID_MODES.indexOf(mode) !== -1;
  }

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {
      /* storage unavailable — silently degrade */
    }
  }

  function applyAttribute(attr, value) {
    document.documentElement.setAttribute(attr, value);
  }

  function dispatch(eventName, detail) {
    document.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
  }

  /* ------------------------------------------------------------------------
     State
     ------------------------------------------------------------------------ */
  var currentTheme = DEFAULT_THEME;
  var currentMode  = DEFAULT_MODE;

  /* ------------------------------------------------------------------------
     Public API
     ------------------------------------------------------------------------ */
  var ThemeManager = {

    /**
     * Initialize the theme system. Loads saved preferences from localStorage
     * (falling back to defaults) and applies them to the document.
     */
    init: function () {
      var savedTheme = readStorage(STORAGE_KEY_THEME);
      var savedMode  = readStorage(STORAGE_KEY_MODE);

      currentTheme = isValidTheme(savedTheme) ? savedTheme : DEFAULT_THEME;
      currentMode  = isValidMode(savedMode) ? savedMode : DEFAULT_MODE;

      applyAttribute("data-theme", currentTheme);
      applyAttribute("data-mode", currentMode);

      dispatch("themechange", { theme: currentTheme });
      dispatch("modechange", { mode: currentMode });
    },

    /**
     * Switch to a named theme.
     * @param {string} themeName — one of the 24 theme ids.
     */
    setTheme: function (themeName) {
      if (!isValidTheme(themeName)) {
        console.warn("[ThemeManager] Unknown theme: " + themeName);
        return;
      }
      if (themeName === currentTheme) return;

      currentTheme = themeName;
      applyAttribute("data-theme", currentTheme);
      writeStorage(STORAGE_KEY_THEME, currentTheme);
      dispatch("themechange", { theme: currentTheme });
    },

    /**
     * Switch between light and dark mode.
     * @param {string} mode — "light" or "dark".
     */
    setMode: function (mode) {
      if (!isValidMode(mode)) {
        console.warn("[ThemeManager] Invalid mode: " + mode);
        return;
      }
      if (mode === currentMode) return;

      currentMode = mode;
      applyAttribute("data-mode", currentMode);
      writeStorage(STORAGE_KEY_MODE, currentMode);
      dispatch("modechange", { mode: currentMode });
    },

    /** Toggle between light ↔ dark. */
    toggleMode: function () {
      ThemeManager.setMode(currentMode === "light" ? "dark" : "light");
    },

    /** @returns {string} current theme id */
    getCurrentTheme: function () {
      return currentTheme;
    },

    /** @returns {string} "light" or "dark" */
    getCurrentMode: function () {
      return currentMode;
    },

    /**
     * @returns {Array<{id:string, name:string, description:string}>}
     * Defensive copy of the full theme catalogue.
     */
    getThemeList: function () {
      return THEMES.map(function (t) {
        return { id: t.id, name: t.name, description: t.description };
      });
    },

    /* --------------------------------------------------------------------
       UI Helper — Theme Selector
       -------------------------------------------------------------------- */

    /**
     * Build and return a theme-selector UI element.
     *
     * @param {Object}  [options]
     * @param {"dropdown"|"grid"} [options.type="dropdown"] — layout style.
     * @param {boolean} [options.showModeToggle=true] — include a light/dark toggle.
     * @param {Element} [options.container] — if provided, the selector is
     *   appended to this element automatically.
     * @returns {HTMLElement} the root wrapper element.
     */
    createSelector: function (options) {
      var opts = options || {};
      var type = opts.type === "grid" ? "grid" : "dropdown";
      var showModeToggle = opts.showModeToggle !== false;

      var wrapper = document.createElement("div");
      wrapper.className = "theme-selector theme-selector--" + type;

      /* ---------- Theme picker ---------- */
      if (type === "dropdown") {
        wrapper.appendChild(buildDropdown());
      } else {
        wrapper.appendChild(buildGrid());
      }

      /* ---------- Mode toggle ---------- */
      if (showModeToggle) {
        wrapper.appendChild(buildModeToggle());
      }

      /* ---------- Disposal ---------- */
      var cleanupFns = [];

      if (type === "dropdown") {
        cleanupFns.push(wireDropdownSync(wrapper.querySelector(".theme-selector__dropdown")));
      } else {
        cleanupFns.push(wireGridSync(wrapper.querySelector(".theme-selector__grid")));
      }

      if (showModeToggle) {
        cleanupFns.push(wireModeSync(wrapper.querySelector(".theme-selector__mode-toggle")));
      }

      /**
       * Remove document-level listeners created by this selector instance.
       * Call when removing the selector from the DOM to prevent leaks.
       */
      wrapper.destroy = function () {
        cleanupFns.forEach(function (fn) { fn(); });
        cleanupFns.length = 0;
      };

      if (opts.container) {
        opts.container.appendChild(wrapper);
      }
      return wrapper;
    }
  };

  /* ------------------------------------------------------------------------
     Selector Builders (private)
     ------------------------------------------------------------------------ */

  function buildDropdown() {
    var select = document.createElement("select");
    select.className = "theme-selector__dropdown";
    select.setAttribute("aria-label", "Choose a theme");

    THEMES.forEach(function (t) {
      var opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.name;
      opt.title = t.description;
      if (t.id === currentTheme) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener("change", function () {
      ThemeManager.setTheme(select.value);
    });

    return select;
  }

  /** Wire external-sync listener; returns a cleanup function. */
  function wireDropdownSync(select) {
    var handler = function (e) { select.value = e.detail.theme; };
    document.addEventListener("themechange", handler);
    return function () { document.removeEventListener("themechange", handler); };
  }

  function applySwatchColors(btn, themeId, mode) {
    var c = THEME_COLORS[themeId];
    if (!c) return;
    var pal = c[mode] || c.light;
    btn.style.background = pal.bg;
    btn.style.color = pal.fg;
    btn.style.borderColor = pal.accent;
  }

  function buildGrid() {
    var grid = document.createElement("div");
    grid.className = "theme-selector__grid";
    grid.setAttribute("role", "radiogroup");
    grid.setAttribute("aria-label", "Choose a theme");

    THEMES.forEach(function (t) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-selector__swatch";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", t.id === currentTheme ? "true" : "false");
      btn.setAttribute("aria-label", t.name);
      btn.dataset.theme = t.id;
      btn.title = t.name + " — " + t.description;
      btn.textContent = t.name;

      applySwatchColors(btn, t.id, currentMode);

      if (t.id === currentTheme) {
        btn.classList.add("theme-selector__swatch--active");
      }

      btn.addEventListener("click", function () {
        ThemeManager.setTheme(t.id);
      });

      grid.appendChild(btn);
    });

    return grid;
  }

  /** Wire external-sync listener; returns a cleanup function. */
  function wireGridSync(grid) {
    var themeHandler = function (e) {
      var buttons = grid.querySelectorAll(".theme-selector__swatch");
      for (var i = 0; i < buttons.length; i++) {
        var isActive = buttons[i].dataset.theme === e.detail.theme;
        buttons[i].classList.toggle("theme-selector__swatch--active", isActive);
        buttons[i].setAttribute("aria-checked", isActive ? "true" : "false");
      }
    };
    var modeHandler = function (e) {
      var mode = e.detail.mode;
      var buttons = grid.querySelectorAll(".theme-selector__swatch");
      for (var i = 0; i < buttons.length; i++) {
        applySwatchColors(buttons[i], buttons[i].dataset.theme, mode);
      }
    };
    document.addEventListener("themechange", themeHandler);
    document.addEventListener("modechange", modeHandler);
    return function () {
      document.removeEventListener("themechange", themeHandler);
      document.removeEventListener("modechange", modeHandler);
    };
  }

  function buildModeToggle() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-selector__mode-toggle";
    btn.setAttribute("aria-label", "Toggle light/dark mode");
    setModeLabel(btn);

    btn.addEventListener("click", function () {
      ThemeManager.toggleMode();
    });

    return btn;
  }

  /** Wire external-sync listener; returns a cleanup function. */
  function wireModeSync(btn) {
    var handler = function () { setModeLabel(btn); };
    document.addEventListener("modechange", handler);
    return function () { document.removeEventListener("modechange", handler); };
  }

  function setModeLabel(btn) {
    var isDark = currentMode === "dark";
    btn.textContent = isDark ? "☀ Light" : "☾ Dark";
    btn.setAttribute("aria-pressed", isDark ? "true" : "false");
  }

  /* ------------------------------------------------------------------------
     Expose globally
     ------------------------------------------------------------------------ */
  window.ThemeManager = ThemeManager;
})();
