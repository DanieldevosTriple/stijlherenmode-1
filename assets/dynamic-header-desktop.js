document.addEventListener('DOMContentLoaded', function () {
  const sectionHeader = document.querySelector('.section-header');
  const sectionAnnouncementBar = document.querySelector('.navigation-banner');
  
  if (!sectionHeader) {
      console.warn('Element with class "section-header" not found. Check if the class is correctly set in HTML.');
      return;
  }
  
  sectionHeader.classList.add('sticky');
  sectionAnnouncementBar.classList.add('sticky');
  
  const enableHideOnScroll = true;
  if (!enableHideOnScroll) return;
  
  let lastScrollY = window.scrollY;
  const visibilityThreshold = 50;
  let isHidden = false;
  let ticking = false;
  let scrollDirection = 'none';
  let lastDirectionChange = Date.now();
  const directionChangeThreshold = 150; // ms to wait before changing direction
  
  function updateHeaderVisibility() {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const newDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      
      // Only update if we've been scrolling in the same direction for a while
      if (newDirection !== scrollDirection) {
          if (currentTime - lastDirectionChange > directionChangeThreshold) {
              scrollDirection = newDirection;
              lastDirectionChange = currentTime;
              
              if (scrollDirection === 'down' && currentScrollY > visibilityThreshold && !isHidden) {
                  sectionHeader.classList.add('hidden');
                  sectionAnnouncementBar.classList.add('hidden');
                  isHidden = true;
              } else if (scrollDirection === 'up' && isHidden) {
                  sectionHeader.classList.remove('hidden');
                  sectionAnnouncementBar.classList.remove('hidden');
                  isHidden = false;
              }
          }
      }
      
      lastScrollY = currentScrollY;
      ticking = false;
  }
  
  // Optimized scroll event listener
  window.addEventListener('scroll', function() {
      if (!ticking) {
          window.requestAnimationFrame(updateHeaderVisibility);
          ticking = true;
      }
  }, { passive: true });
  
  // Add resize handler to ensure proper visibility on window resize
  window.addEventListener('resize', function() {
      if (isHidden && window.scrollY <= visibilityThreshold) {
          sectionHeader.classList.remove('hidden');
          sectionAnnouncementBar.classList.remove('hidden');
          isHidden = false;
      }
  }, { passive: true });
});