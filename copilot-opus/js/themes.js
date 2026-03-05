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
    { id: "webpage",         name: "Webpage",         description: "Clean modern web" },
    { id: "mosaic-1993",     name: "Mosaic 1993",     description: "Early web browser, chunky borders, Courier font" },
    { id: "gen7-cockpit",    name: "Gen-7 Cockpit",   description: "Military avionics, green/amber on dark" },
    { id: "ussr-cockpit",    name: "USSR Cockpit",    description: "Soviet instrument panel, red/amber" },
    { id: "neon-vice-1985",  name: "Neon Vice 1985",  description: "Miami Vice, hot pink / cyan neon" },
    { id: "neon-city-2085",  name: "Neon City 2085",  description: "Cyberpunk, purple/cyan" },
    { id: "coniforest",      name: "Coniforest",      description: "Pine forest greens and earth tones" },
    { id: "rainforest",      name: "Rainforest",      description: "Lush tropical greens" },
    { id: "art-deco",        name: "Art Deco",        description: "Gold / black / cream, geometric" },
    { id: "holographic",     name: "Holographic",     description: "Iridescent rainbow shifts" },
    { id: "vapor",           name: "Vapor",           description: "Vaporwave pastel pink / purple / teal" },
    { id: "paper",           name: "Paper",           description: "Warm cream stationery" },
    { id: "ledger-1920",     name: "Ledger 1920",     description: "Sepia accounting ledger" },
    { id: "blueprint",       name: "Blueprint",       description: "Blue / white technical drawing" },
    { id: "chalkboard",      name: "Chalkboard",      description: "Green board with chalk white" },
    { id: "phosphor",        name: "Phosphor",        description: "Green phosphor CRT terminal" },
    { id: "volcano",         name: "Volcano",         description: "Deep red / orange lava" },
    { id: "oceanic",         name: "Oceanic",         description: "Deep blues and aqua" },
    { id: "steampunk",       name: "Steampunk",       description: "Copper / brass / leather brown" },
    { id: "dieselpunk",      name: "Dieselpunk",      description: "Industrial gray / riveted metal" },
    { id: "solarpunk",       name: "Solarpunk",       description: "Bright green / gold sustainable future" },
    { id: "stonepunk",       name: "Stonepunk",       description: "Earth / stone gray / brown, primitive tech" },
    { id: "dreamcore",       name: "Dreamcore",       description: "Surreal pastel liminal spaces" },
    { id: "frutiger-aero",   name: "Frutiger Aero",   description: "Glossy blue / white / glass (2006-era)" }
  ];

  var STORAGE_KEY_THEME = "ppp-theme";
  var STORAGE_KEY_MODE  = "ppp-mode";
  var DEFAULT_THEME = "webpage";
  var DEFAULT_MODE  = "light";
  var VALID_MODES   = ["light", "dark"];

  var themeIndex = {};
  THEMES.forEach(function (t) { themeIndex[t.id] = t; });

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
    var handler = function (e) {
      var buttons = grid.querySelectorAll(".theme-selector__swatch");
      for (var i = 0; i < buttons.length; i++) {
        var isActive = buttons[i].dataset.theme === e.detail.theme;
        buttons[i].classList.toggle("theme-selector__swatch--active", isActive);
        buttons[i].setAttribute("aria-checked", isActive ? "true" : "false");
      }
    };
    document.addEventListener("themechange", handler);
    return function () { document.removeEventListener("themechange", handler); };
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
