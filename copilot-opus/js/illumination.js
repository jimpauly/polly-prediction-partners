/* ==========================================================================
   Paulie's Prediction Partners — Illumination Controller
   ==========================================================================
   Drives the 7-channel cockpit lighting system defined in illumination.css.
   Channels: Master, Text Primary, Text Secondary, Bars Primary,
             Bars Secondary, Flood, Display.

   Master defaults OFF; every other channel defaults ON at MAX (1.00).
   DAY mode (data-mode="light") → 60 % base.  NVG (dark) → 100 %.
   Dimmers scale 0.25 – 1.00.  State persists via localStorage.

   Exposes window.IlluminationController with public API.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Constants
     ------------------------------------------------------------------------ */

  var STORAGE_KEY = "ppp-illumination";

  var CHANNELS = [
    { id: "text-primary",   label: "TEXT PRI",   desc: "Main Words",    variant: "primary"   },
    { id: "text-secondary", label: "TEXT SEC",    desc: "Other Words",   variant: "secondary" },
    { id: "bars-primary",   label: "BARS PRI",   desc: "Main Lines",    variant: "primary"   },
    { id: "bars-secondary", label: "BARS SEC",    desc: "Other Lines",   variant: "secondary" },
    { id: "flood",          label: "FLOOD",       desc: "Room Light",    variant: "warning"   },
    { id: "display",        label: "DISPLAY",     desc: "Screens",       variant: "info"      }
  ];

  var DIMMER_MIN  = 0.25;
  var DIMMER_MAX  = 1.0;
  var DIMMER_STEP = 0.01;

  /* Dial visual range: 270° arc starting at 210° (7-o'clock) */
  var DIAL_ARC_DEG   = 270;
  var DIAL_START_DEG = 210;

  /* Guard auto-close delay after master OFF (ms) */
  var GUARD_CLOSE_DELAY = 600;

  /* ------------------------------------------------------------------------
     State
     ------------------------------------------------------------------------ */

  function defaultState() {
    var s = { masterOn: false, channels: {} };
    CHANNELS.forEach(function (ch) {
      s.channels[ch.id] = { on: true, dim: DIMMER_MAX };
    });
    return s;
  }

  var state = defaultState();

  /* UI references (set by createControlPanel, nullable) */
  var panelRef = null;
  var guardRef = null;
  var guardTimer = null;

  /* ------------------------------------------------------------------------
     Storage helpers — mirror pattern from themes.js
     ------------------------------------------------------------------------ */

  function readStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function writeStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      /* storage unavailable — silently degrade */
    }
  }

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */

  function getModeFactor() {
    var mode = document.documentElement.getAttribute("data-mode");
    return mode === "dark" ? 1.0 : 0.6;
  }

  function clampDim(value) {
    var v = parseFloat(value);
    if (isNaN(v)) return DIMMER_MAX;
    return Math.min(DIMMER_MAX, Math.max(DIMMER_MIN, v));
  }

  /** Map a dimmer value (0.25 – 1.0) to a knob rotation angle. */
  function dimToRotation(dim) {
    var fraction = (dim - DIMMER_MIN) / (DIMMER_MAX - DIMMER_MIN);
    return DIAL_START_DEG + fraction * DIAL_ARC_DEG;
  }

  /* ------------------------------------------------------------------------
     CSS application — sets custom properties on :root
     ------------------------------------------------------------------------ */

  function applyCSS() {
    var root = document.documentElement.style;

    root.setProperty("--fx-master-switch", state.masterOn ? "1" : "0");

    CHANNELS.forEach(function (ch) {
      var c = state.channels[ch.id];
      var value = c.on ? c.dim : 0;
      root.setProperty("--fx-ch-" + ch.id, value.toString());
    });
  }

  /* ------------------------------------------------------------------------
     Event dispatch
     ------------------------------------------------------------------------ */

  function dispatchChange() {
    document.dispatchEvent(
      new CustomEvent("illuminationchange", {
        detail: IlluminationController.getState()
      })
    );
  }

  /* ------------------------------------------------------------------------
     UI sync — keeps DOM controls in lock-step with internal state
     ------------------------------------------------------------------------ */

  function syncUI() {
    if (!panelRef) return;

    /* Master switch */
    var masterInput = panelRef.querySelector('[data-channel="master"]');
    if (masterInput) masterInput.checked = state.masterOn;

    /* Guard cover */
    if (guardRef) {
      if (state.masterOn) {
        clearTimeout(guardTimer);
        guardRef.classList.add("switch-guard--open");
      } else {
        guardTimer = setTimeout(function () {
          if (guardRef) guardRef.classList.remove("switch-guard--open");
        }, GUARD_CLOSE_DELAY);
      }
    }

    /* Channel switches + dimmers */
    CHANNELS.forEach(function (ch) {
      var c = state.channels[ch.id];

      var toggle = panelRef.querySelector(
        '.airplane-switch [data-channel="' + ch.id + '"]'
      );
      if (toggle) toggle.checked = c.on;

      var dial = panelRef.querySelector(
        '.dimmer-dial[data-channel="' + ch.id + '"]'
      );
      if (!dial) return;

      var range = dial.querySelector('input[type="range"]');
      var knob  = dial.querySelector(".dimmer-dial__knob");
      var readout = dial.querySelector(".dimmer-dial__value");

      if (range) range.value = c.dim;
      if (knob) {
        knob.style.setProperty("--dial-rotation", dimToRotation(c.dim) + "deg");
        knob.style.setProperty("--dial-fraction", c.dim.toString());
      }
      if (readout) readout.textContent = Math.round(c.dim * 100) + "%";
    });
  }

  /* ------------------------------------------------------------------------
     Update cycle — apply → persist → sync UI → notify
     ------------------------------------------------------------------------ */

  function update() {
    applyCSS();
    writeStorage();
    syncUI();
    dispatchChange();
  }

  /* ------------------------------------------------------------------------
     DOM builders (private)
     ------------------------------------------------------------------------ */

  function buildSwitch(channelId, variant, checked) {
    var label = document.createElement("label");
    label.className = "airplane-switch airplane-switch--" + variant;

    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.setAttribute("data-channel", channelId);
    input.setAttribute(
      "aria-label",
      channelId === "master"
        ? "Master lighting switch"
        : channelId.replace(/-/g, " ") + " toggle"
    );

    input.addEventListener("change", function () {
      if (channelId === "master") {
        IlluminationController.setMaster(input.checked);
      } else {
        IlluminationController.toggleChannel(channelId);
      }
    });

    var body  = document.createElement("span");
    body.className = "airplane-switch__body";
    var lever = document.createElement("span");
    lever.className = "airplane-switch__lever";
    body.appendChild(lever);

    label.appendChild(input);
    label.appendChild(body);
    return label;
  }

  function buildDimmer(channelId, value) {
    var wrapper = document.createElement("label");
    wrapper.className = "dimmer-dial";
    wrapper.setAttribute("data-channel", channelId);

    var input = document.createElement("input");
    input.type  = "range";
    input.min   = DIMMER_MIN.toString();
    input.max   = DIMMER_MAX.toString();
    input.step  = DIMMER_STEP.toString();
    input.value = value.toString();
    input.setAttribute("aria-label", channelId.replace(/-/g, " ") + " dimmer");

    input.addEventListener("input", function () {
      IlluminationController.setChannel(channelId, parseFloat(input.value));
    });

    var knob = document.createElement("span");
    knob.className = "dimmer-dial__knob";
    knob.style.setProperty("--dial-rotation", dimToRotation(value) + "deg");
    knob.style.setProperty("--dial-fraction", value.toString());

    var indicator = document.createElement("span");
    indicator.className = "dimmer-dial__indicator";
    knob.appendChild(indicator);

    var readout = document.createElement("span");
    readout.className = "dimmer-dial__value";
    readout.textContent = Math.round(value * 100) + "%";

    wrapper.appendChild(input);
    wrapper.appendChild(knob);
    wrapper.appendChild(readout);
    return wrapper;
  }

  function buildDivider() {
    var el = document.createElement("div");
    el.className = "illumination-panel__divider";
    return el;
  }

  /* ------------------------------------------------------------------------
     Public API
     ------------------------------------------------------------------------ */

  var IlluminationController = {

    /**
     * Initialize the illumination system.
     * Loads saved state from localStorage, applies CSS custom properties,
     * and listens for ThemeManager's 'modechange' events.
     */
    init: function () {
      var saved = readStorage();
      if (saved) {
        state.masterOn = !!saved.masterOn;
        if (saved.channels) {
          CHANNELS.forEach(function (ch) {
            var sc = saved.channels[ch.id];
            if (sc) {
              state.channels[ch.id] = {
                on:  sc.on !== false,
                dim: clampDim(sc.dim)
              };
            }
          });
        }
      }

      applyCSS();

      document.addEventListener("modechange", function () {
        /* CSS already adjusts --fx-mode-base via [data-mode] selector.
           Re-dispatch so consumers can react to the changed effective values. */
        dispatchChange();
      });
    },

    /**
     * Set a channel's dimmer value.
     * @param {string} channel — one of the 6 channel ids.
     * @param {number} value   — 0.25 – 1.0.
     */
    setChannel: function (channel, value) {
      if (!state.channels[channel]) {
        console.warn("[IlluminationController] Unknown channel: " + channel);
        return;
      }
      state.channels[channel].dim = clampDim(value);
      update();
    },

    /**
     * Toggle a channel ON / OFF.
     * @param {string} channel — one of the 6 channel ids.
     */
    toggleChannel: function (channel) {
      if (!state.channels[channel]) {
        console.warn("[IlluminationController] Unknown channel: " + channel);
        return;
      }
      state.channels[channel].on = !state.channels[channel].on;
      update();
    },

    /**
     * Toggle the master switch.
     * @param {boolean} on — true = ON, false = OFF.
     */
    setMaster: function (on) {
      state.masterOn = !!on;
      update();
    },

    /**
     * Return the full illumination state including computed effective values.
     * effectiveValue = masterOn × channelOn × channelDim × baseFactor.
     * @returns {Object}
     */
    getState: function () {
      var base = getModeFactor();
      var masterMul = (state.masterOn ? 1 : 0) * base;

      var channels = {};
      CHANNELS.forEach(function (ch) {
        var c = state.channels[ch.id];
        channels[ch.id] = {
          on:        c.on,
          dim:       c.dim,
          effective: masterMul * (c.on ? c.dim : 0)
        };
      });

      return {
        masterOn:    state.masterOn,
        baseFactor:  base,
        masterScale: masterMul,
        channels:    channels
      };
    },

    /**
     * Build the illumination control panel inside a container element.
     * Generates cockpit-style switches and dimmer dials using classes from
     * illumination.css.
     *
     * @param {HTMLElement} container — DOM node to append the panel into.
     * @returns {HTMLElement} the panel root element.
     */
    createControlPanel: function (container) {
      var panel = document.createElement("div");
      panel.className = "illumination-panel";
      panel.setAttribute("role", "group");
      panel.setAttribute("aria-label", "Lighting controls");
      panelRef = panel;

      /* ---- Header ---- */
      var header = document.createElement("div");
      header.className = "illumination-panel__channel";
      header.style.gridColumn = "1 / -1";

      var title = document.createElement("span");
      title.className = "illumination-panel__label";
      title.style.fontSize = "0.85rem";
      title.style.letterSpacing = "0.2em";
      title.textContent = "\u2708 LIGHTING";
      header.appendChild(title);
      panel.appendChild(header);

      /* ---- Master with safety guard ---- */
      var masterSection = document.createElement("div");
      masterSection.className = "illumination-panel__channel";

      var masterLabel = document.createElement("span");
      masterLabel.className = "illumination-panel__label";
      masterLabel.textContent = "MASTER";
      masterSection.appendChild(masterLabel);

      var guard = document.createElement("div");
      guard.className = "switch-guard";
      if (state.masterOn) guard.classList.add("switch-guard--open");
      guardRef = guard;

      var cover = document.createElement("div");
      cover.className = "switch-guard__cover";
      cover.setAttribute("aria-label", "Lift safety cover");
      cover.addEventListener("click", function () {
        guard.classList.add("switch-guard--open");
      });
      guard.appendChild(cover);

      guard.appendChild(buildSwitch("master", "master", state.masterOn));
      masterSection.appendChild(guard);

      var masterDesc = document.createElement("span");
      masterDesc.className = "illumination-panel__label";
      masterDesc.style.fontSize = "0.55rem";
      masterDesc.textContent = "All Lights";
      masterSection.appendChild(masterDesc);

      panel.appendChild(masterSection);

      /* ---- Divider ---- */
      panel.appendChild(buildDivider());

      /* ---- Per-channel controls ---- */
      CHANNELS.forEach(function (ch) {
        var c = state.channels[ch.id];
        var section = document.createElement("div");
        section.className = "illumination-panel__channel";

        var lbl = document.createElement("span");
        lbl.className = "illumination-panel__label";
        lbl.textContent = ch.label;
        section.appendChild(lbl);

        section.appendChild(buildSwitch(ch.id, ch.variant, c.on));
        section.appendChild(buildDimmer(ch.id, c.dim));

        var desc = document.createElement("span");
        desc.className = "illumination-panel__label";
        desc.style.fontSize = "0.55rem";
        desc.textContent = ch.desc;
        section.appendChild(desc);

        panel.appendChild(section);
      });

      /* ---- Attach & sync ---- */
      container.appendChild(panel);
      syncUI();

      /* ---- Cleanup handle ---- */
      var cleanups = [];

      var modeHandler = function () { syncUI(); };
      document.addEventListener("modechange", modeHandler);
      cleanups.push(function () {
        document.removeEventListener("modechange", modeHandler);
      });

      /** Remove event listeners when the panel is torn down. */
      panel.destroy = function () {
        cleanups.forEach(function (fn) { fn(); });
        cleanups.length = 0;
        if (panelRef === panel) {
          panelRef = null;
          guardRef = null;
        }
      };

      return panel;
    }
  };

  /* ------------------------------------------------------------------------
     Expose globally
     ------------------------------------------------------------------------ */
  window.IlluminationController = IlluminationController;
})();
