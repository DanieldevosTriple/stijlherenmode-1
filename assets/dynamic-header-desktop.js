document.addEventListener('DOMContentLoaded', function() {
  const stickyHeader = document.querySelector('sticky-header');
  const header = document.querySelector('.section-header');
  const banner = document.querySelector('.utility-bar');
  
  if (!stickyHeader || !header) return;

  const config = {
    hideThreshold: 50,
    scrollThreshold: 5,
    hideDelay: 150,
    showDelay: 200
  };

  let state = {
    lastScrollY: window.scrollY,
    isHidden: false,
    scrollTimeout: null,
    actionTimeout: null
  };

  const stickyType = stickyHeader.dataset.stickyType;

  function initializeHeader() {
    switch (stickyType) {
      case 'enabled':
        enableSticky();
        break;
      case 'hide_scroll':
        enableStickyWithHide();
        break;
      case 'disabled':
      default:
        disableSticky();
        break;
    }
  }

  function disableSticky() {
    header.style.position = 'relative';
    if (banner) banner.style.position = 'relative';
    window.removeEventListener('scroll', handleScroll);
  }

  function enableSticky() {
    header.style.position = 'fixed';
    if (banner) banner.style.position = 'fixed';
    window.removeEventListener('scroll', handleScroll);
  }

  function enableStickyWithHide() {
    header.style.position = 'fixed';
    if (banner) banner.style.position = 'fixed';
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  function handleScroll() {
    if (state.scrollTimeout) return;

    state.scrollTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        updateHeaderVisibility();
        state.scrollTimeout = null;
      });
    }, 10);
  }

  function updateHeaderVisibility() {
    const currentScrollY = window.scrollY;
    const scrollDistance = Math.abs(currentScrollY - state.lastScrollY);

    if (scrollDistance < config.scrollThreshold) return;

    if (currentScrollY > state.lastScrollY && currentScrollY > config.hideThreshold) {
      if (!state.isHidden) {
        clearTimeout(state.actionTimeout);
        state.actionTimeout = setTimeout(() => {
          header.classList.add('sticky-hide');
          if (banner) banner.classList.add('sticky-hide');
          state.isHidden = true;
        }, config.hideDelay);
      }
    } else {
      if (state.isHidden) {
        clearTimeout(state.actionTimeout);
        state.actionTimeout = setTimeout(() => {
          header.classList.remove('sticky-hide');
          if (banner) banner.classList.remove('sticky-hide');
          state.isHidden = false;
        }, config.showDelay);
      }
    }

    state.lastScrollY = currentScrollY;
  }

  // Initialize header behavior
  initializeHeader();
});