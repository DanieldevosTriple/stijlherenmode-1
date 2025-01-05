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
  
  const enableHideOnScroll = true;
  if (!enableHideOnScroll) return;
  
  let lastScrollY = window.scrollY;
  const SCROLL_DOWN_THRESHOLD = 100;
  const SCROLL_UP_THRESHOLD = 50;
  let isHidden = false;
  let ticking = false;
  let scrollDistance = 0;
  
  function updateDebugInfo(currentScrollY, isScrollingDown) {
      debugDisplay.innerHTML = `
          Current Scroll: ${Math.round(currentScrollY)}px<br>
          Last Scroll: ${Math.round(lastScrollY)}px<br>
          Scroll Distance: ${Math.round(scrollDistance)}px<br>
          Direction: ${isScrollingDown ? 'DOWN' : 'UP'}<br>
          Is Hidden: ${isHidden}<br>
          Down Threshold: ${SCROLL_DOWN_THRESHOLD}px<br>
          Up Threshold: ${SCROLL_UP_THRESHOLD}px
      `;
  }
  
  function updateHeaderVisibility() {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      
      // Update scroll distance based on direction
      if (isScrollingDown) {
          scrollDistance += (currentScrollY - lastScrollY);
      } else {
          scrollDistance -= (lastScrollY - currentScrollY);
      }
      
      // Reset scroll distance if direction changes
      if ((isScrollingDown && scrollDistance < 0) || (!isScrollingDown && scrollDistance > 0)) {
          scrollDistance = 0;
      }
      
      // Update debug before applying changes
      updateDebugInfo(currentScrollY, isScrollingDown);
      
      // Apply threshold checks
      if (isScrollingDown && scrollDistance > SCROLL_DOWN_THRESHOLD && !isHidden && currentScrollY > SCROLL_DOWN_THRESHOLD) {
          console.log('🔴 Hiding header - Down threshold reached');
          sectionHeader.classList.add('hidden');
          sectionAnnouncementBar.classList.add('hidden');
          isHidden = true;
          scrollDistance = 0;
      } else if (!isScrollingDown && Math.abs(scrollDistance) > SCROLL_UP_THRESHOLD && isHidden) {
          console.log('🟢 Showing header - Up threshold reached');
          sectionHeader.classList.remove('hidden');
          sectionAnnouncementBar.classList.remove('hidden');
          isHidden = false;
          scrollDistance = 0;
      }
      
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
      if (window.scrollY < SCROLL_DOWN_THRESHOLD) {
          sectionHeader.classList.remove('hidden');
          sectionAnnouncementBar.classList.remove('hidden');
          isHidden = false;
      }
      updateDebugInfo(window.scrollY, false);
  });
});