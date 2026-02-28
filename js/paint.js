/**
 * paint.js — MS Paint 1998 Clone
 * Tools: pencil, brush, eraser, fill, color picker, rectangle, circle, line, text
 * Palette: 16 classic MS Paint colors
 * Features: zoom, image upload
 */

const paintApp = (() => {
  // Classic MS Paint 28-color palette (two rows of 14)
  const CLASSIC_PALETTE = [
    '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
    '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff',
    '#804000', '#ff8040', '#ff8080', '#ffff80', '#80ff80', '#80ffff', '#8080ff', '#ff80ff',
    '#400080', '#004040', '#0080ff', '#004080'
  ];

  const TOOLS = ['pencil', 'brush', 'eraser', 'fill', 'eyedropper', 'text', 'rectangle', 'ellipse', 'line'];
  const TOOL_ICONS = {
    pencil: '✏',
    brush: '🖌',
    eraser: '⬜',
    fill: '🪣',
    eyedropper: '💉',
    text: 'A',
    rectangle: '▭',
    ellipse: '○',
    line: '/',
  };

  let canvas, ctx;
  let activeTool = 'pencil';
  let primaryColor = '#000000';
  let secondaryColor = '#ffffff';
  let brushSize = 2;
  let isDrawing = false;
  let startX = 0, startY = 0;
  let zoom = 1.0;
  let textInput = null;

  // For shape preview (rectangle, ellipse, line)
  let imageSnapshot = null;

  function init() {
    const container = document.getElementById('mspaint-container');
    if (!container) return;
    renderApp(container);
  }

  function renderApp(container) {
    container.innerHTML = `
      <div id="paint-app" style="
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #c0c0c0;
        font-family: 'MS Sans Serif', 'Segoe UI', Arial, sans-serif;
        font-size: 11px;
        color: #000;
        border: 2px inset #c0c0c0;
        overflow: hidden;
        min-height: 0;
      ">
        <!-- Title Bar -->
        <div style="
          background: linear-gradient(to right, #000080, #1084d0);
          color: white;
          padding: 2px 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          font-weight: bold;
          flex-shrink: 0;
          height: 18px;
        ">
          <span>🖼 Paint</span>
          <div style="display:flex; gap:2px;">
            <button onclick="paintApp.minimize()" style="width:14px;height:12px;font-size:9px;background:#c0c0c0;color:#000;border:1px outset #c0c0c0;cursor:pointer;padding:0;line-height:1;">_</button>
            <button onclick="paintApp.maximize()" style="width:14px;height:12px;font-size:9px;background:#c0c0c0;color:#000;border:1px outset #c0c0c0;cursor:pointer;padding:0;line-height:1;">□</button>
            <button onclick="paintApp.closeApp()" style="width:14px;height:12px;font-size:9px;background:#c0c0c0;color:#000;border:1px outset #c0c0c0;cursor:pointer;padding:0;line-height:1;font-weight:bold;">✕</button>
          </div>
        </div>
        
        <!-- Menu Bar -->
        <div style="
          background: #c0c0c0;
          display: flex;
          gap: 0;
          padding: 1px 2px;
          border-bottom: 1px solid #808080;
          flex-shrink: 0;
          height: 18px;
          align-items: center;
        " id="paint-menubar">
          <div class="paint-menu-item" onclick="paintApp.showMenu('file')" style="padding:1px 6px; cursor:pointer;">File</div>
          <div class="paint-menu-item" onclick="paintApp.showMenu('edit')" style="padding:1px 6px; cursor:pointer;">Edit</div>
          <div class="paint-menu-item" onclick="paintApp.showMenu('view')" style="padding:1px 6px; cursor:pointer;">View</div>
          <div class="paint-menu-item" onclick="paintApp.showMenu('image')" style="padding:1px 6px; cursor:pointer;">Image</div>
          <div class="paint-menu-item" style="padding:1px 6px; cursor:pointer;">Help</div>
        </div>
        
        <!-- Main Area (toolbox + canvas) -->
        <div style="display:flex; flex:1; min-height:0; overflow:hidden;">
          
          <!-- Toolbox (left panel) -->
          <div id="paint-toolbox" style="
            width: 54px;
            background: #c0c0c0;
            border-right: 2px inset #c0c0c0;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 4px 2px;
            gap: 0;
            flex-shrink: 0;
            overflow-y: auto;
          ">
            <!-- Tool grid: 2 columns -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:2px; width:100%;" id="tool-grid"></div>
            
            <!-- Separator -->
            <div style="width:100%; height:1px; background:#808080; margin:6px 0;"></div>
            
            <!-- Brush size selector -->
            <div style="display:flex; flex-direction:column; align-items:center; gap:3px;" id="brush-sizes">
              ${[1, 2, 4, 6].map(s => `
                <div onclick="paintApp.setBrushSize(${s})" 
                     data-brush-size="${s}"
                     style="width:${Math.max(s * 2, 4)}px; height:${Math.max(s * 2, 4)}px; background:#000; border-radius:50%; cursor:pointer; margin:1px auto;"></div>
              `).join('')}
            </div>
            
            <!-- Upload button -->
            <div style="margin-top:6px; width:100%;">
              <input type="file" id="paint-file-input" accept="image/*" style="display:none;" onchange="paintApp.handleImageUpload(event)">
              <button onclick="document.getElementById('paint-file-input').click()" 
                      style="width:100%; font-size:9px; padding:2px; background:#c0c0c0; border:1px outset #c0c0c0; cursor:pointer; color:#000;">
                📁 Open
              </button>
            </div>
            
            <!-- Zoom controls -->
            <div style="margin-top:4px; width:100%; text-align:center;">
              <div style="font-size:9px; margin-bottom:2px;">Zoom</div>
              <div style="display:flex; gap:2px; justify-content:center;">
                <button onclick="paintApp.zoomOut()" style="font-size:9px; padding:1px 4px; background:#c0c0c0; border:1px outset #c0c0c0; cursor:pointer;">-</button>
                <span id="zoom-display" style="font-size:9px; min-width:28px; text-align:center;">100%</span>
                <button onclick="paintApp.zoomIn()" style="font-size:9px; padding:1px 4px; background:#c0c0c0; border:1px outset #c0c0c0; cursor:pointer;">+</button>
              </div>
            </div>
          </div>
          
          <!-- Canvas Area -->
          <div style="flex:1; overflow:auto; background:#808080; display:flex; align-items:flex-start; justify-content:flex-start; padding:4px;" id="paint-canvas-wrapper">
            <canvas id="paint-canvas" width="640" height="400" style="
              cursor: crosshair;
              display: block;
              background: white;
              border: 1px inset #c0c0c0;
              image-rendering: pixelated;
            "></canvas>
          </div>
        </div>
        
        <!-- Color Palette (bottom) -->
        <div style="
          background: #c0c0c0;
          border-top: 2px inset #c0c0c0;
          padding: 3px 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          height: 36px;
        ">
          <!-- Active colors display -->
          <div style="position:relative; width:28px; height:28px; margin-right:4px; flex-shrink:0;">
            <!-- Secondary (background) -->
            <div id="paint-secondary-color" style="
              position:absolute; bottom:0; right:0;
              width:18px; height:18px;
              background:${secondaryColor};
              border: 1px inset #c0c0c0;
              cursor:pointer;
            " onclick="paintApp.swapColors()" title="Secondary (right-click) color"></div>
            <!-- Primary (foreground) -->
            <div id="paint-primary-color" style="
              position:absolute; top:0; left:0;
              width:18px; height:18px;
              background:${primaryColor};
              border: 1px outset #c0c0c0;
              cursor:pointer;
              z-index:1;
            " title="Primary (left-click) color"></div>
          </div>
          
          <!-- Color cells grid -->
          <div style="display:grid; grid-template-columns:repeat(14, 16px); gap:1px;" id="palette-grid"></div>
          
          <!-- Status bar info -->
          <div style="margin-left:auto; font-size:9px; color:#444; white-space:nowrap;" id="paint-status">
            Tool: Pencil | Pos: 0, 0
          </div>
        </div>
      </div>

      <style>
        #paint-app { user-select: none; }
        .paint-menu-item:hover { background: #000080; color: white; }
        .paint-tool-btn {
          width: 24px; height: 24px;
          background: #c0c0c0;
          border: 1px outset #c0c0c0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          transition: none;
          color: #000;
        }
        .paint-tool-btn:hover { background: #d4d0c8; }
        .paint-tool-btn.active {
          border: 1px inset #c0c0c0;
          background: #a0a0a0;
        }
        .paint-color-cell {
          width: 16px;
          height: 16px;
          cursor: pointer;
          border: 1px outset #c0c0c0;
          box-sizing: border-box;
        }
        .paint-color-cell:hover { border: 1px solid #fff; }
        #paint-canvas-wrapper::-webkit-scrollbar { width: 14px; height: 14px; }
        #paint-canvas-wrapper::-webkit-scrollbar-track { background: #c0c0c0; }
        #paint-canvas-wrapper::-webkit-scrollbar-thumb { background: #808080; border: 2px outset #c0c0c0; }
        [data-brush-size].active-brush { outline: 2px solid #000080; }
      </style>
    `;

    // Build tool buttons
    const toolGrid = document.getElementById('tool-grid');
    TOOLS.forEach(tool => {
      const btn = document.createElement('button');
      btn.className = `paint-tool-btn ${tool === activeTool ? 'active' : ''}`;
      btn.dataset.paintTool = tool;
      btn.title = tool.charAt(0).toUpperCase() + tool.slice(1);
      btn.textContent = TOOL_ICONS[tool];
      btn.addEventListener('click', () => paintApp.setTool(tool));
      toolGrid.appendChild(btn);
    });

    // Build palette
    const paletteGrid = document.getElementById('palette-grid');
    CLASSIC_PALETTE.forEach(color => {
      const cell = document.createElement('div');
      cell.className = 'paint-color-cell';
      cell.style.background = color;
      cell.title = color;
      cell.addEventListener('click', () => paintApp.setPrimaryColor(color));
      cell.addEventListener('contextmenu', e => { e.preventDefault(); paintApp.setSecondaryColor(color); });
      paletteGrid.appendChild(cell);
    });

    // Init canvas
    canvas = document.getElementById('paint-canvas');
    ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Canvas events
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('mousemove', updateStatusBar);

    highlightActiveBrush();
  }

  function highlightActiveBrush() {
    document.querySelectorAll('[data-brush-size]').forEach(el => {
      el.classList.toggle('active-brush', parseInt(el.dataset.brushSize) === brushSize);
    });
  }

  function setTool(tool) {
    activeTool = tool;
    document.querySelectorAll('.paint-tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.paintTool === tool);
    });
    if (canvas) canvas.style.cursor = tool === 'text' ? 'text' : tool === 'eyedropper' ? 'crosshair' : 'crosshair';
    updateStatus();
  }

  function setPrimaryColor(color) {
    primaryColor = color;
    const el = document.getElementById('paint-primary-color');
    if (el) el.style.background = color;
  }

  function setSecondaryColor(color) {
    secondaryColor = color;
    const el = document.getElementById('paint-secondary-color');
    if (el) el.style.background = color;
  }

  function swapColors() {
    [primaryColor, secondaryColor] = [secondaryColor, primaryColor];
    const primary = document.getElementById('paint-primary-color');
    const secondary = document.getElementById('paint-secondary-color');
    if (primary) primary.style.background = primaryColor;
    if (secondary) secondary.style.background = secondaryColor;
  }

  function setBrushSize(size) {
    brushSize = size;
    highlightActiveBrush();
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - rect.left) / zoom),
      y: Math.round((e.clientY - rect.top) / zoom)
    };
  }

  function getColor(e) {
    return e.button === 2 ? secondaryColor : primaryColor;
  }

  function onMouseDown(e) {
    e.preventDefault();
    const { x, y } = getPos(e);
    const color = getColor(e);
    isDrawing = true;
    startX = x;
    startY = y;

    if (activeTool === 'pencil' || activeTool === 'brush') {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = activeTool === 'brush' ? brushSize * 2 : brushSize;
      ctx.moveTo(x, y);
      ctx.lineTo(x + 0.1, y);
      ctx.stroke();
    } else if (activeTool === 'eraser') {
      ctx.beginPath();
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = brushSize * 4;
      ctx.moveTo(x, y);
      ctx.lineTo(x + 0.1, y);
      ctx.stroke();
    } else if (activeTool === 'fill') {
      floodFill(x, y, color);
      isDrawing = false;
    } else if (activeTool === 'eyedropper') {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      if (e.button === 2) setSecondaryColor(hex);
      else setPrimaryColor(hex);
      isDrawing = false;
    } else if (activeTool === 'text') {
      placeTextInput(x, y, color);
      isDrawing = false;
    } else if (['rectangle', 'ellipse', 'line'].includes(activeTool)) {
      // Save snapshot for preview
      imageSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  }

  function onMouseMove(e) {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const color = getColor(e);

    if (activeTool === 'pencil') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (activeTool === 'brush') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * 2;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (activeTool === 'eraser') {
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = brushSize * 4;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (activeTool === 'rectangle' && imageSnapshot) {
      ctx.putImageData(imageSnapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(startX, startY, x - startX, y - startY);
      if (e.shiftKey) { // Fill
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(startX, startY, x - startX, y - startY);
      }
    } else if (activeTool === 'ellipse' && imageSnapshot) {
      ctx.putImageData(imageSnapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      const rx = Math.abs(x - startX) / 2;
      const ry = Math.abs(y - startY) / 2;
      const cx = startX + (x - startX) / 2;
      const cy = startY + (y - startY) / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (activeTool === 'line' && imageSnapshot) {
      ctx.putImageData(imageSnapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  function onMouseUp(e) {
    if (!isDrawing) return;
    isDrawing = false;
    const { x, y } = getPos(e);
    const color = getColor(e);

    if (activeTool === 'rectangle' && imageSnapshot) {
      ctx.putImageData(imageSnapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(startX, startY, x - startX, y - startY);
      imageSnapshot = null;
    } else if (activeTool === 'ellipse' && imageSnapshot) {
      ctx.putImageData(imageSnapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      const rx = Math.abs(x - startX) / 2;
      const ry = Math.abs(y - startY) / 2;
      const cx = startX + (x - startX) / 2;
      const cy = startY + (y - startY) / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      imageSnapshot = null;
    } else if (activeTool === 'line' && imageSnapshot) {
      ctx.putImageData(imageSnapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
      imageSnapshot = null;
    }

    ctx.beginPath(); // Reset path
  }

  function onMouseLeave() {
    if (isDrawing) {
      isDrawing = false;
      ctx.beginPath();
    }
  }

  // Flood fill algorithm
  function floodFill(startX, startY, fillColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const targetColor = getPixelColor(data, startX, startY, canvas.width);
    const fillRGB = hexToRgb(fillColor);

    if (colorsMatch(targetColor, fillRGB)) return;

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      const key = y * canvas.width + x;
      if (visited.has(key)) continue;
      visited.add(key);

      const current = getPixelColor(data, x, y, canvas.width);
      if (!colorsMatch(current, targetColor)) continue;

      setPixelColor(data, x, y, canvas.width, fillRGB);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function getPixelColor(data, x, y, width) {
    const idx = (y * width + x) * 4;
    return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
  }

  function setPixelColor(data, x, y, width, rgb) {
    const idx = (y * width + x) * 4;
    data[idx] = rgb[0]; data[idx + 1] = rgb[1]; data[idx + 2] = rgb[2]; data[idx + 3] = 255;
  }

  function colorsMatch(a, b, tolerance = 30) {
    return Math.abs(a[0] - b[0]) <= tolerance &&
           Math.abs(a[1] - b[1]) <= tolerance &&
           Math.abs(a[2] - b[2]) <= tolerance;
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  // Text tool: place an input overlay on canvas
  function placeTextInput(x, y, color) {
    if (textInput) { commitText(); }
    const rect = canvas.getBoundingClientRect();
    const wrapper = document.getElementById('paint-canvas-wrapper');
    textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.style.cssText = `
      position: absolute;
      left: ${x * zoom + rect.left - wrapper.getBoundingClientRect().left}px;
      top: ${y * zoom + rect.top - wrapper.getBoundingClientRect().top}px;
      font-size: ${14 * zoom}px;
      font-family: Arial, sans-serif;
      color: ${color};
      background: transparent;
      border: 1px dashed #888;
      outline: none;
      min-width: 60px;
      z-index: 100;
    `;
    textInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === 'Escape') commitText();
    });
    textInput.addEventListener('blur', commitText);
    wrapper.style.position = 'relative';
    wrapper.appendChild(textInput);
    textInput.focus();
    textInput._x = x;
    textInput._y = y;
    textInput._color = color;
  }

  function commitText() {
    if (!textInput) return;
    const text = textInput.value;
    if (text) {
      ctx.font = `14px Arial`;
      ctx.fillStyle = textInput._color;
      ctx.fillText(text, textInput._x, textInput._y);
    }
    if (textInput.parentNode) textInput.parentNode.removeChild(textInput);
    textInput = null;
  }

  function updateStatusBar(e) {
    const { x, y } = getPos(e);
    const statusEl = document.getElementById('paint-status');
    if (statusEl) statusEl.textContent = `Tool: ${activeTool} | Pos: ${x}, ${y} | ${Math.round(zoom * 100)}%`;
  }

  function updateStatus() {
    const statusEl = document.getElementById('paint-status');
    if (statusEl) statusEl.textContent = `Tool: ${activeTool} | ${Math.round(zoom * 100)}%`;
  }

  // Zoom
  function zoomIn() {
    zoom = Math.min(zoom * 1.5, 8);
    applyZoom();
  }

  function zoomOut() {
    zoom = Math.max(zoom / 1.5, 0.25);
    applyZoom();
  }

  function applyZoom() {
    if (canvas) {
      canvas.style.width = `${canvas.width * zoom}px`;
      canvas.style.height = `${canvas.height * zoom}px`;
    }
    const zoomEl = document.getElementById('zoom-display');
    if (zoomEl) zoomEl.textContent = `${Math.round(zoom * 100)}%`;
  }

  // Image upload (like MS Paint open file)
  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-uploaded
    event.target.value = '';
  }

  // Menu actions
  function showMenu(menuName) {
    // Create a simple dropdown menu
    const existingMenu = document.getElementById('paint-dropdown-menu');
    if (existingMenu) existingMenu.remove();

    const menuItems = {
      file: [
        { label: 'New', action: () => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); } },
        { label: 'Open...', action: () => document.getElementById('paint-file-input')?.click() },
        { label: '──────', action: null },
        { label: 'Exit', action: () => { const el = document.getElementById('paint-app'); if (el) el.style.display = 'none'; } }
      ],
      edit: [
        { label: 'Clear Image', action: () => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); } },
        { label: 'Invert Colors', action: invertColors }
      ],
      view: [
        { label: 'Zoom In', action: zoomIn },
        { label: 'Zoom Out', action: zoomOut },
        { label: 'Actual Size', action: () => { zoom = 1; applyZoom(); } }
      ],
      image: [
        { label: 'Flip Horizontal', action: flipHorizontal },
        { label: 'Flip Vertical', action: flipVertical }
      ]
    };

    const items = menuItems[menuName] || [];
    const menuEl = document.createElement('div');
    menuEl.id = 'paint-dropdown-menu';
    menuEl.style.cssText = `
      position: fixed; z-index: 9999;
      background: #c0c0c0;
      border: 2px outset #c0c0c0;
      font-size: 11px;
      min-width: 120px;
      box-shadow: 2px 2px 0 #000;
    `;

    items.forEach(item => {
      const el = document.createElement('div');
      el.style.cssText = 'padding: 3px 16px; cursor: pointer; color: #000;';
      el.textContent = item.label;
      if (item.action) {
        el.onmouseenter = () => el.style.background = '#000080', el.style.color = '#fff';
        el.onmouseleave = () => el.style.background = '', el.style.color = '#000';
        el.onclick = () => { item.action(); menuEl.remove(); };
      }
      menuEl.appendChild(el);
    });

    // Position near menu bar
    const menuBarItem = document.querySelector(`[onclick*="${menuName}"]`);
    if (menuBarItem) {
      const rect = menuBarItem.getBoundingClientRect();
      menuEl.style.left = `${rect.left}px`;
      menuEl.style.top = `${rect.bottom}px`;
    }

    document.body.appendChild(menuEl);
    setTimeout(() => document.addEventListener('click', () => menuEl.remove(), { once: true }), 0);
  }

  function invertColors() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function flipHorizontal() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.translate(canvas.width, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  function flipVertical() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.translate(0, canvas.height);
    tempCtx.scale(1, -1);
    tempCtx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  function minimize() { const el = document.getElementById('mspaint-container'); if (el) el.style.height = '20px'; }
  function maximize() { const el = document.getElementById('mspaint-container'); if (el) el.style.height = ''; }
  function closeApp() { const el = document.getElementById('paint-app'); if (el) el.style.display = 'none'; }

  return {
    init, setTool, setPrimaryColor, setSecondaryColor, swapColors,
    setBrushSize, zoomIn, zoomOut, handleImageUpload, showMenu,
    minimize, maximize, closeApp
  };
})();
