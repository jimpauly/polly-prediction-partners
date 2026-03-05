/* ============================================================
   System Gauges — Battery, Network, Memory, CPU
   Mechanical manometer aesthetic
   ============================================================ */

const Gauges = (() => {
  function initialize() {
    drawAllGauges();
    setInterval(drawAllGauges, 3000);
  }

  function drawAllGauges() {
    drawGauge('gauge-battery', getBatteryLevel(), 'BATT');
    drawGauge('gauge-network', getNetworkDownlink(), 'NET');
    drawGauge('gauge-memory', getMemoryUsage(), 'MEM');
    drawGauge('gauge-cpu', getCpuEstimate(), 'CPU');
  }

  function drawGauge(containerId, value, label) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const canvas = container.querySelector('canvas');
    const valueDisplay = container.querySelector('.gauge-value');
    if (!canvas || !valueDisplay) return;

    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2 + 4;
    const radius = Math.min(width, height) / 2 - 6;

    context.clearRect(0, 0, width, height);

    const computedStyle = getComputedStyle(document.body);
    const borderColor = computedStyle.getPropertyValue('--color-border-default').trim() || '#d1d5db';
    const surfaceColor = computedStyle.getPropertyValue('--color-bg-surface').trim() || '#f5f5f5';
    const brandColor = computedStyle.getPropertyValue('--color-bg-brand').trim() || '#2563eb';
    const errorColor = computedStyle.getPropertyValue('--color-state-error').trim() || '#dc2626';
    const warningColor = computedStyle.getPropertyValue('--color-state-warning').trim() || '#d97706';
    const successColor = computedStyle.getPropertyValue('--color-state-success').trim() || '#16a34a';

    // Outer ring (manometer bezel)
    context.beginPath();
    context.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
    context.fillStyle = borderColor;
    context.fill();

    // Inner face
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fillStyle = surfaceColor;
    context.fill();

    // Gauge arc background
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalArc = endAngle - startAngle;

    context.beginPath();
    context.arc(centerX, centerY, radius - 4, startAngle, endAngle);
    context.strokeStyle = borderColor;
    context.lineWidth = 4;
    context.lineCap = 'round';
    context.stroke();

    // Gauge arc fill
    const clampedValue = Math.max(0, Math.min(100, value));
    const fillAngle = startAngle + (clampedValue / 100) * totalArc;
    let fillColor = successColor;
    if (clampedValue > 80) fillColor = errorColor;
    else if (clampedValue > 60) fillColor = warningColor;

    context.beginPath();
    context.arc(centerX, centerY, radius - 4, startAngle, fillAngle);
    context.strokeStyle = fillColor;
    context.lineWidth = 4;
    context.lineCap = 'round';
    context.stroke();

    // Tick marks
    for (let i = 0; i <= 10; i++) {
      const tickAngle = startAngle + (i / 10) * totalArc;
      const innerRadius = i % 5 === 0 ? radius - 12 : radius - 10;
      const outerRadius = radius - 5;

      context.beginPath();
      context.moveTo(
        centerX + Math.cos(tickAngle) * innerRadius,
        centerY + Math.sin(tickAngle) * innerRadius
      );
      context.lineTo(
        centerX + Math.cos(tickAngle) * outerRadius,
        centerY + Math.sin(tickAngle) * outerRadius
      );
      context.strokeStyle = borderColor;
      context.lineWidth = i % 5 === 0 ? 1.5 : 0.8;
      context.stroke();
    }

    // Needle
    const needleAngle = startAngle + (clampedValue / 100) * totalArc;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(
      centerX + Math.cos(needleAngle) * (radius - 14),
      centerY + Math.sin(needleAngle) * (radius - 14)
    );
    context.strokeStyle = errorColor;
    context.lineWidth = 1.5;
    context.stroke();

    // Center cap
    context.beginPath();
    context.arc(centerX, centerY, 3, 0, Math.PI * 2);
    context.fillStyle = borderColor;
    context.fill();

    // Update value display
    valueDisplay.textContent = `${Math.round(clampedValue)}%`;
  }

  function getBatteryLevel() {
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        const container = document.getElementById('gauge-battery');
        if (container) {
          const valueDisplay = container.querySelector('.gauge-value');
          if (valueDisplay) {
            const level = Math.round(battery.level * 100);
            valueDisplay.textContent = `${level}%`;
          }
        }
      });
    }
    return 75 + Math.random() * 20;
  }

  function getNetworkDownlink() {
    if (navigator.connection && navigator.connection.downlink) {
      return Math.min(100, (navigator.connection.downlink / 10) * 100);
    }
    return 40 + Math.random() * 30;
  }

  function getMemoryUsage() {
    if (performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const total = performance.memory.jsHeapSizeLimit;
      return (used / total) * 100;
    }
    return 30 + Math.random() * 25;
  }

  function getCpuEstimate() {
    return 15 + Math.random() * 30;
  }

  return { initialize };
})();
