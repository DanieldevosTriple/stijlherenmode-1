document.addEventListener('DOMContentLoaded', function () {
  const sectionHeader = document.querySelector('.section-header');
  const sectionAnnouncementBar = document.querySelector('.announcement-bar-section');
  const utilityBar = document.querySelector('.announcement-bar-section');
  
  if (!sectionHeader || !utilityBar) {
    console.warn('Elementen met de juiste klassen niet gevonden.');
    return;
  }

  // Controleer of data-sticky-enabled aanwezig is op zowel header en utilityBar
  if (sectionHeader?.dataset.stickyEnabled) {
    sectionHeader.classList.add('sticky');
  }
  if (utilityBar?.dataset.stickyEnabled) {
    sectionAnnouncementBar.classList.add('sticky');
    utilityBar.classList.add('sticky');
  }
  
  let lastScrollY = window.scrollY;
  const visibilityThreshold = 50;
  let isHidden = false;
  let ticking = false;
  let lastTime = Date.now();
  const scrollDelay = 100;
  let resetTimeout;

  function resetHeaderState() {
    if (window.scrollY === 0) {
      clearTimeout(resetTimeout);
      sectionHeader.style.transition = 'none';
      sectionHeader.classList.remove('hidden', 'scroll-up');
      if (utilityBar?.dataset.stickyEnabled) {
        utilityBar.classList.remove('hidden', 'scroll-up');
      }
      setTimeout(() => {
        sectionHeader.style.transition = '';
      }, 10);
      isHidden = false;
      return;
    }
  }

  function updateHeaderVisibility() {
    const currentScrollY = window.scrollY;
    const currentTime = Date.now();

    if (currentScrollY === 0) {
      resetHeaderState();
      return;
    }

    if (currentTime - lastTime < scrollDelay) return;
    const scrollDistance = Math.abs(currentScrollY - lastScrollY);
    if (scrollDistance < 5) return;

    if (currentScrollY > lastScrollY && currentScrollY > visibilityThreshold) {
      if (!isHidden) {
        sectionHeader.classList.add('hidden');
        sectionHeader.classList.remove('scroll-up');
        if (utilityBar?.dataset.stickyEnabled) {
          utilityBar.classList.add('hidden');
          utilityBar.classList.remove('scroll-up');
        }
        isHidden = true;
      }
    } else if (currentScrollY < lastScrollY) {
      if (isHidden) {
        sectionHeader.classList.remove('hidden');
        sectionHeader.classList.add('scroll-up');
        if (utilityBar?.dataset.stickyEnabled) {
          utilityBar.classList.remove('hidden');
          utilityBar.classList.add('scroll-up');
        }
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

  resetHeaderState();
});
