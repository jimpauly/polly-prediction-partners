/**
 * TodoApp — Paulie's Prediction Partners
 * Spiral notebook-style contenteditable to-do list.
 * Features: bold, H1/Aa, bullet list, save as .txt
 */
(function () {
  'use strict';

  let editor;

  function execCmd(cmd, value) {
    editor.focus();
    document.execCommand(cmd, false, value || null);
    syncToolbar();
  }

  function syncToolbar() {
    const boldBtn = document.getElementById('todo-bold');
    if (boldBtn) boldBtn.classList.toggle('active', document.queryCommandState('bold'));

    const listBtn = document.getElementById('todo-list');
    if (listBtn) listBtn.classList.toggle('active', document.queryCommandState('insertUnorderedList'));
  }

  function saveAsTxt() {
    const text = editor.innerText || editor.textContent || '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'paulie-notes.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  function init() {
    editor = document.getElementById('todo-editor');
    if (!editor) return;

    // Load saved content
    try {
      const saved = localStorage.getItem('ppp-todo');
      if (saved) editor.innerHTML = saved;
    } catch (_) {}

    // Auto-save
    editor.addEventListener('input', () => {
      try { localStorage.setItem('ppp-todo', editor.innerHTML); } catch (_) {}
      syncToolbar();
      updateCount();
    });

    editor.addEventListener('keyup', syncToolbar);
    editor.addEventListener('mouseup', syncToolbar);

    // Toolbar buttons
    const boldBtn = document.getElementById('todo-bold');
    if (boldBtn) boldBtn.addEventListener('click', () => execCmd('bold'));

    const h1Btn = document.getElementById('todo-h1');
    if (h1Btn) h1Btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      const parent = range.commonAncestorContainer.parentElement;
      if (parent && parent.tagName === 'H2') {
        document.execCommand('formatBlock', false, 'p');
      } else {
        document.execCommand('formatBlock', false, 'h2');
      }
    });

    const listBtn = document.getElementById('todo-list');
    if (listBtn) listBtn.addEventListener('click', () => execCmd('insertUnorderedList'));

    const saveBtn = document.getElementById('todo-save');
    if (saveBtn) saveBtn.addEventListener('click', saveAsTxt);

    const clearBtn = document.getElementById('todo-clear');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (confirm('Clear all notes?')) {
        editor.innerHTML = '';
        localStorage.removeItem('ppp-todo');
        updateCount();
      }
    });

    updateCount();
  }

  function updateCount() {
    const counter = document.getElementById('todo-count');
    if (!counter || !editor) return;
    const text = editor.innerText || '';
    const lines = text.split('\n').filter(l => l.trim()).length;
    counter.textContent = `${lines} line${lines !== 1 ? 's' : ''}`;
  }

  window.TodoApp = { init };
})();
