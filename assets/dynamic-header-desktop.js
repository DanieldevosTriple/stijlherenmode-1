document.addEventListener('DOMContentLoaded', function () {
    const sectionHeader = document.querySelector('.section-header');
    const sectionIndexPage = document.querySelector('.index-page');
    
    if (!sectionHeader) {
      console.warn('Element with class "section-header" not found.');
      return;
    }
  
    sectionHeader.classList.add('sticky');
    
    let lastScrollY = window.scrollY;
    const visibilityThreshold = 50;
    let isHidden = false;
    let ticking = false;
    let lastTime = Date.now();
    const scrollDelay = 100;
    let resetTimeout;
  
    function resetHeaderState() {
      sectionHeader.classList.remove('hidden');
      sectionHeader.classList.remove('scroll-up');
      if (sectionIndexPage) {
        sectionIndexPage.classList.remove('hidden', 'scroll-up');
      }
      isHidden = false;
    }
  
    function updateHeaderVisibility() {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
  
      if (currentTime - lastTime < scrollDelay) return;
  
      const scrollDistance = Math.abs(currentScrollY - lastScrollY);
      if (scrollDistance < 5) return;
  
      // Clear any pending reset
      if (resetTimeout) {
        clearTimeout(resetTimeout);
      }
  
      if (currentScrollY < visibilityThreshold) {
        // Smoothly transition when near top
        resetTimeout = setTimeout(resetHeaderState, 150);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        if (!isHidden) {
          sectionHeader.classList.add('hidden');
          sectionHeader.classList.remove('scroll-up');
          isHidden = true;
        }
      } else {
        // Scrolling up
        if (isHidden) {
          sectionHeader.classList.remove('hidden');
          sectionHeader.classList.add('scroll-up');
          isHidden = false;
        }
      }
  
      lastScrollY = currentScrollY;
      lastTime = currentTime;
      ticking = false;
    }
  
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          updateHeaderVisibility();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  });