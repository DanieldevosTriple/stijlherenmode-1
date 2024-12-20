document.addEventListener('DOMContentLoaded', function () {
    console.log('Script loaded: sticky functionality is active.');
    const sectionHeader = document.querySelector('.section-header');
    const sectionIndexPage = document.querySelector('.index-page');
    
    if (!sectionHeader) {
        console.warn('Element with class "section-header" not found. Check if the class is correctly set in HTML.');
        return;
    }

    console.log('Element with class "section-header" found.');
    sectionHeader.classList.add('sticky');
    console.log('Class "sticky" successfully added to section-header.');

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
                sectionHeader.classList.remove('scroll-up');
                isHidden = true;
                console.log('Scrolling down: header hidden.');
            }
        } else if (currentScrollY < lastScrollY) {
            // Scrolling up
            if (isHidden) {
                // Use a timeout to ensure smooth transition
                setTimeout(() => {
                    sectionHeader.classList.remove('hidden');
                    sectionHeader.classList.add('scroll-up');
                }, 50);
                isHidden = false;
                console.log('Scrolling up: header visible.');
            }
        }

        // Reset header at top of page
        if (currentScrollY === 0) {
            sectionHeader.classList.remove('hidden', 'scroll-up');
            if (sectionIndexPage) {
                sectionIndexPage.classList.remove('hidden', 'scroll-up');
            }
            isHidden = false;
            console.log('At top of page: header reset.');
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