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
  let ticking = false;
  
  function updateDebugInfo() {
      debugDisplay.innerHTML = `
          Current Scroll: ${Math.round(window.scrollY)}px<br>
          Last Scroll: ${Math.round(lastScrollY)}px<br>
          Is Hidden: ${isHidden}<br>
          Delta: ${Math.round(window.scrollY - lastScrollY)}px
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

          // Scrolling down
          if (delta > 0) {
              hideHeader();
          } 
          // Scrolling up
          else if (delta < 0) {
              showHeader();
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