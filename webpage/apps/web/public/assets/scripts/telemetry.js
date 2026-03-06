/* ============================================================
   Telemetry — PING sparkline, speed, datetime, backend health
   ============================================================ */

const Telemetry = (() => {
  let pingData = [];
  const MAX_PING_POINTS = 30;
  let animationFrameId = null;
  let backendHealthInterval = null;

  function initialize() {
    updateDateTime();
    setInterval(updateDateTime, 1000);   /* 1-second resolution */
    startPingSparkline();
    startBackendHealthCheck();
  }

  function updateDateTime() {
    const element = document.getElementById('datetime-display');
    if (!element) return;
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    element.textContent = `${month}/${day} ${hours}:${minutes}:${seconds}`;
  }

  function startPingSparkline() {
    const canvas = document.getElementById('ping-sparkline');
    if (!canvas) return;
    const context = canvas.getContext('2d');

    function collectPing() {
      let rtt;
      if (navigator.connection && navigator.connection.rtt !== undefined && navigator.connection.rtt > 0) {
        rtt = navigator.connection.rtt;
      } else {
        /* Simulate a realistic RTT based on connection type */
        const base = navigator.connection?.effectiveType === '4g' ? 20 : 50;
        rtt = base + Math.random() * 30;
      }
      pingData.push(rtt);
      if (pingData.length > MAX_PING_POINTS) pingData.shift();

      /* Update ping label */
      const pingLabel = document.getElementById('ping-label');
      if (pingLabel) {
        const lastPing = Math.round(rtt);
        pingLabel.textContent = lastPing + 'ms';
        pingLabel.style.color = lastPing < 50
          ? 'var(--color-state-success, #22c55e)'
          : lastPing < 150
            ? 'var(--color-state-warning, #f59e0b)'
            : 'var(--color-state-error, #ef4444)';
      }
    }

    function drawSparkline() {
      const width = canvas.width;
      const height = canvas.height;
      context.clearRect(0, 0, width, height);

      if (pingData.length < 2) {
        animationFrameId = requestAnimationFrame(drawSparkline);
        return;
      }

      const maxPing = Math.max(...pingData, 100);
      const minPing = Math.min(...pingData, 0);
      const range = maxPing - minPing || 1;

      const computedStyle = getComputedStyle(document.documentElement);
      const lineColor = computedStyle.getPropertyValue('--color-state-success').trim() || '#16a34a';

      context.beginPath();
      context.strokeStyle = lineColor;
      context.lineWidth = 1.5;
      context.lineJoin = 'round';
      context.lineCap = 'round';

      pingData.forEach((value, index) => {
        const x = (index / (MAX_PING_POINTS - 1)) * width;
        const y = height - ((value - minPing) / range) * (height - 4) - 2;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });

      context.stroke();

      /* Fill under the line */
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, lineColor + '25');
      gradient.addColorStop(1, lineColor + '00');
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.closePath();
      context.fillStyle = gradient;
      context.fill();

      animationFrameId = requestAnimationFrame(drawSparkline);
    }

    collectPing();
    setInterval(collectPing, 2000);
    drawSparkline();
  }

  function startBackendHealthCheck() {
    async function checkBackend() {
      const statusEl = document.getElementById('backend-health-dot');
      if (!statusEl) return;

      try {
        const startTime = performance.now();
        const response = await fetch('http://127.0.0.1:8000/api/connection/status', { signal: AbortSignal.timeout(3000) });
        const elapsed = performance.now() - startTime;

        if (response.ok) {
          statusEl.style.background = 'var(--color-state-success, #22c55e)';
          statusEl.style.boxShadow = '0 0 4px var(--color-state-success, #22c55e)';
          statusEl.title = `Backend healthy (${Math.round(elapsed)}ms)`;
        } else {
          statusEl.style.background = 'var(--color-state-warning, #f59e0b)';
          statusEl.title = `Backend unhealthy (${response.status})`;
        }
      } catch (_err) {
        statusEl.style.background = 'var(--color-fg-subtle)';
        statusEl.style.boxShadow = 'none';
        statusEl.title = 'Backend offline';
      }
    }

    checkBackend();
    backendHealthInterval = setInterval(checkBackend, 5000);
  }

  function destroy() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (backendHealthInterval) clearInterval(backendHealthInterval);
  }

  return { initialize, destroy };
})();
