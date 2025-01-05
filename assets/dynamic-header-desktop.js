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
    const DEBOUNCE_DELAY = 150; // Debounce delay in ms
    
    let lastScrollY = window.scrollY;
    let isHidden = false;
    let ticking = false;
    let downDebounceTimer = null;
    let upDebounceTimer = null;
    
    function updateDebugInfo(currentScrollY) {
        debugDisplay.innerHTML = `
            Current Scroll: ${Math.round(currentScrollY)}px<br>
            Last Scroll: ${Math.round(lastScrollY)}px<br>
            Is Hidden: ${isHidden}<br>
            Down Threshold: ${SCROLL_DOWN_THRESHOLD}px<br>
            Up Threshold: ${SCROLL_UP_THRESHOLD}px
        `;
    }
    
    function hideHeader() {
        if (!isHidden) {
            sectionHeader.classList.add('hidden');
            sectionAnnouncementBar.classList.add('hidden');
            isHidden = true;
            console.log('🔴 Hiding header - Down threshold reached');
        }
    }
    
    function showHeader() {
        if (isHidden) {
            sectionHeader.classList.remove('hidden');
            sectionAnnouncementBar.classList.remove('hidden');
            isHidden = false;
            console.log('🟢 Showing header - Up threshold reached');
        }
    }
    
    function updateHeaderVisibility() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        
        // Clear existing timers
        if (downDebounceTimer) clearTimeout(downDebounceTimer);
        if (upDebounceTimer) clearTimeout(upDebounceTimer);
        
        // Scrolling down
        if (scrollDelta > 0 && currentScrollY > SCROLL_DOWN_THRESHOLD) {
            downDebounceTimer = setTimeout(() => {
                hideHeader();
            }, DEBOUNCE_DELAY);
        }
        // Scrolling up
        else if (scrollDelta < 0) {
            upDebounceTimer = setTimeout(() => {
                showHeader();
            }, DEBOUNCE_DELAY);
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