/* ============================================================
   Paulie's Prediction Partners — Main Application Controller
   Initializes all modules, manages studio switching, API keys,
   throttle, agent dials, axis buttons, and P/L graph
   ============================================================ */

(function Application() {
  'use strict';

  // ---- Studio Switching ----
  function initializeStudioSwitching() {
    const studioButtons = document.querySelectorAll('.studio-button');
    const studioContents = document.querySelectorAll('.studio-content');

    studioButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetStudio = button.dataset.studio;

        // Update buttons
        studioButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-checked', 'true');

        // Update content
        studioContents.forEach(content => {
          content.classList.remove('active');
        });
        const target = document.getElementById(`studio-${targetStudio}`);
        if (target) target.classList.add('active');
      });
    });
  }

  // ---- API Key Connection ----
  function initializeApiKeyConnection() {
    const modeRadios = document.querySelectorAll('input[name="api-mode"]');
    const apiKeyInput = document.getElementById('api-key-input');
    const rsaKeyInput = document.getElementById('rsa-key-input');
    const connectButton = document.getElementById('connect-button');
    const apiKeyCard = document.getElementById('api-key-card');
    const connectionLight = document.getElementById('connection-light');
    const connectionStatus = document.getElementById('connection-status');

    let selectedMode = null;

    modeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        selectedMode = radio.value;
        if (apiKeyInput) apiKeyInput.disabled = false;
        if (rsaKeyInput) rsaKeyInput.disabled = false;
        validateApiInputs();
      });
    });

    function validateApiInputs() {
      if (!connectButton || !apiKeyInput || !rsaKeyInput) return;
      const hasApiKey = apiKeyInput.value.trim().length > 0;
      const hasRsaKey = rsaKeyInput.value.trim().length > 0;
      connectButton.disabled = !(selectedMode && hasApiKey && hasRsaKey);
    }

    if (apiKeyInput) apiKeyInput.addEventListener('input', validateApiInputs);
    if (rsaKeyInput) rsaKeyInput.addEventListener('input', validateApiInputs);

    if (connectButton) {
      connectButton.addEventListener('click', async () => {
        const apiKeyValue = apiKeyInput ? apiKeyInput.value.trim() : '';
        const rsaKeyValue = rsaKeyInput ? rsaKeyInput.value.trim() : '';

        if (!selectedMode || !apiKeyValue || !rsaKeyValue) return;

        connectButton.disabled = true;
        connectButton.textContent = 'Connecting…';

        let backendReachable = false;

        try {
          const response = await fetch('http://127.0.0.1:8000/api/connection/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              environment: selectedMode,
              api_key_id: apiKeyValue,
              private_key_pem: rsaKeyValue,
            }),
          });

          if (response.ok) {
            backendReachable = true;
          }
        } catch (networkError) {
          /* Backend not running — proceed in offline/demo mode */
          console.warn('Backend not reachable, proceeding in offline mode:', networkError.message);
        }

        /* Clear credentials from DOM immediately */
        if (apiKeyInput) apiKeyInput.value = '';
        if (rsaKeyInput) rsaKeyInput.value = '';

        /* Update UI to show connected state */
        if (apiKeyCard) {
          const inputs = apiKeyCard.querySelectorAll('.api-input, .connect-button, .api-mode-selector');
          inputs.forEach(input => input.style.display = 'none');

          const cardInner = apiKeyCard.querySelector('.card-inner');
          if (cardInner) {
            const connectedMessage = document.createElement('div');
            connectedMessage.style.cssText = 'font-size:11px;font-weight:700;color:var(--color-state-success);text-align:center;padding:8px;';
            const statusLabel = backendReachable ? 'Connected' : 'Offline Mode';
            connectedMessage.textContent = `✓ ${statusLabel} (${selectedMode.toUpperCase()})`;
            cardInner.appendChild(connectedMessage);
          }
        }

        if (connectionLight) {
          connectionLight.className = `indicator-light ${selectedMode}`;
        }
        if (connectionStatus) {
          connectionStatus.textContent = selectedMode === 'live' ? 'LIVE' : 'DEMO';
        }

        /* Notify Trading Studio of connection */
        TradingStudio.onConnected(selectedMode);

        /* Auto-navigate to Trading Studio */
        const tradeButton = document.querySelector('.studio-button[data-studio="trade"]');
        if (tradeButton) tradeButton.click();
      });
    }
  }

  // ---- Throttle Control ----
  function initializeThrottle() {
    const track = document.getElementById('throttle-track');
    const handle = document.getElementById('throttle-handle');
    if (!track || !handle) return;

    const positions = [
      { top: 'calc(100% - 18px)', value: 0, label: 'Full-Stop' },   // Bottom
      { top: 'calc(50% - 8px)', value: 1, label: 'Semi-Auto' },     // Middle
      { top: '2px', value: 2, label: 'Full-Auto' },                   // Top
    ];
    let currentPosition = 0;

    track.addEventListener('click', () => {
      currentPosition = (currentPosition + 1) % positions.length;
      const position = positions[currentPosition];
      handle.style.top = position.top;
      track.setAttribute('aria-valuenow', position.value);
      track.setAttribute('aria-valuetext', position.label);
    });

    track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
        event.preventDefault();
        currentPosition = Math.min(currentPosition + 1, positions.length - 1);
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
        event.preventDefault();
        currentPosition = Math.max(currentPosition - 1, 0);
      } else return;

      const position = positions[currentPosition];
      handle.style.top = position.top;
      track.setAttribute('aria-valuenow', position.value);
      track.setAttribute('aria-valuetext', position.label);
    });
  }

  // ---- Agent Dial Controls ----
  function initializeAgentDials() {
    const agentCards = document.querySelectorAll('.agent-card:not(.inactive)');
    agentCards.forEach(card => {
      const dialOptions = card.querySelectorAll('.agent-dial-option');
      dialOptions.forEach(option => {
        option.addEventListener('click', () => {
          dialOptions.forEach(o => o.classList.remove('active'));
          option.classList.add('active');
        });
      });
    });
  }

  // ---- Axis Buttons ----
  function initializeAxisButtons() {
    const axisButtons = document.querySelectorAll('.axis-button');
    axisButtons.forEach(button => {
      button.addEventListener('click', () => {
        const axis = button.dataset.axis;
        // Deactivate other buttons in same axis group
        axisButtons.forEach(b => {
          if (b.dataset.axis === axis) b.classList.remove('active');
        });
        button.classList.add('active');
      });
    });
  }

  // ---- P/L Graph (Live Rendering) ----
  function initializePlGraph() {
    const canvas = document.getElementById('pl-graph');
    if (!canvas) return;
    const context = canvas.getContext('2d');
    const profitLossHistory = [];
    const MAX_DATA_POINTS = 120;
    let pollingIntervalId = null;

    function getThemeColors() {
      const computedStyle = getComputedStyle(document.body);
      return {
        foreground: computedStyle.getPropertyValue('--color-fg-default').trim() || '#1f2937',
        success: computedStyle.getPropertyValue('--color-state-success').trim() || '#22c55e',
        danger: computedStyle.getPropertyValue('--color-state-danger').trim() || '#ef4444',
        muted: computedStyle.getPropertyValue('--color-fg-muted').trim() || '#6b7280',
        surface: computedStyle.getPropertyValue('--color-bg-surface').trim() || '#f9fafb',
        border: computedStyle.getPropertyValue('--color-border-muted').trim() || '#e5e7eb',
      };
    }

    function drawChart() {
      const width = canvas.width;
      const height = canvas.height;
      const colors = getThemeColors();
      context.clearRect(0, 0, width, height);

      if (profitLossHistory.length < 2) {
        context.fillStyle = colors.foreground;
        context.globalAlpha = 0.3;
        context.font = '12px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Waiting for P/L data…', width / 2, height / 2);
        context.globalAlpha = 1.0;
        return;
      }

      const padding = { top: 12, right: 8, bottom: 16, left: 40 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      const values = profitLossHistory.map(point => point.value);
      const minValue = Math.min(0, ...values);
      const maxValue = Math.max(0, ...values);
      const range = maxValue - minValue || 1;

      function xPosition(index) {
        return padding.left + (index / (profitLossHistory.length - 1)) * chartWidth;
      }

      function yPosition(value) {
        return padding.top + chartHeight - ((value - minValue) / range) * chartHeight;
      }

      /* Zero line */
      const zeroY = yPosition(0);
      context.beginPath();
      context.strokeStyle = colors.border;
      context.lineWidth = 1;
      context.setLineDash([4, 4]);
      context.moveTo(padding.left, zeroY);
      context.lineTo(width - padding.right, zeroY);
      context.stroke();
      context.setLineDash([]);

      /* P/L line */
      context.beginPath();
      context.lineWidth = 2;
      context.lineJoin = 'round';
      context.lineCap = 'round';

      profitLossHistory.forEach((point, index) => {
        const pointX = xPosition(index);
        const pointY = yPosition(point.value);
        if (index === 0) {
          context.moveTo(pointX, pointY);
        } else {
          context.lineTo(pointX, pointY);
        }
      });

      const latestValue = values[values.length - 1];
      context.strokeStyle = latestValue >= 0 ? colors.success : colors.danger;
      context.stroke();

      /* Gradient fill */
      const gradient = context.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
      if (latestValue >= 0) {
        gradient.addColorStop(0, colors.success + '40');
        gradient.addColorStop(1, colors.success + '05');
      } else {
        gradient.addColorStop(0, colors.danger + '05');
        gradient.addColorStop(1, colors.danger + '40');
      }

      context.lineTo(xPosition(profitLossHistory.length - 1), zeroY);
      context.lineTo(xPosition(0), zeroY);
      context.closePath();
      context.fillStyle = gradient;
      context.fill();

      /* Y-axis labels */
      context.fillStyle = colors.muted;
      context.font = '9px sans-serif';
      context.textAlign = 'right';
      context.textBaseline = 'middle';
      context.fillText('$' + maxValue.toFixed(2), padding.left - 4, padding.top);
      context.fillText('$' + minValue.toFixed(2), padding.left - 4, padding.top + chartHeight);
      context.fillText('$0', padding.left - 4, zeroY);

      /* Current value label */
      context.fillStyle = latestValue >= 0 ? colors.success : colors.danger;
      context.font = 'bold 10px sans-serif';
      context.textAlign = 'right';
      context.textBaseline = 'top';
      const sign = latestValue >= 0 ? '+' : '';
      context.fillText(`${sign}$${latestValue.toFixed(2)}`, width - padding.right, 2);
    }

    async function fetchProfitLossData() {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/trading/status');
        if (!response.ok) return;
        const data = await response.json();
        const dailyPnl = parseFloat(data.daily_pnl) || 0;
        profitLossHistory.push({ time: Date.now(), value: dailyPnl });
        if (profitLossHistory.length > MAX_DATA_POINTS) {
          profitLossHistory.shift();
        }
        drawChart();
      } catch (error) {
        /* Backend not available — keep showing current data */
      }
    }

    drawChart();

    /* Clear any previous interval (safety guard against re-initialization) */
    const previousIntervalId = canvas.dataset.pollingIntervalId;
    if (previousIntervalId) {
      clearInterval(parseInt(previousIntervalId, 10));
    }
    pollingIntervalId = setInterval(fetchProfitLossData, 5000);
    canvas.dataset.pollingIntervalId = String(pollingIntervalId);

    /* Redraw on theme change */
    const observer = new MutationObserver(drawChart);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'data-mode'] });
  }

  // ---- Agent Graphs (Empty State) ----
  function initializeAgentGraphs() {
    const agentGraphs = document.querySelectorAll('.agent-graph');
    agentGraphs.forEach(canvas => {
      const context = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      context.clearRect(0, 0, width, height);

      context.fillStyle = '#888';
      context.globalAlpha = 0.3;
      context.font = '8px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('No data', width / 2, height / 2);
      context.globalAlpha = 1.0;
    });
  }

  // ---- Send-an-Idea ----
  function initializeSendIdea() {
    const button = document.getElementById('send-idea-button');
    if (button) {
      button.addEventListener('click', () => {
        const subject = encodeURIComponent("Paulie's Prediction Partners - Idea");
        const body = encodeURIComponent('Here is my idea:\n\n');
        window.location.href = `mailto:chickensaurusrex@outlook.com?subject=${subject}&body=${body}`;
      });
    }
  }

  // ---- Initialize Everything ----
  function boot() {
    ThemeEngine.initialize();
    Illumination.initialize();
    Telemetry.initialize();
    Gauges.initialize();
    LiveLogs.initialize();
    MsPaint.initialize();
    TodoApp.initialize();
    Rulers.initialize();
    TradingStudio.initialize();

    initializeStudioSwitching();
    initializeApiKeyConnection();
    initializeThrottle();
    initializeAgentDials();
    initializeAxisButtons();
    initializePlGraph();
    initializeAgentGraphs();
    initializeSendIdea();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
