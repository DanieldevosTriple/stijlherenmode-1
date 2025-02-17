document.addEventListener('DOMContentLoaded', function () {
    // Configuration
    const CONFIG = {
        SCROLL_START: 100,      // Pixels to scroll before hiding
        THROTTLE_TIME: 150,     // Throttle time for scroll events in ms
        SCROLL_THRESHOLD: 5     // Minimum scroll movement to trigger header change
    };

    // Element selectors
    const elements = {
        stickyHeader: document.querySelector('sticky-header'),
        sectionHeader: document.querySelector('.section-header'),
        navigationBanner: document.querySelector('.navigation-banner')
    };

    // Validate required elements
    if (!elements.sectionHeader || !elements.stickyHeader) {
        console.warn('Required sticky header elements not found');
        return;
    }

    // Get and validate sticky behavior type
    const stickyType = elements.stickyHeader.dataset.stickyType;
    if (stickyType === 'disabled') return;

    // Initialize sticky classes
    if (['enabled', 'hide_scroll'].includes(stickyType)) {
        elements.sectionHeader.classList.add('sticky');
        elements.navigationBanner?.classList.add('sticky');
    }

    // Exit early if simple sticky behavior
    if (stickyType === 'enabled') return;

    // State management
    const state = {
        lastScrollY: window.scrollY,
        isHidden: false,
        lastScrollTime: Date.now(),
        lastDirection: null,
        ticking: false
    };

    // Header visibility handlers
    const headerActions = {
        hide: () => {
            if (!state.isHidden) {
                elements.sectionHeader.classList.add('hidden');
                elements.navigationBanner?.classList.add('hidden');
                state.isHidden = true;
                console.log('🔴 Hiding header');
            }
        },
        show: () => {
            if (state.isHidden) {
                elements.sectionHeader.classList.remove('hidden');
                elements.navigationBanner?.classList.remove('hidden');
                state.isHidden = false;
                console.log('🟢 Showing header');
            }
        }
    };

    function handleScroll() {
        const now = Date.now();

        // Throttle scroll events
        if (now - state.lastScrollTime < CONFIG.THROTTLE_TIME) {
            return;
        }

        state.lastScrollTime = now;

        if (!state.ticking) {
            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const scrollDelta = currentScrollY - state.lastScrollY;
                const newDirection = scrollDelta > 0 ? 'down' : 'up';

                // Process significant movement
                if (Math.abs(scrollDelta) > CONFIG.SCROLL_THRESHOLD) {
                    // Update direction if changed
                    if (newDirection !== state.lastDirection) {
                        state.lastDirection = newDirection;
                    }

                    // Handle scroll direction
                    if (newDirection === 'down' && currentScrollY > CONFIG.SCROLL_START) {
                        headerActions.hide();
                    } else if (newDirection === 'up') {
                        headerActions.show();
                    }
                }

                state.lastScrollY = currentScrollY;
                state.ticking = false;
            });
            state.ticking = true;
        }
    }

    // Attach scroll listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
});