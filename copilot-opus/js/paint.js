/* ============================================================
   MS Paint 1998 Clone — Canvas drawing, tools, color palette
   ============================================================ */

const MsPaint = (() => {
  let currentTool = 'pencil';
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let foregroundColor = '#000000';
  let backgroundColor = '#ffffff';
  let isMaximized = false;

  const PALETTE_COLORS = [
    '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
    '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000', '#ff8040', '#00ff80',
    '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff',
    '#ffff80', '#00ff40', '#80ffff', '#8080ff', '#ff0080', '#ff8000', '#ffff40', '#80ff80',
  ];

  function initialize() {
    setupCanvas();
    setupTools();
    setupPalette();
    setupMenuActions();
    setupMaximize();
  }

  function setupCanvas() {
    const canvas = document.getElementById('paint-canvas');
    if (!canvas) return;
    const context = canvas.getContext('2d');

    // Fill with white
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    canvas.addEventListener('mousedown', (event) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      lastX = (event.clientX - rect.left) * scaleX;
      lastY = (event.clientY - rect.top) * scaleY;

      if (currentTool === 'fill') {
        floodFill(context, Math.floor(lastX), Math.floor(lastY), foregroundColor, canvas.width, canvas.height);
        isDrawing = false;
      }
    });

    canvas.addEventListener('mousemove', (event) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const currentX = (event.clientX - rect.left) * scaleX;
      const currentY = (event.clientY - rect.top) * scaleY;

      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(currentX, currentY);

      if (currentTool === 'eraser') {
        context.strokeStyle = backgroundColor;
        context.lineWidth = 10;
      } else if (currentTool === 'brush') {
        context.strokeStyle = foregroundColor;
        context.lineWidth = 4;
      } else {
        context.strokeStyle = foregroundColor;
        context.lineWidth = 1;
      }

      context.lineCap = 'round';
      context.stroke();
      lastX = currentX;
      lastY = currentY;
    });

    canvas.addEventListener('mouseup', () => { isDrawing = false; });
    canvas.addEventListener('mouseleave', () => { isDrawing = false; });
  }

  function setupTools() {
    const tools = document.querySelectorAll('.mspaint-tool');
    tools.forEach(tool => {
      tool.addEventListener('click', () => {
        tools.forEach(t => t.classList.remove('active'));
        tool.classList.add('active');
        currentTool = tool.dataset.tool;
      });
    });
  }

  function setupPalette() {
    const paletteContainer = document.getElementById('paint-palette');
    if (!paletteContainer) return;

    PALETTE_COLORS.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'mspaint-palette-color';
      swatch.style.background = color;
      swatch.setAttribute('role', 'option');
      swatch.setAttribute('aria-label', `Color ${color}`);
      swatch.tabIndex = 0;

      swatch.addEventListener('click', (event) => {
        if (event.button === 2 || event.ctrlKey) {
          backgroundColor = color;
          updateColorPreviews();
        } else {
          foregroundColor = color;
          updateColorPreviews();
        }
      });
      swatch.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        backgroundColor = color;
        updateColorPreviews();
      });
      paletteContainer.appendChild(swatch);
    });

    updateColorPreviews();
  }

  function updateColorPreviews() {
    const foregroundPreview = document.getElementById('paint-fg-preview');
    const backgroundPreview = document.getElementById('paint-bg-preview');
    if (foregroundPreview) foregroundPreview.style.background = foregroundColor;
    if (backgroundPreview) backgroundPreview.style.background = backgroundColor;
  }

  function setupMenuActions() {
    const fileNewButton = document.getElementById('paint-file-new');
    if (fileNewButton) {
      fileNewButton.addEventListener('click', () => {
        const canvas = document.getElementById('paint-canvas');
        if (!canvas) return;
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      });
    }
  }

  function setupMaximize() {
    const maximizeButton = document.getElementById('mspaint-maximize');
    const closeButton = document.getElementById('mspaint-close');
    const container = document.getElementById('mspaint');
    const wrapper = document.getElementById('mspaint-wrapper');

    if (maximizeButton && container) {
      maximizeButton.addEventListener('click', () => {
        isMaximized = !isMaximized;
        container.classList.toggle('maximized', isMaximized);

        // Hide/show other cards in main grid
        const mainGrid = container.closest('.main-grid');
        if (mainGrid) {
          Array.from(mainGrid.children).forEach(child => {
            if (child !== wrapper) {
              child.style.display = isMaximized ? 'none' : '';
            }
          });
        }

        if (isMaximized && wrapper) {
          wrapper.style.gridColumn = '1 / -1';
          wrapper.style.height = '100%';
        } else if (wrapper) {
          wrapper.style.gridColumn = '1 / -1';
          wrapper.style.height = '';
        }
      });
    }

    if (closeButton && container) {
      closeButton.addEventListener('click', () => {
        if (isMaximized) {
          isMaximized = false;
          container.classList.remove('maximized');
          const mainGrid = container.closest('.main-grid');
          if (mainGrid) {
            Array.from(mainGrid.children).forEach(child => {
              child.style.display = '';
            });
          }
        }
      });
    }
  }

  function floodFill(context, startX, startY, fillColorHex, width, height) {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    const targetColor = getPixelColor(data, startX, startY, width);

    // Parse fill color
    const fillRgb = hexToRgbArray(fillColorHex);
    if (targetColor[0] === fillRgb[0] && targetColor[1] === fillRgb[1] && targetColor[2] === fillRgb[2]) return;

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const currentColor = getPixelColor(data, x, y, width);
      if (currentColor[0] !== targetColor[0] || currentColor[1] !== targetColor[1] || currentColor[2] !== targetColor[2]) continue;

      visited.add(key);
      const index = (y * width + x) * 4;
      data[index] = fillRgb[0];
      data[index + 1] = fillRgb[1];
      data[index + 2] = fillRgb[2];
      data[index + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    context.putImageData(imageData, 0, 0);
  }

  function getPixelColor(data, x, y, width) {
    const index = (y * width + x) * 4;
    return [data[index], data[index + 1], data[index + 2]];
  }

  function hexToRgbArray(hex) {
    hex = hex.replace('#', '');
    return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
  }

  return { initialize };
})();
