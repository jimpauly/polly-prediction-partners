/* ============================================================
   Telemetry — PING sparkline, speed, datetime
   ============================================================ */

const Telemetry = (() => {
  let pingData = [];
  const MAX_PING_POINTS = 30;
  let animationFrameId = null;

  function initialize() {
    updateDateTime();
    setInterval(updateDateTime, 5000);
    startPingSparkline();
  }

  function updateDateTime() {
    const element = document.getElementById('datetime-display');
    if (!element) return;
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    element.textContent = `${month}/${day} ${hours}:${minutes}`;
  }

  function startPingSparkline() {
    const canvas = document.getElementById('ping-sparkline');
    if (!canvas) return;
    const context = canvas.getContext('2d');

    function collectPing() {
      let rtt = 50;
      if (navigator.connection && navigator.connection.rtt !== undefined) {
        rtt = navigator.connection.rtt;
      } else {
        rtt = 30 + Math.random() * 40;
      }
      pingData.push(rtt);
      if (pingData.length > MAX_PING_POINTS) pingData.shift();
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

      context.beginPath();
      context.strokeStyle = getComputedStyle(document.body).getPropertyValue('--color-state-success').trim() || '#16a34a';
      context.lineWidth = 1.5;
      context.lineJoin = 'round';

      pingData.forEach((value, index) => {
        const x = (index / (MAX_PING_POINTS - 1)) * width;
        const y = height - ((value - minPing) / range) * (height - 4) - 2;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });

      context.stroke();
      animationFrameId = requestAnimationFrame(drawSparkline);
    }

    collectPing();
    setInterval(collectPing, 2000);
    drawSparkline();
  }

  function destroy() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  }

  return { initialize, destroy };
})();
