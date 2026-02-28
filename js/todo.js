/**
 * todo.js — Spiral Notebook To-Do List
 * Features: bold toggle, H1/Aa size toggle, bullet list toggle
 * Appearance: spiral notebook with horizontal lines, red margin line, hole punches
 */

const todoApp = (() => {
  let items = [];
  let nextId = 1;
  let isBold = false;
  let isH1Size = true;
  let isBullet = false;

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
    save();
    render();
  }

  function render() {
    const container = document.getElementById('todo-app');
    if (!container) return;

    container.innerHTML = `
      <div class="notebook-cover">
        <!-- Spiral holes -->
        <div class="spiral-holes">
          ${Array(6).fill(0).map(() => '<div class="spiral-hole"></div>').join('')}
        </div>
        
        <!-- Notebook page -->
        <div class="notebook-page">
          <!-- Header area -->
          <div class="notebook-header">
            <span class="notebook-title">TO-DO LIST</span>
            <div class="notebook-tools">
              <button class="notebook-tool-btn ${isBold ? 'active' : ''}" onclick="todoApp.toggleBold()" title="Bold" aria-label="Toggle bold" aria-pressed="${isBold}"><b>B</b></button>
              <button class="notebook-tool-btn ${isH1Size ? 'active' : ''}" onclick="todoApp.toggleSize()" title="Size" aria-label="Toggle size" aria-pressed="${isH1Size}">H1</button>
              <button class="notebook-tool-btn ${isBullet ? 'active' : ''}" onclick="todoApp.toggleBullet()" title="Bullet list" aria-label="Toggle bullet list" aria-pressed="${isBullet}">•</button>
            </div>
          </div>
          
          <!-- Input area -->
          <div class="notebook-input-row">
            <input type="text" id="todo-input" class="notebook-input" placeholder="Add a task..." 
                   onkeydown="if(event.key==='Enter') todoApp.addFromInput()"
                   aria-label="New task input">
            <button class="notebook-add-btn" onclick="todoApp.addFromInput()" aria-label="Add task">+</button>
          </div>
          
          <!-- Items list -->
          <div class="notebook-items" role="list" aria-label="To-do items">
            ${items.map(item => `
              <div class="notebook-item ${item.done ? 'done' : ''}" role="listitem" data-id="${item.id}">
                <div class="notebook-line-bg"></div>
                <button class="notebook-check ${item.done ? 'checked' : ''}" onclick="todoApp.toggleDone(${item.id})" 
                        aria-label="${item.done ? 'Mark undone' : 'Mark done'}" aria-pressed="${item.done}">
                  ${item.done ? '✓' : '○'}
                </button>
                <span class="notebook-text ${item.bold ? 'bold' : ''} ${item.h1 ? 'h1-size' : 'aa-size'} ${item.bullet ? 'bulleted' : ''}">
                  ${item.bullet ? '• ' : ''}${escapeHtml(item.text)}
                </span>
                <button class="notebook-delete" onclick="todoApp.deleteItem(${item.id})" aria-label="Delete task">×</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <style>
        .notebook-cover {
          display: flex;
          background: var(--color-bg-canvas, #f5f5f5);
          border-radius: 4px;
          overflow: hidden;
          min-height: 200px;
        }
        .spiral-holes {
          width: 22px;
          background: var(--color-bg-brand, #1a73e8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-evenly;
          padding: 8px 0;
          flex-shrink: 0;
        }
        .spiral-hole {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--color-bg-canvas, #f5f5f5);
          border: 2px solid rgba(0,0,0,0.3);
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.4);
        }
        .notebook-page {
          flex: 1;
          background: #fafafa;
          background-image: 
            linear-gradient(transparent calc(100% - 1px), rgba(100,149,237,0.25) 1px);
          background-size: 100% 24px;
          border-left: 2px solid rgba(220, 80, 80, 0.4);
          padding: 8px 8px 8px 14px;
          font-family: 'Courier New', Courier, monospace;
          position: relative;
        }
        .notebook-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 1px solid rgba(100,149,237,0.3);
        }
        .notebook-title {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.12em;
          color: var(--color-fg-muted, #666);
          text-transform: uppercase;
        }
        .notebook-tools { display: flex; gap: 3px; }
        .notebook-tool-btn {
          width: 20px; height: 20px;
          font-size: 10px; font-weight: 700;
          border: 1px solid var(--color-border-default, #ccc);
          border-radius: 2px;
          background: var(--color-bg-surface, #fff);
          color: var(--color-fg-default, #333);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.1s;
        }
        .notebook-tool-btn.active {
          background: var(--color-bg-brand, #1a73e8);
          color: white;
          border-color: var(--color-bg-brand, #1a73e8);
        }
        .notebook-input-row {
          display: flex; gap: 4px; margin-bottom: 4px;
        }
        .notebook-input {
          flex: 1;
          background: transparent;
          border: none;
          border-bottom: 1px dashed var(--color-border-muted, #ddd);
          font-size: 12px;
          font-family: inherit;
          color: var(--color-fg-default, #333);
          padding: 2px 4px;
          outline: none;
        }
        .notebook-add-btn {
          width: 22px; height: 22px;
          background: var(--color-bg-brand, #1a73e8);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-weight: 300;
          transition: transform 0.1s;
        }
        .notebook-add-btn:hover { transform: scale(1.1); }
        .notebook-items { display: flex; flex-direction: column; }
        .notebook-item {
          display: flex;
          align-items: center;
          gap: 6px;
          min-height: 24px;
          padding: 1px 0;
          position: relative;
        }
        .notebook-item.done .notebook-text { text-decoration: line-through; opacity: 0.5; }
        .notebook-check {
          background: none; border: 1px solid var(--color-border-default, #ccc);
          border-radius: 50%; width: 16px; height: 16px;
          font-size: 9px; cursor: pointer; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          color: var(--color-fg-default, #333);
          transition: all 0.1s;
        }
        .notebook-check.checked { background: var(--color-state-success, #16a34a); border-color: var(--color-state-success, #16a34a); color: white; }
        .notebook-text { flex: 1; font-size: 12px; color: var(--color-fg-default, #333); line-height: 24px; }
        .notebook-text.bold { font-weight: 700; }
        .notebook-text.h1-size { font-size: 14px; }
        .notebook-text.aa-size { font-size: 11px; }
        .notebook-delete {
          background: none; border: none; color: var(--color-state-error, #dc2626);
          font-size: 14px; cursor: pointer; opacity: 0; padding: 0 4px;
          transition: opacity 0.1s;
        }
        .notebook-item:hover .notebook-delete { opacity: 0.7; }
        .notebook-delete:hover { opacity: 1 !important; }
      </style>
    `;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
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

  return { init, addItem, addFromInput, toggleDone, deleteItem, toggleBold, toggleSize, toggleBullet };
})();
