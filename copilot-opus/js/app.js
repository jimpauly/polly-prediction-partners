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
      connectButton.addEventListener('click', () => {
        // Simulate successful connection (stub behavior)
        if (apiKeyCard) {
          // Hide input elements
          const inputs = apiKeyCard.querySelectorAll('.api-input, .connect-button, .api-mode-selector');
          inputs.forEach(input => input.style.display = 'none');

          // Show connected status
          const cardInner = apiKeyCard.querySelector('.card-inner');
          if (cardInner) {
            const connectedMessage = document.createElement('div');
            connectedMessage.style.cssText = 'font-size:11px;font-weight:700;color:var(--color-state-success);text-align:center;padding:8px;';
            connectedMessage.textContent = `✓ Connected (${selectedMode.toUpperCase()})`;
            cardInner.appendChild(connectedMessage);
          }
        }

        // Update indicator
        if (connectionLight) {
          connectionLight.className = `indicator-light ${selectedMode}`;
        }
        if (connectionStatus) {
          connectionStatus.textContent = selectedMode === 'live' ? 'LIVE' : 'DEMO';
        }

        // Clear keys from memory
        if (apiKeyInput) apiKeyInput.value = '';
        if (rsaKeyInput) rsaKeyInput.value = '';

        // Notify Trading Studio of connection
        TradingStudio.onConnected(selectedMode);

        // Auto-navigate to Trading Studio
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

  // ---- P/L Graph (No Data State) ----
  function initializePlGraph() {
    const canvas = document.getElementById('pl-graph');
    if (!canvas) return;
    const context = canvas.getContext('2d');

    function drawNoData() {
      const width = canvas.width;
      const height = canvas.height;
      context.clearRect(0, 0, width, height);

      const computedStyle = getComputedStyle(document.body);
      const foregroundColor = computedStyle.getPropertyValue('--color-fg-default').trim() || '#1f2937';

      context.fillStyle = foregroundColor;
      context.globalAlpha = 0.3;
      context.font = '12px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('No data', width / 2, height / 2);
      context.globalAlpha = 1.0;
    }

    drawNoData();

    // Redraw on theme change
    const observer = new MutationObserver(drawNoData);
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
