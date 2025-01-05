document.addEventListener('DOMContentLoaded', function () {
  const stickyHeader = document.querySelector('sticky-header');
  const sectionHeader = document.querySelector('.section-header');
  const sectionAnnouncementBar = document.querySelector('.navigation-banner');
  
  // Debug element setup
  const debugDisplay = document.createElement('div');
  debugDisplay.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      font-family: monospace;
      z-index: 9999;
      border-radius: 4px;
      max-width: 300px;
  `;
  document.body.appendChild(debugDisplay);

  if (!sectionHeader || !stickyHeader) {
      console.warn('Required elements not found');
      return;
  }

  // Get sticky behavior type
  const stickyType = stickyHeader.dataset.stickyType;
  
  if (stickyType === 'disabled') return;

  // Add sticky class for enabled and hide_scroll
  if (['enabled', 'hide_scroll'].includes(stickyType)) {
      sectionHeader.classList.add('sticky');
      sectionAnnouncementBar?.classList.add('sticky');
  }

  if (stickyType === 'enabled') return;

  // Scroll configuration
  const DEBOUNCE_TIME = 150;      // Time to wait before executing scroll action
  const SCROLL_START = 100;       // When to start considering header actions
  
  // State variables
  let lastScrollY = window.scrollY;
  let isHidden = false;
  let debounceTimer = null;
  let lastDirection = null;
  
  function updateDebugInfo() {
      debugDisplay.innerHTML = `
          Current Scroll: ${Math.round(window.scrollY)}px<br>
          Last Scroll: ${Math.round(lastScrollY)}px<br>
          Direction: ${lastDirection}<br>
          Is Hidden: ${isHidden}<br>
          Timer Active: ${debounceTimer !== null}
      `;
  }

  function hideHeader() {
      if (!isHidden) {
          sectionHeader.classList.add('hidden');
          sectionAnnouncementBar?.classList.add('hidden');
          isHidden = true;
          console.log('🔴 Hiding header');
      }
  }

  function showHeader() {
      if (isHidden) {
          sectionHeader.classList.remove('hidden');
          sectionAnnouncementBar?.classList.remove('hidden');
          isHidden = false;
          console.log('🟢 Showing header');
      }
  }

  // Debounce function to prevent rapid execution
  function debounce(fn) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
          fn();
          debounceTimer = null;
      }, DEBOUNCE_TIME);
  }

  let lastCallTime = Date.now();
  const THROTTLE_TIME = 100; // Throttle scroll events to every 100ms

  function handleScroll() {
      const now = Date.now();
      if (now - lastCallTime < THROTTLE_TIME) return;
      lastCallTime = now;

      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';

      // Only process if we've scrolled enough and direction is consistent
      if (Math.abs(currentScrollY - lastScrollY) > 5 && direction !== lastDirection) {
          lastDirection = direction;

          if (currentScrollY > SCROLL_START) {
              if (direction === 'down' && !isHidden) {
                  debounce(hideHeader);
              } else if (direction === 'up' && isHidden) {
                  debounce(showHeader);
              }
          }
      }

      lastScrollY = currentScrollY;
      updateDebugInfo();
  }

  // Use passive scroll listener with throttling
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initialize state
  updateDebugInfo();
});