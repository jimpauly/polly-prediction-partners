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
      if (el) el.style.display = 'none';
      const btn = document.getElementById(BTN_IDS[s]);
      if (btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // Show selected studio
    const selected = document.getElementById(STUDIO_IDS[studioName]);
    if (selected) {
      // Use flex for design/trade/fly
      selected.style.display = studioName === 'design' ? 'flex' : 
                                studioName === 'trade' ? 'flex' : 'flex';
    }

    // Update buttons
    const activeBtn = document.getElementById(BTN_IDS[studioName]);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-selected', 'true');
      activeBtn.setAttribute('aria-pressed', 'true');
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
  }

  return { select, getCurrent, init };
})();
