document.addEventListener('DOMContentLoaded', function () {
  const sectionHeader = document.querySelector('.section-header');
  const sectionAnnouncementBar = document.querySelector('.navigation-banner');
  
  if (!sectionHeader) {
      console.warn('Element with class "section-header" not found. Check if the class is correctly set in HTML.');
      return;
  }

  sectionHeader.classList.add('sticky');
  sectionAnnouncementBar.classList.add('sticky');

  // ** Toggle this variable to enable or disable hiding behavior **
  const enableHideOnScroll = true;  // Set to `false` for always sticky

  if (!enableHideOnScroll) {
      // If hiding behavior is disabled, keep header always visible
      return;
  }

  let lastScrollY = window.scrollY;
  const visibilityThreshold = 50;
  let isHidden = false;
  let ticking = false;  // For requestAnimationFrame
  let lastTime = Date.now();
  const scrollDelay = 100;  // Minimum time between scroll updates in ms
  let actionTimeout;  // Timeout for preventing flicker between scroll up and down
  const hideDelay = 150;  // Delay for hiding header (in ms)
  const showDelay = 200;  // Delay for showing header (in ms)

  function updateHeaderVisibility() {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();

      // Only process scroll events if enough time has passed
      if (currentTime - lastTime < scrollDelay) {
          return;
      }

      // Determine scroll direction and distance
      const scrollDistance = Math.abs(currentScrollY - lastScrollY);
      
      // Only process significant scroll movements
      if (scrollDistance < 5) {
          return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > visibilityThreshold) {
          // Scrolling down
          if (!isHidden) {
              clearTimeout(actionTimeout); // Clear any existing timeout before applying changes
              actionTimeout = setTimeout(() => {
                  sectionHeader.classList.add('hidden');
                  sectionAnnouncementBar.classList.add('hidden');
                  isHidden = true;
              }, hideDelay);  // Add a slight delay before hiding the header
          }
      } else if (currentScrollY < lastScrollY) {
          // Scrolling up
          if (isHidden) {
              clearTimeout(actionTimeout); // Clear any existing timeout before applying changes
              actionTimeout = setTimeout(() => {
                  sectionHeader.classList.remove('hidden');
                  sectionAnnouncementBar.classList.remove('hidden');
                  isHidden = false;
              }, showDelay);  // Add a slight delay before showing the header
          }
      }

      lastScrollY = currentScrollY;
      lastTime = currentTime;
      ticking = false;
  }

  // Optimized scroll event listener with requestAnimationFrame
  window.addEventListener('scroll', function() {
      if (!ticking) {
          window.requestAnimationFrame(function() {
              updateHeaderVisibility();
              ticking = false;
          });
          ticking = true;
      }
  }, { passive: true });

  // Trigger a scroll update when the page is loaded
  window.scrollTo(0, 0);
});
