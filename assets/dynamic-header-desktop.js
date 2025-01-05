document.addEventListener('DOMContentLoaded', function () {
  const sectionHeader = document.querySelector('.section-header');
  const sectionAnnouncementBar = document.querySelector('.navigation-banner');
  
  // Create debug element
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
  
  if (!sectionHeader) {
      console.warn('Element with class "section-header" not found. Check if the class is correctly set in HTML.');
      return;
  }
  
  sectionHeader.classList.add('sticky');
  sectionAnnouncementBar.classList.add('sticky');
  
  const SCROLL_DOWN_THRESHOLD = 100;  // How far to scroll down before hiding
  const SCROLL_UP_THRESHOLD = 50;     // How far to scroll up before showing
  
  let lastScrollY = window.scrollY;
  let isHidden = false;
  let ticking = false;
  let upScrollDistance = 0;           // Track continuous upward scroll
  
  function updateDebugInfo(currentScrollY) {
      debugDisplay.innerHTML = `
          Current Scroll: ${Math.round(currentScrollY)}px<br>
          Last Scroll: ${Math.round(lastScrollY)}px<br>
          Up Scroll Distance: ${Math.round(upScrollDistance)}px<br>
          Is Hidden: ${isHidden}<br>
          Down Threshold: ${SCROLL_DOWN_THRESHOLD}px<br>
          Up Threshold: ${SCROLL_UP_THRESHOLD}px
      `;
  }
  
  function updateHeaderVisibility() {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      
      // Scrolling down
      if (scrollDelta > 0) {
          // Reset upward scroll tracking when direction changes
          upScrollDistance = 0;
          
          // Hide header when scrolling down past threshold
          if (currentScrollY > SCROLL_DOWN_THRESHOLD && !isHidden) {
              sectionHeader.classList.add('hidden');
              sectionAnnouncementBar.classList.add('hidden');
              isHidden = true;
              console.log('🔴 Hiding header - Down threshold reached');
          }
      }
      // Scrolling up
      else if (scrollDelta < 0) {
          // Accumulate upward scroll distance
          upScrollDistance += Math.abs(scrollDelta);
          
          // Show header when enough upward scroll has accumulated
          if (upScrollDistance > SCROLL_UP_THRESHOLD && isHidden) {
              sectionHeader.classList.remove('hidden');
              sectionAnnouncementBar.classList.remove('hidden');
              isHidden = false;
              upScrollDistance = 0;  // Reset after showing
              console.log('🟢 Showing header - Up threshold reached');
          }
      }
      
      updateDebugInfo(currentScrollY);
      lastScrollY = currentScrollY;
      ticking = false;
  }
  
  window.addEventListener('scroll', function() {
      if (!ticking) {
          window.requestAnimationFrame(updateHeaderVisibility);
          ticking = true;
      }
  }, { passive: true });
  
  // Reset on page load
  window.addEventListener('load', function() {
      lastScrollY = window.scrollY;
      upScrollDistance = 0;
      updateDebugInfo(window.scrollY);
  });
});