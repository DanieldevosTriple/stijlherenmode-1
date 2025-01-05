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

  // Configuration
  const SCROLL_START = 100;        // Amount of pixels to scroll before hiding
  const DIRECTION_THRESHOLD = 50;   // Amount of pixels to determine direction change
  const DEBOUNCE_DELAY = 150;      // Delay for direction changes
  
  // State
  let lastScrollY = window.scrollY;
  let isHidden = false;
  let directionChangeTimer = null;
  let currentDirection = null;
  
  function updateDebugInfo() {
      debugDisplay.innerHTML = `
          Scroll Y: ${Math.round(window.scrollY)}px<br>
          Last Y: ${Math.round(lastScrollY)}px<br>
          Direction: ${currentDirection}<br>
          Is Hidden: ${isHidden}<br>
          Start Threshold: ${SCROLL_START}px
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

  function handleScroll() {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      const newDirection = scrollDelta > 0 ? 'down' : 'up';

      // If direction changed, wait to confirm it's not just a tiny movement
      if (newDirection !== currentDirection) {
          if (directionChangeTimer) clearTimeout(directionChangeTimer);
          
          directionChangeTimer = setTimeout(() => {
              // Only update direction if we've scrolled enough
              if (Math.abs(window.scrollY - lastScrollY) > DIRECTION_THRESHOLD) {
                  currentDirection = newDirection;
              }
              directionChangeTimer = null;
          }, DEBOUNCE_DELAY);
      }

      // Immediate response to scroll position
      if (currentScrollY > SCROLL_START && !isHidden && scrollDelta > 0) {
          hideHeader();
      } else if (isHidden && scrollDelta < 0) {
          showHeader();
      }

      lastScrollY = currentScrollY;
      updateDebugInfo();
  }

  // Use passive scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initialize state
  updateDebugInfo();
});