/* ============================================================
   Paulie's Prediction Partners — Trading Studio Module
   Manages market cards, category filtering, Kalshi-style layout,
   real-time updates, and approval flow.
   ============================================================ */

const TradingStudio = (() => {
  "use strict";

  const BACKEND_URL = "http://127.0.0.1:8000";
  const CARDS_PER_PAGE = 24;

  let markets = [];
  let events = {};
  let displayedCount = 0;
  let currentCategory = "all";
  let currentSubcategory = "all";
  let currentSort = "volume";
  let currentFrequency = "all";
  let currentStatus = "active";
  let filtersCollapsed = false;
  let connected = false;
  let websocket = null;
  let approvalExpiryTimeout =
    null; /* stores approval overlay auto-close timer */

  /* Kalshi-style category mapping — matches Kalshi platform top nav.
     Each category maps to Kalshi event categories and keyword matchers. */
  const KALSHI_CATEGORIES = {
    all: { label: "All", keywords: [] },
    new: { label: "New", keywords: [] },
    all_markets: { label: "Trending", keywords: [] },
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

  /* Frequency display labels */
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
    bindPillRow();
    bindFilterBar();
    bindRefreshButton();
    bindLoadMore();
    bindApprovalButtons();
    bindBuySellDelegation();
    renderPillRow();
    updateFilterLabels();

    /* Show trading interface immediately with public data.
       The pre-connect prompt becomes a small inline banner rather than
       blocking the entire interface. */
    const preConnect = document.getElementById("trading-pre-connect");
    const iface = document.getElementById("trading-interface");
    if (preConnect) preConnect.style.display = "none";
    if (iface) iface.style.display = "flex";

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
      const tab = e.target.closest(".ts-cat-btn");
      if (!tab) return;

      nav
        .querySelectorAll(".ts-cat-btn")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentCategory = tab.dataset.category;
      currentSubcategory = "all";
      displayedCount = 0;
      renderPillRow();
      renderCards();
    });
  }

  function bindPillRow() {
    const row = document.getElementById("trading-pill-row");
    if (!row) return;
    row.addEventListener("click", (e) => {
      const pill = e.target.closest(".ts-pill");
      if (!pill) return;
      const action = pill.dataset.action;
      if (action === "toggle-filters") {
        toggleFilterBar();
        return;
      }
      const subcategory = pill.dataset.subcategory;
      if (!subcategory) return;
      currentSubcategory = subcategory;
      displayedCount = 0;
      renderPillRow();
      renderCards();
    });
  }

  function bindFilterBar() {
    const bar = document.getElementById("trading-filter-bar");
    if (!bar) return;

    bar.addEventListener("click", (e) => {
      const item = e.target.closest(".ts-dropdown-item");
      if (item) {
        const dropdown = item.closest(".ts-dropdown");
        if (!dropdown) return;
        const filterType = dropdown.dataset.filter;
        const value = item.dataset.value;
        if (filterType === "sort") currentSort = value;
        if (filterType === "frequency") currentFrequency = value;
        if (filterType === "status") currentStatus = value;
        displayedCount = 0;
        updateFilterLabels();
        closeAllDropdowns();
        renderCards();
        return;
      }

      const btn = e.target.closest(".ts-dropdown-btn");
      if (btn) {
        const dropdown = btn.closest(".ts-dropdown");
        if (!dropdown) return;
        const alreadyOpen = dropdown.classList.contains("open");
        closeAllDropdowns();
        if (!alreadyOpen) dropdown.classList.add("open");
      }
    });

    document.addEventListener("click", (e) => {
      if (!bar.contains(e.target)) closeAllDropdowns();
    });
  }

  function closeAllDropdowns() {
    document.querySelectorAll(".ts-dropdown.open").forEach((dropdown) => {
      dropdown.classList.remove("open");
    });
  }

  function updateFilterLabels() {
    const sortLabel = currentSort === "volume" ? "Volume" : "Closing soon";
    const freqLabel =
      currentFrequency === "all"
        ? "Frequency"
        : FREQ_LABELS[currentFrequency] || currentFrequency;
    const statusLabel =
      currentStatus === "active"
        ? "Open markets"
        : currentStatus === "closed"
          ? "Closed markets"
          : "All markets";

    const sortBtn = document.querySelector('[data-dropdown="sort"]');
    const freqBtn = document.querySelector('[data-dropdown="frequency"]');
    const statusBtn = document.querySelector('[data-dropdown="status"]');

    if (sortBtn) sortBtn.textContent = sortLabel;
    if (freqBtn) freqBtn.textContent = freqLabel;
    if (statusBtn) statusBtn.textContent = statusLabel;

    setDropdownActive("sort", currentSort);
    setDropdownActive("frequency", currentFrequency);
    setDropdownActive("status", currentStatus);
  }

  function setDropdownActive(filterType, value) {
    document
      .querySelectorAll(
        `.ts-dropdown[data-filter="${filterType}"] .ts-dropdown-item`,
      )
      .forEach((item) => {
        item.classList.toggle("active", item.dataset.value === value);
      });
  }

  function toggleFilterBar() {
    const bar = document.getElementById("trading-filter-bar");
    if (!bar) return;
    filtersCollapsed = !filtersCollapsed;
    bar.classList.toggle("is-collapsed", filtersCollapsed);
  }

  function bindRefreshButton() {
    const btn = document.getElementById("market-refresh-button");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      btn.classList.add("ts-spin");
      await fetchPublicData();
      setTimeout(() => btn.classList.remove("ts-spin"), 600);
    });
  }

  function bindLoadMore() {
    const main = document.getElementById("trading-main");
    if (!main) return;
    main.addEventListener("click", (e) => {
      const btn = e.target.closest("#trading-load-more");
      if (!btn) return;
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

    const rawQty = 1;
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
      /* Build dynamic pill row from event categories */
      renderPillRow();
      renderCards();
    } catch (e) {
      console.warn("Failed to fetch events:", e);
    }
  }

  async function fetchPublicData() {
    /* Fetch markets and events from the backend's state cache which is
       populated from Kalshi's public (unauthenticated) API on startup. */
    await Promise.all([fetchMarkets(), fetchEvents()]);
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
    /* Update all action buttons based on connection state */
    document
      .querySelectorAll(".yes-button, .no-button")
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
    const lower = (label || "").toLowerCase();
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

    /* Category filter (except All/New) */
    if (
      currentCategory !== "all" &&
      currentCategory !== "all_markets" &&
      currentCategory !== "new"
    ) {
      filtered = filtered.filter((m) => matchesCategory(m, currentCategory));
    }

    /* Subcategory filter */
    if (currentSubcategory !== "all") {
      const sub = currentSubcategory.toLowerCase();
      filtered = filtered.filter((m) => {
        const ticker = (m.ticker || "").toLowerCase();
        const event = (m.event_ticker || "").toLowerCase();
        const title = (m.yes_sub_title || "").toLowerCase();
        return (
          ticker.includes(sub) || event.includes(sub) || title.includes(sub)
        );
      });
    }

    /* Frequency filter */
    if (currentFrequency && currentFrequency !== "all") {
      filtered = filtered.filter((m) => detectFrequency(m) === currentFrequency);
    }

    /* Status filter */
    if (currentStatus && currentStatus !== "all") {
      filtered = filtered.filter((m) => {
        if (currentStatus === "active") return !isMarketClosed(m);
        if (currentStatus === "closed") return isMarketClosed(m);
        return true;
      });
    }

    return filtered;
  }

  /* ---- Group markets by event (Kalshi-style cards) ---- */

  function groupMarketsByEvent(marketList) {
    const groups = new Map();
    marketList.forEach((market) => {
      const key = market.event_ticker || market.series_ticker || market.ticker;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(market);
    });
    return groups;
  }

  function getEventMetrics(eventMarkets) {
    const volume = eventMarkets.reduce(
      (sum, m) =>
        sum + (parseFloat(m.volume_24h_fp || m.volume_fp || "0") || 0),
      0,
    );
    const closeTimes = eventMarkets
      .map((m) => (m.close_time ? new Date(m.close_time).getTime() : null))
      .filter(Boolean);
    const createdTimes = eventMarkets
      .map((m) => (m.created_time ? new Date(m.created_time).getTime() : null))
      .filter(Boolean);
    return {
      volume,
      earliestClose: closeTimes.length ? Math.min(...closeTimes) : null,
      latestCreated: createdTimes.length ? Math.max(...createdTimes) : 0,
    };
  }

  function getEventTitle(eventTicker, eventMarkets) {
    const eventData = events[eventTicker];
    if (eventData && eventData.title) return eventData.title;
    const fallback =
      eventMarkets[0]?.yes_sub_title || eventMarkets[0]?.ticker || eventTicker;
    return fallback || "Untitled";
  }

  const CATEGORY_ICONS = {
    politics: "🏛",
    sports: "⚽",
    culture: "🎬",
    crypto: "₿",
    climate: "🌍",
    economics: "📊",
    mentions: "📣",
    companies: "🏢",
    financials: "📈",
    tech_and_science: "💡",
  };

  function deriveCategoryKey(label) {
    const lower = (label || "").toLowerCase();
    if (!lower) return "";
    for (const [key, rules] of Object.entries(CATEGORY_MATCH_RULES)) {
      if (rules.some((r) => lower.includes(r))) return key;
    }
    if (lower.includes("tech") || lower.includes("science"))
      return "tech_and_science";
    return "";
  }

  function getEventCategoryLabel(eventTicker, eventMarkets) {
    const eventData = events[eventTicker];
    const raw = eventData?.category || eventMarkets[0]?.category || "";
    if (raw) return raw;
    return deriveCategoryBreadcrumb(eventTicker);
  }

  function deriveCategoryBreadcrumb(seriesKey) {
    const lower = (seriesKey || "").toLowerCase();

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

  function getEventIcon(categoryLabel) {
    const key = deriveCategoryKey(categoryLabel) || currentCategory;
    return CATEGORY_ICONS[key] || "◈";
  }

  function detectEventFrequency(eventMarkets) {
    const counts = new Map();
    eventMarkets.forEach((m) => {
      const freq = detectFrequency(m);
      if (freq === "other") return;
      counts.set(freq, (counts.get(freq) || 0) + 1);
    });
    let best = "other";
    let bestCount = 0;
    counts.forEach((count, freq) => {
      if (count > bestCount) {
        best = freq;
        bestCount = count;
      }
    });
    return best;
  }

  function renderCards() {
    const main = document.getElementById("trading-main");
    if (!main) return;

    const filtered = filterMarkets();

    if (filtered.length === 0) {
      if (markets.length === 0) {
        main.innerHTML = `
          <div class="ts-loader">
            <div class="ts-spinner"></div>
            <div class="ts-empty">Loading markets…</div>
          </div>
        `;
      } else {
        main.innerHTML = `<div class="ts-empty">No markets match this filter.</div>`;
      }
      return;
    }

    const groups = groupMarketsByEvent(filtered);
    const entries = [...groups.entries()].map(([eventTicker, eventMarkets]) => {
      const metrics = getEventMetrics(eventMarkets);
      return { eventTicker, eventMarkets, ...metrics };
    });

    if (currentCategory === "new") {
      entries.sort((a, b) => b.latestCreated - a.latestCreated);
    } else if (currentSort === "volume") {
      entries.sort((a, b) => b.volume - a.volume);
    } else {
      entries.sort((a, b) => {
        const aClose = a.earliestClose ?? Infinity;
        const bClose = b.earliestClose ?? Infinity;
        return aClose - bClose;
      });
    }

    const limit = Math.max(CARDS_PER_PAGE, displayedCount + CARDS_PER_PAGE);
    const visible = entries.slice(0, limit);
    displayedCount = visible.length;

    const sections = new Map();
    visible.forEach((entry) => {
      let sectionLabel = KALSHI_CATEGORIES[currentCategory]?.label || "Markets";
      if (
        currentCategory === "all" ||
        currentCategory === "all_markets"
      ) {
        const catLabel = getEventCategoryLabel(
          entry.eventTicker,
          entry.eventMarkets,
        );
        sectionLabel = formatCategoryLabel(catLabel);
      }
      if (!sections.has(sectionLabel)) sections.set(sectionLabel, []);
      sections.get(sectionLabel).push(entry);
    });

    let html = "";
    sections.forEach((sectionEntries, label) => {
      html += `<section class="ts-section">`;
      if (sections.size > 1) {
        html += `<div class="ts-section-head">${escapeHtml(label)}</div>`;
      }
      html += `<div class="ts-grid">`;
      sectionEntries.forEach((entry) => {
        html += buildEventCardHtml(entry.eventTicker, entry.eventMarkets);
      });
      html += `</div></section>`;
    });

    if (visible.length < entries.length) {
      html += `<button id="trading-load-more" class="ts-load-more">Load more</button>`;
    }

    main.innerHTML = html;
    updateConnectionState();
  }

  function buildEventCardHtml(eventTicker, eventMarkets) {
    const eventData = events[eventTicker] || {};
    const eventTitle = getEventTitle(eventTicker, eventMarkets);
    const categoryLabel = getEventCategoryLabel(eventTicker, eventMarkets);
    const icon = getEventIcon(categoryLabel);
    const iconHtml = eventData.icon_url
      ? `<img src="${escapeAttr(eventData.icon_url)}" alt="">`
      : icon;
    const freq = detectEventFrequency(eventMarkets);
    const freqLabel = FREQ_LABELS[freq] || "";
    const volume = eventMarkets.reduce(
      (sum, m) =>
        sum + (parseFloat(m.volume_24h_fp || m.volume_fp || "0") || 0),
      0,
    );
    const closeMs = eventMarkets
      .map((m) => (m.close_time ? new Date(m.close_time).getTime() : null))
      .filter(Boolean)
      .sort((a, b) => a - b)[0];
    const closeLabel = closeMs ? formatTimeRemaining(new Date(closeMs)) : "";
    const isBinary = eventMarkets.length === 1;
    const badge = freq === "15min" ? `<div class="ts-badge-15">15</div>` : "";
    const cardTicker = isBinary ? eventMarkets[0].ticker : "";

    const pct =
      isBinary && getMarketPercent(eventMarkets[0]) !== null
        ? `${getMarketPercent(eventMarkets[0])}%`
        : "";

    const bodyHtml = isBinary
      ? buildBinaryBodyHtml(eventMarkets[0])
      : buildMultiBodyHtml(eventMarkets);

    return `
      <div class="ts-card glow-display glow-bars-secondary"${cardTicker ? ` data-ticker="${escapeAttr(cardTicker)}"` : ""}>
        <div class="ts-card-top">
          <div class="ts-icon-wrap">${iconHtml}${badge}</div>
          <div class="ts-card-title">${escapeHtml(eventTitle)}</div>
          ${pct ? `<div class="ts-card-pct">${escapeHtml(pct)}</div>` : ""}
        </div>
        ${bodyHtml}
        ${buildFooterHtml(volume, freqLabel, closeLabel)}
      </div>
    `;
  }

  function buildBinaryBodyHtml(market) {
    const isClosed = isMarketClosed(market);
    const yesCents = getCents(market.yes_ask_dollars, market.yes_bid_dollars);
    const noCents = getCents(market.no_ask_dollars, market.no_bid_dollars);
    const yesLabel = yesCents ? `${yesCents}¢` : "";
    const noLabel = noCents ? `${noCents}¢` : "";

    const payoutYes = yesCents ? formatPayout(yesCents) : null;
    const payoutNo = noCents ? formatPayout(noCents) : null;
    const noOffers = !payoutYes && !payoutNo;

    return `
      <div class="ts-binary-body">
        <div class="ts-binary-buttons">
          <button class="ts-action-btn yes-button" data-ticker="${escapeAttr(market.ticker)}" data-side="yes" ${isClosed ? "disabled" : ""}>
            <span class="ts-btn-label">Yes</span>${yesLabel ? `<span class="ts-btn-price">${yesLabel}</span>` : ""}
          </button>
          <button class="ts-action-btn no-button" data-ticker="${escapeAttr(market.ticker)}" data-side="no" ${isClosed ? "disabled" : ""}>
            <span class="ts-btn-label">No</span>${noLabel ? `<span class="ts-btn-price">${noLabel}</span>` : ""}
          </button>
        </div>
        <div class="ts-payout-row">
          <span>$100 → ${payoutYes ? `<span class="ts-payout-value">${escapeHtml(payoutYes)}</span>` : "No offers"}</span>
          <span>$100 → ${payoutNo ? `<span class="ts-payout-value">${escapeHtml(payoutNo)}</span>` : "No offers"}</span>
        </div>
        ${noOffers ? `<div class="ts-no-offers">No offers</div>` : ""}
      </div>
    `;
  }

  function buildMultiBodyHtml(eventMarkets) {
    const sortedMarkets = [...eventMarkets].sort((a, b) => {
      const aClose = a.close_time ? new Date(a.close_time).getTime() : Infinity;
      const bClose = b.close_time ? new Date(b.close_time).getTime() : Infinity;
      return aClose - bClose;
    });
    const rows = sortedMarkets.slice(0, 3).map((market) => {
      const isClosed = isMarketClosed(market);
      const yesCents = getCents(
        market.yes_ask_dollars,
        market.yes_bid_dollars,
      );
      const noCents = getCents(
        market.no_ask_dollars,
        market.no_bid_dollars,
      );
      const pct = getMarketPercent(market);
      const yesLabel = yesCents ? `${yesCents}¢` : "Yes";
      const noLabel = noCents ? `${noCents}¢` : "No";
      const yesEmpty = yesCents ? "" : " ts-combo-empty";
      const noEmpty = noCents ? "" : " ts-combo-empty";

      return `
        <div class="ts-market-row" data-ticker="${escapeAttr(market.ticker)}">
          <div class="ts-market-label">${escapeHtml(
            market.yes_sub_title || market.ticker || "Untitled",
          )}</div>
          <div class="ts-market-pct">${pct !== null ? `${pct}%` : "—"}</div>
          <div class="ts-combo">
            <button class="ts-combo-btn yes-button${yesEmpty}" data-ticker="${escapeAttr(
              market.ticker,
            )}" data-side="yes" ${isClosed ? "disabled" : ""}>${escapeHtml(
              yesLabel,
            )}</button>
            <span class="ts-combo-sep">/</span>
            <button class="ts-combo-btn no-button${noEmpty}" data-ticker="${escapeAttr(
              market.ticker,
            )}" data-side="no" ${isClosed ? "disabled" : ""}>${escapeHtml(
              noLabel,
            )}</button>
          </div>
        </div>
      `;
    });

    const extra =
      eventMarkets.length > 3
        ? `<div class="ts-more-markets">More markets</div>`
        : "";

    return `<div class="ts-multi-body">${rows.join("")}${extra}</div>`;
  }

  function buildFooterHtml(volume, freqLabel, closeLabel) {
    const volStr = volume > 0 ? formatVolume(String(volume)) : "";
    const refreshSvg = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23 4v6h-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M1 20v-6h6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M1 14l4.64 4.36A9 9 0 0020.49 15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    const leftParts = [];
    if (volStr) leftParts.push(`<span>${escapeHtml(volStr)}</span>`);
    if (freqLabel) {
      leftParts.push(
        `<span style="display:flex;align-items:center;gap:3px;color:var(--ts-text-subtle)">${refreshSvg}${escapeHtml(
          freqLabel,
        )}</span>`,
      );
    }
    const leftHtml = leftParts.join(`<span class="ts-footer-dot">·</span>`);

    const hasVol = volume > 100;
    const iconSvg = hasVol
      ? `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="9 12 11 14 15 10" fill="none" stroke="currentColor" stroke-width="2"/></svg>`
      : `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/></svg>`;

    return `
      <div class="ts-card-footer">
        <span class="ts-footer-left">${leftHtml}</span>
        <span class="ts-footer-right">
          ${closeLabel ? escapeHtml(closeLabel) : ""}
          <span class="ts-footer-icon">${iconSvg}</span>
        </span>
      </div>
    `;
  }

  function formatCategoryLabel(label) {
    if (!label) return "Markets";
    const key = deriveCategoryKey(label);
    if (key && KALSHI_CATEGORIES[key]?.label) {
      return KALSHI_CATEGORIES[key].label;
    }
    return label
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function getCents(primaryValue, fallbackValue) {
    const primary = parseFloat(primaryValue || "");
    if (!isNaN(primary) && primary > 0) return Math.round(primary * 100);
    const fallback = parseFloat(fallbackValue || "");
    if (!isNaN(fallback) && fallback > 0) return Math.round(fallback * 100);
    return null;
  }

  function getMarketPercent(market) {
    const price = parseFloat(
      market.last_price_dollars ||
        market.yes_ask_dollars ||
        market.yes_bid_dollars ||
        "",
    );
    if (isNaN(price) || price <= 0) return null;
    return Math.round(price * 100);
  }

  function formatPayout(cents) {
    if (!cents || cents <= 0) return null;
    const payout = Math.round(10000 / cents);
    return `$${payout}`;
  }

  /* ---- Pill Row (Subcategory Chips) ---- */

  function renderPillRow() {
    const row = document.getElementById("trading-pill-row");
    if (!row) return;

    const subs = buildSubcategoriesFromEvents(currentCategory);
    const staticSubs = SUBCATEGORY_MAP[currentCategory] || [];
    const allSubs = [...new Set([...staticSubs, ...subs])].filter(Boolean);
    if (
      currentSubcategory !== "all" &&
      !allSubs.some((s) => s.toLowerCase() === currentSubcategory)
    ) {
      currentSubcategory = "all";
    }

    const pills = allSubs
      .map((s) => {
        const key = s.toLowerCase();
        const active = currentSubcategory === key ? " active" : "";
        return `<button class="ts-pill${active}" data-subcategory="${escapeAttr(key)}">${escapeHtml(s)}</button>`;
      })
      .join("");

    row.innerHTML = `
      <div class="ts-pill-ham" aria-hidden="true"><span></span><span></span><span></span></div>
      <button class="ts-pill${currentSubcategory === "all" ? " active" : ""}" data-subcategory="all">All</button>
      ${pills}
      <button class="ts-pill ts-pill-action" data-action="toggle-filters">Sort / Filter</button>
    `;
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
    if (num >= 1000000) return "$" + (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return "$" + Math.round(num / 1000) + "K";
    if (num >= 1) return "$" + Math.round(num);
    return "";
  }

  /* ---- Trading Status ---- */

  async function fetchAccountSummary() {
    try {
      const tradingResponse = await fetch(
        `${BACKEND_URL}/api/trading/status`,
      ).catch(() => null);

      if (!tradingResponse || !tradingResponse.ok) return;
      const tradingData = await tradingResponse.json();

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
    } catch (error) {
      /* Silently fail — backend may not be reachable */
    }
  }

  function connectWebSocket() {
    try {
      websocket = new WebSocket(
        BACKEND_URL.replace(/^http/, "ws") + "/api/events",
      );
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
    const ticker = data.ticker || "";
    const agentName = data.agent_name || "Agent";
    const side = (data.side || "").toUpperCase();
    const reasoning = data.reasoning || "";

    const container = findMarketContainer(ticker);
    if (!container) return;

    const existing = container.querySelector(".ks-agent-badge");
    if (existing) existing.remove();

    const badge = document.createElement("span");
    badge.className = "ks-agent-badge";
    badge.title = `${agentName}: ${reasoning}`;
    badge.textContent = `🤖 ${agentName} → ${side}`;

    const target =
      container.querySelector(".ts-market-label") ||
      container.querySelector(".ts-card-title") ||
      container;
    target.appendChild(badge);

    setTimeout(() => badge.remove(), 10000);
  }

  function flashTradeActivity(data) {
    const ticker = data.data?.ticker || data.ticker || "";
    const side = (data.data?.side || data.side || "").toLowerCase();

    const container = findMarketContainer(ticker);
    if (!container) return;

    const btnSelector = side === "yes" ? ".yes-button" : ".no-button";
    const btn = container.querySelector(btnSelector);
    if (!btn) return;

    btn.classList.add("ks-trade-flash");
    setTimeout(() => btn.classList.remove("ks-trade-flash"), 1500);
  }

  /* ---- Approval Overlay ---- */

  function showApprovalOverlay(data) {
    const overlay = document.getElementById("approval-overlay");
    if (!overlay) return;

    const agentName = data.agent_name || "Agent";
    const ticker = data.ticker || "—";
    const side = (data.side || "?").toUpperCase();
    const price = data.price_dollars
      ? `${(parseFloat(data.price_dollars) * 100).toFixed(0)}¢`
      : "?";
    const reasoning = data.reasoning || "No reasoning provided";

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

  function findMarketContainer(ticker) {
    if (!ticker) return null;
    return (
      document.querySelector(`.ts-market-row[data-ticker="${ticker}"]`) ||
      document.querySelector(`.ts-card[data-ticker="${ticker}"]`)
    );
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

  /* ---- Utility Functions ---- */

  function formatTimeRemaining(closeTime) {
    const diff = closeTime - new Date();
    if (diff <= 0) return "Closed";
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (hours > 24 * 7) return Math.floor(hours / 24) + "d";
    if (hours > 24) return Math.floor(hours / 24) + "d " + (hours % 24) + "h";
    if (hours > 0) return hours + "h " + minutes + "m";
    if (minutes > 0) return minutes + "m " + seconds + "s";
    return seconds + "s";
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

  return {
    initialize,
    onConnected,
    onDisconnected,
    fetchPublicData,
  };
})();



