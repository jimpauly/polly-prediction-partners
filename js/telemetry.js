/**
 * telemetry.js — Telemetry bar updates
 * PING: sparkline using navigator.connection.rtt or random low values
 * SPD: static "MACH 4.20"
 * LOAD: page load time
 * DAT/TIM: real-time clock M/D HH:MM
 */

const telemetry = (() => {
  const SPARKLINE_POINTS = 30;
  const pingHistory = Array(SPARKLINE_POINTS).fill(20);

  function formatLoad() {
    if (window.performance && performance.timing) {
      const load = performance.timing.loadEventEnd - performance.timing.navigationStart;
      if (load > 0) return (load / 1000).toFixed(2) + 's';
    }
    // Use PerformanceNavigationTiming if available
    const entries = performance.getEntriesByType('navigation');
    if (entries.length > 0) {
      return (entries[0].loadEventEnd / 1000).toFixed(2) + 's';
    }
    return '—';
  }

  function formatDateTime() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return {
      dat: `${month}/${day}`,
      tim: `${hours}:${minutes}`
    };
  }

  function getPingValue() {
    // Use navigator.connection.rtt if available
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && typeof conn.rtt === 'number' && conn.rtt > 0) {
      return conn.rtt;
    }
    // Simulate realistic low ping (15–80ms)
    return Math.round(15 + Math.random() * 65);
  }

  function drawSparkline() {
    const canvas = document.getElementById('ping-sparkline');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const max = Math.max(...pingHistory, 100);
    const min = 0;
    const range = max - min || 100;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, width, height);

    // Sparkline
    ctx.beginPath();
    ctx.strokeStyle = 'var(--color-state-success, #00ff88)';
    ctx.lineWidth = 1.5;

    pingHistory.forEach((val, i) => {
      const x = (i / (SPARKLINE_POINTS - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill under line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,255,136,0.1)';
    ctx.fill();

    // Latest ping value label
    const latestPing = pingHistory[pingHistory.length - 1];
    ctx.fillStyle = 'rgba(0,255,136,0.9)';
    ctx.font = '8px monospace';
    ctx.fillText(`${latestPing}ms`, 2, 9);
  }

  function updateAll() {
    // Ping
    const pingVal = getPingValue();
    pingHistory.push(pingVal);
    if (pingHistory.length > SPARKLINE_POINTS) pingHistory.shift();
    drawSparkline();

    // Date/Time
    const { dat, tim } = formatDateTime();
    const datEl = document.getElementById('telemetry-dat');
    const timEl = document.getElementById('telemetry-tim');
    if (datEl) datEl.textContent = dat;
    if (timEl) timEl.textContent = tim;
  }

  function init() {
    // Load time (set once)
    const loadEl = document.getElementById('telemetry-load');
    if (loadEl) {
      // Wait for load event if not yet fired
      if (document.readyState === 'complete') {
        loadEl.textContent = formatLoad();
      } else {
        window.addEventListener('load', () => {
          loadEl.textContent = formatLoad();
        });
      }
    }

    // Update loop: every 1000ms
    updateAll();
    setInterval(updateAll, 1000);
  }

  return { init };
})();
