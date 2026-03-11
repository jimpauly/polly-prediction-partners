/* ============================================================
   Paulie's Prediction Partners — Agent Dashboard Module
   Handles agent mode controls, per-agent stats, and the
   multi-line P&L comparison chart in the Ignition bar.
   ============================================================ */

const AgentDashboard = (() => {
  "use strict";

  const BACKEND_URL = "http://127.0.0.1:8000";
  const POLL_INTERVAL_MS = 10000;

  /* Agent configuration (internal IDs include bot numbers) */
  const AGENT_CONFIG = {
    "prime-01": {
      apiName: "prime",
      displayName: "volume",
      icon: "📊",
      description: "Volume + liquidity pulse",
      chartColorVar: "--color-accent-primary" /* blue / primary accent */,
      defaultMode: "semi-auto",
      active: true,
    },
    "peritia-02": {
      apiName: "peritia",
      displayName: "crypto",
      icon: "🎯",
      description: "BTC 15m momentum",
      chartColorVar: "--color-state-success" /* green */,
      defaultMode: "semi-auto",
      active: true,
    },
    "praxis-03": {
      apiName: "praxis",
      displayName: "sports",
      icon: "🧠",
      description: "Sports markets",
      chartColorVar: "--color-accent-secondary" /* purple / secondary accent */,
      defaultMode: "safe",
      active: true,
    },
    "patiens-04": {
      apiName: "patiens",
      displayName: "financials",
      icon: "🕰️",
      description: "Oil up/down (Y/N)",
      chartColorVar: "--color-state-warning" /* amber */,
      defaultMode: "safe",
      active: false,
      underConstruction: true,
    },
    "pavis-05": {
      apiName: "pavis",
      displayName: "politics",
      icon: "🛡️",
      description: "Policy + election focus",
      chartColorVar: "--color-fg-subtle" /* slate */,
      defaultMode: "safe",
      active: false,
      underConstruction: true,
    },
    "byob-06": {
      apiName: "byob",
      displayName: "byob",
      icon: "🤖",
      description: "Custom LLM agent",
      chartColorVar: "--color-state-info" /* cyan */,
      defaultMode: "safe",
      active: true,
      isByob: true,
    },
    "agnt007-07": {
      apiName: "agnt007",
      displayName: "companies",
      icon: "🕵️",
      description: "Company event focus",
      chartColorVar: "--color-fg-muted" /* neutral */,
      defaultMode: "safe",
      active: false,
      underConstruction: true,
    },
  };

  const AGENT_API_MAP = Object.entries(AGENT_CONFIG).reduce(
    (acc, [internalName, config]) => {
      acc[internalName] = config.apiName || internalName;
      return acc;
    },
    {},
  );

  const AGENT_INTERNAL_MAP = Object.entries(AGENT_API_MAP).reduce(
    (acc, [internalName, apiName]) => {
      acc[apiName] = internalName;
      return acc;
    },
    {},
  );

  const BYOB_KEY =
    Object.keys(AGENT_CONFIG).find((key) => AGENT_CONFIG[key].isByob) || "byob";

  function resolveApiName(internalName) {
    return AGENT_API_MAP[internalName] || internalName;
  }

  function resolveInternalName(apiName) {
    return AGENT_INTERNAL_MAP[apiName] || apiName;
  }

  /* Canvas fallback color — only used when no CSS variables are available */
  const CHART_COLOR_FALLBACK = "#6b7280";

  /** Resolve a CSS custom property to a usable color value for canvas. */
  function resolveChartColor(config) {
    const val = getComputedStyle(document.documentElement)
      .getPropertyValue(config.chartColorVar)
      .trim();
    return val || CHART_COLOR_FALLBACK;
  }

  /* Top-performing LLM models (Feb 2026) for BYOB radio selectors */
  const LLM_MODELS = [
    { id: "openai", label: "GPT (OpenAI)", placeholder: "sk-..." },
    { id: "claude", label: "Claude (Anthropic)", placeholder: "sk-ant-..." },
    { id: "gemini", label: "Gemini (Google)", placeholder: "AIza..." },
    { id: "grok", label: "Grok (xAI)", placeholder: "xai-..." },
    { id: "deepseek", label: "DeepSeek", placeholder: "sk-..." },
    { id: "qwen", label: "Qwen (Alibaba)", placeholder: "sk-..." },
    { id: "llama", label: "Llama (Meta)", placeholder: "meta-..." },
  ];

  let pollIntervalId = null;
  let isConnected = false;

  /* PnL history per agent — initialized dynamically from AGENT_CONFIG */
  const pnlHistory = Object.keys(AGENT_CONFIG).reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {});

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
    const container = document.getElementById("agent-cards-container");
    if (!container) return;

    container.innerHTML = "";
    Object.entries(AGENT_CONFIG).forEach(([agentName, config]) => {
      const card = document.createElement("div");
      card.id = `agent-card-${agentName}`;
      card.dataset.agent = agentName;

      if (config.underConstruction) {
        card.className = "agent-card agent-card--construction";
        card.innerHTML = `
          <div class="agent-card__cap">
            <span class="agent-card__avatar">${config.icon}</span>
            <div class="agent-card__identity">
              <span class="agent-card__name">${config.displayName}</span>
              <span class="agent-card__role">${config.description}</span>
            </div>
          </div>
          <div class="agent-card__construction">
            <span class="agent-card__construction-emoji">🚧</span>
            <span class="agent-card__construction-label">Under<br>Construction</span>
            <span class="agent-card__construction-emoji">🏗️</span>
          </div>
        `;
      } else if (config.isByob) {
        card.className = "agent-card agent-card--byob";
        card.innerHTML = `
          <div class="agent-card__cap">
            <span class="agent-card__avatar">${config.icon}</span>
            <div class="agent-card__identity">
              <span class="agent-card__name">${config.displayName}</span>
              <span class="agent-card__role">${config.description}</span>
            </div>
          </div>
          <div class="agent-card__status-row">
            <span class="agent-card__status-label">LINK</span>
            <div class="agent-card__status-dot" id="agent-dot-${agentName}" title="Status: Awaiting Config"></div>
          </div>
          <button class="byob-menu-toggle" id="byob-toggle-btn" title="Configure your own bot">⚙️ Configure</button>
        `;
      } else if (config.active) {
        card.className = "agent-card";
        card.innerHTML = `
          <div class="agent-card__cap">
            <span class="agent-card__avatar">${config.icon}</span>
            <div class="agent-card__identity">
              <span class="agent-card__name">${config.displayName}</span>
              <span class="agent-card__role">${config.description}</span>
            </div>
          </div>
          <div class="agent-card__status-row">
            <span class="agent-card__status-label">LINK</span>
            <div class="agent-card__status-dot" id="agent-dot-${agentName}" title="Status: Offline"></div>
          </div>
          <div class="agent-card__stats" id="agent-stats-${agentName}">
            <div class="agent-card__stat">
              <span class="agent-card__stat-label">WR</span>
              <span class="agent-card__wr" id="agent-wr-${agentName}">—%</span>
            </div>
            <div class="agent-card__stat">
              <span class="agent-card__stat-label">PNL</span>
              <span class="agent-card__pnl" id="agent-pnl-${agentName}">$—</span>
            </div>
          </div>
          <div class="agent-card__modes agent-mode-buttons" id="agent-modes-${agentName}">
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
      } else {
        card.className = "agent-card agent-card--inactive";
        card.innerHTML = `
          <div class="agent-card__cap">
            <span class="agent-card__avatar">${config.icon}</span>
            <div class="agent-card__identity">
              <span class="agent-card__name">${config.displayName}</span>
              <span class="agent-card__role">${config.description}</span>
            </div>
          </div>
          <span class="agent-card__locked">LOCKED</span>
        `;
      }

      container.appendChild(card);
    });

    /* Render the BYOB overlay panel (hidden by default) */
    renderByobPanel(container);
  }

  /* ---- BYOB (Bring-Your-Own-Bot) Panel ---- */

  function renderByobPanel(container) {
    const panel = document.createElement("div");
    panel.id = "byob-panel";
    panel.className = "byob-panel byob-panel--hidden";

    const modelRadios = LLM_MODELS.map(
      (m) => `
        <label class="byob-model-radio">
          <input type="radio" name="byob-llm" value="${m.id}">
          <span class="byob-model-label">${m.label}</span>
        </label>`,
    ).join("");

    /* Build numbered-line editor */
    panel.innerHTML = `
      <div class="byob-panel__header">
        <span style="font-weight:700;font-size:11px">🤖 Bring-Your-Own-Bot Config</span>
        <button class="byob-panel__close" id="byob-close-btn" title="Close">✕</button>
      </div>
      <div class="byob-panel__body">
        <div class="byob-editor-wrapper">
          <div class="byob-editor-lines" id="byob-line-nums"></div>
          <textarea class="byob-editor-textarea" id="byob-editor" rows="8"
            spellcheck="false" placeholder="// paste or write your algorithm here…"></textarea>
        </div>
        <button class="btn btn-sm byob-plugin-btn" disabled title="Coming soon">🔌 Plug in Algorithm</button>
        <div class="byob-model-selector">
          <span class="byob-model-selector__title">LLM API Keys</span>
          <div class="byob-model-grid">${modelRadios}</div>
          <input type="text" class="input byob-api-key-input" id="byob-api-key"
            placeholder="Enter your LLM API key…" disabled>
        </div>
      </div>
    `;

    /* Append to body so it escapes any stacking context */
    document.body.appendChild(panel);

    bindByobEvents(panel);
  }

  function bindByobEvents(panel) {
    /* Toggle panel visibility */
    document.addEventListener("click", (e) => {
      if (e.target.closest("#byob-toggle-btn")) {
        panel.classList.toggle("byob-panel--hidden");
        e.stopPropagation();
      }
      if (e.target.closest("#byob-close-btn")) {
        panel.classList.add("byob-panel--hidden");
      }
    });

    /* Line numbers for the code editor */
    const editor = panel.querySelector("#byob-editor");
    const lineNums = panel.querySelector("#byob-line-nums");
    if (editor && lineNums) {
      const updateLines = () => {
        const count = Math.max(editor.value.split("\n").length, 8);
        lineNums.innerHTML = Array.from(
          { length: count },
          (_, i) => `<span>${i + 1}</span>`,
        ).join("");
      };
      editor.addEventListener("input", updateLines);
      editor.addEventListener("scroll", () => {
        lineNums.scrollTop = editor.scrollTop;
      });
      updateLines();
    }

    /* Enable API key input when a model is selected */
    const apiKeyInput = panel.querySelector("#byob-api-key");
    const radios = panel.querySelectorAll('input[name="byob-llm"]');
    radios.forEach((r) => {
      r.addEventListener("change", () => {
        if (apiKeyInput) {
          apiKeyInput.disabled = false;
          const model = LLM_MODELS.find((m) => m.id === r.value);
          apiKeyInput.placeholder = model
            ? model.placeholder
            : "Enter your LLM API key…";
        }
      });
    });

    /* When API key is entered, activate BYOB agent */
    if (apiKeyInput) {
      apiKeyInput.addEventListener("input", () => {
        const dot = document.getElementById(`agent-dot-${BYOB_KEY}`);
        if (apiKeyInput.value.trim().length > 8) {
          if (dot) {
            dot.className = "agent-card__status-dot dot-live";
            dot.title = "Status: Connected via LLM API";
          }
        } else {
          if (dot) {
            dot.className = "agent-card__status-dot";
            dot.title = "Status: Awaiting Config";
          }
        }
      });
    }
  }

  /* ---- Bind Agent Mode Buttons ---- */

  function bindAgentModeButtons() {
    const container = document.getElementById("agent-cards-container");
    if (!container) return;

    container.addEventListener("click", (event) => {
      const button = event.target.closest(".agent-mode-btn");
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
      const apiName = resolveApiName(agentName);
      const response = await fetch(
        `${BACKEND_URL}/api/agents/${encodeURIComponent(apiName)}/mode`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode }),
        },
      );

      if (!response.ok) {
        console.warn(`Failed to set mode for ${apiName}: ${response.status}`);
        /* Revert to what the backend thinks (re-fetch on next poll) */
      }
    } catch (error) {
      console.warn(
        `Agent mode change failed (backend offline): ${error.message}`,
      );
    }
  }

  function updateModeButtonHighlight(agentName, activeMode) {
    const modesContainer = document.getElementById(`agent-modes-${agentName}`);
    if (!modesContainer) return;

    modesContainer.querySelectorAll(".agent-mode-btn").forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === activeMode);
    });

    /* Also update the status dot color based on mode */
    const dot = document.getElementById(`agent-dot-${agentName}`);
    if (dot) {
      dot.className = "agent-card__status-dot";
      if (activeMode === "auto") dot.classList.add("dot-live");
      else if (activeMode === "semi-auto") dot.classList.add("dot-warning");
      else dot.classList.add("dot-stopped");
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
    if (!agentsData || typeof agentsData !== "object") return;

    Object.entries(AGENT_CONFIG).forEach(([agentName, config]) => {
      const apiName = resolveApiName(agentName);
      const agentData = agentsData[apiName];
      if (!agentData) return;

      /* Update mode button highlight */
      const mode = agentData.mode || "safe";
      updateModeButtonHighlight(agentName, mode);

      /* Accumulate PnL history for multi-line chart */
      const pnl =
        agentData.realized_pnl !== undefined
          ? parseFloat(agentData.realized_pnl)
          : 0;
      if (!isNaN(pnl)) {
        pnlHistory[agentName].push({ time: Date.now(), pnl });
        /* Keep last 100 data points using slice (O(n) vs O(n) shift but cleaner) */
        if (pnlHistory[agentName].length > 100) {
          pnlHistory[agentName] = pnlHistory[agentName].slice(-100);
        }
      }

      /* Update agent heatmap bar */
      const heatBar = document.querySelector(
        `[data-agent-heat="${agentName}"]`,
      );
      if (heatBar) {
        heatBar.style.background =
          mode === "auto"
            ? "var(--color-state-success)"
            : mode === "semi-auto"
              ? "var(--color-state-warning)"
              : "var(--color-fg-subtle)";
        heatBar.style.opacity = mode === "safe" ? "0.3" : "0.8";
        heatBar.title = `${config.displayName.toUpperCase()} — ${mode}`;
      }
    });

    /* Redraw multi-line P&L chart */
    drawPnlChart();

    /* Update overall win rate gauge in action bar */
    updateWinRateGauge(agentsData);
  }

  function resetAgentDisplays() {
    Object.keys(AGENT_CONFIG).forEach((agentName) => {
      const dot = document.getElementById(`agent-dot-${agentName}`);

      if (dot) {
        dot.className = "agent-card__status-dot";
      }
    });
  }

  /* ---- Multi-line P&L Chart ---- */

  function drawPnlChart() {
    const canvas = document.getElementById("pl-graph");
    if (!canvas) return;

    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const padding = 4;

    context.clearRect(0, 0, width, height);

    /* Background */
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor =
      computedStyle.getPropertyValue("--color-bg-canvas").trim() || "#0f172a";
    const gridColor =
      computedStyle.getPropertyValue("--color-border-muted").trim() ||
      "rgba(255,255,255,0.1)";

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
    const allPnls = Object.values(pnlHistory)
      .flat()
      .map((p) => p.pnl);
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
      context.lineJoin = "round";
      context.lineCap = "round";
      context.strokeStyle = resolveChartColor(config);
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
      context.fillStyle = resolveChartColor(config);
      context.fillRect(legendX, legendY, 6, 3);
      legendX += 10;
    });
  }

  /* ---- Update Win Rate Gauge in Action Bar ---- */

  function updateWinRateGauge(agentsData) {
    const fill = document.getElementById("win-rate-fill");
    const label = document.getElementById("win-rate-label");
    if (!fill && !label) return;

    /* Aggregate win/loss across all agents */
    let totalWins = 0;
    let totalTrades = 0;
    Object.keys(AGENT_CONFIG).forEach((agentName) => {
      const agentData = agentsData[resolveApiName(agentName)];
      if (!agentData) return;
      totalWins += parseInt(agentData.win_count, 10) || 0;
      totalTrades += parseInt(agentData.total_trades, 10) || 0;
    });

    if (totalTrades > 0) {
      const pct = Math.round((totalWins / totalTrades) * 100);
      if (fill) fill.style.height = pct + "%";
      if (label) {
        label.textContent = pct + "%";
        label.style.color =
          pct >= 55
            ? "var(--color-state-success)"
            : pct >= 45
              ? "var(--color-state-warning)"
              : "var(--color-state-error)";
      }
    } else {
      if (fill) fill.style.height = "0%";
      if (label) {
        label.textContent = "—";
        label.style.color = "";
      }
    }
  }

  /* ---- Update heatmap ---- */

  function updateHeatmap(agentsData) {
    const heatmapEl = document.getElementById("agent-heatmap");
    if (!heatmapEl) return;

    const agentNames = Object.keys(AGENT_CONFIG);
    const bars = heatmapEl.querySelectorAll("[data-agent-heat]");

    bars.forEach((bar, index) => {
      const agentName = agentNames[index];
      const apiName = resolveApiName(agentName);
      if (!agentName || !agentsData[apiName]) return;

      const mode = agentsData[apiName].mode || "safe";
      bar.style.background =
        mode === "auto"
          ? "var(--color-state-success)"
          : mode === "semi-auto"
            ? "var(--color-state-warning)"
            : "var(--color-fg-subtle)";
      bar.style.opacity = mode === "safe" ? "0.3" : "0.8";
    });
  }

  /* ---- Realtime event hook ---- */

  function onEvent(event) {
    if (event.type === "fill" || event.type === "agent_update") {
      fetchAgentStats();
    }
    /* Keep per-agent mode buttons in sync with global throttle changes */
    if (event.type === "agent_mode_changed" && event.data) {
      const { agent_name, mode } = event.data;
      if (agent_name && mode) {
        const internalName = resolveInternalName(agent_name);
        updateModeButtonHighlight(internalName, mode);
      }
    }
  }

  return {
    initialize,
    onConnected,
    onDisconnected,
    onEvent,
    resolveApiName,
    resolveInternalName,
  };
})();
