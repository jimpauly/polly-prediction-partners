/**
 * MS Paint 1998 Clone — Paulie's Prediction Partners
 * Tools: pencil, brush, eraser, fill, text, rect, ellipse, line
 * 16-color palette, undo/redo, save as PNG
 */
(function () {
  'use strict';

  const COLORS = [
    '#000000','#808080','#800000','#808000',
    '#008000','#008080','#000080','#800080',
    '#ffffff','#c0c0c0','#ff0000','#ffff00',
    '#00ff00','#00ffff','#0000ff','#ff00ff',
  ];

  let canvas, ctx;
  let currentTool = 'pencil';
  let currentColor = '#000000';
  let bgColor = '#ffffff';
  let brushSize = 3;
  let isDrawing = false;
  let startX = 0, startY = 0;
  let lastX = 0, lastY = 0;
  let snapshot = null;
  const undoStack = [];
  const redoStack = [];
  const MAX_UNDO = 20;

  // Text tool state
  let textInput = null;

  function saveUndo() {
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    redoStack.length = 0;
  }

  function undo() {
    if (!undoStack.length) return;
    redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(undoStack.pop(), 0, 0);
  }

  function redo() {
    if (!redoStack.length) return;
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(redoStack.pop(), 0, 0);
  }

  /** Flood fill (BFS) */
  function floodFill(x, y, fillColorHex) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const w = canvas.width;
    const h = canvas.height;

    const idx = (px, py) => (py * w + px) * 4;
    const tx = Math.floor(x), ty = Math.floor(y);
    const ti = idx(tx, ty);
    const tr = data[ti], tg = data[ti+1], tb = data[ti+2], ta = data[ti+3];

    // Parse fill color
    const fr = parseInt(fillColorHex.slice(1,3),16);
    const fg = parseInt(fillColorHex.slice(3,5),16);
    const fb = parseInt(fillColorHex.slice(5,7),16);

    if (tr===fr && tg===fg && tb===fb) return;

    const sameColor = (i) =>
      data[i]===tr && data[i+1]===tg && data[i+2]===tb && data[i+3]===ta;

    const stack = [[tx, ty]];
    const visited = new Uint8Array(w * h);

    while (stack.length) {
      const [cx, cy] = stack.pop();
      if (cx<0||cy<0||cx>=w||cy>=h) continue;
      const ci = idx(cx,cy);
      const vi = cy*w+cx;
      if (visited[vi] || !sameColor(ci)) continue;
      visited[vi] = 1;
      data[ci]=fr; data[ci+1]=fg; data[ci+2]=fb; data[ci+3]=255;
      stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  }

  function onDown(e) {
    const {x, y} = getPos(e);
    isDrawing = true;
    startX = x; startY = y;
    lastX = x; lastY = y;
    ctx.strokeStyle = currentColor;
    ctx.fillStyle   = currentColor;
    ctx.lineWidth   = brushSize;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    if (currentTool === 'fill') {
      saveUndo();
      floodFill(x, y, currentColor);
      isDrawing = false;
      return;
    }
    if (currentTool === 'text') {
      placeTextInput(x, y);
      isDrawing = false;
      return;
    }
    saveUndo();
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    e.preventDefault();
  }

  function onMove(e) {
    if (!isDrawing) return;
    const {x, y} = getPos(e);
    updateStatus(x, y);

    if (currentTool === 'pencil' || currentTool === 'brush') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentTool === 'brush' ? brushSize * 3 : brushSize;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'eraser') {
      ctx.strokeStyle = bgColor;
      ctx.lineWidth = brushSize * 5;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      if (currentTool === 'rect') {
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      } else if (currentTool === 'ellipse') {
        const rx = Math.abs(x-startX)/2, ry = Math.abs(y-startY)/2;
        const cx2 = (x+startX)/2, cy2 = (y+startY)/2;
        ctx.ellipse(cx2, cy2, rx, ry, 0, 0, Math.PI*2);
        ctx.stroke();
      } else if (currentTool === 'line') {
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
    lastX = x; lastY = y;
    e.preventDefault();
  }

  function onUp(e) {
    if (!isDrawing) return;
    isDrawing = false;
    snapshot = null;
    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
      ctx.closePath();
    }
  }

  function placeTextInput(x, y) {
    if (textInput) textInput.remove();
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.style.cssText = `
      position:absolute;
      left:${rect.left + x*scaleX}px;
      top:${rect.top + y*scaleY}px;
      background:transparent;
      border:1px dashed #888;
      color:${currentColor};
      font-size:${Math.round(brushSize*4)}px;
      font-family:'Courier New',monospace;
      outline:none;
      min-width:80px;
      z-index:1000;
      padding:1px 3px;
    `;
    document.body.appendChild(textInput);
    textInput.focus();
    textInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') commitText(x, y, textInput.value);
      if (ev.key === 'Escape') { textInput.remove(); textInput = null; }
    });
    textInput.addEventListener('blur', () => {
      if (textInput) { commitText(x, y, textInput.value); }
    });
  }

  function commitText(x, y, text) {
    if (text.trim()) {
      saveUndo();
      ctx.fillStyle = currentColor;
      ctx.font = `${brushSize * 4}px 'Courier New', monospace`;
      ctx.fillText(text, x, y);
    }
    if (textInput) { textInput.remove(); textInput = null; }
  }

  function updateStatus(x, y) {
    const status = document.getElementById('paint-status');
    if (status) status.textContent =
      `Tool: ${currentTool.toUpperCase()}  |  Pos: ${Math.floor(x)},${Math.floor(y)}  |  Size: ${brushSize}px`;
  }

  function newCanvas() {
    if (!confirm('Clear canvas? This cannot be undone.')) return;
    undoStack.length = 0; redoStack.length = 0;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function saveAsPNG() {
    const link = document.createElement('a');
    link.download = 'paulie-paint.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function init() {
    canvas = document.getElementById('paint-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Events
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup',   onUp);
    canvas.addEventListener('mouseleave',onUp);
    canvas.addEventListener('touchstart', onDown, {passive:false});
    canvas.addEventListener('touchmove',  onMove, {passive:false});
    canvas.addEventListener('touchend',   onUp);

    // Tool buttons
    document.querySelectorAll('.paint-tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTool = btn.dataset.tool;
        document.querySelectorAll('.paint-tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Color palette
    const palette = document.getElementById('paint-palette');
    if (palette) {
      COLORS.forEach(c => {
        const sw = document.createElement('div');
        sw.className = 'paint-color';
        sw.style.background = c;
        sw.dataset.color = c;
        if (c === currentColor) sw.classList.add('selected');
        sw.addEventListener('click', (e) => {
          if (e.shiftKey) { bgColor = c; }
          else {
            currentColor = c;
            document.querySelectorAll('.paint-color').forEach(s => s.classList.remove('selected'));
            sw.classList.add('selected');
          }
        });
        palette.appendChild(sw);
      });
    }

    // Menu buttons
    const newBtn = document.getElementById('paint-new');
    if (newBtn) newBtn.addEventListener('click', newCanvas);
    const saveBtn = document.getElementById('paint-save');
    if (saveBtn) saveBtn.addEventListener('click', saveAsPNG);
    const undoBtn = document.getElementById('paint-undo');
    if (undoBtn) undoBtn.addEventListener('click', undo);
    const redoBtn = document.getElementById('paint-redo');
    if (redoBtn) redoBtn.addEventListener('click', redo);

    // Brush size slider
    const sizeSlider = document.getElementById('paint-size');
    if (sizeSlider) {
      sizeSlider.value = brushSize;
      sizeSlider.addEventListener('input', () => { brushSize = parseInt(sizeSlider.value); });
    }

    // Maximize toggle
    const maxBtn = document.getElementById('paint-maximize');
    if (maxBtn) {
      maxBtn.addEventListener('click', () => {
        const wrap = document.getElementById('paint-canvas-wrap');
        if (wrap) wrap.classList.toggle('maximized');
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
    });

    updateStatus(0, 0);
  }

  window.PaintApp = { init };
})();
