/* ============================================================
   Precision Tools — Rulers (X/Y) and Grid Overlay
   X-axis ruler (top), Y-axis ruler (left), 18px wide
   Tick marks: 6px/8px/12px at every 10px intervals
   ============================================================ */

const Rulers = (() => {
  function initialize() {
    draw();
    window.addEventListener('resize', draw);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', draw);
    }
  }

  function draw() {
    drawXRuler();
    drawYRuler();
  }

  function drawXRuler() {
    const canvas = document.getElementById('ruler-x-canvas');
    if (!canvas) return;

    const container = document.querySelector('.viewport-container');
    const width = container ? container.offsetWidth : 1920;
    canvas.width = width - 18; // Subtract origin square
    canvas.height = 18;

    const context = canvas.getContext('2d');
    const computedStyle = getComputedStyle(document.body);
    const borderColor = computedStyle.getPropertyValue('--color-border-default').trim() || '#d1d5db';
    const foregroundColor = computedStyle.getPropertyValue('--color-fg-default').trim() || '#1f2937';
    const surfaceColor = computedStyle.getPropertyValue('--color-bg-surface').trim() || '#f5f5f5';

    context.fillStyle = surfaceColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Bottom border
    context.strokeStyle = borderColor;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, 17.5);
    context.lineTo(canvas.width, 17.5);
    context.stroke();

    // Tick marks
    for (let i = 0; i <= canvas.width; i += 10) {
      let tickHeight = 6;
      if (i % 100 === 0) tickHeight = 12;
      else if (i % 50 === 0) tickHeight = 8;

      context.beginPath();
      context.moveTo(i + 0.5, 18);
      context.lineTo(i + 0.5, 18 - tickHeight);
      context.strokeStyle = foregroundColor;
      context.lineWidth = 0.5;
      context.stroke();

      // Labels at every 100px
      if (i % 100 === 0 && i > 0) {
        context.fillStyle = foregroundColor;
        context.font = '7px sans-serif';
        context.textAlign = 'center';
        context.fillText(String(i), i, 8);
      }
    }

    // End label
    const endValue = canvas.width;
    context.fillStyle = foregroundColor;
    context.font = '7px sans-serif';
    context.textAlign = 'right';
    context.fillText(`${endValue}px`, canvas.width - 2, 8);
  }

  function drawYRuler() {
    const canvas = document.getElementById('ruler-y-canvas');
    if (!canvas) return;

    const container = document.querySelector('.viewport-container');
    const height = container ? container.offsetHeight : 1080;
    canvas.width = 18;
    canvas.height = height - 18; // Subtract origin square

    const context = canvas.getContext('2d');
    const computedStyle = getComputedStyle(document.body);
    const borderColor = computedStyle.getPropertyValue('--color-border-default').trim() || '#d1d5db';
    const foregroundColor = computedStyle.getPropertyValue('--color-fg-default').trim() || '#1f2937';
    const surfaceColor = computedStyle.getPropertyValue('--color-bg-surface').trim() || '#f5f5f5';

    context.fillStyle = surfaceColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Right border
    context.strokeStyle = borderColor;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(17.5, 0);
    context.lineTo(17.5, canvas.height);
    context.stroke();

    // Tick marks
    for (let i = 0; i <= canvas.height; i += 10) {
      let tickHeight = 6;
      if (i % 100 === 0) tickHeight = 12;
      else if (i % 50 === 0) tickHeight = 8;

      context.beginPath();
      context.moveTo(18, i + 0.5);
      context.lineTo(18 - tickHeight, i + 0.5);
      context.strokeStyle = foregroundColor;
      context.lineWidth = 0.5;
      context.stroke();

      // Labels at every 100px
      if (i % 100 === 0 && i > 0) {
        context.save();
        context.translate(8, i);
        context.rotate(-Math.PI / 2);
        context.fillStyle = foregroundColor;
        context.font = '7px sans-serif';
        context.textAlign = 'center';
        context.fillText(String(i), 0, 0);
        context.restore();
      }
    }

    // End label
    const endValue = canvas.height;
    context.save();
    context.translate(8, canvas.height - 2);
    context.rotate(-Math.PI / 2);
    context.fillStyle = foregroundColor;
    context.font = '7px sans-serif';
    context.textAlign = 'left';
    context.fillText(`${endValue}px`, 0, 0);
    context.restore();
  }

  return { initialize, draw };
})();
