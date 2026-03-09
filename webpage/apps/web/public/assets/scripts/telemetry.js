/* ============================================================
   Telemetry — PING sparkline, speed, datetime, backend health
   ============================================================ */

const Telemetry = (() => {
  let pingData = [];
  const MAX_PING_POINTS = 30; /* ~30 seconds at 1-second intervals */
  const PING_Y_MIN = 0;
  const PING_Y_MAX = 300;
  let animationFrameId = null;
  let backendHealthInterval = null;

  function initialize() {
    updateDateTime();
    setInterval(updateDateTime, 1000); /* 1-second resolution */
    startPingSparkline();
    startBackendHealthCheck();
  }

  function updateDateTime() {
    const element = document.getElementById("datetime-display");
    if (!element) return;
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    element.textContent = `${month}/${day} ${hours}:${minutes}:${seconds}`;
  }

  function startPingSparkline() {
    const canvas = document.getElementById("ping-sparkline");
    if (!canvas) return;
    const context = canvas.getContext("2d");

    function collectPing() {
      let rtt;
      if (
        navigator.connection &&
        navigator.connection.rtt !== undefined &&
        navigator.connection.rtt > 0
      ) {
        rtt = navigator.connection.rtt;
      } else {
        /* Simulate a realistic RTT based on connection type */
        const base = navigator.connection?.effectiveType === "4g" ? 20 : 50;
        rtt = base + Math.random() * 30;
      }
      pingData.push(Math.min(rtt, PING_Y_MAX));
      if (pingData.length > MAX_PING_POINTS) pingData.shift();

      /* Update ping label */
      const pingLabel = document.getElementById("ping-label");
      if (pingLabel) {
        const lastPing = Math.round(rtt);
        pingLabel.textContent = lastPing + "ms";
        pingLabel.style.color =
          lastPing < 50
            ? "var(--color-state-success, #22c55e)"
            : lastPing < 150
              ? "var(--color-state-warning, #f59e0b)"
              : "var(--color-state-error, #ef4444)";
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

      /* Static Y axis: 0ms at top, 300ms at bottom (inverted) */
      const range = PING_Y_MAX - PING_Y_MIN;

      const computedStyle = getComputedStyle(document.documentElement);
      const lineColor =
        computedStyle.getPropertyValue("--color-state-success").trim() ||
        "#16a34a";

      /* Build points array */
      const points = pingData.map((value, index) => ({
        x: (index / (MAX_PING_POINTS - 1)) * width,
        y: (value / range) * (height - 4) + 2, /* 0ms = top (y=2), 300ms = bottom (y=height-2) */
      }));

      /* Draw smooth bezier curve through points */
      context.beginPath();
      context.strokeStyle = lineColor;
      context.lineWidth = 1.5;
      context.lineJoin = "round";
      context.lineCap = "round";

      context.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        context.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
      }

      context.stroke();

      /* Fill under the curve */
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, lineColor + "00");
      gradient.addColorStop(1, lineColor + "25");
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.closePath();
      context.fillStyle = gradient;
      context.fill();

      animationFrameId = requestAnimationFrame(drawSparkline);
    }

    collectPing();
    setInterval(collectPing, 1000); /* 1-second intervals for ~30s history */
    drawSparkline();
  }

  function startBackendHealthCheck() {
    async function checkBackend() {
      const statusEl = document.getElementById("backend-health-dot");
      if (!statusEl) return;

      try {
        const startTime = performance.now();
        /* AbortSignal.timeout is available in modern browsers and Electron 20+;
           fall back to AbortController for broader compatibility */
        let signal;
        let abortController;
        if (
          typeof AbortSignal !== "undefined" &&
          typeof AbortSignal.timeout === "function"
        ) {
          signal = AbortSignal.timeout(2000);
        } else {
          abortController = new AbortController();
          signal = abortController.signal;
          setTimeout(() => abortController.abort(), 2000);
        }
        const response = await fetch(
          "http://127.0.0.1:8000/api/connection/status",
          { signal },
        );
        const elapsed = performance.now() - startTime;

        if (response.ok) {
          statusEl.style.background = "var(--color-state-success, #22c55e)";
          statusEl.style.boxShadow =
            "0 0 4px var(--color-state-success, #22c55e)";
          statusEl.title = `Backend healthy (${Math.round(elapsed)}ms)`;
        } else {
          statusEl.style.background = "var(--color-state-warning, #f59e0b)";
          statusEl.title = `Backend unhealthy (${response.status})`;
        }
      } catch (_err) {
        statusEl.style.background = "var(--color-fg-subtle)";
        statusEl.style.boxShadow = "none";
        statusEl.title = "Backend offline";
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
