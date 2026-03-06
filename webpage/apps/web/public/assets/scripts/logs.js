/* ============================================================
   Live Logs Terminal — Captures UI events, resize, errors,
   and backend notifications. Displays last 12 entries with
   color-coded severity: info (default), warn (amber), error (red)
   ============================================================ */

const LiveLogs = (() => {
  const MAX_ENTRIES = 12;
  let logCount = 0;

  function initialize() {
    addLog('info', 'System online — Paulie\'s Prediction Partners');
    addLog('info', `Theme: ${document.documentElement.dataset.theme || '—'}`);
    addLog('info', `Mode: ${document.documentElement.dataset.mode || '—'}`);
    addLog('info', `User-Agent: ${navigator.userAgent.split(' ').pop()}`);

    /* Capture click events (throttled to avoid flooding) */
    let lastClickLog = 0;
    document.addEventListener('click', (event) => {
      const now = Date.now();
      if (now - lastClickLog < 300) return;
      lastClickLog = now;
      const target = event.target;
      const tag = target.tagName.toLowerCase();
      const id = target.id ? `#${target.id}` : '';
      const cls = target.className && typeof target.className === 'string' && target.className.trim()
        ? `.${target.className.trim().split(/\s+/)[0]}`
        : '';
      addLog('info', `CLICK ${tag}${id || cls}`);
    });

    /* Capture resize events (throttled) */
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        addLog('warn', `RESIZE → ${window.innerWidth}×${window.innerHeight}px`);
      }, 250);
    });

    /* Capture errors */
    window.addEventListener('error', (event) => {
      addLog('error', `ERROR: ${event.message || 'Unknown error'}`);
    });

    window.addEventListener('unhandledrejection', (event) => {
      const msg = event.reason?.message || String(event.reason) || 'Unhandled rejection';
      addLog('error', `REJECT: ${msg.substring(0, 60)}`);
    });

    /* Listen for custom theme changes */
    document.addEventListener('themechange', (event) => {
      addLog('info', `THEME → ${document.documentElement.dataset.theme} / ${document.documentElement.dataset.mode}`);
    });

    /* Listen for illumination changes */
    document.addEventListener('illuminationchange', () => {
      addLog('info', 'ILLUMINATION updated');
    });

    /* Listen for tab switches (if tabs fire custom events) */
    document.querySelectorAll('.nav-tab[role="tab"]').forEach(tab => {
      tab.addEventListener('click', () => {
        addLog('info', `TAB → ${tab.dataset.studio || tab.textContent.trim()}`);
      });
    });

    /* Periodic system status log */
    setInterval(() => {
      const mem = performance.memory;
      if (mem) {
        const used = Math.round(mem.usedJSHeapSize / 1048576);
        addLog('info', `MEM: ${used}MB used`);
      }
    }, 60000);
  }

  function addLog(level, message) {
    const terminal = document.getElementById('live-logs');
    if (!terminal) return;

    logCount++;
    const timestamp = new Date();
    const hours = String(timestamp.getHours()).padStart(2, '0');
    const minutes = String(timestamp.getMinutes()).padStart(2, '0');
    const seconds = String(timestamp.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    const entry = document.createElement('div');
    entry.className = `log-entry log-${level}`;

    /* Color the level indicator */
    const levelColors = {
      info: 'var(--color-fg-muted)',
      warn: 'var(--color-state-warning, #f59e0b)',
      error: 'var(--color-state-error, #ef4444)',
      success: 'var(--color-state-success, #22c55e)',
    };
    const levelColor = levelColors[level] || levelColors.info;
    const levelIcon = { info: '·', warn: '⚠', error: '✗', success: '✓' }[level] || '·';

    entry.style.cssText = `
      font-family: var(--font-family-mono);
      font-size: 9.5px;
      padding: 1px 0;
      display: flex;
      gap: 4px;
      align-items: baseline;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    entry.innerHTML = `
      <span style="color:var(--color-fg-subtle);flex-shrink:0">${timeString}</span>
      <span style="color:${levelColor};flex-shrink:0;font-weight:700">${levelIcon}</span>
      <span style="color:var(--color-fg-default);overflow:hidden;text-overflow:ellipsis">${escapeHtml(message)}</span>
    `;

    terminal.appendChild(entry);

    /* Keep only last MAX_ENTRIES */
    while (terminal.children.length > MAX_ENTRIES) {
      terminal.removeChild(terminal.firstChild);
    }

    terminal.scrollTop = terminal.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  return { initialize, addLog };
})();
