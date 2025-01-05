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
  const DEBOUNCE_TIME = 150;       // Time to wait before processing scroll
  const SCROLL_THRESHOLD = 50;      // Minimum scroll amount to trigger action
  
  // State
  let lastScrollY = window.scrollY;
  let isHidden = false;
  let debounceTimer = null;
  let currentDirection = null;
  
  function updateDebugInfo() {
      debugDisplay.innerHTML = `
          Scroll Y: ${Math.round(window.scrollY)}px<br>
          Last Y: ${Math.round(lastScrollY)}px<br>
          Direction: ${currentDirection}<br>
          Is Hidden: ${isHidden}<br>
          Debouncing: ${debounceTimer !== null}
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
      // Clear existing timer
      if (debounceTimer) {
          clearTimeout(debounceTimer);
      }

      // Set new timer
      debounceTimer = setTimeout(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = currentScrollY - lastScrollY;

          // Only process if we've scrolled enough
          if (Math.abs(scrollDelta) > SCROLL_THRESHOLD) {
              // Determine scroll direction
              const newDirection = scrollDelta > 0 ? 'down' : 'up';
              
              if (newDirection !== currentDirection) {
                  currentDirection = newDirection;
                  
                  // Apply header visibility based on direction
                  if (currentDirection === 'down') {
                      hideHeader();
                  } else {
                      showHeader();
                  }
              }
          }

          lastScrollY = currentScrollY;
          debounceTimer = null;
          updateDebugInfo();
      }, DEBOUNCE_TIME);

      updateDebugInfo();
  }

  // Use passive scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initialize state
  updateDebugInfo();
});