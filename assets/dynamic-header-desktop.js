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
  const SCROLL_START = 100;      // Amount of pixels to scroll before hiding
  const THROTTLE_TIME = 150;     // Throttle time for scroll events
  
  // State
  let lastScrollY = window.scrollY;
  let isHidden = false;
  let lastScrollTime = Date.now();
  let lastDirection = null;
  let ticking = false;
  
  function updateDebugInfo() {
      debugDisplay.innerHTML = `
          Scroll Y: ${Math.round(window.scrollY)}px<br>
          Last Y: ${Math.round(lastScrollY)}px<br>
          Direction: ${lastDirection}<br>
          Is Hidden: ${isHidden}
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
      const now = Date.now();
      
      // Throttle scroll events
      if (now - lastScrollTime < THROTTLE_TIME) {
          if (!ticking) {
              requestAnimationFrame(() => {
                  updateDebugInfo();
                  ticking = false;
              });
              ticking = true;
          }
          return;
      }

      lastScrollTime = now;
      
      if (!ticking) {
          requestAnimationFrame(() => {
              const currentScrollY = window.scrollY;
              const scrollDelta = currentScrollY - lastScrollY;
              const newDirection = scrollDelta > 0 ? 'down' : 'up';

              // Only process if there's significant movement
              if (Math.abs(scrollDelta) > 5) {
                  // Update last direction if it changed
                  if (newDirection !== lastDirection) {
                      lastDirection = newDirection;
                  }

                  // Handle scroll down
                  if (newDirection === 'down' && currentScrollY > SCROLL_START) {
                      hideHeader();
                  }
                  // Handle scroll up
                  else if (newDirection === 'up') {
                      showHeader();
                  }
              }

              lastScrollY = currentScrollY;
              updateDebugInfo();
              ticking = false;
          });
          ticking = true;
      }
  }

  // Use passive scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initialize state
  updateDebugInfo();
});