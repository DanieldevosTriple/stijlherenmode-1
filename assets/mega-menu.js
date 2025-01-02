document.addEventListener('DOMContentLoaded', function () {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const closeMenuButton = document.querySelector('.close-menu');
    const backButton = document.querySelector('.back-button');
    const menuTitle = document.querySelector('.current-menu-title');
    const menuContainer = document.querySelector('.menu-container');
    const body = document.body;

    let currentLevel = 0;
    const menuHistory = [{
        title: 'Menu',
        panel: document.querySelector('.menu-panel[data-level="0"]')
    }];

    console.log('Menu Initialized', menuHistory);

    // Mobile Menu Functionality
    function initializeMobileMenu() {
        hamburgerMenu?.addEventListener('click', () => {
            console.log('Hamburger Menu Clicked');
            mobileMenuOverlay.classList.add('show');
            closeMenuButton.classList.add('show');
            hamburgerMenu.classList.add('hidden');
            body.classList.add('no-scroll');
            resetMenuState();
        });

        closeMenuButton?.addEventListener('click', closeMobileMenu);

        // Handle submenu navigation (drawer effect from the right)
        document.querySelectorAll('.submenu-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const targetId = toggle.getAttribute('data-target');
                const nextPanel = document.querySelector(`.menu-panel[data-menu="${targetId}"]`);
                const nextTitle = toggle.closest('.nav-item').querySelector('.nav-link').textContent.trim();

                console.log(`Submenu Toggle Clicked: ${nextTitle}`);

                if (nextPanel) {
                    document.querySelector('.mobile-menu-header').style.display = 'flex'; // Show header for submenu
                    backButton.style.display = 'block'; // Show back button
                    menuTitle.textContent = nextTitle;

                    // Show the next panel as a drawer sliding from the right
                    nextPanel.classList.add('active', 'submenu');
                    navigateForward(nextPanel, nextTitle);
                }
            });
        });

        // Back button navigation (slide back to the left)
        backButton?.addEventListener('click', navigateBack);

        // Close menu when clicking overlay
        mobileMenuOverlay?.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) {
                closeMobileMenu();
            }
        });
    }

    // Navigate forward (submenu sliding in from the right)
    function navigateForward(nextPanel, title) {
        const currentPanel = menuHistory[menuHistory.length - 1].panel;
        
        // Prepare panels for animation
        currentPanel.style.transform = 'translateX(-100%)';
        nextPanel.style.transform = 'translateX(100%)';
        nextPanel.style.visibility = 'visible';
        
        // Trigger animation
        requestAnimationFrame(() => {
            nextPanel.style.transform = 'translateX(0)';
            nextPanel.classList.add('active');
        });
    
        menuHistory.push({ title, panel: nextPanel });
        menuTitle.textContent = title;
        backButton.style.display = 'block';
        document.querySelector('.mobile-menu-header').style.display = 'flex';
    }

    // Navigate back (submenu closes, menu comes back from left)
    function navigateBack() {
        if (menuHistory.length > 1) {
            const currentPanel = menuHistory[menuHistory.length - 1].panel;
            const previousState = menuHistory[menuHistory.length - 2];
            const previousPanel = previousState.panel;
    
            previousPanel.style.visibility = 'visible';
            previousPanel.classList.add('active');
            previousPanel.style.transform = 'translateX(0)';
    
            currentPanel.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                currentPanel.classList.remove('active');
                currentPanel.style.visibility = 'hidden';
                menuHistory.pop();
                menuTitle.textContent = previousState.title;
                backButton.style.display = menuHistory.length > 1 ? 'block' : 'none';
            }, 300);
        }
    }

    // Close the mobile menu
    function closeMobileMenu() {
        console.log('Closing Mobile Menu');
        mobileMenuOverlay.classList.remove('show');
        closeMenuButton.classList.remove('show');
        hamburgerMenu.classList.remove('hidden');
        body.classList.remove('no-scroll');
        resetMenuState();
    }

    // Reset menu state
    function resetMenuState() {
        console.log('Resetting Menu State');
        // Hide all panels
        document.querySelectorAll('.menu-panel').forEach(panel => {
            panel.classList.remove('active', 'submenu');
        });

        // Reset history
        menuHistory.length = 1;
        menuHistory[0].panel.classList.add('active');
        console.log('Menu History after reset:', menuHistory);
    }

    // Initialize mobile menu
    initializeMobileMenu();
});
