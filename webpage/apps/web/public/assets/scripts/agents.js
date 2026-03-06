/* ============================================================
   Paulie's Prediction Partners — Agent Dashboard Module
   Handles agent mode controls, per-agent stats, and the
   multi-line P&L comparison chart in the Ignition bar.
   ============================================================ */

const AgentDashboard = (() => {
  'use strict';

  const BACKEND_URL = 'http://127.0.0.1:8000';
  const POLL_INTERVAL_MS = 8000;

  /* Agent configuration (icons and colours match PRD) */
  const AGENT_CONFIG = {
    peritia: {
      displayName: 'PERITIA',
      icon: '🎯',
      description: 'BTC 15-min Candlestick',
      chartColor: '#22c55e',    /* green */
      defaultMode: 'semi-auto',
    },
    prime: {
      displayName: 'PRIME',
      icon: '📊',
      description: 'Majority Signal',
      chartColor: '#3b82f6',    /* blue */
      defaultMode: 'semi-auto',
    },
    praxis: {
      displayName: 'PRAXIS',
      icon: '🧠',
      description: 'Sports Markets',
      chartColor: '#a855f7',    /* purple */
      defaultMode: 'safe',
    },
  };

  let pollIntervalId = null;
  let isConnected = false;

  /* PnL history per agent keyed by agent name (arrays of {time, pnl}) */
  const pnlHistory = {
    peritia: [],
    prime: [],
    praxis: [],
  };

  /* ---- Public API ---- */

  function initialize() {
    renderAgentCards();
    bindAgentModeButtons();
  }

  function onConnected() {
    isConnected = true;
    startPolling();
  }

  function onDisconnected() {
    isConnected = false;
    stopPolling();
    resetAgentDisplays();
  }

  /* ---- Render Agent Cards ---- */

  function renderAgentCards() {
    const container = document.getElementById('agent-cards-container');
    if (!container) return;

    container.innerHTML = '';
    Object.entries(AGENT_CONFIG).forEach(([agentName, config]) => {
      const card = document.createElement('div');
      card.className = 'agent-card';
      card.id = `agent-card-${agentName}`;
      card.dataset.agent = agentName;

      card.innerHTML = `
        <span class="agent-card__avatar">${config.icon}</span>
        <span class="agent-card__name">${config.displayName}</span>
        <span class="agent-card__role">${config.description}</span>
        <div class="agent-card__status-dot" id="agent-dot-${agentName}" title="Status: Offline"></div>
        <div class="agent-card__stats" id="agent-stats-${agentName}">
          <span class="agent-card__wr" id="agent-wr-${agentName}">—%</span>
          <span class="agent-card__pnl" id="agent-pnl-${agentName}">$—</span>
        </div>
        <div class="agent-mode-buttons" id="agent-modes-${agentName}">
          <button
            class="agent-mode-btn"
            data-agent="${agentName}"
            data-mode="auto"
            title="Full Auto — agent trades without approval"
            aria-label="Set ${config.displayName} to Full Auto mode"
          >A</button>
          <button
            class="agent-mode-btn active"
            data-agent="${agentName}"
            data-mode="semi-auto"
            title="Semi-Auto — agent requests approval before buying"
            aria-label="Set ${config.displayName} to Semi-Auto mode"
          >S</button>
          <button
            class="agent-mode-btn"
            data-agent="${agentName}"
            data-mode="safe"
            title="Safe — agent is paused"
            aria-label="Set ${config.displayName} to Safe (paused) mode"
          >⛔</button>
        </div>
      `;

      container.appendChild(card);
    });
  }

  /* ---- Bind Agent Mode Buttons ---- */

  function bindAgentModeButtons() {
    const container = document.getElementById('agent-cards-container');
    if (!container) return;

    container.addEventListener('click', (event) => {
      const button = event.target.closest('.agent-mode-btn');
      if (!button) return;

      const agentName = button.dataset.agent;
      const mode = button.dataset.mode;
      if (agentName && mode) {
        setAgentMode(agentName, mode);
      }
    });
  }

  async function setAgentMode(agentName, mode) {
    /* Update UI immediately (optimistic update) */
    updateModeButtonHighlight(agentName, mode);

    try {
      const response = await fetch(`${BACKEND_URL}/api/agents/${encodeURIComponent(agentName)}/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });

      if (!response.ok) {
        console.warn(`Failed to set mode for ${agentName}: ${response.status}`);
        /* Revert to what the backend thinks (re-fetch on next poll) */
      }
    } catch (error) {
      console.warn(`Agent mode change failed (backend offline): ${error.message}`);
    }
  }

  function updateModeButtonHighlight(agentName, activeMode) {
    const modesContainer = document.getElementById(`agent-modes-${agentName}`);
    if (!modesContainer) return;

    modesContainer.querySelectorAll('.agent-mode-btn').forEach(button => {
      button.classList.toggle('active', button.dataset.mode === activeMode);
    });

    /* Also update the status dot color based on mode */
    const dot = document.getElementById(`agent-dot-${agentName}`);
    if (dot) {
      dot.className = 'agent-card__status-dot';
      if (activeMode === 'auto') dot.classList.add('dot-live');
      else if (activeMode === 'semi-auto') dot.classList.add('dot-warning');
      else dot.classList.add('dot-stopped');
    }
  }

  /* ---- Polling ---- */

  function startPolling() {
    stopPolling();
    fetchAgentStats();
    pollIntervalId = setInterval(fetchAgentStats, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollIntervalId !== null) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
  }

  async function fetchAgentStats() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/state/agents`);
      if (!response.ok) return;
      const data = await response.json();
      updateAgentDisplays(data.agents || data);
    } catch (_error) {
      /* Backend offline — keep existing display */
    }
  }

  /* ---- Update Agent Displays ---- */

  function updateAgentDisplays(agentsData) {
    if (!agentsData || typeof agentsData !== 'object') return;

    Object.entries(AGENT_CONFIG).forEach(([agentName, config]) => {
      const agentData = agentsData[agentName];
      if (!agentData) return;

      /* Update mode button highlight */
      const mode = agentData.mode || 'safe';
      updateModeButtonHighlight(agentName, mode);

      /* Update win rate (from win_count / total_trades) */
      const wrElement = document.getElementById(`agent-wr-${agentName}`);
      if (wrElement) {
        const winCount = parseInt(agentData.win_count || 0);
        const totalTrades = parseInt(agentData.total_trades || 0);
        let winRateStr = '—%';
        if (totalTrades > 0) {
          const wr = Math.round((winCount / totalTrades) * 100);
          winRateStr = `${wr}% (${winCount}/${totalTrades})`;
          /* Color-code win rate */
          wrElement.style.color = wr >= 55 ? 'var(--color-state-success)'
            : wr >= 45 ? 'var(--color-state-warning)'
            : 'var(--color-state-error)';
        } else {
          winRateStr = `0T`;
        }
        wrElement.textContent = winRateStr;
      }

      /* Update P&L */
      const pnlElement = document.getElementById(`agent-pnl-${agentName}`);
      if (pnlElement) {
        const pnl = agentData.realized_pnl !== undefined
          ? parseFloat(agentData.realized_pnl)
          : null;
        if (pnl !== null && !isNaN(pnl)) {
          const sign = pnl >= 0 ? '+' : '';
          pnlElement.textContent = `${sign}$${Math.abs(pnl).toFixed(2)}`;
          pnlElement.style.color = pnl >= 0 ? 'var(--color-state-success)' : 'var(--color-state-error)';
        } else {
          pnlElement.textContent = '$—';
          pnlElement.style.color = '';
        }
      }

      /* Accumulate PnL history for multi-line chart */
      const pnl = agentData.realized_pnl !== undefined ? parseFloat(agentData.realized_pnl) : 0;
      if (!isNaN(pnl)) {
        pnlHistory[agentName].push({ time: Date.now(), pnl });
        /* Keep last 100 data points */
        if (pnlHistory[agentName].length > 100) {
          pnlHistory[agentName].shift();
        }
      }

      /* Update agent heatmap bar */
      const heatBar = document.querySelector(`[data-agent-heat="${agentName}"]`);
      if (heatBar) {
        heatBar.style.background = mode === 'auto'
          ? 'var(--color-state-success)'
          : mode === 'semi-auto'
            ? 'var(--color-state-warning)'
            : 'var(--color-fg-subtle)';
        heatBar.style.opacity = mode === 'safe' ? '0.3' : '0.8';
        heatBar.title = `${agentName.toUpperCase()} — ${mode}`;
      }
    });

    /* Redraw multi-line P&L chart */
    drawPnlChart();

    /* Update overall win rate gauge in action bar */
    updateWinRateGauge(agentsData);
  }

  function resetAgentDisplays() {
    Object.keys(AGENT_CONFIG).forEach(agentName => {
      const wrElement = document.getElementById(`agent-wr-${agentName}`);
      const pnlElement = document.getElementById(`agent-pnl-${agentName}`);
      const dot = document.getElementById(`agent-dot-${agentName}`);

      if (wrElement) wrElement.textContent = '—%';
      if (pnlElement) { pnlElement.textContent = '$—'; pnlElement.style.color = ''; }
      if (dot) { dot.className = 'agent-card__status-dot'; }
    });
  }

  /* ---- Multi-line P&L Chart ---- */

  function drawPnlChart() {
    const canvas = document.getElementById('pl-graph');
    if (!canvas) return;

    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 4;

    context.clearRect(0, 0, width, height);

    /* Background */
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--color-bg-canvas').trim() || '#0f172a';
    const gridColor = computedStyle.getPropertyValue('--color-border-muted').trim() || 'rgba(255,255,255,0.1)';

    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

    /* Draw zero line */
    context.strokeStyle = gridColor;
    context.lineWidth = 0.5;
    context.setLineDash([3, 3]);
    context.beginPath();
    context.moveTo(padding, height / 2);
    context.lineTo(width - padding, height / 2);
    context.stroke();
    context.setLineDash([]);

    /* Collect all PnL data for scale */
    const allPnls = Object.values(pnlHistory).flat().map(p => p.pnl);
    if (allPnls.length === 0) return;

    const maxAbsPnl = Math.max(...allPnls.map(Math.abs), 0.01);
    const minPnl = -maxAbsPnl;
    const maxPnl = maxAbsPnl;
    const pnlRange = maxPnl - minPnl;

    function pnlToY(pnl) {
      return padding + (1 - (pnl - minPnl) / pnlRange) * (height - padding * 2);
    }

    /* Draw each agent line */
    Object.entries(AGENT_CONFIG).forEach(([agentName, config]) => {
      const history = pnlHistory[agentName];
      if (history.length < 2) return;

      /* Use relative time for X axis */
      const minTime = history[0].time;
      const maxTime = history[history.length - 1].time;
      const timeRange = maxTime - minTime || 1;

      function timeToX(time) {
        return padding + ((time - minTime) / timeRange) * (width - padding * 2);
      }

      context.beginPath();
      context.lineWidth = 1.5;
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.strokeStyle = config.chartColor;
      context.globalAlpha = 0.85;

      history.forEach((point, index) => {
        const x = timeToX(point.time);
        const y = pnlToY(point.pnl);
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();
      context.globalAlpha = 1;
    });

    /* Draw legend (tiny dots per agent) */
    let legendX = padding + 2;
    const legendY = height - padding - 4;
    Object.entries(AGENT_CONFIG).forEach(([agentName, config]) => {
      context.fillStyle = config.chartColor;
      context.fillRect(legendX, legendY, 6, 3);
      legendX += 10;
    });
  }

  /* ---- Update Win Rate Gauge in Action Bar ---- */

  function updateWinRateGauge(agentsData) {
    const fill = document.getElementById('win-rate-fill');
    const label = document.getElementById('win-rate-label');
    if (!fill && !label) return;

    /* Aggregate win/loss across all agents */
    let totalWins = 0;
    let totalTrades = 0;
    Object.keys(AGENT_CONFIG).forEach(agentName => {
      const agentData = agentsData[agentName];
      if (!agentData) return;
      totalWins += parseInt(agentData.win_count || 0);
      totalTrades += parseInt(agentData.total_trades || 0);
    });

    if (totalTrades > 0) {
      const pct = Math.round((totalWins / totalTrades) * 100);
      if (fill) fill.style.height = pct + '%';
      if (label) {
        label.textContent = pct + '%';
        label.style.color = pct >= 55 ? 'var(--color-state-success)'
          : pct >= 45 ? 'var(--color-state-warning)'
          : 'var(--color-state-error)';
      }
    } else {
      if (fill) fill.style.height = '0%';
      if (label) { label.textContent = '—'; label.style.color = ''; }
    }
  }

  /* ---- Update heatmap ---- */

  function updateHeatmap(agentsData) {
    const heatmapEl = document.getElementById('agent-heatmap');
    if (!heatmapEl) return;

    const agentNames = Object.keys(AGENT_CONFIG);
    const bars = heatmapEl.querySelectorAll('[data-agent-heat]');

    bars.forEach((bar, index) => {
      const agentName = agentNames[index];
      if (!agentName || !agentsData[agentName]) return;

      const mode = agentsData[agentName].mode || 'safe';
      bar.style.background = mode === 'auto'
        ? 'var(--color-state-success)'
        : mode === 'semi-auto'
          ? 'var(--color-state-warning)'
          : 'var(--color-fg-subtle)';
      bar.style.opacity = mode === 'safe' ? '0.3' : '0.8';
    });
  }

  /* ---- Realtime event hook ---- */

  function onEvent(event) {
    if (event.type === 'fill' || event.type === 'agent_update') {
      fetchAgentStats();
    }
  }

  return {
    initialize,
    onConnected,
    onDisconnected,
    onEvent,
  };
})();
