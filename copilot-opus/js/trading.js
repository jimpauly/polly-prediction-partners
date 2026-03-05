/* ============================================================
   Paulie's Prediction Partners — Trading Studio Module
   Manages market cards, category filtering, real-time updates,
   expanded card overlay, and semi-auto approval flow.
   ============================================================ */

const TradingStudio = (() => {
  'use strict';

  const BACKEND_URL = 'http://127.0.0.1:8000';
  const CARDS_PER_PAGE = 18;

  let markets = [];
  let displayedCount = 0;
  let currentCategory = 'all';
  let currentSubcategory = 'all';
  let connected = false;
  let websocket = null;

  const SUBCATEGORY_MAP = {
    all: ['All'],
    crypto: ['All', 'BTC', 'ETH', 'SOL', 'Other'],
    sports: ['All', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer'],
    politics: ['All', 'US', 'Global'],
    economics: ['All', 'Fed', 'CPI', 'Jobs'],
    weather: ['All', 'Temperature', 'Storms'],
    entertainment: ['All', 'Awards', 'Box Office'],
    tech: ['All', 'AI', 'Space', 'EVs'],
    science: ['All', 'Space', 'Climate']
  };

  const CATEGORY_KEYWORDS = {
    crypto: ['btc', 'bitcoin', 'eth', 'ethereum', 'sol', 'crypto', 'kxbtc', 'kxeth', 'kxsol'],
    sports: ['nfl', 'nba', 'mlb', 'nhl', 'soccer', 'football', 'basketball', 'baseball', 'sports'],
    politics: ['president', 'election', 'congress', 'senate', 'governor', 'political'],
    economics: ['fed', 'cpi', 'gdp', 'unemployment', 'inflation', 'interest', 'jobs'],
    weather: ['weather', 'temperature', 'hurricane', 'snow', 'rain'],
    entertainment: ['oscar', 'grammy', 'emmy', 'movie', 'tv', 'music'],
    tech: ['tech', 'ai', 'apple', 'google', 'tesla', 'spacex'],
    science: ['space', 'nasa', 'climate', 'vaccine']
  };

  /* ---- Initialization ---- */

  function initialize() {
    bindCategoryTabs();
    bindSubcategoryTabs();
    bindFilters();
    bindRefreshButton();
    bindShowMore();
    bindApprovalButtons();
    bindOverlayClose();
  }

  /* ---- Event Binding ---- */

  function bindCategoryTabs() {
    const nav = document.getElementById('trading-category-nav');
    if (!nav) return;
    nav.addEventListener('click', (e) => {
      const tab = e.target.closest('.category-tab');
      if (!tab) return;
      nav.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      currentSubcategory = 'all';
      displayedCount = 0;
      updateSubcategories();
      renderCards();
    });
  }

  function bindSubcategoryTabs() {
    const nav = document.getElementById('trading-subcategory-nav');
    if (!nav) return;
    nav.addEventListener('click', (e) => {
      const tab = e.target.closest('.subcategory-tab');
      if (!tab) return;
      nav.querySelectorAll('.subcategory-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSubcategory = tab.dataset.subcategory;
      displayedCount = 0;
      renderCards();
    });
  }

  function bindFilters() {
    ['filter-volume', 'filter-frequency', 'filter-time-to-close'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', () => { displayedCount = 0; renderCards(); });
    });
  }

  function bindRefreshButton() {
    const btn = document.getElementById('market-refresh-button');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      btn.classList.add('spin');
      await fetchMarkets();
      setTimeout(() => btn.classList.remove('spin'), 600);
    });
  }

  function bindShowMore() {
    const btn = document.getElementById('show-more-markets');
    if (!btn) return;
    btn.addEventListener('click', () => {
      displayedCount += CARDS_PER_PAGE;
      renderCards();
    });
  }

  function bindApprovalButtons() {
    const approveBtn = document.getElementById('approve-button');
    const denyBtn = document.getElementById('deny-button');
    const overlay = document.getElementById('approval-overlay');

    if (approveBtn) {
      approveBtn.addEventListener('click', () => {
        const orderId = overlay?.dataset.clientOrderId;
        if (orderId) postApprovalDecision(orderId, true);
        if (overlay) overlay.style.display = 'none';
      });
    }
    if (denyBtn) {
      denyBtn.addEventListener('click', () => {
        const orderId = overlay?.dataset.clientOrderId;
        if (orderId) postApprovalDecision(orderId, false);
        if (overlay) overlay.style.display = 'none';
      });
    }
  }

  function bindOverlayClose() {
    const overlay = document.getElementById('expanded-card-overlay');
    if (!overlay) return;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.style.display = 'none';
    });
  }

  /* ---- Connection Lifecycle ---- */

  async function onConnected(environment) {
    connected = true;
    const preConnect = document.getElementById('trading-pre-connect');
    const iface = document.getElementById('trading-interface');
    if (preConnect) preConnect.style.display = 'none';
    if (iface) {
      iface.style.display = 'block';
      iface.classList.add('trading-init-animation');
      setTimeout(() => iface.classList.remove('trading-init-animation'), 1500);
    }
    await fetchMarkets();
    connectWebSocket();
  }

  function onDisconnected() {
    connected = false;
    const preConnect = document.getElementById('trading-pre-connect');
    const iface = document.getElementById('trading-interface');
    if (preConnect) preConnect.style.display = 'flex';
    if (iface) iface.style.display = 'none';
    markets = [];
    displayedCount = 0;
    renderCards();
    if (websocket) { websocket.close(); websocket = null; }
  }

  /* ---- Data Fetching ---- */

  async function fetchMarkets() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/state/markets`);
      if (!response.ok) return;
      const data = await response.json();
      markets = data.markets || [];
      displayedCount = 0;
      renderCards();
    } catch (e) {
      console.warn('Failed to fetch markets:', e);
    }
  }

  /* ---- Filtering ---- */

  function matchesCategory(market, category) {
    const ticker = (market.ticker || '').toLowerCase();
    const event = (market.event_ticker || '').toLowerCase();
    const keywords = CATEGORY_KEYWORDS[category] || [];
    return keywords.some(k => ticker.includes(k) || event.includes(k));
  }

  function filterMarkets() {
    let filtered = [...markets];

    if (currentCategory !== 'all') {
      filtered = filtered.filter(m => matchesCategory(m, currentCategory));
    }

    if (currentSubcategory !== 'all') {
      const sub = currentSubcategory.toLowerCase();
      filtered = filtered.filter(m => {
        const ticker = (m.ticker || '').toLowerCase();
        const event = (m.event_ticker || '').toLowerCase();
        return ticker.includes(sub) || event.includes(sub);
      });
    }

    const volumeFilter = document.getElementById('filter-volume')?.value;
    if (volumeFilter && volumeFilter !== 'all') {
      filtered = filtered.filter(m => {
        const vol = parseFloat(m.volume_24h_fp) || 0;
        if (volumeFilter === 'high') return vol >= 10000;
        if (volumeFilter === 'medium') return vol >= 1000 && vol < 10000;
        if (volumeFilter === 'low') return vol < 1000;
        return true;
      });
    }

    const timeFilter = document.getElementById('filter-time-to-close')?.value;
    if (timeFilter && timeFilter !== 'all') {
      const now = Date.now();
      filtered = filtered.filter(m => {
        if (!m.close_time) return false;
        const diff = new Date(m.close_time).getTime() - now;
        if (diff <= 0) return false;
        const hours = diff / 3600000;
        if (timeFilter === '1h') return hours < 1;
        if (timeFilter === '24h') return hours < 24;
        if (timeFilter === '7d') return hours < 168;
        if (timeFilter === '30d') return hours < 720;
        return true;
      });
    }

    return filtered;
  }

  /* ---- Subcategory Nav ---- */

  function updateSubcategories() {
    const nav = document.getElementById('trading-subcategory-nav');
    if (!nav) return;
    const subs = SUBCATEGORY_MAP[currentCategory] || ['All'];
    nav.innerHTML = subs.map((s, i) =>
      `<button class="subcategory-tab${i === 0 ? ' active' : ''}" data-subcategory="${s.toLowerCase()}">${s}</button>`
    ).join('');
  }

  /* ---- Rendering ---- */

  function renderCards() {
    const grid = document.getElementById('series-cards-grid');
    if (!grid) return;

    const filtered = filterMarkets();
    const limit = displayedCount + CARDS_PER_PAGE;
    const toShow = filtered.slice(0, limit);
    displayedCount = toShow.length;

    grid.innerHTML = '';

    if (toShow.length === 0 && connected) {
      grid.innerHTML = '<div class="no-data" style="grid-column:1/-1;">No markets match your filters</div>';
    }

    toShow.forEach((market, idx) => {
      const card = createSeriesCard(market);
      card.style.animationDelay = (idx * 30) + 'ms';
      grid.appendChild(card);
    });

    const showMoreContainer = document.getElementById('show-more-container');
    if (showMoreContainer) {
      showMoreContainer.style.display = displayedCount < filtered.length ? 'flex' : 'none';
    }
  }

  function createSeriesCard(market) {
    const card = document.createElement('div');
    card.className = 'series-card card-enter';
    card.dataset.ticker = market.ticker;

    const yesPrice = market.yes_bid_dollars || null;
    const noPrice = market.no_bid_dollars || null;
    const lastPrice = market.last_price_dollars || null;
    const volume = market.volume_24h_fp || '0';
    const status = market.status || 'unknown';
    const title = market.yes_sub_title || market.ticker || 'Untitled';
    const closeTime = market.close_time ? new Date(market.close_time) : null;
    const timeRemaining = closeTime ? formatTimeRemaining(closeTime) : '—';
    const chancePercent = yesPrice ? Math.round(parseFloat(yesPrice) * 100) : '—';
    const yesCents = yesPrice ? (parseFloat(yesPrice) * 100).toFixed(0) + '¢' : '—';
    const noCents = noPrice ? (parseFloat(noPrice) * 100).toFixed(0) + '¢' : '—';
    const lastDisplay = lastPrice ? '$' + parseFloat(lastPrice).toFixed(2) : '—';

    card.innerHTML = `
      <div class="series-card-header">
        <span class="series-card-category">${escapeHtml(market.event_ticker || '')}</span>
        <span class="series-card-timer">${escapeHtml(timeRemaining)}</span>
      </div>
      <div class="series-card-title">${escapeHtml(title)}</div>
      <div class="series-card-chart">
        <canvas class="series-card-canvas" width="280" height="60"></canvas>
        <div class="series-card-price-row">
          <span class="series-card-last-price">${escapeHtml(lastDisplay)}</span>
          <span class="series-card-volume">Vol: ${escapeHtml(String(volume))}</span>
        </div>
      </div>
      <div class="series-card-chance">
        <span class="chance-label">Chance</span>
        <span class="chance-value">${escapeHtml(String(chancePercent))}%</span>
      </div>
      <div class="series-card-buttons">
        <button class="yes-button" data-ticker="${escapeAttr(market.ticker)}" data-side="yes">Yes ${escapeHtml(yesCents)}</button>
        <button class="no-button" data-ticker="${escapeAttr(market.ticker)}" data-side="no">No ${escapeHtml(noCents)}</button>
      </div>
      <div class="series-card-status ${status === 'active' ? 'status-active' : 'status-inactive'}">${escapeHtml(status)}</div>
      <button class="expand-button" data-ticker="${escapeAttr(market.ticker)}" title="Expand card">⤢</button>
    `;

    card.querySelector('.expand-button').addEventListener('click', (e) => {
      e.stopPropagation();
      expandCard(market);
    });

    return card;
  }

  /* ---- Expand Card Overlay ---- */

  function expandCard(market) {
    const overlay = document.getElementById('expanded-card-overlay');
    const content = document.getElementById('expanded-card-content');
    if (!overlay || !content) return;

    const title = market.yes_sub_title || market.ticker || 'Untitled';

    content.innerHTML = `
      <div class="expanded-card-header">
        <h3>${escapeHtml(title)}</h3>
        <button class="close-expanded" id="close-expanded">✕</button>
      </div>
      <div class="expanded-card-body">
        <div class="expanded-chart"><canvas id="expanded-chart-canvas" width="600" height="200"></canvas></div>
        <div class="expanded-details">
          <div class="detail-row"><span>Ticker</span><span>${escapeHtml(market.ticker || '')}</span></div>
          <div class="detail-row"><span>Event</span><span>${escapeHtml(market.event_ticker || '')}</span></div>
          <div class="detail-row"><span>Status</span><span>${escapeHtml(market.status || '')}</span></div>
          <div class="detail-row"><span>Last Price</span><span>${escapeHtml(market.last_price_dollars || '—')}</span></div>
          <div class="detail-row"><span>Yes Bid</span><span>${escapeHtml(market.yes_bid_dollars || '—')}</span></div>
          <div class="detail-row"><span>Yes Ask</span><span>${escapeHtml(market.yes_ask_dollars || '—')}</span></div>
          <div class="detail-row"><span>No Bid</span><span>${escapeHtml(market.no_bid_dollars || '—')}</span></div>
          <div class="detail-row"><span>No Ask</span><span>${escapeHtml(market.no_ask_dollars || '—')}</span></div>
          <div class="detail-row"><span>Volume 24h</span><span>${escapeHtml(String(market.volume_24h_fp || '0'))}</span></div>
          <div class="detail-row"><span>Open Interest</span><span>${escapeHtml(String(market.open_interest_fp || '0'))}</span></div>
          <div class="detail-row"><span>Close Time</span><span>${escapeHtml(market.close_time || '—')}</span></div>
        </div>
        <div class="expanded-actions">
          <button class="yes-button large" data-ticker="${escapeAttr(market.ticker)}" data-side="yes">Buy YES</button>
          <button class="no-button large" data-ticker="${escapeAttr(market.ticker)}" data-side="no">Buy NO</button>
        </div>
      </div>
    `;

    overlay.style.display = 'flex';
    document.getElementById('close-expanded').addEventListener('click', () => {
      overlay.style.display = 'none';
    });
  }

  /* ---- Real-time Updates ---- */

  function connectWebSocket() {
    try {
      websocket = new WebSocket('ws://127.0.0.1:8000/api/events');
      websocket.onmessage = (event) => {
        try { handleRealtimeEvent(JSON.parse(event.data)); } catch (_) { /* ignore parse errors */ }
      };
      websocket.onclose = () => {
        setTimeout(() => { if (connected) connectWebSocket(); }, 5000);
      };
      websocket.onerror = () => { /* silent */ };
    } catch (_) { /* WebSocket not available */ }
  }

  function handleRealtimeEvent(event) {
    if (event.type === 'market_update' && event.data) {
      const idx = markets.findIndex(m => m.ticker === event.data.ticker);
      if (idx >= 0) { markets[idx] = { ...markets[idx], ...event.data }; }
      else { markets.push(event.data); }
      renderCards();
    }
    if (event.type === 'approval_request' && event.data) {
      showApprovalOverlay(event.data);
    }
  }

  /* ---- Approval Overlay ---- */

  function showApprovalOverlay(data) {
    const overlay = document.getElementById('approval-overlay');
    if (!overlay) return;
    setText('approval-agent-name', data.agent_name || '');
    setText('approval-ticker', data.ticker || '');
    setText('approval-reasoning', data.reasoning || '');
    setText('approval-details', `Side: ${data.side || '?'}, Price: ${data.price_dollars || '?'}`);
    overlay.style.display = 'flex';
    overlay.dataset.clientOrderId = data.client_order_id || '';
  }

  async function postApprovalDecision(orderId, approved) {
    try {
      await fetch(`${BACKEND_URL}/api/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_order_id: orderId, approved })
      });
    } catch (e) {
      console.warn('Approval post failed:', e);
    }
  }

  /* ---- Helpers ---- */

  function formatTimeRemaining(closeTime) {
    const diff = closeTime - new Date();
    if (diff <= 0) return 'Closed';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) return Math.floor(hours / 24) + 'd';
    if (hours > 0) return hours + 'h ' + minutes + 'm';
    return minutes + 'm';
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return { initialize, onConnected, onDisconnected };
})();
