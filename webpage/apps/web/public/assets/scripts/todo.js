(function () {
  "use strict";

  /* ── Constants ──────────────────────────────────────────────── */

  var CSS_ID = "ppp-todo-styles";
  var STORAGE_KEY = "ppp-todo-notes";
  var MAX_PAGES = 50;
  var AUTOSAVE_MS = 2000;

  /* ── State / DOM / Handlers ─────────────────────────────────── */

  var state = null;
  var dom = {};
  var handlers = {};
  var autosaveTimer = null;

  /* ── Default state factory ──────────────────────────────────── */

  function defaultState() {
    return {
      pages: [
        { title: "My Notes", body: "<div><br></div>" }
      ],
      currentPage: 0,
      bold: false,
      heading: true,
      bullets: false
    };
  }

  /* ── Persistence ────────────────────────────────────────────── */

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
          return parsed;
        }
      }
    } catch (_) { /* silent */ }
    return defaultState();
  }

  function saveState() {
    if (!state) return;
    syncCurrentPage();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        pages: state.pages,
        currentPage: state.currentPage
      }));
    } catch (_) { /* silent */ }
  }

  function scheduleSave() {
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(saveState, AUTOSAVE_MS);
  }

  /* ── DOM helper (mirrors paint.js convention) ───────────────── */

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "className") { e.className = attrs[k]; }
        else if (k === "style" && typeof attrs[k] === "object") {
          Object.keys(attrs[k]).forEach(function (s) { e.style[s] = attrs[k][s]; });
        }
        else if (k.indexOf("on") === 0) {
          e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        }
        else { e.setAttribute(k, attrs[k]); }
      });
    }
    if (children !== undefined && children !== null) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        if (typeof c === "string") { e.appendChild(document.createTextNode(c)); }
        else { e.appendChild(c); }
      });
    }
    return e;
  }

  /* ── Sanitise text for safe download ────────────────────────── */

  function htmlToPlainText(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    /* Convert checkboxes */
    var checks = tmp.querySelectorAll("input[type=checkbox]");
    for (var i = 0; i < checks.length; i++) {
      var mark = checks[i].checked ? "[x] " : "[ ] ";
      checks[i].parentNode.replaceChild(document.createTextNode(mark), checks[i]);
    }
    /* Convert <br> and block elements to newlines */
    var brs = tmp.querySelectorAll("br");
    for (var b = 0; b < brs.length; b++) {
      brs[b].parentNode.replaceChild(document.createTextNode("\n"), brs[b]);
    }
    var blocks = tmp.querySelectorAll("div,p,li,h1,h2,h3");
    for (var d = 0; d < blocks.length; d++) {
      blocks[d].insertAdjacentText("afterend", "\n");
    }
    return tmp.textContent.replace(/\n{3,}/g, "\n\n").trim();
  }

  /* ── Build: Spiral binding ──────────────────────────────────── */

  function buildSpiral() {
    var strip = el("div", { className: "todo-spiral" });
    for (var i = 0; i < 12; i++) {
      strip.appendChild(el("div", { className: "todo-spiral-ring" }));
    }
    return strip;
  }

  /* ── Build: File dropdown menu ────────────────────────────────── */

  function buildFileMenu() {
    var wrap = el("div", { className: "todo-file-menu" });

    var btn = el("button", {
      className: "todo-file-menu-btn",
      title: "File menu",
      onClick: function () {
        var isOpen = dropdown.style.display === "block";
        dropdown.style.display = isOpen ? "none" : "block";
      }
    }, "\uD83D\uDCC1 File");

    var dropdown = el("div", { className: "todo-file-dropdown" });
    dropdown.style.display = "none";

    var itemNew = el("button", {
      className: "todo-file-dropdown-item",
      onClick: function () { addPage(); dropdown.style.display = "none"; }
    }, "+ New Page");
    dropdown.appendChild(itemNew);

    var itemSave = el("button", {
      className: "todo-file-dropdown-item",
      onClick: function () { downloadTxt(); dropdown.style.display = "none"; }
    }, "\uD83D\uDCBE Save as .txt");
    dropdown.appendChild(itemSave);

    wrap.appendChild(btn);
    wrap.appendChild(dropdown);

    /* Close dropdown when clicking outside */
    handlers.onDocClickFileMenu = function (e) {
      if (!wrap.contains(e.target)) {
        dropdown.style.display = "none";
      }
    };
    document.addEventListener("click", handlers.onDocClickFileMenu);

    return wrap;
  }

  /* ── Build: Toolbar (formatting tools only) ─────────────────── */

  function buildToolbar() {
    var bar = el("div", { className: "todo-toolbar" });

    /* Bold */
    var btnBold = el("button", {
      className: "todo-tb-btn" + (state.bold ? " active" : ""),
      title: "Toggle Bold (Ctrl+B)",
      onClick: function () { toggleBold(); }
    }, "B");
    btnBold.style.fontWeight = "800";
    dom.btnBold = btnBold;
    bar.appendChild(btnBold);

    /* H1/Aa */
    var btnSize = el("button", {
      className: "todo-tb-btn" + (state.heading ? " active" : ""),
      title: "Toggle Heading / Body text",
      onClick: function () { toggleHeading(); }
    });
    btnSize.innerHTML = state.heading ? "H1" : "Aa";
    dom.btnSize = btnSize;
    bar.appendChild(btnSize);

    /* Bullets */
    var btnBullet = el("button", {
      className: "todo-tb-btn" + (state.bullets ? " active" : ""),
      title: "Toggle Bullet List",
      onClick: function () { toggleBullets(); }
    }, "\u2022");
    dom.btnBullet = btnBullet;
    bar.appendChild(btnBullet);

    /* Add Task */
    var btnTask = el("button", {
      className: "todo-tb-btn",
      title: "Add Task Checkbox"
    });
    btnTask.innerHTML = "&#9744;";
    btnTask.addEventListener("click", function () { insertTask(); });
    bar.appendChild(btnTask);

    return bar;
  }

  /* ── Build: Editor ──────────────────────────────────────────── */

  function buildEditor() {
    var wrap = el("div", { className: "todo-editor-wrap" });

    /* Red margin line */
    wrap.appendChild(el("div", { className: "todo-margin-line" }));

    var editor = el("div", {
      className: "todo-editor",
      contentEditable: "true",
      spellcheck: "true"
    });
    editor.setAttribute("role", "textbox");
    editor.setAttribute("aria-multiline", "true");
    editor.setAttribute("aria-label", "Note editor");
    dom.editor = editor;
    wrap.appendChild(editor);
    return wrap;
  }

  /* ── Build: Page nav ────────────────────────────────────────── */

  function buildPageNav() {
    var nav = el("div", { className: "todo-page-nav" });

    var btnPrev = el("button", {
      className: "todo-pg-btn",
      title: "Previous Page",
      onClick: function () { goPage(state.currentPage - 1); }
    }, "\u25C0");
    dom.btnPrev = btnPrev;
    nav.appendChild(btnPrev);

    var indicator = el("span", { className: "todo-pg-indicator" });
    dom.pageIndicator = indicator;
    nav.appendChild(indicator);

    var btnNext = el("button", {
      className: "todo-pg-btn",
      title: "Next Page",
      onClick: function () { goPage(state.currentPage + 1); }
    }, "\u25B6");
    dom.btnNext = btnNext;
    nav.appendChild(btnNext);

    /* Delete page */
    var btnDel = el("button", {
      className: "todo-pg-btn todo-pg-del",
      title: "Delete this page",
      onClick: function () { deletePage(); }
    }, "\uD83D\uDDD1");
    dom.btnDel = btnDel;
    nav.appendChild(btnDel);

    return nav;
  }

  /* ── Render / Sync ──────────────────────────────────────────── */

  function syncCurrentPage() {
    if (!state || !dom.editor) return;
    var pg = state.pages[state.currentPage];
    if (pg) {
      pg.body = dom.editor.innerHTML;
    }
  }

  function renderPage() {
    if (!state || !dom.editor) return;
    var pg = state.pages[state.currentPage];
    if (!pg) return;
    dom.editor.innerHTML = pg.body || "<div><br></div>";
    updatePageNav();
    applyAutoHeading();
  }

  function updatePageNav() {
    if (!dom.pageIndicator) return;
    dom.pageIndicator.textContent = "Page " + (state.currentPage + 1) + " of " + state.pages.length;
    dom.btnPrev.disabled = state.currentPage <= 0;
    dom.btnNext.disabled = state.currentPage >= state.pages.length - 1;
    dom.btnDel.disabled = state.pages.length <= 1;
  }

  /* ── Page operations ────────────────────────────────────────── */

  function goPage(idx) {
    if (idx < 0 || idx >= state.pages.length) return;
    syncCurrentPage();
    state.currentPage = idx;
    renderPage();
    saveState();
    dom.editor.focus();
  }

  function addPage() {
    if (state.pages.length >= MAX_PAGES) return;
    syncCurrentPage();
    state.pages.push({ title: "Untitled", body: "<div><br></div>" });
    state.currentPage = state.pages.length - 1;
    renderPage();
    saveState();
    dom.editor.focus();
  }

  function deletePage() {
    if (state.pages.length <= 1) return;
    syncCurrentPage();
    state.pages.splice(state.currentPage, 1);
    if (state.currentPage >= state.pages.length) {
      state.currentPage = state.pages.length - 1;
    }
    renderPage();
    saveState();
  }

  /* ── Formatting actions ─────────────────────────────────────── */

  function toggleBold() {
    dom.editor.focus();
    document.execCommand("bold", false, null);
    state.bold = document.queryCommandState("bold");
    dom.btnBold.classList.toggle("active", state.bold);
    scheduleSave();
  }

  function toggleHeading() {
    state.heading = !state.heading;
    dom.btnSize.innerHTML = state.heading ? "H1" : "Aa";
    dom.btnSize.classList.toggle("active", state.heading);
    dom.editor.focus();

    /* Apply to current selection / line */
    if (state.heading) {
      document.execCommand("formatBlock", false, "h1");
    } else {
      document.execCommand("formatBlock", false, "div");
    }
    scheduleSave();
  }

  function toggleBullets() {
    state.bullets = !state.bullets;
    dom.btnBullet.classList.toggle("active", state.bullets);
    dom.editor.focus();
    document.execCommand("insertUnorderedList", false, null);
    scheduleSave();
  }

  /* ── Auto-heading: first block is H1, rest are body ─────────── */

  function applyAutoHeading() {
    if (!dom.editor) return;
    var firstChild = dom.editor.firstElementChild;
    if (!firstChild) return;

    /* Ensure first child is an H1 */
    if (firstChild.tagName !== "H1") {
      var h1 = document.createElement("h1");
      h1.className = "todo-title-line";
      h1.innerHTML = firstChild.innerHTML || "<br>";
      dom.editor.replaceChild(h1, firstChild);
    }
  }

  /* ── Task / Checkbox insertion ──────────────────────────────── */

  function insertTask() {
    dom.editor.focus();
    var line = document.createElement("div");
    line.className = "todo-task-line";
    var label = document.createElement("label");
    var cb = document.createElement("input");
    cb.type = "checkbox";
    var span = document.createElement("span");
    span.textContent = "New task";
    label.appendChild(cb);
    label.appendChild(document.createTextNode(" "));
    label.appendChild(span);
    line.appendChild(label);

    /* Insert at caret or append */
    var sel = window.getSelection();
    if (sel.rangeCount) {
      var range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(line);
      range.setStartAfter(line);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      dom.editor.appendChild(line);
    }
    scheduleSave();
  }

  function handleCheckboxClick(e) {
    var target = e.target;
    if (target.tagName === "INPUT" && target.type === "checkbox") {
      var span = target.parentNode.querySelector("span");
      if (span) {
        span.style.textDecoration = target.checked ? "line-through" : "none";
        span.style.opacity = target.checked ? "0.55" : "1";
      }
      scheduleSave();
    }
  }

  /* ── [ ] → checkbox conversion on input ─────────────────────── */

  function convertBracketTasks() {
    if (!dom.editor) return;
    var walker = document.createTreeWalker(dom.editor, NodeFilter.SHOW_TEXT, null, false);
    var node;
    var replacements = [];
    while ((node = walker.nextNode())) {
      var text = node.nodeValue;
      var match = text.match(/^\[( |x)\]\s*/);
      if (match) {
        replacements.push({ node: node, checked: match[1] === "x", matchLen: match[0].length });
      }
    }
    for (var i = replacements.length - 1; i >= 0; i--) {
      var r = replacements[i];
      var cb = document.createElement("input");
      cb.type = "checkbox";
      if (r.checked) cb.checked = true;
      var remaining = r.node.nodeValue.slice(r.matchLen);
      var parent = r.node.parentNode;
      parent.replaceChild(document.createTextNode(remaining), r.node);
      parent.insertBefore(document.createTextNode(" "), parent.firstChild);
      parent.insertBefore(cb, parent.firstChild);
    }
  }

  function placeCaretAtEnd(element) {
    var range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /* ── Download .txt ──────────────────────────────────────────── */

  function downloadTxt() {
    syncCurrentPage();
    var parts = [];
    state.pages.forEach(function (pg, idx) {
      if (state.pages.length > 1) {
        parts.push("=== Page " + (idx + 1) + " ===");
      }
      parts.push(htmlToPlainText(pg.body));
    });
    var text = parts.join("\n\n");
    var blob = new Blob([text], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "my-notes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── Editor event wiring ────────────────────────────────────── */

  function wireEditor() {
    handlers.onInput = function () {
      applyAutoHeading();
      convertBracketTasks();
      scheduleSave();
    };
    dom.editor.addEventListener("input", handlers.onInput);

    handlers.onEditorClick = function (e) {
      handleCheckboxClick(e);
    };
    dom.editor.addEventListener("click", handlers.onEditorClick);

    /* Keyboard shortcuts */
    handlers.onKeyDown = function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleBold();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveState();
      }
      /* Enter in H1 → switch to body div */
      if (e.key === "Enter") {
        var sel = window.getSelection();
        if (sel.anchorNode) {
          var block = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
          while (block && block !== dom.editor && block.parentElement !== dom.editor) {
            block = block.parentElement;
          }
          if (block && block.tagName === "H1") {
            e.preventDefault();
            var div = document.createElement("div");
            div.innerHTML = "<br>";
            block.after(div);
            placeCaretAtEnd(div);
          }
        }
      }
    };
    dom.editor.addEventListener("keydown", handlers.onKeyDown);

    /* Paste: strip formatting to plain text for cleanliness */
    handlers.onPaste = function (e) {
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData("text/plain");
      document.execCommand("insertText", false, text);
    };
    dom.editor.addEventListener("paste", handlers.onPaste);
  }

  /* ── CSS (scoped under .todo-notebook) ──────────────────────── */

  var CSS = [
    /* Root container */
    ".todo-notebook {",
    "  display: flex;",
    "  flex-direction: column;",
    "  height: 100%;",
    "  min-height: 320px;",
    "  font-family: 'Georgia', 'Times New Roman', var(--font-family-base, serif);",
    "  color: var(--color-fg-default, #1e293b);",
    "  background: transparent;",
    "  border-radius: var(--border-radius-md, 8px);",
    "  overflow: hidden;",
    "  position: relative;",
    "}",

    /* Spiral binding strip along top */
    ".todo-spiral {",
    "  display: flex;",
    "  justify-content: space-around;",
    "  align-items: center;",
    "  padding: 4px 24px;",
    "  background: var(--color-bg-surface-raised, #e2e8f0);",
    "  border-bottom: 2px solid var(--color-border-muted, #cbd5e1);",
    "  flex-shrink: 0;",
    "  position: relative;",
    "  z-index: 2;",
    "}",
    ".todo-spiral-ring {",
    "  width: 18px;",
    "  height: 18px;",
    "  border-radius: 50%;",
    "  border: 3px solid #78716c;",
    "  background: var(--color-bg-surface-raised, #e2e8f0);",
    "  box-shadow: inset 0 1px 2px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.4);",
    "  flex-shrink: 0;",
    "}",

    /* File dropdown menu */
    ".todo-file-menu {",
    "  position: relative;",
    "  flex-shrink: 0;",
    "  z-index: 10;",
    "  padding: 4px 10px 4px 42px;",
    "  background: var(--color-bg-surface, #f8fafc);",
    "  border-bottom: 1px solid var(--color-border-muted, #e2e8f0);",
    "}",
    ".todo-file-menu-btn {",
    "  font-size: 12px;",
    "  font-family: var(--font-family-mono, monospace);",
    "  padding: 3px 10px;",
    "  border: 1px solid var(--color-border-muted, #cbd5e1);",
    "  border-radius: 4px;",
    "  background: var(--color-bg-surface, #fff);",
    "  color: var(--color-fg-default, #334155);",
    "  cursor: pointer;",
    "  transition: background 0.15s;",
    "}",
    ".todo-file-menu-btn:hover {",
    "  background: var(--color-accent-primary, #3b82f6);",
    "  color: #fff;",
    "}",
    ".todo-file-dropdown {",
    "  position: absolute;",
    "  top: 100%;",
    "  left: 42px;",
    "  min-width: 140px;",
    "  background: var(--color-bg-surface, #fff);",
    "  border: 1px solid var(--color-border-muted, #cbd5e1);",
    "  border-radius: 6px;",
    "  box-shadow: 0 4px 12px rgba(0,0,0,0.15);",
    "  z-index: 20;",
    "  overflow: hidden;",
    "}",
    ".todo-file-dropdown-item {",
    "  display: block;",
    "  width: 100%;",
    "  text-align: left;",
    "  padding: 6px 12px;",
    "  font-size: 12px;",
    "  border: none;",
    "  background: none;",
    "  color: var(--color-fg-default, #334155);",
    "  cursor: pointer;",
    "  transition: background 0.1s;",
    "}",
    ".todo-file-dropdown-item:hover {",
    "  background: var(--color-accent-primary, #3b82f6);",
    "  color: #fff;",
    "}",

    /* Toolbar (now below editor) */
    ".todo-toolbar {",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 4px;",
    "  padding: 6px 10px 6px 42px;",
    "  background: var(--color-bg-surface, #f8fafc);",
    "  border-top: 1px solid var(--color-border-muted, #e2e8f0);",
    "  flex-shrink: 0;",
    "  flex-wrap: wrap;",
    "}",
    ".todo-tb-btn {",
    "  min-width: 34px;",
    "  height: 34px;",
    "  border: 1px solid var(--color-border-muted, #cbd5e1);",
    "  border-radius: 6px;",
    "  background: var(--color-bg-surface, #fff);",
    "  color: var(--color-fg-default, #334155);",
    "  font-size: 15px;",
    "  cursor: pointer;",
    "  display: inline-flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  padding: 0 8px;",
    "  transition: background var(--transition-speed, 0.15s), box-shadow var(--transition-speed, 0.15s), transform 0.1s;",
    "  user-select: none;",
    "}",
    ".todo-tb-btn:hover {",
    "  background: var(--color-accent-primary, #3b82f6);",
    "  color: #fff;",
    "  box-shadow: 0 2px 6px rgba(0,0,0,0.15);",
    "  transform: translateY(-1px);",
    "}",
    ".todo-tb-btn:active {",
    "  transform: translateY(0);",
    "  box-shadow: none;",
    "}",
    ".todo-tb-btn.active {",
    "  background: var(--color-accent-primary, #3b82f6);",
    "  color: #fff;",
    "  border-color: var(--color-accent-primary, #3b82f6);",
    "  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);",
    "}",
    ".todo-tb-sep {",
    "  width: 1px;",
    "  height: 22px;",
    "  background: var(--color-border-muted, #e2e8f0);",
    "  margin: 0 4px;",
    "  flex-shrink: 0;",
    "}",

    /* Editor wrapper — the notebook paper */
    ".todo-editor-wrap {",
    "  flex: 1;",
    "  position: relative;",
    "  background: #fefce8;",
    "  background-image:",
    "    repeating-linear-gradient(",
    "      to bottom,",
    "      transparent,",
    "      transparent 27px,",
    "      #93c5fd55 27px,",
    "      #93c5fd55 28px",
    "    );",
    "  background-position: 0 12px;",
    "  overflow-y: auto;",
    "  overflow-x: hidden;",
    "  box-shadow: inset 0 2px 8px rgba(0,0,0,0.06);",
    "}",

    /* Red margin line */
    ".todo-margin-line {",
    "  position: absolute;",
    "  top: 0;",
    "  bottom: 0;",
    "  left: 36px;",
    "  width: 2px;",
    "  background: #f87171;",
    "  opacity: 0.55;",
    "  pointer-events: none;",
    "  z-index: 1;",
    "}",

    /* Editor */
    ".todo-editor {",
    "  min-height: 100%;",
    "  padding: 14px 16px 14px 44px;",
    "  outline: none;",
    "  line-height: 28px;",
    "  font-size: 15px;",
    "  color: #1e293b;",
    "  word-wrap: break-word;",
    "  overflow-wrap: break-word;",
    "  white-space: pre-wrap;",
    "  caret-color: var(--color-accent-primary, #3b82f6);",
    "}",

    /* Heading line */
    ".todo-editor h1, .todo-editor .todo-title-line {",
    "  font-size: 22px;",
    "  font-weight: 700;",
    "  line-height: 34px;",
    "  margin: 0 0 4px 0;",
    "  padding: 0;",
    "  color: #0f172a;",
    "  border-bottom: 2px solid #93c5fd44;",
    "}",
    ".todo-editor div, .todo-editor p {",
    "  margin: 0;",
    "  padding: 0;",
    "  min-height: 28px;",
    "}",
    ".todo-editor ul {",
    "  margin: 0;",
    "  padding-left: 20px;",
    "}",
    ".todo-editor li {",
    "  min-height: 28px;",
    "}",

    /* Task checkbox lines */
    ".todo-task-line {",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 6px;",
    "  min-height: 28px;",
    "}",
    ".todo-task-line label {",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 6px;",
    "  cursor: pointer;",
    "  width: 100%;",
    "}",
    ".todo-editor input[type=checkbox] {",
    "  width: 18px;",
    "  height: 18px;",
    "  accent-color: var(--color-accent-primary, #3b82f6);",
    "  cursor: pointer;",
    "  flex-shrink: 0;",
    "}",

    /* Page navigation */
    ".todo-page-nav {",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  gap: 8px;",
    "  padding: 8px 10px;",
    "  background: var(--color-bg-surface, #f8fafc);",
    "  border-top: 1px solid var(--color-border-muted, #e2e8f0);",
    "  flex-shrink: 0;",
    "}",
    ".todo-pg-btn {",
    "  min-width: 32px;",
    "  height: 30px;",
    "  border: 1px solid var(--color-border-muted, #cbd5e1);",
    "  border-radius: 6px;",
    "  background: var(--color-bg-surface, #fff);",
    "  color: var(--color-fg-default, #334155);",
    "  font-size: 14px;",
    "  cursor: pointer;",
    "  display: inline-flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  padding: 0 8px;",
    "  transition: background var(--transition-speed, 0.15s), opacity 0.15s;",
    "}",
    ".todo-pg-btn:hover:not(:disabled) {",
    "  background: var(--color-accent-primary, #3b82f6);",
    "  color: #fff;",
    "}",
    ".todo-pg-btn:disabled {",
    "  opacity: 0.35;",
    "  cursor: default;",
    "}",
    ".todo-pg-del {",
    "  margin-left: 12px;",
    "  font-size: 15px;",
    "}",
    ".todo-pg-del:hover:not(:disabled) {",
    "  background: var(--color-state-error, #ef4444);",
    "  color: #fff;",
    "}",
    ".todo-pg-indicator {",
    "  font-size: 13px;",
    "  color: var(--color-fg-muted, #64748b);",
    "  min-width: 90px;",
    "  text-align: center;",
    "  user-select: none;",
    "}",

    /* Placeholder when editor empty */
    ".todo-editor:empty::before {",
    "  content: 'Start typing your notes\\2026';",
    "  color: #94a3b8;",
    "  pointer-events: none;",
    "  font-style: italic;",
    "}",

    /* Paper shadow around the whole notebook */
    ".todo-notebook::after {",
    "  content: '';",
    "  position: absolute;",
    "  inset: 0;",
    "  border-radius: var(--border-radius-md, 8px);",
    "  box-shadow: 0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);",
    "  pointer-events: none;",
    "  z-index: 3;",
    "}",

    /* Selection color */
    ".todo-editor ::selection {",
    "  background: #93c5fd88;",
    "}",

    /* Scrollbar */
    ".todo-editor-wrap::-webkit-scrollbar { width: 6px; }",
    ".todo-editor-wrap::-webkit-scrollbar-track { background: transparent; }",
    ".todo-editor-wrap::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }",
    ".todo-editor-wrap::-webkit-scrollbar-thumb:hover { background: #64748b; }",

    ""
  ].join("\n");

  /* ── Public: init ───────────────────────────────────────────── */

  function init(container) {
    if (!container) {
      throw new Error("TodoApp.init() requires a container element.");
    }
    destroy();

    /* Load persisted state */
    state = loadState();
    state.bold = false;
    state.heading = true;
    state.bullets = false;
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
    var root = el("div", { className: "todo-notebook" });
    dom.root = root;

    root.appendChild(buildSpiral());
    root.appendChild(buildFileMenu());
    root.appendChild(buildEditor());
    root.appendChild(buildToolbar());
    root.appendChild(buildPageNav());

    container.appendChild(root);

    /* Render current page */
    renderPage();

    /* Focus */
    dom.editor.focus();
    wireEditor();
  }

  /* ── Public: destroy ────────────────────────────────────────── */

  function destroy() {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }
    if (dom.editor) {
      if (handlers.onInput) dom.editor.removeEventListener("input", handlers.onInput);
      if (handlers.onEditorClick) dom.editor.removeEventListener("click", handlers.onEditorClick);
      if (handlers.onKeyDown) dom.editor.removeEventListener("keydown", handlers.onKeyDown);
      if (handlers.onPaste) dom.editor.removeEventListener("paste", handlers.onPaste);
    }
    if (handlers.onDocClickFileMenu) {
      document.removeEventListener("click", handlers.onDocClickFileMenu);
    }
    if (dom.root && dom.root.parentNode) {
      dom.root.parentNode.removeChild(dom.root);
    }
    dom = {};
    handlers = {};
    state = null;
  }

  /* ── Export ──────────────────────────────────────────────────── */

  window.TodoApp = {
    init: init,
    destroy: destroy
  };

})();
