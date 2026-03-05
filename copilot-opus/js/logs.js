/* ============================================================
   Live Logs Terminal — Captures click, resize, focus events
   Includes errors/warnings with color coding; last 7 entries
   ============================================================ */

const LiveLogs = (() => {
  const MAX_ENTRIES = 7;

  function initialize() {
    addLog('info', 'System initialized');
    addLog('info', `Theme: ${document.body.getAttribute('data-theme')}`);
    addLog('info', `Mode: ${document.body.getAttribute('data-mode')}`);

    // Capture click events
    document.addEventListener('click', (event) => {
      const target = event.target;
      const tag = target.tagName.toLowerCase();
      const id = target.id ? `#${target.id}` : '';
      const className = target.className && typeof target.className === 'string' ? `.${target.className.split(' ')[0]}` : '';
      addLog('info', `CLICK ${tag}${id || className} (${event.clientX},${event.clientY})`);
    });

    // Capture resize events
    window.addEventListener('resize', () => {
      addLog('warn', `RESIZE ${window.innerWidth}×${window.innerHeight}`);
    });

    // Capture focus events on interactive elements
    document.addEventListener('focusin', (event) => {
      const target = event.target;
      if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.getAttribute('tabindex')) {
        const id = target.id ? `#${target.id}` : target.tagName.toLowerCase();
        addLog('info', `FOCUS ${id}`);
      }
    });

    // Capture errors
    window.addEventListener('error', (event) => {
      addLog('error', `ERROR: ${event.message}`);
    });

    // Capture visual viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        addLog('warn', `VIEWPORT ${Math.round(window.visualViewport.width)}×${Math.round(window.visualViewport.height)}`);
      });
    }
  }

  function addLog(level, message) {
    const terminal = document.getElementById('live-logs');
    if (!terminal) return;

    const timestamp = new Date();
    const hours = String(timestamp.getHours()).padStart(2, '0');
    const minutes = String(timestamp.getMinutes()).padStart(2, '0');
    const seconds = String(timestamp.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    const entry = document.createElement('div');
    entry.className = `log-entry log-${level}`;
    entry.textContent = `[${timeString}] ${message}`;

    terminal.appendChild(entry);

    // Keep only last MAX_ENTRIES
    while (terminal.children.length > MAX_ENTRIES) {
      terminal.removeChild(terminal.firstChild);
    }

    terminal.scrollTop = terminal.scrollHeight;
  }

  return { initialize, addLog };
})();
