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
  
  const SCROLL_DOWN_THRESHOLD = 100;
  const SCROLL_UP_THRESHOLD = 50;
  
  let lastScrollY = window.scrollY;
  let isHidden = false;
  let ticking = false;
  let lastScrollTime = Date.now();
  let scrollDirection = null;
  let scrollTimeout = null;
  
  function updateDebugInfo(currentScrollY) {
      debugDisplay.innerHTML = `
          Current Scroll: ${Math.round(currentScrollY)}px<br>
          Last Scroll: ${Math.round(lastScrollY)}px<br>
          Direction: ${scrollDirection}<br>
          Is Hidden: ${isHidden}<br>
          Time since last scroll: ${Date.now() - lastScrollTime}ms
      `;
  }
  
  function updateHeaderVisibility() {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const newDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      
      // Clear existing timeout
      if (scrollTimeout) {
          clearTimeout(scrollTimeout);
      }
      
      // Update direction only if it's different
      if (newDirection !== scrollDirection) {
          scrollDirection = newDirection;
          lastScrollTime = currentTime;
      }
      
      // Handle scroll down
      if (scrollDirection === 'down' && 
          currentScrollY > SCROLL_DOWN_THRESHOLD && 
          !isHidden) {
          sectionHeader.classList.add('hidden');
          sectionAnnouncementBar.classList.add('hidden');
          isHidden = true;
          console.log('🔴 Hiding header - Down threshold reached');
      }
      
      // Handle scroll up
      if (scrollDirection === 'up' && 
          currentScrollY < document.documentElement.scrollHeight - window.innerHeight - SCROLL_UP_THRESHOLD && 
          isHidden) {
          scrollTimeout = setTimeout(() => {
              if (scrollDirection === 'up') {
                  sectionHeader.classList.remove('hidden');
                  sectionAnnouncementBar.classList.remove('hidden');
                  isHidden = false;
                  console.log('🟢 Showing header - Up threshold reached');
              }
          }, 150); // Small delay to prevent flickering
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
      updateDebugInfo(window.scrollY);
  });
});