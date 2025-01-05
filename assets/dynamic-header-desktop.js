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
  
  // Remove the delay variables and timeout
  // lastTime and scrollDelay are no longer needed
  
  function updateHeaderVisibility() {
      const currentScrollY = window.scrollY;
      const scrollDistance = Math.abs(currentScrollY - lastScrollY);
      
      // Reduce minimum scroll distance for faster response
      if (scrollDistance < 2) return;
      
      if (currentScrollY > lastScrollY && currentScrollY > visibilityThreshold) {
          // Scrolling down - hide immediately
          if (!isHidden) {
              sectionHeader.classList.add('hidden');
              sectionAnnouncementBar.classList.add('hidden');
              isHidden = true;
          }
      } else if (currentScrollY < lastScrollY) {
          // Scrolling up - show immediately
          if (isHidden) {
              sectionHeader.classList.remove('hidden');
              sectionAnnouncementBar.classList.remove('hidden');
              isHidden = false;
          }
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
});