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
  let lastScrollY = window.scrollY;
  let isHidden = false;
  let scrollDirection = null;
  let lastDirectionChange = Date.now();
  const SCROLL_THRESHOLD = 50;
  const DIRECTION_CHANGE_TIMEOUT = 100;

  function updateDebugInfo() {
      debugDisplay.innerHTML = `
          Current Scroll: ${Math.round(window.scrollY)}px<br>
          Last Scroll: ${Math.round(lastScrollY)}px<br>
          Direction: ${scrollDirection}<br>
          Is Hidden: ${isHidden}<br>
          Time since direction change: ${Date.now() - lastDirectionChange}ms
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

  let ticking = false;
  let upScrollAccumulator = 0;
  const UP_SCROLL_THRESHOLD = 100;

  function handleScroll() {
      if (ticking) return;
      
      ticking = true;
      requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          const scrollDelta = currentScroll - lastScrollY;
          const currentTime = Date.now();
          
          // Determine scroll direction
          const newDirection = scrollDelta > 0 ? 'down' : 'up';
          
          // Handle direction changes
          if (newDirection !== scrollDirection) {
              if (currentTime - lastDirectionChange > DIRECTION_CHANGE_TIMEOUT) {
                  scrollDirection = newDirection;
                  lastDirectionChange = currentTime;
                  upScrollAccumulator = 0;
              }
          }
          
          // Handle scroll down
          if (scrollDirection === 'down' && scrollDelta > SCROLL_THRESHOLD && !isHidden) {
              hideHeader();
              upScrollAccumulator = 0;
          }
          // Handle scroll up
          else if (scrollDirection === 'up' && scrollDelta < 0) {
              upScrollAccumulator += Math.abs(scrollDelta);
              if (upScrollAccumulator > UP_SCROLL_THRESHOLD && isHidden) {
                  showHeader();
              }
          }
          
          lastScrollY = currentScroll;
          updateDebugInfo();
          ticking = false;
      });
  }

  // Throttled scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initialize state
  updateDebugInfo();
});