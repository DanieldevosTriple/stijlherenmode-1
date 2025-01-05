document.addEventListener('DOMContentLoaded', function () {
    const sectionHeader = document.querySelector('.section-header');
    const sectionIndexPage = document.querySelector('.index-page');
    const sectionAnnouncementBar = document.querySelector('.navigation-banner'); 
    
    if (!sectionHeader) {
        console.warn('Element with class "section-header" not found. Check if the class is correctly set in HTML.');
        return;
    }

    sectionHeader.classList.add('sticky'); 
    sectionAnnouncementBar.classList.add('sticky');

    let lastScrollY = window.scrollY;
    const visibilityThreshold = 50;
    let isHidden = false;
    let ticking = false;  // For requestAnimationFrame
    let lastTime = Date.now();
    const scrollDelay = 100;  // Minimum time between scroll updates in ms

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
                sectionHeader.classList.add('hidden');
                sectionAnnouncementBar.classList.add('hidden');
                sectionHeader.classList.remove('scroll-up');
                sectionAnnouncementBar.classList.remove('scroll-up');
                isHidden = true;
            }
        } else if (currentScrollY < lastScrollY) {
            // Scrolling up
            if (isHidden) {
                // Use a timeout to ensure smooth transition
                setTimeout(() => {
                    sectionHeader.classList.remove('hidden');
                    sectionAnnouncementBar.classList.remove('hidden');
                    sectionHeader.classList.add('scroll-up');
                    sectionAnnouncementBar.classList.add('scroll-up');
                }, 50);
                isHidden = false;
            }
        }

        // Reset header at top of page
        if (currentScrollY === 0) {
            sectionHeader.classList.remove('hidden', 'scroll-up');
            sectionAnnouncementBar.classList.remove('hidden', 'scroll-up');
            if (sectionIndexPage) {
                sectionIndexPage.classList.remove('hidden', 'scroll-up');
            }
            isHidden = false;
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
});