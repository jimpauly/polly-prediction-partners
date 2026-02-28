/**
 * main.js — App initialization and event coordination
 * Polly Prediction Partners v0.03.01
 */

// ============================================================
// PRECISION TOOLS (rulers + grid overlay)
// ============================================================
const precisionTools = (() => {
  let rulersEnabled = false;
  let gridEnabled = false;

  function toggleRulers(enabled) {
    rulersEnabled = enabled;
    const rulerX = document.getElementById('ruler-x');
    const rulerY = document.getElementById('ruler-y');
    if (rulerX) rulerX.style.display = enabled ? 'block' : 'none';
    if (rulerY) rulerY.style.display = enabled ? 'block' : 'none';
    if (enabled) drawRulers();
    document.body.dataset.rulers = enabled ? 'visible' : 'hidden';
  }

  function toggleGrid(enabled) {
    gridEnabled = enabled;
    const grid = document.getElementById('grid-overlay');
    if (grid) grid.style.display = enabled ? 'block' : 'none';
    document.body.dataset.grid = enabled ? 'visible' : 'hidden';
  }

  function drawRulers() {
    drawRulerX();
    drawRulerY();
  }

  function drawRulerX() {
    const canvas = document.getElementById('ruler-x');
    if (!canvas) return;
    const W = window.innerWidth;
    canvas.width = W;
    canvas.height = 18;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg-surface').trim() || '#f0f0f0';
    const fgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-fg-muted').trim() || '#666';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, 18);
    ctx.strokeStyle = fgColor;
    ctx.fillStyle = fgColor;
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';

    for (let x = 0; x <= W; x += 10) {
      const tickH = x % 100 === 0 ? 12 : x % 50 === 0 ? 8 : 6;
      ctx.beginPath();
      ctx.moveTo(x, 18);
      ctx.lineTo(x, 18 - tickH);
      ctx.stroke();
      if (x % 100 === 0 && x > 0) {
        ctx.fillText(x, x, 10);
      }
    }
    // End label
    ctx.fillText(`${W}px`, W - 20, 10);
  }

  function drawRulerY() {
    const canvas = document.getElementById('ruler-y');
    if (!canvas) return;
    const H = window.innerHeight;
    canvas.width = 18;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg-surface').trim() || '#f0f0f0';
    const fgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-fg-muted').trim() || '#666';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 18, H);
    ctx.strokeStyle = fgColor;
    ctx.fillStyle = fgColor;
    ctx.font = '7px monospace';

    for (let y = 0; y <= H; y += 10) {
      const tickW = y % 100 === 0 ? 12 : y % 50 === 0 ? 8 : 6;
      ctx.beginPath();
      ctx.moveTo(18, y);
      ctx.lineTo(18 - tickW, y);
      ctx.stroke();
      if (y % 100 === 0 && y > 0) {
        ctx.save();
        ctx.translate(10, y);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(y, 0, 0);
        ctx.restore();
      }
    }
    ctx.save();
    ctx.translate(10, H - 20);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${H}px`, 0, 0);
    ctx.restore();
  }

  // Recalculate on resize
  function onResize() {
    if (rulersEnabled) drawRulers();
  }

  return { toggleRulers, toggleGrid, drawRulers, onResize };
})();

// ============================================================
// PALETTE VIEWER (updates when theme changes)
// ============================================================
window.paletteViewer = (() => {
  // Extract CSS custom properties for current theme
  function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    const tokenNames = [
      '--color-bg-canvas', '--color-bg-surface', '--color-bg-brand',
      '--color-fg-default', '--color-fg-strong', '--color-fg-muted',
      '--color-border-default', '--color-border-muted', '--color-border-focus',
      '--color-link-default', '--color-link-visited',
      '--color-code-bg', '--color-code-fg',
      '--color-state-success', '--color-state-warning', '--color-state-error', '--color-state-info',
      '--color-selection-bg', '--color-debug-marker',
    ];

    return tokenNames.map(name => ({
      name: name.replace('--color-', '').replace(/-/g, '.'),
      value: style.getPropertyValue(name).trim()
    })).filter(t => t.value);
  }

  function update() {
    const container = document.getElementById('palette-viewer');
    if (!container) return;
    const colors = getThemeColors();
    container.innerHTML = colors.map(token => `
      <div title="${token.name}: ${token.value}" style="display:flex; flex-direction:column; align-items:center; gap:2px;">
        <div style="
          width: 100%; height: 28px;
          background: ${token.value};
          border: 1px solid var(--color-border-default);
          border-radius: 3px;
          cursor: help;
        "></div>
        <div style="font-size: 8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%; text-align:center; opacity:0.7;">${token.name.split('.').pop()}</div>
      </div>
    `).join('');
  }

  return { update };
})();

// ============================================================
// SYSTEM GAUGES (Battery, Network, Memory)
// ============================================================
const systemGauges = (() => {
  const GAUGE_IDS = { battery: 'gauge-battery', network: 'gauge-network', memory: 'gauge-memory' };
  let values = { battery: 0.75, network: 0.5, memory: 0.4 };
  let batteryManager = null;

  function drawGauge(canvasId, value, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) / 2 - 4;
    ctx.clearRect(0, 0, W, H);

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, R, Math.PI * 0.75, Math.PI * 0.25, false);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border-muted') || '#ddd';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Value arc
    const endAngle = Math.PI * 0.75 + (value * Math.PI * 1.5);
    ctx.beginPath();
    ctx.arc(cx, cy, R, Math.PI * 0.75, endAngle, false);
    ctx.strokeStyle = color || getComputedStyle(document.documentElement).getPropertyValue('--color-bg-brand') || '#1a73e8';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value text
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-fg-default') || '#333';
    ctx.font = `bold ${Math.round(W * 0.2)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(value * 100)}%`, cx, cy);
  }

  function updateGauges() {
    // Battery (real if available)
    if (navigator.getBattery) {
      navigator.getBattery().then(bat => {
        values.battery = bat.level;
        const batteryColor = bat.charging ? '#16a34a' : bat.level < 0.2 ? '#dc2626' : '#1a73e8';
        drawGauge(GAUGE_IDS.battery, bat.level, batteryColor);
      }).catch(() => drawGauge(GAUGE_IDS.battery, values.battery, null));
    } else {
      // Simulate slowly varying value
      values.battery = Math.max(0.1, Math.min(1.0, values.battery + (Math.random() - 0.5) * 0.02));
      drawGauge(GAUGE_IDS.battery, values.battery, null);
    }

    // Network downlink (real if available)
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.downlink) {
      // Normalize: 0 = 0 Mbps, 1 = 100+ Mbps
      values.network = Math.min(1.0, conn.downlink / 100);
    } else {
      values.network = Math.max(0.1, Math.min(1.0, values.network + (Math.random() - 0.5) * 0.05));
    }
    drawGauge(GAUGE_IDS.network, values.network, '#0891b2');

    // Memory
    if (performance.memory) {
      values.memory = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
    } else {
      values.memory = Math.max(0.1, Math.min(0.95, values.memory + (Math.random() - 0.5) * 0.03));
    }
    drawGauge(GAUGE_IDS.memory, values.memory, '#d97706');
  }

  function init() {
    updateGauges();
    setInterval(updateGauges, 2000);
  }

  return { init, drawGauge, updateGauges };
})();

// ============================================================
// LIVE EVENT LOG
// ============================================================
const eventLog = (() => {
  const MAX_EVENTS = 7;
  const events = [];
  const LOG_COLORS = { click: '#00ff88', resize: '#ffaa00', focus: '#00aaff', blur: '#888888', keydown: '#ff88ff', scroll: '#88ffff' };

  function log(type, detail) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}.${String(now.getMilliseconds()).slice(0,2)}`;
    events.unshift({ type, detail, time });
    if (events.length > MAX_EVENTS) events.pop();
    render();
  }

  function render() {
    const container = document.getElementById('event-log');
    if (!container) return;
    container.innerHTML = events.map(e => `
      <div style="color:${LOG_COLORS[e.type] || '#ccc'}; padding:1px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        <span style="opacity:0.5;">${e.time}</span> 
        <span style="font-weight:700;">[${e.type.toUpperCase()}]</span> 
        <span style="opacity:0.8;">${e.detail}</span>
      </div>
    `).join('');
  }

  function init() {
    document.addEventListener('click', e => log('click', `${e.target.tagName.toLowerCase()}${e.target.id ? '#'+e.target.id : ''}${e.target.className ? '.'+String(e.target.className).split(' ')[0] : ''}`));
    window.addEventListener('resize', () => log('resize', `${window.innerWidth}×${window.innerHeight}`));
    document.addEventListener('focusin', e => log('focus', `${e.target.tagName.toLowerCase()}${e.target.id ? '#'+e.target.id : ''}`));
    document.addEventListener('focusout', e => log('blur', `${e.target.tagName.toLowerCase()}`));
    document.addEventListener('keydown', e => { if (!['Shift','Control','Alt','Meta'].includes(e.key)) log('keydown', `"${e.key}"`); });
    log('focus', 'app initialized');
  }

  return { init, log };
})();

// ============================================================
// DEV LOGS
// ============================================================
const devLogs = (() => {
  const MAX_LOGS = 20;
  const logs = [];
  const originalConsole = { error: console.error, warn: console.warn };

  function addLog(type, msg) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    logs.unshift({ type, msg: String(msg).slice(0, 80), time });
    if (logs.length > MAX_LOGS) logs.pop();
    render();
  }

  function render() {
    const container = document.getElementById('dev-log');
    if (!container) return;
    container.innerHTML = logs.length === 0 
      ? '<div style="opacity:0.4; font-size:9px; padding:4px;">No errors or warnings.</div>'
      : logs.map(l => `
        <div style="color:${l.type === 'error' ? '#ff4444' : '#ffaa00'}; padding:1px 0; font-size:9px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${l.msg}">
          <span style="opacity:0.5;">${l.time}</span>
          <span>[${l.type.toUpperCase()}]</span>
          <span>${l.msg}</span>
        </div>
      `).join('');
  }

  function init() {
    console.error = (...args) => { originalConsole.error(...args); addLog('error', args.join(' ')); };
    console.warn = (...args) => { originalConsole.warn(...args); addLog('warn', args.join(' ')); };
    render();
  }

  return { init };
})();

// ============================================================
// MANOMETER ANIMATION
// ============================================================
const manometers = (() => {
  const needles = [];
  let targets = [0.3, 0.7, 0.5];
  let current = [0.3, 0.7, 0.5];

  function animate() {
    const svgNeedles = document.querySelectorAll('.manometer-needle');
    svgNeedles.forEach((needle, i) => {
      // Smoothly move toward target
      current[i] += (targets[i] - current[i]) * 0.05;
      // Random drift in target
      if (Math.random() < 0.02) {
        targets[i] = 0.1 + Math.random() * 0.8;
      }
      // Map 0..1 to -135..135 degrees
      const angle = -135 + current[i] * 270;
      needle.setAttribute('transform', `rotate(${angle})`);
    });
    requestAnimationFrame(animate);
  }

  function init() {
    animate();
  }

  return { init };
})();

// ============================================================
// MAIN INIT
// ============================================================
function initApp() {
  // Initialize all modules
  themes.init();
  illumination.init();
  studios.init();
  telemetry.init();
  todoApp.init();
  trading.init();
  paintApp.init();

  // Init design studio features
  systemGauges.init();
  eventLog.init();
  devLogs.init();
  manometers.init();

  // Update palette viewer after theme init
  setTimeout(() => {
    window.paletteViewer.update();
    // Also refresh theme button self-styles
    themes.refreshThemeButtonStyles();
  }, 100);

  // Resize handler
  window.addEventListener('resize', () => {
    precisionTools.onResize();
    systemGauges.updateGauges();
    trading.renderPLChart();
  });

  // visualViewport change
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      precisionTools.onResize();
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'd') { e.preventDefault(); themes.toggleMode(); }
  });

  // Log initialization
  console.info('Polly Prediction Partners v0.03.01 initialized');
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
