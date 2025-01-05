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
  const SCROLL_DOWN_THRESHOLD = 100; // Pixels to scroll down before hiding
  const SCROLL_UP_THRESHOLD = 50;    // Pixels to scroll up before showing
  let isHidden = false;
  let ticking = false;
  let scrollDistance = 0;
  
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
      
      // Apply threshold checks
      if (isScrollingDown && scrollDistance > SCROLL_DOWN_THRESHOLD && !isHidden && currentScrollY > SCROLL_DOWN_THRESHOLD) {
          sectionHeader.classList.add('hidden');
          sectionAnnouncementBar.classList.add('hidden');
          isHidden = true;
          scrollDistance = 0;
      } else if (!isScrollingDown && Math.abs(scrollDistance) > SCROLL_UP_THRESHOLD && isHidden) {
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
  });
});