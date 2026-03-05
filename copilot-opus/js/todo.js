/* ============================================================
   To-Do List App — Spiral notebook, formatting, save as .txt
   ============================================================ */

const TodoApp = (() => {
  let isBold = false;
  let isHeading = true;
  let isBullets = false;

  function initialize() {
    const boldButton = document.getElementById('todo-bold');
    const headingButton = document.getElementById('todo-heading');
    const bulletButton = document.getElementById('todo-bullets');
    const saveButton = document.getElementById('todo-save');
    const editor = document.getElementById('todo-editor');

    if (!editor) return;

    // Set initial heading style
    editor.style.fontSize = '18px';
    editor.style.fontWeight = '400';

    if (boldButton) {
      boldButton.addEventListener('click', () => {
        isBold = !isBold;
        boldButton.classList.toggle('active', isBold);
        document.execCommand('bold', false, null);
      });
    }

    if (headingButton) {
      headingButton.addEventListener('click', () => {
        isHeading = !isHeading;
        headingButton.textContent = isHeading ? 'H1' : 'Aa';
        headingButton.classList.toggle('active', isHeading);
        editor.style.fontSize = isHeading ? '18px' : '13px';
      });
    }

    if (bulletButton) {
      bulletButton.addEventListener('click', () => {
        isBullets = !isBullets;
        bulletButton.classList.toggle('active', isBullets);
        document.execCommand('insertUnorderedList', false, null);
      });
    }

    if (saveButton) {
      saveButton.addEventListener('click', () => {
        const text = editor.innerText || editor.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'paulies-todo.txt';
        anchor.click();
        URL.revokeObjectURL(url);
      });
    }

    // Auto-switch from H1 to Aa after first paragraph
    editor.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && isHeading) {
        setTimeout(() => {
          isHeading = false;
          if (headingButton) {
            headingButton.textContent = 'Aa';
            headingButton.classList.remove('active');
          }
          editor.style.fontSize = '13px';
        }, 0);
      }
    });
  }

  return { initialize };
})();
