/* ============================================================
   Paulie's Prediction Partners — Trading Studio Module
   Manages market cards, category filtering, series grouping,
   real-time updates, expanded card overlay, and approval flow.
   Kalshi-style navigation: top category bar + left sidebar.
   ============================================================ */

const TradingStudio = (() => {
  "use strict";

  const BACKEND_URL = "http://127.0.0.1:8000";
  const CARDS_PER_PAGE = 24;

  let markets = [];
  let events = {};
  let seriesData = {};
  let displayedCount = 0;
  let currentCategory = "all";
  let currentSubcategory = "all";
  let connected = false;
  let websocket = null;
  let approvalExpiryTimeout =
    null; /* stores approval overlay auto-close timer */
  let currentSeriesDetail = null; /* series key when in detail view */
  let seriesDetailFreqFilter = "all"; /* frequency filter inside detail view */

  /* Kalshi-style category mapping — matches Kalshi platform top nav.
     Each category maps to Kalshi event categories and keyword matchers. */
  const KALSHI_CATEGORIES = {
    all: { label: "Trending", keywords: [] },
    new: { label: "New", keywords: [] },
    all_markets: { label: "All", keywords: [] },
    politics: {
      label: "Politics",
      keywords: [
        "president",
        "election",
        "congress",
        "senate",
        "governor",
        "political",
        "trump",
        "biden",
        "democrat",
        "republican",
        "vote",
        "gop",
        "party",
      ],
    },
    sports: {
      label: "Sports",
      keywords: [
        "nfl",
        "nba",
        "mlb",
        "nhl",
        "soccer",
        "football",
        "basketball",
        "baseball",
        "sports",
        "tennis",
        "golf",
        "mma",
        "ufc",
        "cricket",
        "boxing",
        "chess",
        "esports",
        "motorsport",
        "olympics",
        "f1",
        "nascar",
        "pga",
        "fifa",
        "epl",
        "league",
        "championship",
        "world cup",
        "super bowl",
      ],
    },
    culture: {
      label: "Culture",
      keywords: [
        "oscar",
        "grammy",
        "emmy",
        "movie",
        "tv",
        "music",
        "entertainment",
        "culture",
        "celebrity",
        "reality",
        "award",
        "box office",
        "streaming",
        "tiktok",
        "youtube",
        "netflix",
      ],
    },
    crypto: {
      label: "Crypto",
      keywords: [
        "btc",
        "bitcoin",
        "eth",
        "ethereum",
        "sol",
        "crypto",
        "kxbtc",
        "kxeth",
        "kxsol",
        "defi",
        "nft",
        "altcoin",
        "solana",
        "blockchain",
      ],
    },
    climate: {
      label: "Climate",
      keywords: [
        "weather",
        "temperature",
        "hurricane",
        "snow",
        "rain",
        "climate",
        "storm",
        "tornado",
        "heat",
        "cold",
        "flood",
        "wildfire",
        "noaa",
      ],
    },
    economics: {
      label: "Economics",
      keywords: [
        "fed",
        "cpi",
        "gdp",
        "unemployment",
        "inflation",
        "interest",
        "jobs",
        "economy",
        "fomc",
        "treasury",
        "rate",
        "payroll",
        "pce",
        "durable",
        "housing",
        "retail",
      ],
    },
    mentions: {
      label: "Mentions",
      keywords: ["mention", "tweet", "social", "media", "viral", "trending"],
    },
    companies: {
      label: "Companies",
      keywords: [
        "apple",
        "google",
        "meta",
        "amazon",
        "tesla",
        "nvidia",
        "microsoft",
        "stock",
        "earnings",
        "ipo",
        "market cap",
        "revenue",
      ],
    },
    financials: {
      label: "Financials",
      keywords: [
        "s&p",
        "dow",
        "nasdaq",
        "bond",
        "yield",
        "forex",
        "oil",
        "gold",
        "commodity",
        "vix",
        "spy",
        "qqq",
        "finance",
      ],
    },
    tech_and_science: {
      label: "Tech & Science",
      keywords: [
        "tech",
        "ai",
        "space",
        "spacex",
        "nasa",
        "vaccine",
        "science",
        "quantum",
        "semiconductor",
        "ev",
        "robot",
        "fda",
        "biotech",
      ],
    },
  };

  /* Kalshi-style subcategories per top-level category.
     These are populated dynamically from live events but we have sensible
     defaults matching Kalshi's known navigation structure. */
  const SUBCATEGORY_MAP = {
    all: [],
    new: [],
    all_markets: [],
    politics: ["US", "Global", "Senate", "House", "Governor"],
    sports: [
      "Soccer",
      "Tennis",
      "Golf",
      "MMA",
      "Cricket",
      "Baseball",
      "Boxing",
      "Chess",
      "Esports",
      "Motorsport",
      "Olympics",
      "NFL",
      "NBA",
      "MLB",
      "NHL",
    ],
    culture: ["Awards", "Box Office", "Music", "Streaming"],
    crypto: ["BTC", "ETH", "SOL", "Other"],
    climate: ["Temperature", "Storms", "Wildfire"],
    economics: ["Fed", "CPI", "Jobs", "GDP"],
    mentions: [],
    companies: ["Tech", "Finance", "Auto", "Energy"],
    financials: ["Indices", "Commodities", "Forex"],
    tech_and_science: ["AI", "Space", "EVs", "Biotech"],
  };

  /* Series display names and icons for section headers */
  const SERIES_DISPLAY = {
    kxbtc: { label: "Bitcoin (BTC)", icon: "₿", priority: 1 },
    kxeth: { label: "Ethereum (ETH)", icon: "⬡", priority: 2 },
    kxsol: { label: "Solana (SOL)", icon: "◎", priority: 3 },
    nfl: { label: "NFL Football", icon: "🏈", priority: 10 },
    nba: { label: "NBA Basketball", icon: "🏀", priority: 11 },
    mlb: { label: "MLB Baseball", icon: "⚾", priority: 12 },
    nhl: { label: "NHL Hockey", icon: "🏒", priority: 13 },
    fed: { label: "Federal Reserve", icon: "🏦", priority: 20 },
    cpi: { label: "CPI Inflation", icon: "📈", priority: 21 },
    gdp: { label: "GDP", icon: "📊", priority: 22 },
  };

  /* Frequency display labels — shared by series detail view and event panels */
  const FREQ_LABELS = {
    "15min": "15 Min",
    "1h": "Hourly",
    "6h": "6 Hour",
    "24h": "Daily",
    "7d": "Weekly",
  };

  /* ---- Initialization ---- */

  function initialize() {
    bindCategoryTabs();
    bindSidebarNav();
    bindFilters();
    bindRefreshButton();
    bindShowMore();
    bindApprovalButtons();
    bindOverlayClose();
    bindBuySellDelegation();

    /* Show trading interface immediately with public data.
       The pre-connect prompt becomes a small inline banner rather than
       blocking the entire interface. */
    const preConnect = document.getElementById("trading-pre-connect");
    const iface = document.getElementById("trading-interface");
    if (preConnect) preConnect.style.display = "none";
    if (iface) iface.style.display = "flex";

    /* Hide account bar until connected (no balance data without API keys) */
    const accountBar = document.getElementById("trading-account-bar");
    if (accountBar) accountBar.style.display = "none";

    /* Fetch public market data from backend with retry polling */
    pollForPublicData();

    /* Listen for public_data_ready events from WebSocket */
    connectPublicWebSocket();
  }

  /* ---- Event Binding ---- */

  function bindCategoryTabs() {
    const nav = document.getElementById("trading-category-nav");
    if (!nav) return;
    nav.addEventListener("click", (e) => {
      const tab = e.target.closest(".ks-cat-tab");
      if (!tab) return;

      /* Close series detail view if open */
      if (currentSeriesDetail) {
        currentSeriesDetail = null;
        const detailView = document.getElementById("series-detail-view");
        const grid = document.getElementById("series-cards-grid");
        const filtersRow = document.querySelector(".trading-filters");
        if (detailView) detailView.style.display = "none";
        if (grid) grid.style.display = "";
        if (filtersRow) filtersRow.style.display = "";
      }

      nav
        .querySelectorAll(".ks-cat-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentCategory = tab.dataset.category;
      currentSubcategory = "all";
      displayedCount = 0;
      updateSidebar();
      renderCards();
    });
  }

  function bindSidebarNav() {
    const nav = document.getElementById("trading-subcategory-nav");
    if (!nav) return;
    nav.addEventListener("click", (e) => {
      const item = e.target.closest(".ks-sidebar-item");
      if (!item) return;

      /* If in series detail view, series-nav items have their own handlers */
      if (item.dataset.seriesNav) return;

      /* Handle expandable items with children */
      if (item.classList.contains("ks-sidebar-parent")) {
        item.classList.toggle("ks-sidebar-expanded");
        return;
      }

      /* Close series detail view if open */
      if (currentSeriesDetail) closeSeriesDetail();

      nav
        .querySelectorAll(".ks-sidebar-item")
        .forEach((t) => t.classList.remove("active"));
      item.classList.add("active");
      currentSubcategory = item.dataset.subcategory;
      displayedCount = 0;
      renderCards();
    });
  }

  function bindFilters() {
    ["filter-volume", "filter-time-to-close", "filter-status"].forEach((id) => {
      const el = document.getElementById(id);
      if (el)
        el.addEventListener("change", () => {
          displayedCount = 0;
          renderCards();
        });
    });

    /* Frequency pill buttons (Kalshi-style) */
    const pillGroup = document.getElementById("freq-pill-group");
    if (pillGroup) {
      pillGroup.addEventListener("click", (e) => {
        const pill = e.target.closest(".ks-freq-pill");
        if (!pill) return;
        pillGroup
          .querySelectorAll(".ks-freq-pill")
          .forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        displayedCount = 0;
        renderCards();
      });
    }
  }

  function bindRefreshButton() {
    const btn = document.getElementById("market-refresh-button");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      btn.classList.add("spin");
      await fetchMarkets();
      setTimeout(() => btn.classList.remove("spin"), 600);
    });
  }

  function bindShowMore() {
    const btn = document.getElementById("show-more-markets");
    if (!btn) return;
    btn.addEventListener("click", () => {
      displayedCount += CARDS_PER_PAGE;
      renderCards();
    });
  }

  function bindApprovalButtons() {
    const approveBtn = document.getElementById("approve-button");
    const denyBtn = document.getElementById("deny-button");
    const overlay = document.getElementById("approval-overlay");

    if (approveBtn) {
      approveBtn.addEventListener("click", () => {
        const orderId = overlay?.dataset.clientOrderId;
        if (orderId) postApprovalDecision(orderId, true);
        if (overlay) overlay.style.display = "none";
      });
    }
    if (denyBtn) {
      denyBtn.addEventListener("click", () => {
        const orderId = overlay?.dataset.clientOrderId;
        if (orderId) postApprovalDecision(orderId, false);
        if (overlay) overlay.style.display = "none";
      });
    }
  }

  function bindOverlayClose() {
    const overlay = document.getElementById("expanded-card-overlay");
    if (!overlay) return;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.style.display = "none";
    });
  }

  /* ---- Connection Lifecycle ---- */

  async function onConnected(environment) {
    connected = true;

    /* Close the public-data WebSocket since the main one takes over */
    if (publicWs) {
      publicWs.onclose = null; /* prevent reconnect */
      publicWs.close();
      publicWs = null;
    }

    const preConnect = document.getElementById("trading-pre-connect");
    const iface = document.getElementById("trading-interface");
    if (preConnect) preConnect.style.display = "none";
    if (iface) {
      iface.style.display = "flex";
      iface.classList.add("trading-init-animation");
      setTimeout(() => iface.classList.remove("trading-init-animation"), 1500);
    }
    /* Refresh with authenticated data (may include private markets) */
    await Promise.all([fetchMarkets(), fetchEvents()]);
    await fetchAccountSummary();
    connectWebSocket();

    /* Update button states to show connected */
    updateConnectionState();

    /* Notify sub-modules */
    if (typeof PositionsPanel !== "undefined") PositionsPanel.onConnected();
    if (typeof AgentDashboard !== "undefined") AgentDashboard.onConnected();

    /* Poll account summary every 10 seconds */
    if (onConnected._accountInterval)
      clearInterval(onConnected._accountInterval);
    onConnected._accountInterval = setInterval(fetchAccountSummary, 10000);
  }

  function onDisconnected() {
    connected = false;
    if (onConnected._accountInterval) {
      clearInterval(onConnected._accountInterval);
      onConnected._accountInterval = null;
    }
    /* Keep the trading interface visible — show markets from public API.
       Only hide account summary data and update button states. */
    const accountBar = document.getElementById("trading-account-bar");
    if (accountBar) accountBar.style.display = "none";
    updateConnectionState();

    if (websocket) {
      websocket.close();
      websocket = null;
    }

    /* Re-fetch public data so cards remain populated */
    fetchPublicData();

    if (typeof PositionsPanel !== "undefined") PositionsPanel.onDisconnected();
    if (typeof AgentDashboard !== "undefined") AgentDashboard.onDisconnected();
  }

  /* ---- Data Fetching ---- */

  async function fetchMarkets() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/state/markets`);
      if (!response.ok) return;
      const data = await response.json();
      /* Backend returns {ticker: marketObj, …} — convert to array */
      markets = Array.isArray(data) ? data : Object.values(data);
      displayedCount = 0;
      renderCards();
    } catch (e) {
      console.warn("Failed to fetch markets:", e);
    }
  }

  async function fetchEvents() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/state/events`);
      if (!response.ok) return;
      const data = await response.json();
      events = data || {};
      /* Build dynamic sidebar from event categories */
      updateSidebar();
    } catch (e) {
      console.warn("Failed to fetch events:", e);
    }
  }

  async function fetchPublicData() {
    /* Fetch markets and events from the backend's state cache which is
       populated from Kalshi's public (unauthenticated) API on startup. */
    await Promise.all([fetchMarkets(), fetchEvents(), fetchSeries()]);
  }

  async function fetchSeries() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/state/series`);
      if (!response.ok) return;
      const data = await response.json();
      seriesData = data || {};
    } catch (e) {
      console.warn("Failed to fetch series:", e);
    }
  }

  let _publicDataPollTimer = null;
  let _publicDataPollAttempts = 0;
  const _MAX_POLL_ATTEMPTS = 20;
  const _POLL_BASE_DELAY_MS = 3000;
  const _POLL_BACKOFF_MULTIPLIER = 1.2;
  const _MAX_POLL_DELAY_MS = 15000;

  function pollForPublicData() {
    if (_publicDataPollTimer) clearTimeout(_publicDataPollTimer);
    _publicDataPollAttempts = 0;
    _tryFetchPublicData();
  }

  async function _tryFetchPublicData() {
    _publicDataPollAttempts++;
    await fetchPublicData();

    /* If we got markets, stop polling */
    if (markets.length > 0) {
      _publicDataPollTimer = null;
      return;
    }

    /* Retry with increasing delay up to max attempts */
    if (_publicDataPollAttempts < _MAX_POLL_ATTEMPTS) {
      const delay = Math.min(
        _POLL_BASE_DELAY_MS *
          Math.pow(_POLL_BACKOFF_MULTIPLIER, _publicDataPollAttempts - 1),
        _MAX_POLL_DELAY_MS,
      );
      _publicDataPollTimer = setTimeout(_tryFetchPublicData, delay);
    }
  }

  function updateConnectionState() {
    /* Update UI elements to reflect connection status.
       When not connected, buy/sell buttons show "Connect to Trade". */
    const accountBar = document.getElementById("trading-account-bar");
    if (accountBar) {
      accountBar.style.display = connected ? "flex" : "none";
    }

    /* Update all action buttons based on connection state */
    document
      .querySelectorAll(".ks-action-btn, .yes-button, .no-button")
      .forEach((btn) => {
        if (!connected && !btn.disabled) {
          btn.dataset.needsConnection = "true";
        } else {
          delete btn.dataset.needsConnection;
        }
      });
  }

  /* ---- Filtering ---- */

  /* ---- Category Matching Helper ---- */

  /* Maps our navigation categories to Kalshi event category substrings */
  const CATEGORY_MATCH_RULES = {
    politics: ["politic"],
    sports: ["sport"],
    culture: ["cultur", "entertain"],
    crypto: ["crypto"],
    climate: ["climat", "weather"],
    economics: ["econom"],
    mentions: ["mention"],
    companies: ["compan"],
    financials: ["financ"],
    tech_and_science: ["tech", "scienc"],
  };

  function categoryMatchesLabel(category, label) {
    const lower = label.toLowerCase();
    const rules = CATEGORY_MATCH_RULES[category];
    if (!rules) return false;
    return rules.some((r) => lower.includes(r));
  }

  function matchesCategory(market, category) {
    /* Check event category from live data first */
    const eventTicker = market.event_ticker || "";
    const eventData = events[eventTicker];
    if (
      eventData &&
      eventData.category &&
      categoryMatchesLabel(category, eventData.category)
    ) {
      return true;
    }

    /* Market-level category (added in schema) */
    const marketCategory = market.category || "";
    if (marketCategory && categoryMatchesLabel(category, marketCategory)) {
      return true;
    }

    /* Fallback: keyword matching on tickers/titles */
    const ticker = (market.ticker || "").toLowerCase();
    const event = (market.event_ticker || "").toLowerCase();
    const title = (market.yes_sub_title || "").toLowerCase();
    const combined = ticker + " " + event + " " + title;
    const catConfig = KALSHI_CATEGORIES[category];
    if (!catConfig) return false;
    const keywords = catConfig.keywords || [];
    return keywords.some((k) => combined.includes(k));
  }

  function detectFrequency(market) {
    const ticker = (market.ticker || "").toLowerCase();
    const title = (market.yes_sub_title || "").toLowerCase();
    const series = (
      market.series_ticker ||
      market.event_ticker ||
      ""
    ).toLowerCase();
    const combined = ticker + " " + title + " " + series;

    if (
      combined.includes("15min") ||
      combined.includes("15m") ||
      combined.includes("15-min")
    )
      return "15min";
    if (
      combined.includes("1hr") ||
      combined.includes("1h") ||
      combined.includes("hourly") ||
      combined.includes("1-hour")
    )
      return "1h";
    if (
      combined.includes("6hr") ||
      combined.includes("6h") ||
      combined.includes("6-hour")
    )
      return "6h";
    if (
      combined.includes("24hr") ||
      combined.includes("24h") ||
      combined.includes("daily") ||
      combined.includes("1-day")
    )
      return "24h";
    if (
      combined.includes("weekly") ||
      combined.includes("1-week") ||
      combined.includes("7-day")
    )
      return "7d";
    return "other";
  }

  function filterMarkets() {
    let filtered = [...markets];

    /* "all" = trending (sort by volume), "new" = sort by creation,
       "all_markets" = no category filter */
    if (currentCategory === "new") {
      filtered.sort((a, b) => {
        const ta = a.created_time ? new Date(a.created_time).getTime() : 0;
        const tb = b.created_time ? new Date(b.created_time).getTime() : 0;
        return tb - ta;
      });
    } else if (currentCategory === "all" || currentCategory === "all_markets") {
      /* "all" = trending — sort by volume descending */
      if (currentCategory === "all") {
        filtered.sort((a, b) => {
          return (
            (parseFloat(b.volume_24h_fp) || 0) -
            (parseFloat(a.volume_24h_fp) || 0)
          );
        });
      }
    } else {
      /* Category filter */
      filtered = filtered.filter((m) => matchesCategory(m, currentCategory));
    }

    /* Subcategory filter */
    if (currentSubcategory !== "all") {
      const sub = currentSubcategory.toLowerCase();
      filtered = filtered.filter((m) => {
        const ticker = (m.ticker || "").toLowerCase();
        const event = (m.event_ticker || "").toLowerCase();
        return ticker.includes(sub) || event.includes(sub);
      });
    }

    /* Volume filter */
    const volumeFilter = document.getElementById("filter-volume")?.value;
    if (volumeFilter && volumeFilter !== "all") {
      filtered = filtered.filter((m) => {
        const vol = parseFloat(m.volume_24h_fp) || 0;
        if (volumeFilter === "high") return vol >= 10000;
        if (volumeFilter === "medium") return vol >= 1000 && vol < 10000;
        if (volumeFilter === "low") return vol < 1000;
        return true;
      });
    }

    /* Frequency filter (pill buttons) */
    const activePill = document.querySelector(
      "#freq-pill-group .ks-freq-pill.active",
    );
    const freqFilter = activePill ? activePill.dataset.freq : "all";
    if (freqFilter && freqFilter !== "all") {
      filtered = filtered.filter((m) => detectFrequency(m) === freqFilter);
    }

    /* Time-to-close filter */
    const timeFilter = document.getElementById("filter-time-to-close")?.value;
    if (timeFilter && timeFilter !== "all") {
      const now = Date.now();
      filtered = filtered.filter((m) => {
        if (!m.close_time) return false;
        const diff = new Date(m.close_time).getTime() - now;
        if (diff <= 0) return timeFilter === "closed";
        const hours = diff / 3600000;
        if (timeFilter === "1h") return hours < 1;
        if (timeFilter === "24h") return hours < 24;
        if (timeFilter === "7d") return hours < 168;
        if (timeFilter === "30d") return hours < 720;
        return true;
      });
    }

    /* Status filter */
    const statusFilter = document.getElementById("filter-status")?.value;
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((m) => {
        const status = (m.status || "").toLowerCase();
        if (statusFilter === "active")
          return status === "active" || status === "open";
        if (statusFilter === "closed")
          return (
            status === "closed" ||
            status === "finalized" ||
            status === "settled"
          );
        return true;
      });
    }

    return filtered;
  }

  /* ---- Group markets by series ---- */

  function groupBySeries(marketList) {
    const groups = new Map();
    marketList.forEach((market) => {
      const seriesKey = market.series_ticker || market.event_ticker || "other";
      if (!groups.has(seriesKey)) groups.set(seriesKey, []);
      groups.get(seriesKey).push(market);
    });

    /* Sort groups: known series first (by priority), then alphabetically */
    const sorted = [...groups.entries()].sort((a, b) => {
      const keyA = a[0].toLowerCase();
      const keyB = b[0].toLowerCase();
      const prioA = getSeriesPriority(keyA);
      const prioB = getSeriesPriority(keyB);
      if (prioA !== prioB) return prioA - prioB;
      return keyA.localeCompare(keyB);
    });

    return sorted;
  }

  function getSeriesPriority(seriesKey) {
    const lower = seriesKey.toLowerCase();
    for (const [key, info] of Object.entries(SERIES_DISPLAY)) {
      if (lower.includes(key)) return info.priority;
    }
    return 99;
  }

  function getSeriesDisplay(seriesKey) {
    const lower = seriesKey.toLowerCase();
    for (const [key, info] of Object.entries(SERIES_DISPLAY)) {
      if (lower.includes(key)) return info;
    }
    return { label: seriesKey, icon: "📋", priority: 99 };
  }

  /* ---- Sidebar Nav ---- */

  function updateSidebar() {
    const nav = document.getElementById("trading-subcategory-nav");
    const sidebar = document.getElementById("trading-subcategory-sidebar");
    if (!nav) return;

    /* Determine subcategories to display */
    const subs = buildSubcategoriesFromEvents(currentCategory);
    const staticSubs = SUBCATEGORY_MAP[currentCategory] || [];

    /* Merge: live event data + static defaults, deduplicated */
    const allSubs = [...new Set([...subs, ...staticSubs])];

    if (allSubs.length === 0) {
      /* No subcategories for this category — hide sidebar */
      if (sidebar) sidebar.classList.add("ks-sidebar-hidden");
      nav.innerHTML = "";
      return;
    }

    if (sidebar) sidebar.classList.remove("ks-sidebar-hidden");

    nav.innerHTML = allSubs
      .map(
        (s) =>
          `<button class="ks-sidebar-item${currentSubcategory === s.toLowerCase() ? " active" : ""}" data-subcategory="${s.toLowerCase()}">${escapeHtml(s)}</button>`,
      )
      .join("");
  }

  function buildSubcategoriesFromEvents(category) {
    /* Derive subcategories from live event data for the selected category */
    const subcats = new Set();

    Object.values(events).forEach((evt) => {
      const evtCategory = evt.category || "";
      const matches = categoryMatchesLabel(category, evtCategory);

      if (matches && evt.sub_title) {
        /* Extract a short label from the event sub_title or series_ticker */
        const label = deriveSubcategoryLabel(evt);
        if (label) subcats.add(label);
      }
    });

    return [...subcats].sort();
  }

  /* Known series patterns — module-level constant for performance */
  const KNOWN_SERIES_MAP = {
    NFL: "NFL",
    NBA: "NBA",
    MLB: "MLB",
    NHL: "NHL",
    KXBTC: "BTC",
    KXETH: "ETH",
    KXSOL: "SOL",
  };

  function deriveSubcategoryLabel(evt) {
    /* Try to extract a meaningful subcategory label from event metadata */
    const seriesTicker = (evt.series_ticker || "").toUpperCase();
    const title = evt.title || evt.sub_title || "";

    for (const [key, label] of Object.entries(KNOWN_SERIES_MAP)) {
      if (seriesTicker.includes(key)) return label;
    }

    /* Extract first meaningful word from title */
    const words = title.split(/\s+/).filter((w) => w.length > 2);
    if (words.length > 0) return words[0];
    return null;
  }

  /* ---- Rendering (Kalshi-style series panels) ---- */

  /* How many outcome rows to show per series panel before "More markets" */
  const INITIAL_ROWS_PER_SERIES = 3;

  /* Track which series are expanded (showing all rows) */
  const expandedSeries = new Set();

  function renderCards() {
    const grid = document.getElementById("series-cards-grid");
    if (!grid) return;

    const filtered = filterMarkets();

    if (filtered.length === 0) {
      if (markets.length === 0) {
        /* Show skeleton loading panels that match Kalshi's layout */
        grid.innerHTML = Array(6)
          .fill(null)
          .map(
            () => `
            <div class="ks-series-panel ks-skeleton-panel">
                <div class="ks-panel-header">
                    <div class="ks-panel-header-left">
                        <span class="ks-skeleton-circle"></span>
                        <div class="ks-panel-title-group">
                            <span class="ks-skeleton-line" style="width:60px;height:10px"></span>
                            <span class="ks-skeleton-line" style="width:180px;height:14px"></span>
                        </div>
                    </div>
                </div>
                <div class="ks-panel-chart" style="padding:8px 14px">
                    <div class="ks-skeleton-line" style="width:100%;height:60px;border-radius:4px"></div>
                </div>
                <div class="ks-outcome-table" style="padding:4px 14px 8px">
                    <div class="ks-skeleton-line" style="width:100%;height:32px;margin-bottom:6px;border-radius:4px"></div>
                    <div class="ks-skeleton-line" style="width:100%;height:32px;margin-bottom:6px;border-radius:4px"></div>
                    <div class="ks-skeleton-line" style="width:100%;height:32px;border-radius:4px"></div>
                </div>
                <div class="ks-panel-footer" style="padding:6px 14px">
                    <span class="ks-skeleton-line" style="width:120px;height:10px"></span>
                </div>
            </div>
        `,
          )
          .join("");
      } else {
        grid.innerHTML =
          '<div class="no-markets-message" style="grid-column:1/-1;">No markets match your current filters</div>';
      }
      const showMoreContainer = document.getElementById("show-more-container");
      if (showMoreContainer) showMoreContainer.style.display = "none";
      return;
    }

    /* Group by series for Kalshi-style panels */
    const groups = groupBySeries(filtered);

    /* Calculate how many total series to show */
    const seriesLimit = Math.max(
      CARDS_PER_PAGE,
      displayedCount + CARDS_PER_PAGE,
    );
    let seriesRendered = 0;

    grid.innerHTML = "";

    groups.forEach(([seriesKey, seriesMarkets]) => {
      if (seriesRendered >= seriesLimit) return;

      const panel = createSeriesPanel(seriesKey, seriesMarkets);
      grid.appendChild(panel);
      seriesRendered++;
    });

    displayedCount = seriesRendered;

    const showMoreContainer = document.getElementById("show-more-container");
    if (showMoreContainer) {
      showMoreContainer.style.display =
        seriesRendered < groups.length ? "flex" : "none";
    }
  }

  /* ---- Create a Kalshi-style series panel ---- */

  function createSeriesPanel(seriesKey, seriesMarkets) {
    const panel = document.createElement("div");
    panel.className = "ks-series-panel card-enter";
    panel.dataset.series = seriesKey;

    const seriesDisplay = getSeriesDisplay(seriesKey);
    const isExpanded = expandedSeries.has(seriesKey);
    const rowLimit = isExpanded
      ? seriesMarkets.length
      : INITIAL_ROWS_PER_SERIES;
    const visibleMarkets = seriesMarkets.slice(0, rowLimit);
    const hasMore = seriesMarkets.length > INITIAL_ROWS_PER_SERIES;

    /* Representative market for the series chart */
    const repMarket = seriesMarkets[0];

    /* Build title from event data, then series data, then ticker */
    let seriesTitle = seriesDisplay.label;

    /* Try event title first (most accurate for Kalshi-style display) */
    const eventData = events[repMarket.event_ticker];
    if (eventData && eventData.title) {
      seriesTitle = eventData.title;
    } else if (repMarket.yes_sub_title) {
      seriesTitle = deriveSeriesTitle(repMarket);
    }

    /* Try series data for even better context */
    const seriesInfo =
      seriesData[seriesKey] || seriesData[repMarket.series_ticker];
    if (seriesInfo && seriesInfo.title && !eventData) {
      seriesTitle = seriesInfo.title;
    }

    /* Category breadcrumb */
    const catBreadcrumb = deriveCategoryBreadcrumb(seriesKey);

    /* Build close time from representative market (Kalshi shows this at panel bottom) */
    const closeTimeStr = repMarket.close_time
      ? formatEventCloseTime(new Date(repMarket.close_time))
      : "";

    panel.innerHTML = `
      <div class="ks-panel-header">
        <div class="ks-panel-header-left">
          <span class="ks-panel-icon">${seriesDisplay.icon}</span>
          <div class="ks-panel-title-group">
            <span class="ks-panel-breadcrumb">${escapeHtml(catBreadcrumb)}</span>
            <span class="ks-panel-title">${escapeHtml(seriesTitle)}</span>
          </div>
        </div>
        <div class="ks-panel-header-right">
          <span class="ks-panel-market-count">${seriesMarkets.length} market${seriesMarkets.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div class="ks-panel-chart">
        <canvas class="ks-panel-canvas" width="600" height="80"></canvas>
      </div>
      <div class="ks-outcome-table">
        <div class="ks-outcome-header-row">
          <span class="ks-outcome-header-cell ks-outcome-cell-desc">Chance</span>
          <span class="ks-outcome-header-cell ks-outcome-cell-chance"></span>
          <span class="ks-outcome-header-cell ks-outcome-cell-actions"></span>
        </div>
        ${visibleMarkets.map((m) => buildOutcomeRow(m)).join("")}
      </div>
      <div class="ks-panel-footer">
        ${closeTimeStr ? `<span class="ks-panel-close-time">${escapeHtml(closeTimeStr)}</span>` : ""}
        <span class="ks-panel-footer-spacer"></span>
        ${seriesMarkets.length > 1 ? `<span class="ks-panel-spread-total">Spread and Total ▾</span>` : ""}
      </div>
      ${
        hasMore
          ? `<button class="ks-more-markets-btn" data-series="${escapeAttr(seriesKey)}">${
              isExpanded
                ? "Show fewer"
                : `More markets (${seriesMarkets.length - INITIAL_ROWS_PER_SERIES})`
            }</button>`
          : ""
      }
    `;

    /* Draw sparkline on the panel canvas */
    const canvas = panel.querySelector(".ks-panel-canvas");
    if (canvas) drawMiniSparkline(canvas, repMarket);

    /* Bind "More markets" toggle */
    const moreBtn = panel.querySelector(".ks-more-markets-btn");
    if (moreBtn) {
      moreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (expandedSeries.has(seriesKey)) {
          expandedSeries.delete(seriesKey);
        } else {
          expandedSeries.add(seriesKey);
        }
        renderCards();
      });
    }

    /* Bind outcome row expand clicks */
    panel.querySelectorAll(".ks-outcome-row").forEach((row) => {
      row.addEventListener("click", (e) => {
        if (e.target.closest("button")) return; /* let buy buttons handle */
        const ticker = row.dataset.ticker;
        const market = seriesMarkets.find((m) => m.ticker === ticker);
        if (market) expandCard(market);
      });
    });

    /* Bind series panel header click → open series detail view */
    const header = panel.querySelector(".ks-panel-header");
    if (header) {
      header.style.cursor = "pointer";
      header.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        openSeriesDetail(seriesKey);
      });
    }

    return panel;
  }

  /* ---- Build an outcome row (one per market within a series) ---- */

  function buildOutcomeRow(market) {
    const isClosed = isMarketClosed(market);
    const title = market.yes_sub_title || market.ticker || "Untitled";
    const yesPrice = market.yes_bid_dollars || null;
    const noPrice = market.no_bid_dollars || null;
    const chancePercent = yesPrice
      ? Math.round(parseFloat(yesPrice) * 100)
      : null;
    const yesCents = yesPrice
      ? (parseFloat(yesPrice) * 100).toFixed(0) + "¢"
      : "—";
    const noCents = noPrice
      ? (parseFloat(noPrice) * 100).toFixed(0) + "¢"
      : "—";

    /* Kalshi uses green pill for high certainty, outlined for moderate */
    let chanceClass = "ks-chance-badge";
    if (chancePercent !== null) {
      if (chancePercent >= 90 || chancePercent <= 10) {
        chanceClass += " ks-chance-badge--strong";
      }
    }

    const closeTime = market.close_time ? new Date(market.close_time) : null;
    const timeRemaining = closeTime ? formatTimeRemaining(closeTime) : "";
    const isClosingSoon =
      closeTime && closeTime - Date.now() < 3600000 && !isClosed;
    const timerClass = isClosingSoon
      ? "ks-outcome-timer ks-outcome-timer--urgent"
      : "ks-outcome-timer";
    const freqBadge = renderFrequencyBadge(market);

    /* Format chance display like Kalshi: "<1%" or ">99%" */
    let chanceDisplay = "—";
    if (chancePercent !== null) {
      if (chancePercent <= 0) chanceDisplay = "<1%";
      else if (chancePercent < 1) chanceDisplay = "<1%";
      else if (chancePercent >= 100) chanceDisplay = ">99%";
      else if (chancePercent > 99) chanceDisplay = ">99%";
      else chanceDisplay = chancePercent + "%";
    }

    return `
      <div class="ks-outcome-row${isClosed ? " ks-outcome-row--closed" : ""}" data-ticker="${escapeAttr(market.ticker)}">
        <div class="ks-outcome-cell-desc">
          <span class="ks-outcome-title">${escapeHtml(title)}</span>
          ${timeRemaining ? `<span class="${timerClass}">${escapeHtml(timeRemaining)}</span>` : ""}
          ${freqBadge}
        </div>
        <div class="ks-outcome-cell-chance">
          <span class="${chanceClass}">${chanceDisplay}</span>
        </div>
        <div class="ks-outcome-cell-actions">
          <button class="yes-button ks-action-btn${!connected ? " ks-needs-connection" : ""}" data-ticker="${escapeAttr(market.ticker)}" data-side="yes" ${isClosed ? "disabled" : ""}>Yes ${escapeHtml(yesCents)}</button>
          <button class="no-button ks-action-btn${!connected ? " ks-needs-connection" : ""}" data-ticker="${escapeAttr(market.ticker)}" data-side="no" ${isClosed ? "disabled" : ""}>No ${escapeHtml(noCents)}</button>
        </div>
      </div>
    `;
  }

  /* ---- Series title derivation ---- */

  /* Pattern that matches price/percentage thresholds like "$87,500 or above" or "50% or below" */
  const THRESHOLD_PATTERN =
    /(\$[\d,.]+|\d+(\.\d+)?%?) or (above|below|more|less)/gi;

  function deriveSeriesTitle(market) {
    /* Kalshi titles look like "Bitcoin price today at 8am EST?"
       We try to derive a meaningful series-level title from the first market */
    const eventTicker = market.event_ticker || "";
    const subtitle = market.yes_sub_title || "";

    /* Strip price/percentage thresholds to get the base question */
    const baseTitle = subtitle
      .replace(THRESHOLD_PATTERN, "")
      .replace(/^\s*(—|-)\s*/, "")
      .trim();

    if (baseTitle.length > 10) return baseTitle;

    /* Fallback to event ticker in human form */
    return eventTicker
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function deriveCategoryBreadcrumb(seriesKey) {
    const lower = seriesKey.toLowerCase();

    /* Check event data first for accurate category */
    for (const market of markets) {
      if (
        (market.series_ticker || "").toLowerCase() === lower ||
        (market.event_ticker || "").toLowerCase() === lower
      ) {
        const eventData = events[market.event_ticker];
        if (eventData && eventData.category) {
          return eventData.category;
        }
      }
    }

    if (
      lower.includes("btc") ||
      lower.includes("eth") ||
      lower.includes("sol") ||
      lower.includes("crypto")
    )
      return "Crypto";
    if (
      lower.includes("nfl") ||
      lower.includes("nba") ||
      lower.includes("mlb") ||
      lower.includes("nhl") ||
      lower.includes("soccer") ||
      lower.includes("tennis") ||
      lower.includes("golf") ||
      lower.includes("mma") ||
      lower.includes("ufc")
    )
      return "Sports";
    if (lower.includes("fed") || lower.includes("cpi") || lower.includes("gdp"))
      return "Economics";
    if (lower.includes("temp") || lower.includes("weather")) return "Climate";
    if (
      lower.includes("elect") ||
      lower.includes("president") ||
      lower.includes("congress")
    )
      return "Politics";
    return "Markets";
  }

  /* ---- Potential Returns Calculator ---- */

  function calcPotentialReturn(priceDollars, notional) {
    const price = parseFloat(priceDollars);
    if (!price || price <= 0 || price > 0.99) return null;
    /* If we invest $notional and win: payout = notional / price */
    const payout = notional / price;
    const profit = payout - notional;
    return { payout: payout.toFixed(0), profit: profit.toFixed(0) };
  }

  function renderPotentialReturns(market) {
    const notional = 100; /* $100 base calculation */
    const yesReturn = market.yes_ask_dollars
      ? calcPotentialReturn(market.yes_ask_dollars, notional)
      : null;
    const noReturn = market.no_ask_dollars
      ? calcPotentialReturn(market.no_ask_dollars, notional)
      : null;

    if (!yesReturn && !noReturn) return "";

    const yesStr = yesReturn ? `+$${yesReturn.profit}` : "—";
    const noStr = noReturn ? `+$${noReturn.profit}` : "—";

    return `
      <div class="series-card-returns">
        <span class="returns-label">$${notional} wins →</span>
        <span class="returns-yes" title="YES potential profit on $${notional}">${escapeHtml(yesStr)}</span>
        <span class="returns-sep">/</span>
        <span class="returns-no" title="NO potential profit on $${notional}">${escapeHtml(noStr)}</span>
      </div>
    `;
  }

  /* ---- Frequency Badge ---- */

  function renderFrequencyBadge(market) {
    const freq = detectFrequency(market);
    if (freq === "other") return "";
    const labels = {
      "15min": "15m",
      "1h": "1hr",
      "6h": "6hr",
      "24h": "24hr",
      "7d": "7d",
    };
    return `<span class="series-card-freq-badge">${escapeHtml(labels[freq] || freq)}</span>`;
  }

  /* ---- Series Card Creation ---- */

  function createSeriesCard(market) {
    const card = document.createElement("div");
    const isClosed = isMarketClosed(market);
    card.className = `series-card card-enter${isClosed ? " series-card--closed" : ""}`;
    card.dataset.ticker = market.ticker;

    const yesPrice = market.yes_bid_dollars || null;
    const noPrice = market.no_bid_dollars || null;
    const lastPrice = market.last_price_dollars || null;
    const volume = formatVolume(market.volume_24h_fp || "0");
    const status = market.status || "unknown";
    const title = market.yes_sub_title || market.ticker || "Untitled";
    const closeTime = market.close_time ? new Date(market.close_time) : null;
    const timeRemaining = closeTime ? formatTimeRemaining(closeTime) : "—";
    const isClosingSoon =
      closeTime && closeTime - Date.now() < 3600000 && !isClosed;
    const chancePercent = yesPrice
      ? Math.round(parseFloat(yesPrice) * 100)
      : null;
    const yesCents = yesPrice
      ? (parseFloat(yesPrice) * 100).toFixed(0) + "¢"
      : "—";
    const noCents = noPrice
      ? (parseFloat(noPrice) * 100).toFixed(0) + "¢"
      : "—";

    const timerClass = isClosingSoon
      ? "series-card-timer series-card-timer--urgent"
      : "series-card-timer";
    const chanceColor =
      chancePercent !== null
        ? chancePercent > 60
          ? "var(--color-state-success)"
          : chancePercent < 40
            ? "var(--color-state-error)"
            : "var(--color-accent-primary)"
        : "";

    card.innerHTML = `
      <div class="series-card-header">
        <span class="series-card-category">${escapeHtml(market.event_ticker || "")}</span>
        <div style="display:flex;align-items:center;gap:3px">
          ${renderFrequencyBadge(market)}
          <span class="${timerClass}">${escapeHtml(timeRemaining)}</span>
        </div>
      </div>
      <div class="series-card-title">${escapeHtml(title)}</div>
      <div class="series-card-chart">
        <canvas class="series-card-canvas" width="280" height="52"></canvas>
        <div class="series-card-price-row">
          <span class="series-card-volume">Vol: ${escapeHtml(String(volume))}</span>
          <span class="series-card-oi">OI: ${escapeHtml(formatVolume(market.open_interest_fp || "0"))}</span>
        </div>
      </div>
      <div class="series-card-chance">
        <span class="chance-label">Chance</span>
        <span class="chance-value" style="color:${chanceColor}">${chancePercent !== null ? chancePercent + "%" : "—"}</span>
        <div class="chance-bar">
          <div class="chance-bar__fill" style="width:${chancePercent !== null ? chancePercent : 50}%;background:${chanceColor || "var(--color-accent-primary)"}"></div>
        </div>
      </div>
      ${renderPotentialReturns(market)}
      <div class="series-card-buttons">
        <button class="yes-button${isClosed ? " disabled" : ""}" data-ticker="${escapeAttr(market.ticker)}" data-side="yes" ${isClosed ? "disabled" : ""}>Yes ${escapeHtml(yesCents)}</button>
        <button class="no-button${isClosed ? " disabled" : ""}" data-ticker="${escapeAttr(market.ticker)}" data-side="no" ${isClosed ? "disabled" : ""}>No ${escapeHtml(noCents)}</button>
      </div>
      ${isClosed ? '<div class="series-card-closed-overlay"><span>CLOSED</span></div>' : ""}
      <button class="expand-button" data-ticker="${escapeAttr(market.ticker)}" title="Expand card">⤢</button>
    `;

    card.querySelector(".expand-button").addEventListener("click", (e) => {
      e.stopPropagation();
      expandCard(market);
    });

    /* Render mini sparkline on the card canvas */
    const miniCanvas = card.querySelector(".series-card-canvas");
    if (miniCanvas) {
      drawMiniSparkline(miniCanvas, market);
    }

    return card;
  }

  function isMarketClosed(market) {
    const status = (market.status || "").toLowerCase();
    if (status === "closed" || status === "finalized" || status === "settled")
      return true;
    if (market.close_time) {
      return new Date(market.close_time).getTime() < Date.now();
    }
    return false;
  }

  function formatVolume(value) {
    const num = parseFloat(value) || 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return String(Math.round(num));
  }

  /* ---- Mini Sparkline for Series Cards ---- */

  function drawMiniSparkline(canvas, market) {
    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);

    /* Generate a plausible price curve from the market's current price */
    const currentPrice = parseFloat(
      market.last_price_dollars || market.yes_bid_dollars || "0.50",
    );
    const dataPoints = 30;
    const prices = [];
    let price = currentPrice * (0.85 + Math.random() * 0.15);

    for (let i = 0; i < dataPoints; i++) {
      const drift = (currentPrice - price) * 0.08;
      const noise = (Math.random() - 0.5) * 0.04;
      price = Math.max(0.01, Math.min(0.99, price + drift + noise));
      prices.push(price);
    }
    /* Ensure last point matches current price */
    prices[prices.length - 1] = currentPrice;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 0.01;
    const padding = 4;

    const computedStyle = getComputedStyle(document.documentElement);
    const successColor =
      computedStyle.getPropertyValue("--color-state-success").trim() ||
      "#22c55e";
    const errorColor =
      computedStyle.getPropertyValue("--color-state-error").trim() ||
      computedStyle.getPropertyValue("--color-state-danger").trim() ||
      "#ef4444";
    const isUpTrend = prices[prices.length - 1] >= prices[0];
    const lineColor = isUpTrend ? successColor : errorColor;

    /* Draw line */
    context.beginPath();
    context.lineWidth = 1.5;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.strokeStyle = lineColor;

    prices.forEach((pricePoint, index) => {
      const x = padding + (index / (dataPoints - 1)) * (width - padding * 2);
      const y =
        padding +
        (1 - (pricePoint - minPrice) / priceRange) * (height - padding * 2);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();

    /* Draw gradient fill */
    const lastX = padding + (width - padding * 2);
    const gradient = context.createLinearGradient(
      0,
      padding,
      0,
      height - padding,
    );
    gradient.addColorStop(0, lineColor + "30");
    gradient.addColorStop(1, lineColor + "05");

    context.lineTo(lastX, height - padding);
    context.lineTo(padding, height - padding);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();
  }

  /* ---- Expand Card Overlay ---- */

  function expandCard(market) {
    const overlay = document.getElementById("expanded-card-overlay");
    const content = document.getElementById("expanded-card-content");
    if (!overlay || !content) return;

    const title = market.yes_sub_title || market.ticker || "Untitled";
    const isClosed = isMarketClosed(market);

    const yesAsk = market.yes_ask_dollars
      ? `${(parseFloat(market.yes_ask_dollars) * 100).toFixed(0)}¢`
      : "—";
    const noBid = market.no_bid_dollars
      ? `${(parseFloat(market.no_bid_dollars) * 100).toFixed(0)}¢`
      : "—";
    const yesReturn = market.yes_ask_dollars
      ? calcPotentialReturn(market.yes_ask_dollars, 100)
      : null;
    const noReturn = market.no_ask_dollars
      ? calcPotentialReturn(market.no_ask_dollars, 100)
      : null;

    content.innerHTML = `
      <div class="expanded-card-header">
        <div>
          <h3 style="margin:0;font-size:14px;line-height:1.3">${escapeHtml(title)}</h3>
          <div style="font-size:10px;opacity:0.6;margin-top:2px">${escapeHtml(market.ticker || "")}</div>
        </div>
        <button class="close-expanded" id="close-expanded" aria-label="Close expanded card">✕</button>
      </div>
      <div class="expanded-card-body">
        <div class="expanded-chart">
          <canvas id="expanded-chart-canvas" width="600" height="160"></canvas>
        </div>
        <div class="expanded-two-col">
          <div class="expanded-details">
            <div class="detail-section-title">Market Info</div>
            <div class="detail-row"><span>Event</span><span>${escapeHtml(market.event_ticker || "—")}</span></div>
            <div class="detail-row"><span>Series</span><span>${escapeHtml(market.series_ticker || "—")}</span></div>
            <div class="detail-row"><span>Status</span><span class="${isMarketClosed(market) ? "status-inactive" : "status-active"}">${escapeHtml(market.status || "—")}</span></div>
            <div class="detail-row"><span>Closes</span><span>${market.close_time ? new Date(market.close_time).toLocaleString() : "—"}</span></div>
            <div class="detail-row"><span>Volume 24h</span><span>${escapeHtml(formatVolume(market.volume_24h_fp || "0"))}</span></div>
            <div class="detail-row"><span>Open Interest</span><span>${escapeHtml(formatVolume(market.open_interest_fp || "0"))}</span></div>
          </div>
          <div class="expanded-orderbook">
            <div class="detail-section-title">Order Book</div>
            <div class="orderbook-row yes">
              <span class="ob-side">YES</span>
              <span class="ob-bid">Bid: ${escapeHtml(market.yes_bid_dollars ? (parseFloat(market.yes_bid_dollars) * 100).toFixed(0) + "¢" : "—")}</span>
              <span class="ob-ask">Ask: ${escapeHtml(yesAsk)}</span>
            </div>
            <div class="orderbook-row no">
              <span class="ob-side">NO</span>
              <span class="ob-bid">Bid: ${escapeHtml(noBid)}</span>
              <span class="ob-ask">Ask: ${escapeHtml(market.no_ask_dollars ? (parseFloat(market.no_ask_dollars) * 100).toFixed(0) + "¢" : "—")}</span>
            </div>
            ${
              yesReturn || noReturn
                ? `
            <div class="detail-section-title" style="margin-top:8px">Potential Returns (per $100)</div>
            ${yesReturn ? `<div class="detail-row"><span>YES wins</span><span class="text-success">+$${yesReturn.profit} ($${yesReturn.payout} total)</span></div>` : ""}
            ${noReturn ? `<div class="detail-row"><span>NO wins</span><span class="text-success">+$${noReturn.profit} ($${noReturn.payout} total)</span></div>` : ""}
            `
                : ""
            }
            <div class="detail-row"><span>Last Price</span><span>${escapeHtml(market.last_price_dollars ? "$" + parseFloat(market.last_price_dollars).toFixed(2) : "—")}</span></div>
          </div>
        </div>
        <div class="expanded-order-row">
          <label class="expanded-qty-label" for="expanded-order-qty">Contracts</label>
          <input
            id="expanded-order-qty"
            class="expanded-qty-input"
            type="number"
            min="1"
            max="100"
            step="1"
            value="1"
            ${isClosed ? "disabled" : ""}
            aria-label="Number of contracts to order"
          />
        </div>
        <div class="expanded-actions">
          <button class="yes-button large${!connected ? " ks-needs-connection" : ""}" data-ticker="${escapeAttr(market.ticker)}" data-side="yes" ${isClosed ? "disabled" : ""}>
            ${connected ? "Buy YES " + yesAsk : "🔒 Connect to Buy YES"}
          </button>
          <button class="no-button large${!connected ? " ks-needs-connection" : ""}" data-ticker="${escapeAttr(market.ticker)}" data-side="no" ${isClosed ? "disabled" : ""}>
            ${connected ? "Buy NO " + noBid : "🔒 Connect to Buy NO"}
          </button>
        </div>
        ${isClosed ? '<div class="expanded-closed-notice">⚠ This market is closed. Orders cannot be placed.</div>' : ""}
        ${!connected && !isClosed ? '<div class="expanded-closed-notice" style="color:var(--color-accent-primary)">🔑 Connect your Kalshi API keys in the bottom bar to place trades</div>' : ""}
      </div>
    `;

    overlay.style.display = "flex";
    document.getElementById("close-expanded").addEventListener("click", () => {
      overlay.style.display = "none";
    });

    /* Draw expanded sparkline */
    requestAnimationFrame(() => {
      const expandedCanvas = document.getElementById("expanded-chart-canvas");
      if (expandedCanvas) drawExpandedChart(expandedCanvas, market);
    });
  }

  function drawExpandedChart(canvas, market) {
    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);

    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue("--color-bg-canvas").trim();
    const gridColor = computedStyle
      .getPropertyValue("--color-border-muted")
      .trim();
    const successColor =
      computedStyle.getPropertyValue("--color-state-success").trim() ||
      "#22c55e";
    const errorColor =
      computedStyle.getPropertyValue("--color-state-error").trim() ||
      computedStyle.getPropertyValue("--color-state-danger").trim() ||
      "#ef4444";

    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

    /* Draw grid lines */
    context.strokeStyle = gridColor;
    context.lineWidth = 0.5;
    context.setLineDash([3, 4]);
    [0.25, 0.5, 0.75].forEach((fraction) => {
      const y = fraction * height;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    });
    context.setLineDash([]);

    /* Generate price series */
    const currentPrice = parseFloat(
      market.last_price_dollars || market.yes_bid_dollars || "0.50",
    );
    const dataPoints = 60;
    const prices = [];
    let price = currentPrice * (0.8 + Math.random() * 0.2);

    for (let i = 0; i < dataPoints; i++) {
      const drift = (currentPrice - price) * 0.06;
      const noise = (Math.random() - 0.5) * 0.03;
      price = Math.max(0.01, Math.min(0.99, price + drift + noise));
      prices.push(price);
    }
    prices[prices.length - 1] = currentPrice;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 0.01;
    const padding = 8;
    const isUpTrend = prices[prices.length - 1] >= prices[0];
    const lineColor = isUpTrend ? successColor : errorColor;

    /* Draw line */
    context.beginPath();
    context.lineWidth = 2;
    context.lineJoin = "round";
    context.strokeStyle = lineColor;

    prices.forEach((pricePoint, index) => {
      const x = padding + (index / (dataPoints - 1)) * (width - padding * 2);
      const y =
        padding +
        (1 - (pricePoint - minPrice) / priceRange) * (height - padding * 2);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();

    /* Fill */
    const gradient = context.createLinearGradient(
      0,
      padding,
      0,
      height - padding,
    );
    gradient.addColorStop(0, lineColor + "40");
    gradient.addColorStop(1, lineColor + "05");
    context.lineTo(width - padding, height - padding);
    context.lineTo(padding, height - padding);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();

    /* Current price label */
    context.fillStyle = lineColor;
    context.font = "bold 11px monospace";
    context.fillText(`${(currentPrice * 100).toFixed(0)}¢`, width - 32, 14);
  }

  /* ---- Real-time Updates ---- */

  function connectWebSocket() {
    try {
      websocket = new WebSocket("ws://127.0.0.1:8000/api/events");
      websocket.onmessage = (event) => {
        try {
          handleRealtimeEvent(JSON.parse(event.data));
        } catch (_) {
          /* ignore parse errors */
        }
      };
      websocket.onclose = () => {
        setTimeout(() => {
          if (connected) connectWebSocket();
        }, 5000);
      };
      websocket.onerror = () => {
        /* silent */
      };
    } catch (_) {
      /* WebSocket not available */
    }
  }

  let publicWs = null;
  let publicWsRetryDelay = 5000;

  function connectPublicWebSocket() {
    /* Lightweight WebSocket that listens for public_data_ready events
       so the Trading Studio auto-refreshes when the backend finishes
       fetching public Kalshi data. */
    if (connected) return; /* Main WS handles everything when connected */
    try {
      publicWs = new WebSocket(
        BACKEND_URL.replace(/^http/, "ws") + "/api/events",
      );
      publicWs.onopen = () => {
        publicWsRetryDelay = 5000; /* Reset backoff on successful connect */
      };
      publicWs.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "public_data_ready") {
            fetchPublicData();
          }
          /* Handle agent activity events for semi-auto/full-auto display */
          if (msg.type === "agent_analysis" && msg.data) {
            showAgentActivity(msg.data);
          }
        } catch (_) {
          /* ignore parse errors */
        }
      };
      publicWs.onclose = () => {
        /* Reconnect with exponential backoff (max 60s) */
        setTimeout(() => {
          if (!connected) connectPublicWebSocket();
        }, publicWsRetryDelay);
        publicWsRetryDelay = Math.min(publicWsRetryDelay * 1.5, 60000);
      };
      publicWs.onerror = () => {
        /* silent — backend may not be running yet, retry on close */
      };
    } catch (_) {
      /* WebSocket not available */
    }
  }

  function handleRealtimeEvent(event) {
    if (event.type === "market_update" && event.data) {
      const idx = markets.findIndex((m) => m.ticker === event.data.ticker);
      if (idx >= 0) {
        markets[idx] = { ...markets[idx], ...event.data };
      } else {
        markets.push(event.data);
      }
      renderCards();
    }
    if (event.type === "approval_request" && event.data) {
      showApprovalOverlay(event.data);
    }
    if (event.type === "fill" && event.data) {
      showToast(
        `Fill: ${event.data.data?.ticker || "unknown"} — ${event.data.data?.side || ""}`,
        "success",
      );
      /* Full-auto: flash the buy/sell button on the card */
      flashTradeActivity(event.data);
      fetchAccountSummary();
      if (typeof PositionsPanel !== "undefined")
        PositionsPanel.onFill(event.data);
    }
    if (event.type === "manual_order" && event.data) {
      fetchAccountSummary();
    }
    if (event.type === "trading_enabled" || event.type === "trading_disabled") {
      fetchAccountSummary();
    }
    if (event.type === "agent_analysis" && event.data) {
      showAgentActivity(event.data);
    }
    if (typeof AgentDashboard !== "undefined") AgentDashboard.onEvent(event);
  }

  /* ---- Agent Activity Display (Semi-Auto & Full-Auto) ---- */

  function showAgentActivity(data) {
    /* In semi-auto mode, agents analyze markets and display their analysis
       around the yes/no contracts. This shows bot analysis on relevant cards. */
    const ticker = data.ticker || "";
    const agentName = data.agent_name || "Agent";
    const side = (data.side || "").toUpperCase();
    const reasoning = data.reasoning || "";

    /* Find the outcome row for this ticker and show agent analysis indicator */
    const row = document.querySelector(
      `.ks-outcome-row[data-ticker="${ticker}"]`,
    );
    if (!row) return;

    /* Remove any existing agent badge */
    const existing = row.querySelector(".ks-agent-badge");
    if (existing) existing.remove();

    const badge = document.createElement("span");
    badge.className = "ks-agent-badge";
    badge.title = `${agentName}: ${reasoning}`;
    badge.textContent = `🤖 ${agentName} → ${side}`;

    const descCell = row.querySelector(".ks-outcome-cell-desc");
    if (descCell) descCell.appendChild(badge);

    /* Auto-remove after 10 seconds */
    setTimeout(() => badge.remove(), 10000);
  }

  function flashTradeActivity(data) {
    /* In full-auto mode, briefly flash buy/sell activity on the relevant card
       to show what is being traded by the autonomous agents. */
    const ticker = data.data?.ticker || data.ticker || "";
    const side = (data.data?.side || data.side || "").toLowerCase();

    const row = document.querySelector(
      `.ks-outcome-row[data-ticker="${ticker}"]`,
    );
    if (!row) return;

    /* Flash the appropriate button */
    const btnSelector = side === "yes" ? ".yes-button" : ".no-button";
    const btn = row.querySelector(btnSelector);
    if (!btn) return;

    btn.classList.add("ks-trade-flash");
    setTimeout(() => btn.classList.remove("ks-trade-flash"), 1500);
  }

  /* ---- Approval Overlay ---- */

  function showApprovalOverlay(data) {
    const overlay = document.getElementById("approval-overlay");
    if (!overlay) return;

    /* Build richer approval display */
    const agentName = data.agent_name || "Agent";
    const ticker = data.ticker || "—";
    const side = (data.side || "?").toUpperCase();
    const price = data.price_dollars
      ? `${(parseFloat(data.price_dollars) * 100).toFixed(0)}¢`
      : "?";
    const reasoning = data.reasoning || "No reasoning provided";

    /* Set a 60-second auto-expiry timer (no countdown shown per PRD) */
    if (approvalExpiryTimeout) clearTimeout(approvalExpiryTimeout);
    approvalExpiryTimeout = setTimeout(() => {
      if (overlay.style.display !== "none") {
        overlay.style.display = "none";
        showToast(`Approval request for ${ticker} expired`, "info");
      }
    }, 60000);

    setText("approval-agent-name", agentName);
    setText("approval-ticker", ticker);
    setText("approval-reasoning", reasoning);
    setText("approval-details", `${side} @ ${price}`);
    overlay.style.display = "flex";
    overlay.dataset.clientOrderId = data.client_order_id || "";
  }

  async function postApprovalDecision(orderId, approved) {
    const action = approved ? "approve" : "deny";
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/approvals/${encodeURIComponent(orderId)}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!response.ok) {
        showToast(`Approval ${action} failed (${response.status})`, "error");
        return;
      }
      showToast(
        `Trade ${approved ? "approved ✓" : "denied ✕"}: ${orderId}`,
        approved ? "success" : "info",
      );
    } catch (e) {
      showToast("Approval post failed — backend not reachable", "error");
    }
  }

  /* ---- Buy/Sell Button Delegation ---- */

  function bindBuySellDelegation() {
    /* Delegate clicks on .yes-button / .no-button anywhere in the trading studio */
    const tradingSection = document.getElementById("studio-trading");
    if (!tradingSection) return;
    tradingSection.addEventListener("click", (e) => {
      const button = e.target.closest(
        ".yes-button[data-ticker], .no-button[data-ticker]",
      );
      if (!button || button.disabled) return;
      e.stopPropagation();
      const ticker = button.dataset.ticker;
      const side = button.dataset.side;
      if (ticker && side) {
        handleManualOrder(ticker, side);
      }
    });
  }

  async function handleManualOrder(ticker, side) {
    if (!connected) {
      showToast("Connect your Kalshi API keys to place trades", "info");
      return;
    }
    const market = markets.find((m) => m.ticker === ticker);
    if (!market) {
      showToast("Market not found", "error");
      return;
    }

    /* Read order quantity from expanded-card input (defaults to 1) */
    const qtyInput = document.getElementById("expanded-order-qty");
    const rawQty = qtyInput ? parseFloat(qtyInput.value) : 1;
    if (!Number.isInteger(rawQty) || rawQty < 1 || rawQty > 100) {
      showToast("Quantity must be a whole number between 1 and 100", "error");
      return;
    }
    const countFp = rawQty.toFixed(2);

    const priceDollars =
      side === "yes"
        ? market.yes_ask_dollars || market.yes_bid_dollars || ""
        : market.no_ask_dollars || market.no_bid_dollars || "";

    if (!priceDollars) {
      showToast("Price data unavailable — cannot place order", "error");
      return;
    }

    const priceNum = parseFloat(priceDollars);
    /* Kalshi contracts are priced $0.01–$0.99 (exclusive 0 and 1) */
    if (isNaN(priceNum) || priceNum <= 0 || priceNum > 0.99) {
      showToast("Invalid price data from backend", "error");
      return;
    }

    showToast(
      `Submitting ${side.toUpperCase()} ×${rawQty} order for ${ticker}…`,
      "info",
    );

    try {
      const response = await fetch(`${BACKEND_URL}/api/trading/manual-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: ticker,
          side: side,
          action: "buy",
          count_fp: countFp,
          price_dollars: priceDollars,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        showToast(
          errorData.detail || `Order failed (${response.status})`,
          "error",
        );
        return;
      }
      showToast(
        `✓ Order submitted: ${side.toUpperCase()} ×${rawQty} on ${ticker}`,
        "success",
      );
    } catch (networkError) {
      showToast("Backend not reachable — cannot place orders", "error");
    }
  }

  /* ---- Account Summary ---- */

  async function fetchAccountSummary() {
    try {
      const [balanceResponse, tradingResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/api/state/balance`).catch(() => null),
        fetch(`${BACKEND_URL}/api/trading/status`).catch(() => null),
      ]);

      if (balanceResponse && balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        const balanceElement = document.getElementById(
          "account-balance-display",
        );
        const portfolioElement = document.getElementById(
          "portfolio-value-display",
        );
        if (balanceElement && balanceData.balance !== undefined) {
          const balanceValue = parseFloat(balanceData.balance);
          balanceElement.textContent = isNaN(balanceValue)
            ? "—"
            : "$" + balanceValue.toFixed(2);
        }
        if (portfolioElement && balanceData.portfolio_value !== undefined) {
          const portfolioValue = parseFloat(balanceData.portfolio_value);
          portfolioElement.textContent = isNaN(portfolioValue)
            ? "—"
            : "$" + portfolioValue.toFixed(2);
        }
      }

      if (tradingResponse && tradingResponse.ok) {
        const tradingData = await tradingResponse.json();
        const pnlElement = document.getElementById("daily-pnl-display");
        if (pnlElement && tradingData.daily_pnl !== undefined) {
          const pnl = parseFloat(tradingData.daily_pnl);
          if (isNaN(pnl)) {
            pnlElement.textContent = "—";
          } else {
            const sign = pnl >= 0 ? "+" : "";
            pnlElement.textContent = sign + "$" + pnl.toFixed(2);
            pnlElement.style.color =
              pnl >= 0
                ? "var(--color-state-success)"
                : "var(--color-state-error, var(--color-state-danger))";
          }
        }

        /* Update circuit breaker indicator */
        const cbEl = document.getElementById("circuit-breaker-status");
        if (cbEl) {
          cbEl.textContent = tradingData.circuit_breaker_open
            ? "⚡ CIRCUIT OPEN"
            : "";
          cbEl.style.color = tradingData.circuit_breaker_open
            ? "var(--color-state-error)"
            : "";
        }
      }
    } catch (error) {
      /* Silently fail — backend may not be reachable */
    }
  }

  /* ---- Toast Notification System ---- */

  function showToast(message, type) {
    let container = document.getElementById("trading-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "trading-toast-container";
      container.style.cssText =
        "position:fixed;top:12px;right:12px;z-index:9999;display:flex;flex-direction:column;gap:6px;pointer-events:none;";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const colorMap = {
      success: "var(--color-state-success)",
      error: "var(--color-state-error)",
      info: "var(--color-state-info)",
    };
    const borderColor = colorMap[type] || colorMap.info;
    toast.style.cssText = `
      padding:8px 16px;
      font-size:12px;
      font-family:var(--font-family-mono, monospace);
      background:var(--color-bg-surface, #1f2937);
      color:var(--color-fg-default, #fff);
      border:1px solid ${borderColor};
      border-left:3px solid ${borderColor};
      border-radius:6px;
      box-shadow:0 4px 12px rgba(0,0,0,0.3);
      pointer-events:auto;
      opacity:0;
      transform:translateX(20px);
      transition:opacity 0.3s ease, transform 0.3s ease;
      max-width:360px;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    /* Animate in */
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(0)";
    });

    /* Auto-remove after 4 seconds */
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(20px)";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ============================================================
     Series Detail View — Kalshi-style drill-down into a series
     Shows all events/markets for a given series_ticker, grouped
     by event, with breadcrumb navigation and related-series sidebar.
     ============================================================ */

  function openSeriesDetail(seriesKey) {
    currentSeriesDetail = seriesKey;
    seriesDetailFreqFilter = "all";

    const grid = document.getElementById("series-cards-grid");
    const detailView = document.getElementById("series-detail-view");
    const showMore = document.getElementById("show-more-container");
    const filtersRow = document.querySelector(".trading-filters");
    if (!detailView) return;

    /* Hide grid, show detail view */
    if (grid) grid.style.display = "none";
    if (showMore) showMore.style.display = "none";
    if (filtersRow) filtersRow.style.display = "none";
    detailView.style.display = "flex";

    renderSeriesDetail();
    updateSeriesDetailSidebar();
  }

  function closeSeriesDetail() {
    currentSeriesDetail = null;

    const grid = document.getElementById("series-cards-grid");
    const detailView = document.getElementById("series-detail-view");
    const filtersRow = document.querySelector(".trading-filters");
    if (grid) grid.style.display = "";
    if (detailView) detailView.style.display = "none";
    if (filtersRow) filtersRow.style.display = "";

    /* Restore sidebar to category subcategories */
    updateSidebar();
    renderCards();
  }

  function renderSeriesDetail() {
    if (!currentSeriesDetail) return;

    const seriesKey = currentSeriesDetail;
    const seriesDisplay = getSeriesDisplay(seriesKey);
    const catBreadcrumb = deriveCategoryBreadcrumb(seriesKey);

    /* Collect all markets belonging to this series */
    const seriesMarkets = markets.filter((m) => {
      const st = (m.series_ticker || m.event_ticker || "").toLowerCase();
      return st === seriesKey.toLowerCase();
    });

    /* -- Breadcrumb -- */
    const breadcrumbEl = document.getElementById("series-detail-breadcrumb");
    if (breadcrumbEl) {
      breadcrumbEl.innerHTML = `
        <button class="ks-detail-back-btn" id="series-detail-back" aria-label="Back to market grid">
          ← Back
        </button>
        <span class="ks-detail-crumb">${escapeHtml(catBreadcrumb)}</span>
        <span class="ks-detail-crumb-sep">›</span>
        <span class="ks-detail-crumb-current">${escapeHtml(seriesDisplay.label)}</span>
      `;
      document
        .getElementById("series-detail-back")
        .addEventListener("click", closeSeriesDetail);
    }

    /* -- Header with series icon, title, and stats -- */
    const headerEl = document.getElementById("series-detail-header");
    if (headerEl) {
      const totalVolume = seriesMarkets.reduce(
        (sum, m) => sum + (parseFloat(m.volume_24h_fp) || 0),
        0,
      );
      const activeCount = seriesMarkets.filter(
        (m) => !isMarketClosed(m),
      ).length;
      const eventCount = new Set(seriesMarkets.map((m) => m.event_ticker)).size;

      headerEl.innerHTML = `
        <div class="ks-detail-hero">
          <span class="ks-detail-icon">${seriesDisplay.icon}</span>
          <div class="ks-detail-hero-text">
            <h2 class="ks-detail-title">${escapeHtml(seriesDisplay.label)}</h2>
            <span class="ks-detail-subtitle">${escapeHtml(seriesKey.toUpperCase())} · ${eventCount} event${eventCount !== 1 ? "s" : ""} · ${activeCount} active market${activeCount !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div class="ks-detail-stats">
          <div class="ks-detail-stat">
            <span class="ks-detail-stat-label">Markets</span>
            <span class="ks-detail-stat-value">${seriesMarkets.length}</span>
          </div>
          <div class="ks-detail-stat">
            <span class="ks-detail-stat-label">24h Volume</span>
            <span class="ks-detail-stat-value">${formatVolume(String(totalVolume))}</span>
          </div>
          <div class="ks-detail-stat">
            <span class="ks-detail-stat-label">Active</span>
            <span class="ks-detail-stat-value">${activeCount}</span>
          </div>
        </div>
      `;
    }

    /* -- Frequency filter pills for series detail -- */
    const filtersEl = document.getElementById("series-detail-filters");
    if (filtersEl) {
      const frequencies = detectSeriesFrequencies(seriesMarkets);
      filtersEl.innerHTML = `
        <div class="ks-freq-pills">
          <button class="ks-freq-pill${seriesDetailFreqFilter === "all" ? " active" : ""}" data-detail-freq="all">All</button>
          ${frequencies.map((f) => `<button class="ks-freq-pill${seriesDetailFreqFilter === f.key ? " active" : ""}" data-detail-freq="${escapeAttr(f.key)}">${escapeHtml(f.label)}</button>`).join("")}
        </div>
        <span class="ks-detail-market-count">${seriesMarkets.length} total market${seriesMarkets.length !== 1 ? "s" : ""}</span>
      `;
      filtersEl.querySelectorAll(".ks-freq-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          seriesDetailFreqFilter = pill.dataset.detailFreq;
          renderSeriesDetail();
        });
      });
    }

    /* -- Event groups (grouped by event_ticker, sorted by close time) -- */
    const eventsEl = document.getElementById("series-detail-events");
    if (!eventsEl) return;

    /* Apply frequency filter */
    let filteredMarkets = seriesMarkets;
    if (seriesDetailFreqFilter !== "all") {
      filteredMarkets = seriesMarkets.filter(
        (m) => detectFrequency(m) === seriesDetailFreqFilter,
      );
    }

    /* Group by event_ticker */
    const eventGroups = new Map();
    filteredMarkets.forEach((m) => {
      const ek = m.event_ticker || "unknown";
      if (!eventGroups.has(ek)) eventGroups.set(ek, []);
      eventGroups.get(ek).push(m);
    });

    /* Sort events: open events first (by close time ascending), then closed */
    const sortedGroups = [...eventGroups.entries()].sort((a, b) => {
      const aClose = a[1][0].close_time
        ? new Date(a[1][0].close_time).getTime()
        : Infinity;
      const bClose = b[1][0].close_time
        ? new Date(b[1][0].close_time).getTime()
        : Infinity;
      const aClosed = aClose < Date.now();
      const bClosed = bClose < Date.now();
      if (aClosed !== bClosed) return aClosed ? 1 : -1;
      return aClose - bClose;
    });

    if (sortedGroups.length === 0) {
      eventsEl.innerHTML = `
        <div class="ks-detail-empty">No markets match the selected frequency filter.</div>
      `;
      return;
    }

    eventsEl.innerHTML = "";
    sortedGroups.forEach(([eventTicker, eventMarkets]) => {
      const eventPanel = buildSeriesEventPanel(eventTicker, eventMarkets);
      eventsEl.appendChild(eventPanel);
    });
  }

  function buildSeriesEventPanel(eventTicker, eventMarkets) {
    const panel = document.createElement("div");
    panel.className = "ks-detail-event-panel";

    const eventData = events[eventTicker];
    const eventTitle = eventData?.title || eventTicker.replace(/-/g, " ");
    const repMarket = eventMarkets[0];
    const closeTime = repMarket.close_time
      ? new Date(repMarket.close_time)
      : null;
    const isClosed = closeTime && closeTime.getTime() < Date.now();
    const closeStr = closeTime ? formatEventCloseTime(closeTime) : "";
    const freq = detectFrequency(repMarket);
    const freqLabel = FREQ_LABELS[freq] || "";
    const timeRemaining = closeTime ? formatTimeRemaining(closeTime) : "";

    panel.innerHTML = `
      <div class="ks-detail-event-header${isClosed ? " ks-detail-event-header--closed" : ""}">
        <div class="ks-detail-event-title-row">
          <span class="ks-detail-event-title">${escapeHtml(eventTitle)}</span>
          ${freqLabel ? `<span class="series-card-freq-badge">${escapeHtml(freqLabel)}</span>` : ""}
        </div>
        <div class="ks-detail-event-meta">
          ${closeStr ? `<span class="ks-detail-event-close">${escapeHtml(closeStr)}</span>` : ""}
          ${timeRemaining ? `<span class="ks-detail-event-remaining">${escapeHtml(timeRemaining)}</span>` : ""}
          ${isClosed ? '<span class="ks-detail-event-status--closed">Closed</span>' : '<span class="ks-detail-event-status--open">Open</span>'}
        </div>
      </div>
      <div class="ks-outcome-table">
        <div class="ks-outcome-header-row">
          <span class="ks-outcome-header-cell ks-outcome-cell-desc">Outcome</span>
          <span class="ks-outcome-header-cell ks-outcome-cell-chance">Chance</span>
          <span class="ks-outcome-header-cell ks-outcome-cell-actions"></span>
        </div>
        ${eventMarkets.map((m) => buildOutcomeRow(m)).join("")}
      </div>
    `;

    /* Bind outcome row clicks */
    panel.querySelectorAll(".ks-outcome-row").forEach((row) => {
      row.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        const ticker = row.dataset.ticker;
        const market = eventMarkets.find((m) => m.ticker === ticker);
        if (market) expandCard(market);
      });
    });

    return panel;
  }

  function detectSeriesFrequencies(seriesMarkets) {
    const found = new Set();
    seriesMarkets.forEach((m) => {
      const f = detectFrequency(m);
      if (f !== "other") found.add(f);
    });
    return Object.entries(FREQ_LABELS)
      .map(([key, label]) => ({ key, label }))
      .filter((f) => found.has(f.key));
  }

  function updateSeriesDetailSidebar() {
    const nav = document.getElementById("trading-subcategory-nav");
    const sidebar = document.getElementById("trading-subcategory-sidebar");
    if (!nav || !currentSeriesDetail) return;

    /* Show related series in the same category */
    const catBreadcrumb = deriveCategoryBreadcrumb(currentSeriesDetail);

    /* Collect all unique series tickers from markets in same category */
    const relatedSeries = new Map();
    markets.forEach((m) => {
      const st = m.series_ticker || m.event_ticker || "";
      if (!st) return;
      const mCat = deriveCategoryBreadcrumb(st);
      if (mCat.toLowerCase() === catBreadcrumb.toLowerCase()) {
        if (!relatedSeries.has(st)) {
          const display = getSeriesDisplay(st);
          relatedSeries.set(st, {
            key: st,
            label: display.label,
            icon: display.icon,
            priority: display.priority,
          });
        }
      }
    });

    const sortedRelated = [...relatedSeries.values()].sort(
      (a, b) => a.priority - b.priority,
    );

    if (sidebar) sidebar.classList.remove("ks-sidebar-hidden");

    nav.innerHTML = sortedRelated
      .map(
        (s) =>
          `<button class="ks-sidebar-item${s.key.toLowerCase() === currentSeriesDetail.toLowerCase() ? " active" : ""}" data-series-nav="${escapeAttr(s.key)}">${s.icon} ${escapeHtml(s.label)}</button>`,
      )
      .join("");

    /* Bind clicks to navigate between related series */
    nav.querySelectorAll("[data-series-nav]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openSeriesDetail(btn.dataset.seriesNav);
      });
    });
  }

  /* ---- Utility Functions ---- */

  function formatTimeRemaining(closeTime) {
    const diff = closeTime - new Date();
    if (diff <= 0) return "Closed";
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 24 * 7) return Math.floor(hours / 24) + "d";
    if (hours > 24) return Math.floor(hours / 24) + "d " + (hours % 24) + "h";
    if (hours > 0) return hours + "h " + minutes + "m";
    return minutes + "m";
  }

  function formatEventCloseTime(date) {
    /* Kalshi-style close time: "Jan 25 @ 5:30am EST" */
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    const tzAbbr = new Date()
      .toLocaleTimeString("en-us", { timeZoneName: "short" })
      .split(" ")
      .pop();
    return `${month} ${day} @ ${hours}:${minutes}${ampm} ${tzAbbr}`;
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  return { initialize, onConnected, onDisconnected, fetchPublicData };
})();
