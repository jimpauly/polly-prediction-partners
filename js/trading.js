/**
 * trading.js — Trading Studio logic
 * Handles: API key connection, market display, agents, P/L chart
 */

const trading = (() => {
  let isConnected = false;
  let activeMode = null; // 'live' | 'demo' | null
  let globalPermission = 'full-stop';
  let agentPermissions = { prime: 'full-stop', peritia: 'full-stop' };
  let plTimeView = '24h';
  let plYAxisView = '10';
  let plChartInstance = null;
  let categoriesData = [];
  let seriesData = [];
  let visibleSeriesCount = 9;

  // Mock series categories for display
  const MOCK_CATEGORIES = [
    { id: 'crypto', label: '₿ Crypto', subs: ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE'] },
    { id: 'financials', label: '📈 Financials', subs: ['SPX', 'NDX', 'Gold', 'Oil', 'Fed Rate'] },
    { id: 'sports', label: '🏆 Sports', subs: ['NFL', 'NBA', 'MLB', 'Soccer', 'Olympics'] },
    { id: 'politics', label: '🗳 Politics', subs: ['US', 'Global', 'Senate', 'House', 'Governors'] },
    { id: 'weather', label: '🌤 Weather', subs: ['Temperature', 'Hurricane', 'Drought', 'Snowfall'] },
    { id: 'entertainment', label: '🎬 Entertainment', subs: ['Awards', 'Box Office', 'TV', 'Music'] },
    { id: 'science', label: '🔬 Science', subs: ['Space', 'AI', 'Tech', 'Health'] },
  ];

  // Mock series cards data
  function generateMockSeries(count) {
    const series = [];
    const categories = ['Crypto', 'Financials', 'Sports', 'Politics', 'Weather'];
    const names = [
      'BTC Price > $100K by Dec', 'ETH above $5K', 'SOL hits $500',
      'SPX ends week up', 'Fed cuts rates Q2', 'Gold > $3000',
      'Super Bowl winner', 'NBA Finals MVP', 'World Cup champion',
      '2024 Election winner', 'Senate majority', 'GDP growth > 3%',
      'Hurricane season active', 'Oil below $70', 'Nvidia > $1T',
      'OpenAI IPO in 2025', 'Tesla Model Y sales', 'Apple Vision Pro v2',
    ];
    for (let i = 0; i < count; i++) {
      const yesPrice = Math.floor(Math.random() * 80) + 10;
      const volume = Math.floor(Math.random() * 50000) + 500;
      series.push({
        id: i + 1,
        ticker: `MOCK-${i + 1}`,
        title: names[i % names.length],
        category: categories[i % categories.length],
        yesPrice,
        noPrice: 100 - yesPrice,
        volume,
        closeTime: new Date(Date.now() + Math.random() * 30 * 24 * 3600 * 1000).toLocaleDateString(),
        status: 'open'
      });
    }
    return series;
  }

  function connect() {
    const liveKey = document.getElementById('live-api-key')?.value.trim();
    const demoKey = document.getElementById('demo-api-key')?.value.trim();

    if (!liveKey && !demoKey) {
      showStatus('Enter at least one API key pair to connect.', 'error');
      return;
    }

    // Simulate connection (no real API calls in frontend-only)
    activeMode = liveKey ? 'live' : 'demo';
    isConnected = true;

    updateConnectionIndicators();
    showStatus(`Connected in ${activeMode.toUpperCase()} mode.`, 'success');
    document.getElementById('api-no-keys-msg').style.display = 'none';

    // Load mock series data
    seriesData = generateMockSeries(27);
    categoriesData = MOCK_CATEGORIES;
    visibleSeriesCount = 9;

    // Show trading content
    const noData = document.getElementById('trade-no-data');
    const tradeContent = document.getElementById('trade-content');
    if (noData) noData.style.display = 'none';
    if (tradeContent) { tradeContent.style.display = 'flex'; renderTradeContent(); }

    // Render P/L chart
    renderPLChart();
  }

  function disconnect() {
    isConnected = false;
    activeMode = null;
    updateConnectionIndicators();
    const noData = document.getElementById('trade-no-data');
    const tradeContent = document.getElementById('trade-content');
    if (noData) noData.style.display = 'flex';
    if (tradeContent) tradeContent.style.display = 'none';
    renderPLChart();
    showStatus('Disconnected.', 'info');
  }

  function updateConnectionIndicators() {
    const liveLight = document.getElementById('indicator-live');
    const demoLight = document.getElementById('indicator-demo');
    if (liveLight) {
      liveLight.className = `indicator-light ${activeMode === 'live' ? 'light-on' : ''}`;
    }
    if (demoLight) {
      demoLight.className = `indicator-light ${activeMode === 'demo' ? 'light-blink' : ''}`;
    }
  }

  function showStatus(msg, type) {
    // Create a transient toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 9999;
      padding: 10px 18px; border-radius: 6px; font-size: 12px; font-weight: 600;
      color: white; pointer-events: none;
      background: ${type === 'error' ? '#dc2626' : type === 'success' ? '#16a34a' : '#0891b2'};
      animation: fadeInOut 3s ease forwards;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function renderTradeContent() {
    const container = document.getElementById('trade-content');
    if (!container) return;

    container.innerHTML = `
      <div style="padding:8px; display:flex; flex-direction:column; gap:8px; height:100%;">
        <!-- Category Nav -->
        <div style="display:flex; gap:6px; overflow-x:auto; padding:4px 0; flex-shrink:0;" id="category-nav">
          ${categoriesData.map(cat => `
            <button class="btn category-btn" data-cat="${cat.id}" onclick="trading.selectCategory('${cat.id}')"
                    style="white-space:nowrap; padding:4px 12px; font-size:11px;">${cat.label}</button>
          `).join('')}
        </div>
        
        <!-- Sub-category Nav + Filters -->
        <div style="display:flex; gap:6px; align-items:center; overflow-x:auto; flex-shrink:0;" id="subcategory-nav">
          <div id="subcategory-btns" style="display:flex; gap:4px;"></div>
          <div style="margin-left:auto; display:flex; gap:6px; flex-shrink:0;">
            <select id="filter-sort" onchange="trading.applyFilters()" style="font-size:10px; padding:2px 6px; background:var(--color-bg-surface); color:var(--color-fg-default); border:1px solid var(--color-border-default); border-radius:3px;">
              <option value="volume">Sort: Volume</option>
              <option value="frequency">Sort: Frequency</option>
              <option value="close-time">Sort: Time-to-Close</option>
            </select>
          </div>
        </div>
        
        <!-- Series Cards Grid (3 columns) -->
        <div id="series-grid" style="flex:1; overflow-y:auto; display:grid; grid-template-columns:repeat(3,1fr); gap:8px; align-content:start;"></div>
        
        <!-- Show More -->
        <div style="flex-shrink:0; text-align:center; padding:4px 0;">
          <button class="btn" id="show-more-btn" onclick="trading.showMore()" style="font-size:11px; padding:6px 24px;">
            SHOW MORE MARKETS
          </button>
        </div>
      </div>
    `;

    selectCategory(categoriesData[0]?.id);
    renderSeriesCards();
  }

  function selectCategory(catId) {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === catId));
    const cat = categoriesData.find(c => c.id === catId);
    const subContainer = document.getElementById('subcategory-btns');
    if (subContainer && cat) {
      subContainer.innerHTML = cat.subs.map((sub, i) => `
        <button class="btn${i === 0 ? ' active' : ''}" style="font-size:10px; padding:3px 8px;" onclick="this.parentElement.querySelectorAll('.btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');">${sub}</button>
      `).join('');
    }
  }

  function renderSeriesCards() {
    const grid = document.getElementById('series-grid');
    if (!grid) return;
    const visible = seriesData.slice(0, visibleSeriesCount);
    grid.innerHTML = visible.map(s => createSeriesCard(s)).join('');

    const showMoreBtn = document.getElementById('show-more-btn');
    if (showMoreBtn) {
      showMoreBtn.style.display = visibleSeriesCount >= seriesData.length ? 'none' : '';
    }
  }

  function createSeriesCard(series) {
    const yesPct = series.yesPrice;
    const noPct = series.noPrice;
    const barWidth = yesPct;
    return `
      <div class="card display-component" style="display:flex; flex-direction:column; gap:6px; position:relative; font-size:11px;" data-series-id="${series.id}">
        <!-- Category badge -->
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:4px;">
          <span style="font-size:9px; padding:1px 6px; border-radius:8px; background:var(--color-bg-brand); color:var(--color-bg-canvas); font-weight:700;">${series.category}</span>
          <span style="font-size:9px; opacity:0.6;">${series.closeTime}</span>
        </div>
        
        <!-- Title -->
        <div style="font-weight:700; font-size:12px; line-height:1.3; color:var(--color-fg-strong);">${series.title}</div>
        
        <!-- Probability bar -->
        <div style="background:var(--color-border-muted); border-radius:3px; height:6px; overflow:hidden;">
          <div style="width:${barWidth}%; height:100%; background:var(--color-state-success); border-radius:3px;"></div>
        </div>
        
        <!-- YES/NO prices -->
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:6px;">
            <button style="font-size:10px; padding:2px 10px; background:var(--color-state-success); color:white; border:none; border-radius:3px; cursor:pointer; font-weight:700;">
              YES ${yesPct}¢
            </button>
            <button style="font-size:10px; padding:2px 10px; background:var(--color-state-error); color:white; border:none; border-radius:3px; cursor:pointer; font-weight:700;">
              NO ${noPct}¢
            </button>
          </div>
          <div style="font-size:9px; opacity:0.6;">Vol: ${(series.volume / 1000).toFixed(1)}K</div>
        </div>
        
        <!-- Expand button -->
        <button onclick="trading.expandSeries(${series.id})" 
                style="position:absolute; bottom:6px; right:6px; background:none; border:1px solid var(--color-border-muted); border-radius:3px; width:18px; height:18px; font-size:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0.5;"
                title="Expand" aria-label="Expand series card">⤢</button>
      </div>
    `;
  }

  function expandSeries(id) {
    const series = seriesData.find(s => s.id === id);
    if (!series) return;
    // Show expanded card overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:absolute;inset:0;z-index:200;background:var(--color-bg-surface);border-radius:6px;padding:20px;display:flex;flex-direction:column;gap:12px;`;
    overlay.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:900;font-size:16px;">${series.title}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--color-fg-default);">×</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div><div class="label-etched">YES PRICE</div><div style="font-size:24px;font-weight:900;color:var(--color-state-success);">${series.yesPrice}¢</div></div>
        <div><div class="label-etched">NO PRICE</div><div style="font-size:24px;font-weight:900;color:var(--color-state-error);">${series.noPrice}¢</div></div>
        <div><div class="label-etched">VOLUME</div><div style="font-size:18px;font-weight:700;">${series.volume.toLocaleString()}</div></div>
        <div><div class="label-etched">CLOSES</div><div style="font-size:14px;">${series.closeTime}</div></div>
      </div>
      <div style="display:flex;gap:8px;">
        <button style="flex:1;padding:10px;background:var(--color-state-success);color:white;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;">BUY YES</button>
        <button style="flex:1;padding:10px;background:var(--color-state-error);color:white;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;">BUY NO</button>
      </div>
    `;
    const main = document.getElementById('region-main');
    if (main) { main.style.position = 'relative'; main.appendChild(overlay); }
  }

  function showMore() {
    visibleSeriesCount = Math.min(visibleSeriesCount + 18, seriesData.length);
    renderSeriesCards();
  }

  function applyFilters() {}

  function setGlobalPermission(perm) {
    globalPermission = perm;
    document.querySelectorAll('#global-permission .perm-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.perm === perm);
    });
  }

  function setAgentPermission(agent, perm) {
    agentPermissions[agent] = perm;
    const containerId = `${agent}-permission`;
    document.querySelectorAll(`#${containerId} .perm-btn`).forEach(btn => {
      btn.classList.toggle('active', btn.dataset.perm === perm);
    });
  }

  function setPLView(view) {
    plTimeView = view;
    ['24h', '1w', '1m', '1y', 'all'].forEach(v => {
      const btn = document.getElementById(`pl-btn-${v}`);
      if (btn) btn.classList.toggle('active', v === view);
    });
    renderPLChart();
  }

  function setPLYAxis(view) {
    plYAxisView = view;
    ['10', '100', '1k', '10k', 'all'].forEach(v => {
      const btn = document.getElementById(`pl-y-${v}`);
      if (btn) btn.classList.toggle('active', v === view);
    });
    renderPLChart();
  }

  function renderPLChart() {
    const canvas = document.getElementById('pl-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 300;
    const H = canvas.offsetHeight || 80;
    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    if (!isConnected) {
      ctx.fillStyle = 'rgba(128,128,128,0.3)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(128,128,128,0.7)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NO DATA', W / 2, H / 2 + 4);
      return;
    }

    // Generate mock P/L lines for demo
    const points = 30;
    const agentColors = { prime: '#00ff88', peritia: '#00aaff' };

    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, W, H);

    Object.entries(agentColors).forEach(([agent, color]) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      let val = 0;
      for (let i = 0; i < points; i++) {
        val += (Math.random() - 0.45) * 5;
        const x = (i / (points - 1)) * W;
        const y = H / 2 - (val / 50) * (H * 0.4);
        if (i === 0) ctx.moveTo(x, Math.max(2, Math.min(H - 2, y)));
        else ctx.lineTo(x, Math.max(2, Math.min(H - 2, y)));
      }
      ctx.stroke();
    });

    // Zero line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(128,128,128,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function onStudioShow() {
    setTimeout(renderPLChart, 100);
  }

  function init() {
    renderPLChart();
  }

  return {
    init, connect, disconnect, setGlobalPermission, setAgentPermission,
    setPLView, setPLYAxis, renderPLChart, onStudioShow,
    expandSeries, showMore, applyFilters, selectCategory
  };
})();
