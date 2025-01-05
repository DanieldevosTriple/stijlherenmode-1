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
  
  // Exit if sticky is disabled
  if (stickyType === 'disabled') {
      return;
  }

  // Add sticky class for enabled and hide_scroll
  if (['enabled', 'hide_scroll'].includes(stickyType)) {
      sectionHeader.classList.add('sticky');
      sectionAnnouncementBar?.classList.add('sticky');
  }

  // Exit if just sticky enabled (no hide on scroll)
  if (stickyType === 'enabled') {
      return;
  }

  // Variables for scroll handling
  const MIN_SCROLL = 20;           // Minimum scroll movement to consider
  const SCROLL_DOWN_START = 100;   // When to start considering hiding header
  const SCROLL_UP_SHOW = 50;      // How far to scroll up before showing header
  
  let lastScrollY = window.scrollY;
  let isHidden = false;
  let ticking = false;
  let scrollDirection = null;
  let upScrollDistance = 0;        // Track continuous upward scroll
  
  function updateDebugInfo() {
      debugDisplay.innerHTML = `
          Current Scroll: ${Math.round(window.scrollY)}px<br>
          Last Scroll: ${Math.round(lastScrollY)}px<br>
          Direction: ${scrollDirection}<br>
          Up Distance: ${Math.round(upScrollDistance)}px<br>
          Is Hidden: ${isHidden}<br>
          Up Show At: ${SCROLL_UP_SHOW}px
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
      if (ticking) return;
      
      ticking = true;
      requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY;

          // Only process significant scroll movements
          if (Math.abs(delta) >= MIN_SCROLL) {
              const newDirection = delta > 0 ? 'down' : 'up';
              
              // Handle direction change
              if (newDirection !== scrollDirection) {
                  scrollDirection = newDirection;
                  if (scrollDirection === 'up') {
                      upScrollDistance = 0;  // Reset up scroll tracking on direction change
                  }
              }

              // Handle scroll down
              if (scrollDirection === 'down') {
                  upScrollDistance = 0;  // Reset up scroll tracking
                  if (currentScrollY > SCROLL_DOWN_START && !isHidden) {
                      hideHeader();
                  }
              } 
              // Handle scroll up
              else if (scrollDirection === 'up' && isHidden) {
                  upScrollDistance += Math.abs(delta);
                  if (upScrollDistance >= SCROLL_UP_SHOW) {
                      showHeader();
                      upScrollDistance = 0;
                  }
              }
          }

          lastScrollY = currentScrollY;
          updateDebugInfo();
          ticking = false;
      });
  }

  // Throttled scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initialize state
  updateDebugInfo();
});