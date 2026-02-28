/**
 * studios.js — Studio switching logic
 * Design (default) | Trade | Fly
 */

const studios = (() => {
  const STUDIOS = ['design', 'trade', 'fly'];
  let current = 'design';

  const STUDIO_IDS = {
    design: 'studio-design',
    trade: 'studio-trade',
    fly: 'studio-fly'
  };

  const BTN_IDS = {
    design: 'studio-btn-design',
    trade: 'studio-btn-trade',
    fly: 'studio-btn-fly'
  };

  function select(studioName) {
    if (!STUDIOS.includes(studioName)) return;
    const prev = current;
    current = studioName;

    // Hide all studio panels
    STUDIOS.forEach(s => {
      const el = document.getElementById(STUDIO_IDS[s]);
      if (el) {
        el.style.display = 'none';
        el.classList.remove('studio-entering');
      }
      const btn = document.getElementById(BTN_IDS[s]);
      if (btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // Show selected studio with fade-in (Phase 3)
    const selected = document.getElementById(STUDIO_IDS[studioName]);
    if (selected) {
      selected.style.display = 'flex';
      // Trigger CSS animation: remove then re-add class via rAF
      void selected.offsetWidth;
      selected.classList.add('studio-entering');
      selected.addEventListener('animationend', () => selected.classList.remove('studio-entering'), { once: true });
    }

    // Update buttons
    const activeBtn = document.getElementById(BTN_IDS[studioName]);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-selected', 'true');
      activeBtn.setAttribute('aria-pressed', 'true');
    }

    // Update app-root data attribute for CSS-driven layout changes (sidebar visibility)
    const appRoot = document.getElementById('app-root');
    if (appRoot) appRoot.dataset.activeStudio = studioName;

    // Phase 6: Move focus to the main region when switching studios
    if (studioName !== prev) {
      const mainRegion = document.getElementById('region-main');
      if (mainRegion) {
        mainRegion.setAttribute('tabindex', '-1');
        mainRegion.focus({ preventScroll: true });
        // Don't leave a permanent tabstop on the region
        mainRegion.addEventListener('blur', () => mainRegion.removeAttribute('tabindex'), { once: true });
      }
    }

    // Trigger studio-specific init
    if (studioName === 'design' && window.designStudio) {
      window.designStudio.onShow();
    } else if (studioName === 'trade' && window.trading) {
      trading.onStudioShow();
    }
  }

  function getCurrent() { return current; }

  function init() {
    select('design'); // Default

    // Phase 6: Arrow key navigation within the studio selector
    const selector = document.getElementById('studio-selector');
    if (selector) {
      selector.addEventListener('keydown', e => {
        const idx = STUDIOS.indexOf(current);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = STUDIOS[(idx + 1) % STUDIOS.length];
          select(next);
          document.getElementById(BTN_IDS[next])?.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = STUDIOS[(idx - 1 + STUDIOS.length) % STUDIOS.length];
          select(prev);
          document.getElementById(BTN_IDS[prev])?.focus();
        }
      });
    }
  }

  return { select, getCurrent, init };
})();
