/**
 * todo.js — Spiral Notebook To-Do List
 * Features: bold toggle, H1/Aa size toggle, bullet list toggle,
 *           inline editing, clear-done, task counter
 * Appearance: spiral notebook with horizontal lines, red margin line, hole punches
 */

const todoApp = (() => {
  let items = [];
  let nextId = 1;
  let isBold = false;
  let isH1Size = true;
  let isBullet = false;
  let editingId = null;

  const STORAGE_KEY = 'ppp-todo-items';

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        items = data.items || [];
        nextId = data.nextId || (items.length + 1);
      }
    } catch (e) {}
    if (items.length === 0) {
      items = [
        { id: nextId++, text: 'Connect API keys to Kalshi', done: false, bold: false, h1: false, bullet: true },
        { id: nextId++, text: 'Configure agent permissions', done: false, bold: false, h1: false, bullet: true },
        { id: nextId++, text: 'Review P/L performance metrics', done: false, bold: false, h1: false, bullet: true },
      ];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, nextId }));
    } catch (e) {}
  }

  function addItem(text) {
    if (!text.trim()) return;
    items.push({ id: nextId++, text: text.trim(), done: false, bold: isBold, h1: isH1Size, bullet: isBullet });
    save();
    render();
  }

  function toggleDone(id) {
    const item = items.find(i => i.id === id);
    if (item) { item.done = !item.done; save(); render(); }
  }

  function deleteItem(id) {
    items = items.filter(i => i.id !== id);
    if (editingId === id) editingId = null;
    save();
    render();
  }

  function clearDone() {
    items = items.filter(i => !i.done);
    save();
    render();
  }

  function startEdit(id) {
    editingId = id;
    render();
    const input = document.getElementById(`todo-edit-${id}`);
    if (input) { input.focus(); input.select(); }
  }

  function commitEdit(id) {
    const input = document.getElementById(`todo-edit-${id}`);
    if (!input) return;
    const newText = input.value.trim();
    if (newText) {
      const item = items.find(i => i.id === id);
      if (item) item.text = newText;
      save();
    }
    editingId = null;
    render();
  }

  function cancelEdit() {
    editingId = null;
    render();
  }

  function render() {
    const container = document.getElementById('todo-app');
    if (!container) return;

    const doneCount = items.filter(i => i.done).length;
    const totalCount = items.length;
    const hasDone = doneCount > 0;
    // Spiral holes: scale with task count (min 5, max 12)
    const MIN_HOLES = 5, MAX_HOLES = 12, HOLES_PER_TASK = 1.5, BASE_HOLES = 3;
    const holeCount = Math.min(MAX_HOLES, Math.max(MIN_HOLES, Math.ceil(totalCount * HOLES_PER_TASK) + BASE_HOLES));

    container.innerHTML = `
      <div class="notebook-cover">
        <!-- Spiral binding -->
        <div class="spiral-holes">
          ${Array(holeCount).fill(0).map(() => '<div class="spiral-hole"></div>').join('')}
        </div>

        <!-- Notebook page -->
        <div class="notebook-page">
          <!-- Header area -->
          <div class="notebook-header">
            <span class="notebook-title">TO-DO LIST</span>
            <div class="notebook-tools">
              <button class="notebook-tool-btn ${isBold ? 'active' : ''}" onclick="todoApp.toggleBold()" title="Bold text" aria-label="Toggle bold" aria-pressed="${isBold}"><b>B</b></button>
              <button class="notebook-tool-btn ${isH1Size ? 'active' : ''}" onclick="todoApp.toggleSize()" title="Large text" aria-label="Toggle size" aria-pressed="${isH1Size}">H1</button>
              <button class="notebook-tool-btn ${isBullet ? 'active' : ''}" onclick="todoApp.toggleBullet()" title="Bullet list" aria-label="Toggle bullet list" aria-pressed="${isBullet}">•</button>
            </div>
          </div>

          <!-- Input area -->
          <div class="notebook-input-row">
            <input type="text" id="todo-input" class="notebook-input" placeholder="Add a task…"
                   onkeydown="if(event.key==='Enter') todoApp.addFromInput()"
                   aria-label="New task input">
            <button class="notebook-add-btn" onclick="todoApp.addFromInput()" aria-label="Add task" title="Add task">+</button>
          </div>

          <!-- Items list -->
          <div class="notebook-items" role="list" aria-label="To-do items">
            ${items.map(item => {
              if (editingId === item.id) {
                return `
                  <div class="notebook-item editing" role="listitem" data-id="${item.id}">
                    <button class="notebook-check ${item.done ? 'checked' : ''}" onclick="todoApp.toggleDone(${item.id})"
                            aria-label="${item.done ? 'Mark undone' : 'Mark done'}" aria-pressed="${item.done}">
                      ${item.done ? '✓' : '○'}
                    </button>
                    <input id="todo-edit-${item.id}" class="notebook-edit-input"
                           value="${escapeAttr(item.text)}"
                           onkeydown="if(event.key==='Enter'){todoApp.commitEdit(${item.id});}else if(event.key==='Escape'){todoApp.cancelEdit();}"
                           onblur="todoApp.commitEdit(${item.id})"
                           aria-label="Edit task text">
                    <button class="notebook-delete" onclick="todoApp.deleteItem(${item.id})" aria-label="Delete task" style="opacity:0.7;">×</button>
                  </div>`;
              }
              return `
                <div class="notebook-item ${item.done ? 'done' : ''}" role="listitem" data-id="${item.id}">
                  <button class="notebook-check ${item.done ? 'checked' : ''}" onclick="todoApp.toggleDone(${item.id})"
                          aria-label="${item.done ? 'Mark undone' : 'Mark done'}" aria-pressed="${item.done}">
                    ${item.done ? '✓' : '○'}
                  </button>
                  <span class="notebook-text ${item.bold ? 'bold' : ''} ${item.h1 ? 'h1-size' : 'aa-size'}"
                        ondblclick="todoApp.startEdit(${item.id})"
                        onkeydown="if(event.key==='Enter'||event.key==='F2'){todoApp.startEdit(${item.id});event.preventDefault();}"
                        tabindex="0" title="Double-click or press Enter to edit">
                    ${item.bullet ? '<span class="nb-bullet">•</span> ' : ''}${escapeHtml(item.text)}
                  </span>
                  <button class="notebook-delete" onclick="todoApp.deleteItem(${item.id})" aria-label="Delete task">×</button>
                </div>`;
            }).join('')}
          </div>

          <!-- Footer -->
          <div class="notebook-footer">
            <span class="notebook-count" aria-live="polite">${totalCount === 0 ? 'No tasks' : `${doneCount}/${totalCount} done`}</span>
            ${hasDone ? `<button class="notebook-clear-btn" onclick="todoApp.clearDone()" aria-label="Clear completed tasks">Clear done</button>` : ''}
          </div>
        </div>
      </div>

      <style>
        .notebook-cover {
          display: flex;
          background: var(--color-bg-canvas, #f5f5f5);
          border-radius: 4px;
          overflow: hidden;
        }
        .spiral-holes {
          width: 20px;
          background: var(--color-bg-brand, #1a73e8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-evenly;
          padding: 6px 0;
          flex-shrink: 0;
        }
        .spiral-hole {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: var(--color-bg-canvas, #f5f5f5);
          border: 2px solid rgba(0,0,0,0.25);
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.35);
          flex-shrink: 0;
        }
        .notebook-page {
          flex: 1;
          min-width: 0;
          background: var(--color-bg-surface, #fafafa);
          background-image:
            linear-gradient(transparent calc(100% - 1px), rgba(100,149,237,0.22) 1px);
          background-size: 100% 26px;
          border-left: 2px solid rgba(220, 80, 80, 0.35);
          padding: 8px 8px 6px 12px;
          font-family: 'Courier New', Courier, monospace;
        }
        .notebook-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
          padding-bottom: 5px;
          border-bottom: 1px solid rgba(100,149,237,0.3);
          gap: 6px;
        }
        .notebook-title {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.12em;
          color: var(--color-fg-muted, #666);
          text-transform: uppercase;
          white-space: nowrap;
        }
        .notebook-tools { display: flex; gap: 4px; flex-shrink: 0; }
        .notebook-tool-btn {
          padding: 0 8px;
          height: 24px;
          min-width: 28px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.03em;
          border: 1px solid var(--color-border-default, #ccc);
          border-radius: 100px;
          background: var(--color-bg-surface, #fff);
          color: var(--color-fg-muted, #555);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s;
          user-select: none;
        }
        .notebook-tool-btn:hover:not(.active) {
          border-color: var(--color-border-focus, #1a73e8);
          color: var(--color-fg-default, #333);
        }
        .notebook-tool-btn.active {
          background: var(--color-bg-brand, #1a73e8);
          color: #fff;
          border-color: var(--color-bg-brand, #1a73e8);
          box-shadow: 0 0 6px rgba(26, 115, 232, 0.3);
        }
        .notebook-input-row {
          display: flex; gap: 4px; margin-bottom: 4px; align-items: center;
        }
        .notebook-input {
          flex: 1;
          min-width: 0;
          background: transparent;
          border: none;
          border-bottom: 1px dashed var(--color-border-muted, #ddd);
          font-size: 12px;
          font-family: inherit;
          color: var(--color-fg-default, #333);
          padding: 2px 4px;
          outline: none;
        }
        .notebook-input::placeholder { color: var(--color-fg-subtle, #aaa); }
        .notebook-add-btn {
          width: 24px; height: 24px;
          background: var(--color-bg-brand, #1a73e8);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-weight: 300;
          flex-shrink: 0;
          transition: transform 0.1s, filter 0.1s;
        }
        .notebook-add-btn:hover { transform: scale(1.1); filter: brightness(1.1); }
        .notebook-items { display: flex; flex-direction: column; }
        .notebook-item {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          min-height: 26px;
          padding: 2px 0;
        }
        .notebook-item.done .notebook-text { text-decoration: line-through; opacity: 0.45; }
        .notebook-check {
          background: none;
          border: 1.5px solid var(--color-border-default, #bbb);
          border-radius: 50%;
          width: 16px; height: 16px;
          font-size: 9px;
          cursor: pointer;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          color: var(--color-fg-default, #333);
          transition: background 0.1s, border-color 0.1s;
          margin-top: 3px;
        }
        .notebook-check:hover { border-color: var(--color-bg-brand, #1a73e8); }
        .notebook-check.checked {
          background: var(--color-state-success, #16a34a);
          border-color: var(--color-state-success, #16a34a);
          color: white;
        }
        .notebook-text {
          flex: 1;
          min-width: 0;
          font-size: 12px;
          color: var(--color-fg-default, #333);
          line-height: 1.55;
          word-break: break-word;
          cursor: default;
          padding-top: 2px;
          border-radius: 2px;
          outline: none;
        }
        .notebook-text:focus-visible {
          box-shadow: 0 0 0 2px var(--color-bg-brand, #1a73e8);
        }
        .notebook-text:hover { color: var(--color-fg-default, #333); }
        .nb-bullet { color: var(--color-bg-brand, #1a73e8); font-weight: 700; }
        .notebook-text.bold { font-weight: 700; }
        .notebook-text.h1-size { font-size: 14px; }
        .notebook-text.aa-size { font-size: 11px; }
        .notebook-edit-input {
          flex: 1;
          min-width: 0;
          font-size: 12px;
          font-family: 'Courier New', Courier, monospace;
          color: var(--color-fg-default, #333);
          background: var(--color-bg-canvas, #f9f9f9);
          border: 1px solid var(--color-bg-brand, #1a73e8);
          border-radius: 3px;
          padding: 1px 5px;
          outline: none;
          line-height: 1.4;
        }
        .notebook-delete {
          background: none; border: none;
          color: var(--color-state-error, #dc2626);
          font-size: 15px; cursor: pointer; opacity: 0;
          padding: 0 2px; flex-shrink: 0;
          transition: opacity 0.1s;
          margin-top: 1px;
          line-height: 1;
        }
        .notebook-item:hover .notebook-delete { opacity: 0.6; }
        .notebook-delete:hover { opacity: 1 !important; }
        .notebook-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 5px;
          padding-top: 4px;
          border-top: 1px solid rgba(100,149,237,0.25);
          min-height: 20px;
        }
        .notebook-count {
          font-size: 9px;
          letter-spacing: 0.08em;
          color: var(--color-fg-subtle, #aaa);
          text-transform: uppercase;
        }
        .notebook-clear-btn {
          font-size: 9px;
          font-family: 'Courier New', Courier, monospace;
          letter-spacing: 0.05em;
          color: var(--color-fg-muted, #888);
          background: none;
          border: 1px solid var(--color-border-default, #ddd);
          border-radius: 3px;
          padding: 1px 6px;
          cursor: pointer;
          transition: color 0.1s, border-color 0.1s;
        }
        .notebook-clear-btn:hover {
          color: var(--color-state-error, #dc2626);
          border-color: var(--color-state-error, #dc2626);
        }
      </style>
    `;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  function escapeAttr(text) {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function addFromInput() {
    const input = document.getElementById('todo-input');
    if (input) { addItem(input.value); input.value = ''; input.focus(); }
  }

  function toggleBold() { isBold = !isBold; render(); }
  function toggleSize() { isH1Size = !isH1Size; render(); }
  function toggleBullet() { isBullet = !isBullet; render(); }

  function init() {
    load();
    render();
  }

  return { init, addItem, addFromInput, toggleDone, deleteItem, clearDone, startEdit, commitEdit, cancelEdit, toggleBold, toggleSize, toggleBullet };
})();
