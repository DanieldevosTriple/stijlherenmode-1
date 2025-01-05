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
  const SCROLL_START = 100;       // When to start considering header actions
  const DEBOUNCE_DOWN = 150;      // Debounce time for hiding (scrolling down)
  
  // State variables
  let lastScrollY = window.scrollY;
  let isHidden = false;
  let hideDebounceTimer = null;
  let lastDirection = null;
  let scrollingUp = false;
  
  function updateDebugInfo() {
      debugDisplay.innerHTML = `
          Current Scroll: ${Math.round(window.scrollY)}px<br>
          Last Scroll: ${Math.round(lastScrollY)}px<br>
          Direction: ${lastDirection}<br>
          Is Hidden: ${isHidden}<br>
          Scrolling Up: ${scrollingUp}
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

  let lastCallTime = Date.now();
  const THROTTLE_TIME = 50;

  function handleScroll() {
      const now = Date.now();
      if (now - lastCallTime < THROTTLE_TIME) return;
      lastCallTime = now;

      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';

      // Only process if we've scrolled enough
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
          if (direction !== lastDirection) {
              // Direction changed
              lastDirection = direction;
              if (direction === 'up') {
                  // Clear any pending hide operation
                  if (hideDebounceTimer) {
                      clearTimeout(hideDebounceTimer);
                      hideDebounceTimer = null;
                  }
                  showHeader();
              }
          }

          if (currentScrollY > SCROLL_START) {
              if (direction === 'down' && !isHidden) {
                  // Debounce the hide operation
                  if (hideDebounceTimer) clearTimeout(hideDebounceTimer);
                  hideDebounceTimer = setTimeout(() => {
                      if (lastDirection === 'down') { // Double-check direction
                          hideHeader();
                      }
                      hideDebounceTimer = null;
                  }, DEBOUNCE_DOWN);
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