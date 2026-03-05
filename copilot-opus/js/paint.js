/* ==========================================================================
   Paulie's Prediction Partners — Design Studio (MS Paint 1998 Clone)
   ==========================================================================
   Fully functional MS Paint clone styled after Windows 98.
   Exposes window.PaintApp with init(container) and destroy() methods.

   Features: Pencil, Brush, Eraser, Fill, Line, Rectangle, Ellipse,
   Rounded Rectangle, Eyedropper, Airbrush, Text tool, Color palette,
   Undo (Ctrl+Z, 20 levels), and classic Win98 chrome.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Constants
     ------------------------------------------------------------------------ */

  var CANVAS_W = 640;
  var CANVAS_H = 480;
  var MAX_UNDO = 20;

  /* Win98 palette: 14 colors per row, 28 swatches total */
  var PALETTE_ROW1 = [
    "#000000", "#808080", "#800000", "#808000",
    "#008000", "#008080", "#000080", "#800080",
    "#808040", "#004040", "#0080ff", "#004080",
    "#4000ff", "#804000"
  ];
  var PALETTE_ROW2 = [
    "#ffffff", "#c0c0c0", "#ff0000", "#ffff00",
    "#00ff00", "#00ffff", "#0000ff", "#ff00ff",
    "#ffff80", "#00ff80", "#80ffff", "#0080ff",
    "#ff0080", "#ff8040"
  ];

  var TOOLS = [
    { id: "free-select",  icon: "⬚",  tip: "Free-Form Select" },
    { id: "select",       icon: "⊡",  tip: "Select" },
    { id: "eraser",       icon: "▓",  tip: "Eraser/Color Eraser" },
    { id: "fill",         icon: "🪣", tip: "Fill With Color" },
    { id: "eyedropper",   icon: "💉", tip: "Pick Color" },
    { id: "magnifier",    icon: "🔍", tip: "Magnifier" },
    { id: "pencil",       icon: "✏",  tip: "Pencil" },
    { id: "brush",        icon: "🖌",  tip: "Brush" },
    { id: "airbrush",     icon: "💨", tip: "Airbrush" },
    { id: "text",         icon: "A",  tip: "Text" },
    { id: "line",         icon: "╲",  tip: "Line" },
    { id: "curve",        icon: "⌒",  tip: "Curve" },
    { id: "rectangle",    icon: "▭",  tip: "Rectangle" },
    { id: "polygon",      icon: "⬠",  tip: "Polygon" },
    { id: "ellipse",      icon: "⬭",  tip: "Ellipse" },
    { id: "roundrect",    icon: "▢",  tip: "Rounded Rectangle" }
  ];

  var LINE_WIDTHS = [1, 2, 3, 5];

  var FILL_MODES = ["outline", "filledOutline", "filled"];

  /* ------------------------------------------------------------------------
     CSS (injected once)
     ------------------------------------------------------------------------ */

  var CSS_ID = "ppp-paint-styles";

  var CSS = (function () {
    /*
     * All rules scoped under .paint98 to avoid leaking.
     * Classic Win98: #c0c0c0 bg, beveled 3-D borders, Tahoma / MS Sans Serif.
     */
    return [
      /* ---- Reset & Container ---- */
      ".paint98 *, .paint98 *::before, .paint98 *::after { box-sizing: border-box; margin: 0; padding: 0; }",
      ".paint98 { font-family: 'Tahoma', 'MS Sans Serif', 'Arial', sans-serif; font-size: 11px; color: #000; background: #c0c0c0; display: flex; flex-direction: column; border: 2px outset #dfdfdf; user-select: none; -webkit-user-select: none; position: relative; }",
      ".paint98.maximized { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999; }",

      /* ---- Title Bar ---- */
      ".paint98 .title-bar { display: flex; align-items: center; background: linear-gradient(90deg, #000080, #1084d0); color: #fff; font-weight: bold; font-size: 11px; padding: 2px 3px; height: 20px; cursor: default; }",
      ".paint98 .title-bar .title-icon { width: 16px; height: 16px; margin-right: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; }",
      ".paint98 .title-bar .title-text { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
      ".paint98 .title-bar .title-buttons { display: flex; gap: 2px; }",
      ".paint98 .title-bar .title-btn { width: 16px; height: 14px; font-size: 9px; line-height: 14px; text-align: center; background: #c0c0c0; border: 1.5px outset #fff; cursor: pointer; font-family: 'Marlett', 'Webdings', sans-serif; color: #000; padding: 0; }",
      ".paint98 .title-bar .title-btn:active { border-style: inset; }",

      /* ---- Menu Bar ---- */
      ".paint98 .menu-bar { display: flex; background: #c0c0c0; border-bottom: 1px solid #808080; padding: 1px 0; height: 20px; position: relative; }",
      ".paint98 .menu-bar .menu-item { padding: 2px 8px; cursor: default; position: relative; }",
      ".paint98 .menu-bar .menu-item:hover { background: #000080; color: #fff; }",
      ".paint98 .menu-bar .menu-dropdown { display: none; position: absolute; top: 100%; left: 0; background: #c0c0c0; border: 2px outset #dfdfdf; min-width: 160px; z-index: 1000; padding: 2px 0; }",
      ".paint98 .menu-bar .menu-item.open .menu-dropdown { display: block; }",
      ".paint98 .menu-bar .menu-dropdown .menu-action { padding: 3px 24px 3px 8px; cursor: default; white-space: nowrap; }",
      ".paint98 .menu-bar .menu-dropdown .menu-action:hover { background: #000080; color: #fff; }",
      ".paint98 .menu-bar .menu-dropdown .menu-sep { height: 1px; background: #808080; margin: 2px 4px; }",

      /* ---- Main Body ---- */
      ".paint98 .main-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }",

      /* ---- Tool Palette ---- */
      ".paint98 .tool-palette { width: 58px; min-width: 58px; background: #c0c0c0; border-right: 1px solid #808080; display: flex; flex-direction: column; align-items: center; padding: 2px 2px 4px 2px; }",
      ".paint98 .tool-grid { display: grid; grid-template-columns: 24px 24px; gap: 1px; margin-bottom: 4px; }",
      ".paint98 .tool-btn { width: 24px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer; background: #c0c0c0; border: 1.5px outset #dfdfdf; line-height: 1; }",
      ".paint98 .tool-btn.active { border: 1.5px inset #808080; background: #b0b0b0; }",
      ".paint98 .tool-btn:hover:not(.active) { border-color: #fff #808080 #808080 #fff; }",

      /* ---- Line Width Selector ---- */
      ".paint98 .line-width-panel { border: 1.5px inset #808080; background: #fff; width: 48px; padding: 2px; margin-top: 2px; }",
      ".paint98 .line-width-option { height: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin: 1px 0; border: 1px solid transparent; }",
      ".paint98 .line-width-option.active { border: 1px dotted #000; background: #c0c0ff; }",
      ".paint98 .line-width-option .lw-line { background: #000; display: block; width: 80%; }",

      /* ---- Fill Mode Selector ---- */
      ".paint98 .fill-mode-panel { border: 1.5px inset #808080; background: #fff; width: 48px; padding: 2px; margin-top: 4px; }",
      ".paint98 .fill-mode-option { height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin: 1px 0; border: 1px solid transparent; }",
      ".paint98 .fill-mode-option.active { border: 1px dotted #000; background: #c0c0ff; }",
      ".paint98 .fill-mode-option .fm-shape { width: 20px; height: 14px; border: 2px solid #000; }",
      ".paint98 .fill-mode-option.fm-filledOutline .fm-shape { background: #808080; }",
      ".paint98 .fill-mode-option.fm-filled .fm-shape { background: #808080; border-color: #808080; }",

      /* ---- Canvas Area ---- */
      ".paint98 .canvas-area { flex: 1; background: #808080; overflow: auto; position: relative; display: flex; align-items: flex-start; justify-content: flex-start; padding: 4px; }",
      ".paint98 .canvas-wrap { background: #fff; border: 1px solid #808080; position: relative; flex-shrink: 0; cursor: crosshair; }",
      ".paint98 .canvas-wrap canvas { display: block; }",
      ".paint98 .canvas-overlay { position: absolute; top: 0; left: 0; pointer-events: none; }",

      /* ---- Color Palette ---- */
      ".paint98 .color-bar { display: flex; align-items: center; background: #c0c0c0; border-top: 1px solid #808080; padding: 3px 4px; gap: 8px; height: 34px; }",
      ".paint98 .fg-bg-indicator { position: relative; width: 30px; height: 26px; flex-shrink: 0; }",
      ".paint98 .fg-bg-indicator .bg-swatch { position: absolute; right: 0; bottom: 0; width: 18px; height: 18px; border: 1.5px outset #dfdfdf; }",
      ".paint98 .fg-bg-indicator .fg-swatch { position: absolute; left: 0; top: 0; width: 18px; height: 18px; border: 1.5px outset #dfdfdf; z-index: 1; }",
      ".paint98 .palette-grid { display: flex; flex-direction: column; gap: 1px; }",
      ".paint98 .palette-row { display: flex; gap: 1px; }",
      ".paint98 .palette-cell { width: 16px; height: 12px; border: 1px solid #808080; cursor: pointer; }",
      ".paint98 .palette-cell:hover { border-color: #fff; }",

      /* ---- Status Bar ---- */
      ".paint98 .status-bar { display: flex; align-items: center; background: #c0c0c0; border-top: 1px solid #fff; padding: 2px 4px; height: 20px; font-size: 11px; }",
      ".paint98 .status-bar .status-section { border: 1px inset #808080; padding: 0 6px; height: 16px; line-height: 16px; margin-right: 4px; }",
      ".paint98 .status-bar .status-coords { min-width: 80px; }",
      ".paint98 .status-bar .status-size { min-width: 80px; }",

      /* Cursor styles */
      ".paint98 .canvas-wrap.tool-pencil { cursor: crosshair; }",
      ".paint98 .canvas-wrap.tool-brush { cursor: crosshair; }",
      ".paint98 .canvas-wrap.tool-eraser { cursor: cell; }",
      ".paint98 .canvas-wrap.tool-fill { cursor: crosshair; }",
      ".paint98 .canvas-wrap.tool-eyedropper { cursor: crosshair; }",
      ".paint98 .canvas-wrap.tool-line { cursor: crosshair; }",
      ".paint98 .canvas-wrap.tool-rectangle { cursor: crosshair; }",
      ".paint98 .canvas-wrap.tool-ellipse { cursor: crosshair; }",
      ".paint98 .canvas-wrap.tool-roundrect { cursor: crosshair; }",
      ".paint98 .canvas-wrap.tool-airbrush { cursor: crosshair; }",
      ".paint98 .canvas-wrap.tool-text { cursor: text; }",

      ""
    ].join("\n");
  })();

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "className") { e.className = attrs[k]; }
        else if (k === "style" && typeof attrs[k] === "object") {
          Object.keys(attrs[k]).forEach(function (s) { e.style[s] = attrs[k][s]; });
        }
        else if (k.indexOf("on") === 0) { e.addEventListener(k.slice(2).toLowerCase(), attrs[k]); }
        else { e.setAttribute(k, attrs[k]); }
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        if (typeof c === "string") { e.appendChild(document.createTextNode(c)); }
        else { e.appendChild(c); }
      });
    }
    return e;
  }

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return { r: r, g: g, b: b };
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function colorsMatch(a, b, tolerance) {
    tolerance = tolerance || 0;
    return Math.abs(a[0] - b[0]) <= tolerance &&
           Math.abs(a[1] - b[1]) <= tolerance &&
           Math.abs(a[2] - b[2]) <= tolerance &&
           Math.abs(a[3] - b[3]) <= tolerance;
  }

  /* ------------------------------------------------------------------------
     PaintApp
     ------------------------------------------------------------------------ */

  var state, dom, handlers;

  function resetState() {
    state = {
      tool: "pencil",
      fgColor: "#000000",
      bgColor: "#ffffff",
      lineWidth: 1,
      fillMode: "outline",
      drawing: false,
      lastX: 0,
      lastY: 0,
      startX: 0,
      startY: 0,
      undoStack: [],
      maximized: false,
      fileName: "untitled"
    };
  }

  /* ----------- Build UI ----------- */

  function buildTitleBar() {
    return el("div", { className: "title-bar" }, [
      el("div", { className: "title-icon" }, "🎨"),
      el("div", { className: "title-text" }, state.fileName + " - Paint"),
      el("div", { className: "title-buttons" }, [
        el("button", { className: "title-btn", title: "Minimize", onClick: function () {} }, "−"),
        el("button", { className: "title-btn maximize-btn", title: "Maximize", onClick: toggleMaximize }, "□"),
        el("button", { className: "title-btn", title: "Close", onClick: function () { if (dom.root) dom.root.style.display = "none"; } }, "✕")
      ])
    ]);
  }

  function buildMenuBar() {
    var menus = {
      "File": [
        { label: "New", action: clearCanvas, shortcut: "Ctrl+N" },
        { sep: true },
        { label: "Save (download PNG)", action: saveCanvas, shortcut: "Ctrl+S" }
      ],
      "Edit": [
        { label: "Undo", action: undo, shortcut: "Ctrl+Z" },
        { sep: true },
        { label: "Select All", action: selectAll, shortcut: "Ctrl+A" },
        { label: "Clear Selection / Canvas", action: clearCanvas, shortcut: "Del" }
      ],
      "View": [
        { label: "Tool Box", action: noop },
        { label: "Color Box", action: noop },
        { label: "Status Bar", action: noop }
      ],
      "Image": [
        { label: "Flip/Rotate...", action: noop },
        { label: "Stretch/Skew...", action: noop },
        { label: "Invert Colors", action: invertColors },
        { label: "Clear Image", action: clearCanvas }
      ],
      "Colors": [
        { label: "Edit Colors...", action: noop }
      ],
      "Help": [
        { label: "About Paint", action: function () { alert("Paulie's Prediction Partners\nDesign Studio — Paint 98 Clone\n\nHave fun drawing!"); } }
      ]
    };

    var bar = el("div", { className: "menu-bar" });
    var openMenu = null;

    Object.keys(menus).forEach(function (name) {
      var item = el("div", { className: "menu-item" }, name);
      var dropdown = el("div", { className: "menu-dropdown" });

      menus[name].forEach(function (entry) {
        if (entry.sep) {
          dropdown.appendChild(el("div", { className: "menu-sep" }));
        } else {
          var label = entry.label;
          if (entry.shortcut) label += "\t" + entry.shortcut;
          var action = el("div", { className: "menu-action", onClick: function (e) {
            e.stopPropagation();
            closeAllMenus();
            if (entry.action) entry.action();
          } }, entry.label);
          if (entry.shortcut) {
            var sc = el("span", { style: { float: "right", color: "#808080", marginLeft: "16px" } }, entry.shortcut);
            action.appendChild(sc);
          }
          dropdown.appendChild(action);
        }
      });

      item.appendChild(dropdown);

      item.addEventListener("mousedown", function (e) {
        e.stopPropagation();
        if (item.classList.contains("open")) {
          closeAllMenus();
        } else {
          closeAllMenus();
          item.classList.add("open");
          openMenu = item;
        }
      });

      item.addEventListener("mouseenter", function () {
        if (openMenu && openMenu !== item) {
          closeAllMenus();
          item.classList.add("open");
          openMenu = item;
        }
      });

      bar.appendChild(item);
    });

    function closeAllMenus() {
      bar.querySelectorAll(".menu-item").forEach(function (mi) { mi.classList.remove("open"); });
      openMenu = null;
    }

    /* Close menus on click outside */
    handlers.closeMenus = function () { closeAllMenus(); };

    return bar;
  }

  function buildToolPalette() {
    var palette = el("div", { className: "tool-palette" });
    var grid = el("div", { className: "tool-grid" });

    TOOLS.forEach(function (t) {
      var btn = el("button", {
        className: "tool-btn" + (t.id === state.tool ? " active" : ""),
        title: t.tip,
        "data-tool": t.id,
        onClick: function () {
          state.tool = t.id;
          updateToolSelection();
        }
      }, t.icon);
      grid.appendChild(btn);
    });

    palette.appendChild(grid);

    /* Line width selector */
    var lwPanel = el("div", { className: "line-width-panel" });
    LINE_WIDTHS.forEach(function (w) {
      var opt = el("div", {
        className: "line-width-option" + (w === state.lineWidth ? " active" : ""),
        "data-lw": String(w),
        onClick: function () {
          state.lineWidth = w;
          updateLineWidthSelection();
        }
      }, [
        el("span", { className: "lw-line", style: { height: w + "px" } })
      ]);
      lwPanel.appendChild(opt);
    });
    palette.appendChild(lwPanel);

    /* Fill mode selector (for shape tools) */
    var fmPanel = el("div", { className: "fill-mode-panel" });
    FILL_MODES.forEach(function (mode) {
      var opt = el("div", {
        className: "fill-mode-option fm-" + mode + (mode === state.fillMode ? " active" : ""),
        "data-fm": mode,
        onClick: function () {
          state.fillMode = mode;
          updateFillModeSelection();
        }
      }, [
        el("div", { className: "fm-shape" })
      ]);
      fmPanel.appendChild(opt);
    });
    palette.appendChild(fmPanel);

    return palette;
  }

  function buildCanvasArea() {
    var area = el("div", { className: "canvas-area" });
    var wrap = el("div", { className: "canvas-wrap tool-" + state.tool });

    var canvas = el("canvas", { width: String(CANVAS_W), height: String(CANVAS_H) });
    var overlay = el("canvas", {
      className: "canvas-overlay",
      width: String(CANVAS_W),
      height: String(CANVAS_H)
    });

    wrap.style.width = CANVAS_W + "px";
    wrap.style.height = CANVAS_H + "px";

    wrap.appendChild(canvas);
    wrap.appendChild(overlay);
    area.appendChild(wrap);

    dom.canvas = canvas;
    dom.overlay = overlay;
    dom.canvasWrap = wrap;
    dom.canvasArea = area;

    return area;
  }

  function buildColorBar() {
    var bar = el("div", { className: "color-bar" });

    /* FG / BG indicator */
    var indicator = el("div", { className: "fg-bg-indicator" });
    var bgSwatch = el("div", { className: "bg-swatch", style: { background: state.bgColor } });
    var fgSwatch = el("div", { className: "fg-swatch", style: { background: state.fgColor } });
    indicator.appendChild(bgSwatch);
    indicator.appendChild(fgSwatch);

    indicator.addEventListener("click", function () {
      /* Swap fg/bg */
      var tmp = state.fgColor;
      state.fgColor = state.bgColor;
      state.bgColor = tmp;
      updateColorIndicator();
    });

    bar.appendChild(indicator);
    dom.fgSwatch = fgSwatch;
    dom.bgSwatch = bgSwatch;

    /* Palette grid */
    var grid = el("div", { className: "palette-grid" });
    [PALETTE_ROW1, PALETTE_ROW2].forEach(function (row) {
      var rowDiv = el("div", { className: "palette-row" });
      row.forEach(function (color) {
        var cell = el("div", {
          className: "palette-cell",
          style: { background: color },
          title: color
        });
        cell.addEventListener("mousedown", function (e) {
          e.preventDefault();
          if (e.button === 2) {
            state.bgColor = color;
          } else {
            state.fgColor = color;
          }
          updateColorIndicator();
        });
        cell.addEventListener("contextmenu", function (e) { e.preventDefault(); });
        rowDiv.appendChild(cell);
      });
      grid.appendChild(rowDiv);
    });

    bar.appendChild(grid);
    return bar;
  }

  function buildStatusBar() {
    var bar = el("div", { className: "status-bar" });
    var coords = el("div", { className: "status-section status-coords" }, " ");
    var size = el("div", { className: "status-section status-size" }, CANVAS_W + " x " + CANVAS_H);
    bar.appendChild(coords);
    bar.appendChild(size);
    dom.statusCoords = coords;
    dom.statusSize = size;
    return bar;
  }

  /* ----------- UI Update Helpers ----------- */

  function updateToolSelection() {
    if (!dom.root) return;
    dom.root.querySelectorAll(".tool-btn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tool") === state.tool);
    });
    /* Update cursor class on canvas wrap */
    var wrap = dom.canvasWrap;
    if (wrap) {
      wrap.className = "canvas-wrap tool-" + state.tool;
    }
  }

  function updateLineWidthSelection() {
    if (!dom.root) return;
    dom.root.querySelectorAll(".line-width-option").forEach(function (o) {
      o.classList.toggle("active", parseInt(o.getAttribute("data-lw"), 10) === state.lineWidth);
    });
  }

  function updateFillModeSelection() {
    if (!dom.root) return;
    dom.root.querySelectorAll(".fill-mode-option").forEach(function (o) {
      o.classList.toggle("active", o.getAttribute("data-fm") === state.fillMode);
    });
  }

  function updateColorIndicator() {
    if (dom.fgSwatch) dom.fgSwatch.style.background = state.fgColor;
    if (dom.bgSwatch) dom.bgSwatch.style.background = state.bgColor;
  }

  function updateStatusCoords(x, y) {
    if (dom.statusCoords) {
      dom.statusCoords.textContent = x + ", " + y;
    }
  }

  /* ----------- Canvas Drawing Engine ----------- */

  function getCtx() {
    return dom.canvas ? dom.canvas.getContext("2d") : null;
  }

  function getOverlayCtx() {
    return dom.overlay ? dom.overlay.getContext("2d") : null;
  }

  function clearOverlay() {
    var octx = getOverlayCtx();
    if (octx) octx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  }

  function pushUndo() {
    var ctx = getCtx();
    if (!ctx) return;
    state.undoStack.push(ctx.getImageData(0, 0, CANVAS_W, CANVAS_H));
    if (state.undoStack.length > MAX_UNDO) {
      state.undoStack.shift();
    }
  }

  function undo() {
    if (state.undoStack.length === 0) return;
    var ctx = getCtx();
    if (!ctx) return;
    var imgData = state.undoStack.pop();
    ctx.putImageData(imgData, 0, 0);
  }

  function clearCanvas() {
    pushUndo();
    var ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  function saveCanvas() {
    if (!dom.canvas) return;
    var link = document.createElement("a");
    link.download = state.fileName + ".png";
    link.href = dom.canvas.toDataURL("image/png");
    link.click();
  }

  function selectAll() {
    /* Stub — in real Paint this would create a marching ants selection */
  }

  function invertColors() {
    pushUndo();
    var ctx = getCtx();
    if (!ctx) return;
    var imgData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    var d = imgData.data;
    for (var i = 0; i < d.length; i += 4) {
      d[i]     = 255 - d[i];
      d[i + 1] = 255 - d[i + 1];
      d[i + 2] = 255 - d[i + 2];
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function noop() {}

  /* Flood fill using scanline algorithm */
  function floodFill(startX, startY, fillColor) {
    var ctx = getCtx();
    if (!ctx) return;

    startX = Math.round(startX);
    startY = Math.round(startY);
    if (startX < 0 || startX >= CANVAS_W || startY < 0 || startY >= CANVAS_H) return;

    var imgData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    var data = imgData.data;
    var rgb = hexToRgb(fillColor);
    var fillR = rgb.r, fillG = rgb.g, fillB = rgb.b;

    var idx = (startY * CANVAS_W + startX) * 4;
    var targetR = data[idx];
    var targetG = data[idx + 1];
    var targetB = data[idx + 2];
    var targetA = data[idx + 3];

    /* Don't fill if same color */
    if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === 255) return;

    var target = [targetR, targetG, targetB, targetA];
    var stack = [[startX, startY]];
    var visited = new Uint8Array(CANVAS_W * CANVAS_H);

    while (stack.length > 0) {
      var point = stack.pop();
      var px = point[0];
      var py = point[1];

      if (px < 0 || px >= CANVAS_W || py < 0 || py >= CANVAS_H) continue;

      var vi = py * CANVAS_W + px;
      if (visited[vi]) continue;

      var pi = vi * 4;
      var current = [data[pi], data[pi + 1], data[pi + 2], data[pi + 3]];
      if (!colorsMatch(current, target, 2)) continue;

      visited[vi] = 1;
      data[pi]     = fillR;
      data[pi + 1] = fillG;
      data[pi + 2] = fillB;
      data[pi + 3] = 255;

      stack.push([px + 1, py]);
      stack.push([px - 1, py]);
      stack.push([px, py + 1]);
      stack.push([px, py - 1]);
    }

    ctx.putImageData(imgData, 0, 0);
  }

  /* Airbrush spray */
  function sprayAt(ctx, x, y, radius, color) {
    var density = 30;
    ctx.fillStyle = color;
    for (var i = 0; i < density; i++) {
      var angle = Math.random() * Math.PI * 2;
      var r = Math.random() * radius;
      var sx = x + r * Math.cos(angle);
      var sy = y + r * Math.sin(angle);
      ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
    }
  }

  /* Bresenham line for pencil smoothness */
  function drawLineBresenham(ctx, x0, y0, x1, y1) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  /* Shape drawing helpers (on overlay or main) */
  function drawRectShape(targetCtx, x1, y1, x2, y2, fg, bg, lw, fillMode) {
    var x = Math.min(x1, x2);
    var y = Math.min(y1, y2);
    var w = Math.abs(x2 - x1);
    var h = Math.abs(y2 - y1);

    targetCtx.lineWidth = lw;
    targetCtx.strokeStyle = fg;
    targetCtx.fillStyle = bg;

    if (fillMode === "filled") {
      targetCtx.fillStyle = fg;
      targetCtx.fillRect(x, y, w, h);
    } else if (fillMode === "filledOutline") {
      targetCtx.fillRect(x, y, w, h);
      targetCtx.strokeRect(x, y, w, h);
    } else {
      targetCtx.strokeRect(x, y, w, h);
    }
  }

  function drawEllipseShape(targetCtx, x1, y1, x2, y2, fg, bg, lw, fillMode) {
    var cx = (x1 + x2) / 2;
    var cy = (y1 + y2) / 2;
    var rx = Math.abs(x2 - x1) / 2;
    var ry = Math.abs(y2 - y1) / 2;

    targetCtx.lineWidth = lw;
    targetCtx.strokeStyle = fg;
    targetCtx.fillStyle = bg;

    targetCtx.beginPath();
    targetCtx.ellipse(cx, cy, Math.max(rx, 0.5), Math.max(ry, 0.5), 0, 0, Math.PI * 2);

    if (fillMode === "filled") {
      targetCtx.fillStyle = fg;
      targetCtx.fill();
    } else if (fillMode === "filledOutline") {
      targetCtx.fill();
      targetCtx.stroke();
    } else {
      targetCtx.stroke();
    }
  }

  function drawRoundRectShape(targetCtx, x1, y1, x2, y2, fg, bg, lw, fillMode) {
    var x = Math.min(x1, x2);
    var y = Math.min(y1, y2);
    var w = Math.abs(x2 - x1);
    var h = Math.abs(y2 - y1);
    var r = Math.min(10, w / 4, h / 4);

    targetCtx.lineWidth = lw;
    targetCtx.strokeStyle = fg;
    targetCtx.fillStyle = bg;

    targetCtx.beginPath();
    targetCtx.moveTo(x + r, y);
    targetCtx.lineTo(x + w - r, y);
    targetCtx.quadraticCurveTo(x + w, y, x + w, y + r);
    targetCtx.lineTo(x + w, y + h - r);
    targetCtx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    targetCtx.lineTo(x + r, y + h);
    targetCtx.quadraticCurveTo(x, y + h, x, y + h - r);
    targetCtx.lineTo(x, y + r);
    targetCtx.quadraticCurveTo(x, y, x + r, y);
    targetCtx.closePath();

    if (fillMode === "filled") {
      targetCtx.fillStyle = fg;
      targetCtx.fill();
    } else if (fillMode === "filledOutline") {
      targetCtx.fill();
      targetCtx.stroke();
    } else {
      targetCtx.stroke();
    }
  }

  function drawLineShape(targetCtx, x1, y1, x2, y2, color, lw) {
    targetCtx.strokeStyle = color;
    targetCtx.lineWidth = lw;
    targetCtx.lineCap = "round";
    targetCtx.beginPath();
    targetCtx.moveTo(x1, y1);
    targetCtx.lineTo(x2, y2);
    targetCtx.stroke();
  }

  /* ----------- Event Handlers ----------- */

  function getCanvasPos(e) {
    var rect = dom.canvas.getBoundingClientRect();
    var scaleX = CANVAS_W / rect.width;
    var scaleY = CANVAS_H / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY)
    };
  }

  function isShapeTool(tool) {
    return tool === "rectangle" || tool === "ellipse" || tool === "roundrect" || tool === "line";
  }

  function onCanvasMouseDown(e) {
    e.preventDefault();
    var pos = getCanvasPos(e);
    var ctx = getCtx();
    if (!ctx) return;

    var color = (e.button === 2) ? state.bgColor : state.fgColor;
    var altColor = (e.button === 2) ? state.fgColor : state.bgColor;

    state.drawing = true;
    state.lastX = pos.x;
    state.lastY = pos.y;
    state.startX = pos.x;
    state.startY = pos.y;
    state.drawButton = e.button;

    var tool = state.tool;

    if (tool === "eyedropper") {
      var pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
      var pickedColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
      if (e.button === 2) {
        state.bgColor = pickedColor;
      } else {
        state.fgColor = pickedColor;
      }
      updateColorIndicator();
      state.drawing = false;
      return;
    }

    if (tool === "fill") {
      pushUndo();
      floodFill(pos.x, pos.y, color);
      state.drawing = false;
      return;
    }

    if (tool === "text") {
      pushUndo();
      var text = prompt("Enter text:");
      if (text) {
        ctx.fillStyle = color;
        ctx.font = (state.lineWidth * 8 + 8) + "px 'Tahoma', 'Arial', sans-serif";
        ctx.fillText(text, pos.x, pos.y);
      }
      state.drawing = false;
      return;
    }

    /* For line/shape tools, we save undo at mousedown */
    if (isShapeTool(tool)) {
      pushUndo();
      return;
    }

    /* Freehand tools: push undo */
    if (tool === "pencil" || tool === "brush" || tool === "eraser" || tool === "airbrush") {
      pushUndo();
    }

    /* Start drawing immediately for freehand tools */
    if (tool === "pencil") {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === "brush") {
      ctx.strokeStyle = color;
      ctx.lineWidth = state.lineWidth * 3 + 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === "eraser") {
      var eraserSize = state.lineWidth * 4 + 4;
      ctx.fillStyle = state.bgColor;
      ctx.fillRect(pos.x - eraserSize / 2, pos.y - eraserSize / 2, eraserSize, eraserSize);
    } else if (tool === "airbrush") {
      sprayAt(ctx, pos.x, pos.y, state.lineWidth * 6 + 8, color);
    }
  }

  function onCanvasMouseMove(e) {
    var pos = getCanvasPos(e);
    updateStatusCoords(pos.x, pos.y);

    if (!state.drawing) return;

    var ctx = getCtx();
    if (!ctx) return;

    var color = (state.drawButton === 2) ? state.bgColor : state.fgColor;
    var altColor = (state.drawButton === 2) ? state.fgColor : state.bgColor;
    var tool = state.tool;

    if (tool === "pencil") {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(state.lastX, state.lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      state.lastX = pos.x;
      state.lastY = pos.y;
    } else if (tool === "brush") {
      ctx.strokeStyle = color;
      ctx.lineWidth = state.lineWidth * 3 + 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(state.lastX, state.lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      state.lastX = pos.x;
      state.lastY = pos.y;
    } else if (tool === "eraser") {
      var eraserSize = state.lineWidth * 4 + 4;
      ctx.fillStyle = state.bgColor;
      /* Draw a line of eraser rectangles for smooth erasing */
      var dx = pos.x - state.lastX;
      var dy = pos.y - state.lastY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var steps = Math.max(1, Math.ceil(dist));
      for (var s = 0; s <= steps; s++) {
        var t = steps === 0 ? 0 : s / steps;
        var ix = state.lastX + dx * t;
        var iy = state.lastY + dy * t;
        ctx.fillRect(ix - eraserSize / 2, iy - eraserSize / 2, eraserSize, eraserSize);
      }
      state.lastX = pos.x;
      state.lastY = pos.y;
    } else if (tool === "airbrush") {
      sprayAt(ctx, pos.x, pos.y, state.lineWidth * 6 + 8, color);
      state.lastX = pos.x;
      state.lastY = pos.y;
    } else if (isShapeTool(tool)) {
      /* Preview on overlay */
      clearOverlay();
      var octx = getOverlayCtx();
      if (!octx) return;
      if (tool === "line") {
        drawLineShape(octx, state.startX, state.startY, pos.x, pos.y, color, state.lineWidth);
      } else if (tool === "rectangle") {
        drawRectShape(octx, state.startX, state.startY, pos.x, pos.y, color, altColor, state.lineWidth, state.fillMode);
      } else if (tool === "ellipse") {
        drawEllipseShape(octx, state.startX, state.startY, pos.x, pos.y, color, altColor, state.lineWidth, state.fillMode);
      } else if (tool === "roundrect") {
        drawRoundRectShape(octx, state.startX, state.startY, pos.x, pos.y, color, altColor, state.lineWidth, state.fillMode);
      }
    }
  }

  function onCanvasMouseUp(e) {
    if (!state.drawing) return;

    var pos = getCanvasPos(e);
    var ctx = getCtx();
    var color = (state.drawButton === 2) ? state.bgColor : state.fgColor;
    var altColor = (state.drawButton === 2) ? state.fgColor : state.bgColor;
    var tool = state.tool;

    /* Commit shape from overlay to canvas */
    if (isShapeTool(tool) && ctx) {
      clearOverlay();
      if (tool === "line") {
        drawLineShape(ctx, state.startX, state.startY, pos.x, pos.y, color, state.lineWidth);
      } else if (tool === "rectangle") {
        drawRectShape(ctx, state.startX, state.startY, pos.x, pos.y, color, altColor, state.lineWidth, state.fillMode);
      } else if (tool === "ellipse") {
        drawEllipseShape(ctx, state.startX, state.startY, pos.x, pos.y, color, altColor, state.lineWidth, state.fillMode);
      } else if (tool === "roundrect") {
        drawRoundRectShape(ctx, state.startX, state.startY, pos.x, pos.y, color, altColor, state.lineWidth, state.fillMode);
      }
    }

    state.drawing = false;
  }

  function onKeyDown(e) {
    /* Ctrl+Z = Undo */
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      undo();
      return;
    }
    /* Ctrl+N = New */
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      clearCanvas();
      return;
    }
    /* Ctrl+S = Save */
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      saveCanvas();
      return;
    }
    /* Delete = Clear */
    if (e.key === "Delete") {
      clearCanvas();
    }
  }

  function toggleMaximize() {
    state.maximized = !state.maximized;
    if (dom.root) {
      dom.root.classList.toggle("maximized", state.maximized);
    }
  }

  /* ----------- Airbrush continuous spray ----------- */
  var sprayInterval = null;

  function startSprayInterval() {
    stopSprayInterval();
    sprayInterval = setInterval(function () {
      if (!state.drawing || state.tool !== "airbrush") {
        stopSprayInterval();
        return;
      }
      var ctx = getCtx();
      if (!ctx) return;
      var color = (state.drawButton === 2) ? state.bgColor : state.fgColor;
      sprayAt(ctx, state.lastX, state.lastY, state.lineWidth * 6 + 8, color);
    }, 50);
  }

  function stopSprayInterval() {
    if (sprayInterval) {
      clearInterval(sprayInterval);
      sprayInterval = null;
    }
  }

  /* ----------- Touch support for kids on tablets ----------- */

  function touchToMouse(type) {
    return function (e) {
      if (e.touches.length === 0 && type === "mouseup") {
        onCanvasMouseUp({ clientX: state.lastClientX || 0, clientY: state.lastClientY || 0, button: 0, preventDefault: function () {} });
        return;
      }
      var touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return;
      state.lastClientX = touch.clientX;
      state.lastClientY = touch.clientY;
      var fakeEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0,
        preventDefault: function () { e.preventDefault(); }
      };
      if (type === "mousedown") onCanvasMouseDown(fakeEvent);
      else if (type === "mousemove") onCanvasMouseMove(fakeEvent);
      else if (type === "mouseup") onCanvasMouseUp(fakeEvent);
    };
  }

  /* ----------- Init & Destroy ----------- */

  function init(container) {
    if (!container) {
      throw new Error("PaintApp.init() requires a container element.");
    }
    destroy();
    resetState();
    dom = {};
    handlers = {};

    /* Inject CSS */
    if (!document.getElementById(CSS_ID)) {
      var style = document.createElement("style");
      style.id = CSS_ID;
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    /* Build DOM */
    var root = el("div", { className: "paint98" });
    dom.root = root;

    root.appendChild(buildTitleBar());
    root.appendChild(buildMenuBar());

    var mainBody = el("div", { className: "main-body" });
    mainBody.appendChild(buildToolPalette());
    mainBody.appendChild(buildCanvasArea());
    root.appendChild(mainBody);

    root.appendChild(buildColorBar());
    root.appendChild(buildStatusBar());

    container.appendChild(root);

    /* Init canvas to white */
    var ctx = getCtx();
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    /* Bind canvas events */
    var cw = dom.canvasWrap;
    cw.addEventListener("mousedown", onCanvasMouseDown);
    cw.addEventListener("contextmenu", function (e) { e.preventDefault(); });

    /* Touch events */
    cw.addEventListener("touchstart", touchToMouse("mousedown"), { passive: false });
    cw.addEventListener("touchmove", touchToMouse("mousemove"), { passive: false });
    cw.addEventListener("touchend", touchToMouse("mouseup"), { passive: false });

    /* Mousemove & mouseup on document so drawing continues outside canvas */
    handlers.docMouseMove = function (e) { onCanvasMouseMove(e); };
    handlers.docMouseUp = function (e) {
      onCanvasMouseUp(e);
      stopSprayInterval();
    };
    document.addEventListener("mousemove", handlers.docMouseMove);
    document.addEventListener("mouseup", handlers.docMouseUp);

    /* Keyboard shortcuts */
    handlers.keyDown = onKeyDown;
    document.addEventListener("keydown", handlers.keyDown);

    /* Close menus on outside click */
    handlers.docClick = function () {
      if (handlers.closeMenus) handlers.closeMenus();
    };
    document.addEventListener("mousedown", handlers.docClick);

    /* Airbrush spray interval on draw start */
    var origMouseDown = onCanvasMouseDown;
    cw.removeEventListener("mousedown", onCanvasMouseDown);
    cw.addEventListener("mousedown", function (e) {
      origMouseDown(e);
      if (state.tool === "airbrush" && state.drawing) {
        startSprayInterval();
      }
    });
  }

  function destroy() {
    stopSprayInterval();
    if (handlers) {
      if (handlers.docMouseMove) document.removeEventListener("mousemove", handlers.docMouseMove);
      if (handlers.docMouseUp) document.removeEventListener("mouseup", handlers.docMouseUp);
      if (handlers.keyDown) document.removeEventListener("keydown", handlers.keyDown);
      if (handlers.docClick) document.removeEventListener("mousedown", handlers.docClick);
    }
    if (dom && dom.root && dom.root.parentNode) {
      dom.root.parentNode.removeChild(dom.root);
    }
    dom = {};
    handlers = {};
    state = null;
  }

  /* ----------- Export ----------- */

  window.PaintApp = {
    init: init,
    destroy: destroy
  };

})();
