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

    // Mobile Menu Functionality
    function initializeMobileMenu() {
        hamburgerMenu?.addEventListener('click', () => {
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

                if (nextPanel) {
                    document.querySelector('.mobile-menu-header').style.display = 'flex'; // Show header for submenu
                    backButton.style.display = 'block'; // Show back button
                    menuTitle.textContent = nextTitle;

                    // Show the next panel and apply the transition from right to left
                    nextPanel.classList.add('active', 'submenu');
                    setTimeout(() => {
                        nextPanel.style.transform = 'translateX(0)'; // Trigger the transition
                    }, 10); // This ensures the transition happens after the panel is added
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

        // Show the header for submenu
        document.querySelector('.mobile-menu-header').style.display = 'flex';

        // Hide the current panel
        currentPanel.classList.remove('active');

        // Show the next panel (submenu)
        nextPanel.classList.add('active');

        // Update the menu history
        menuHistory.push({
            title: title,
            panel: nextPanel
        });

        // Update title and show the back button
        menuTitle.textContent = title;
        backButton.style.display = 'block';
    }

    // Navigate back (submenu closes, menu comes back from left)
    function navigateBack() {
        if (menuHistory.length > 1) {
            const currentPanel = menuHistory[menuHistory.length - 1].panel;
            currentPanel.classList.add('close');  // Close the current submenu (slide to the right)

            setTimeout(() => {
                // Remove active class and reset position
                currentPanel.classList.remove('active', 'close');

                const previousState = menuHistory[menuHistory.length - 2];
                const previousPanel = previousState.panel;

                // Remove the current submenu from history
                menuHistory.pop();

                // Show the previous panel (main menu)
                previousPanel.classList.add('active');
                menuTitle.textContent = previousState.title;

                // Hide the back button and the header when returning to the main menu
                backButton.style.display = menuHistory.length > 1 ? 'block' : 'none';
                document.querySelector('.mobile-menu-header').style.display = 'none'; // Hide the header at main menu
            }, 300); // Ensure the transition completes before proceeding
        } else {
            console.log('Already at the main menu, no further back navigation possible.');
        }
    }

    // Close the mobile menu
    function closeMobileMenu() {
        mobileMenuOverlay.classList.remove('show');
        closeMenuButton.classList.remove('show');
        hamburgerMenu.classList.remove('hidden');
        body.classList.remove('no-scroll');
        resetMenuState();
    }

    // Reset menu state
    function resetMenuState() {
        // Hide all panels
        document.querySelectorAll('.menu-panel').forEach(panel => {
            panel.classList.remove('active', 'submenu');
            panel.style.transform = 'translateX(100%)'; // Reset position for next time
        });

        // Reset history
        menuHistory.length = 1;
        menuHistory[0].panel.classList.add('active');
    }

    // Initialize mobile menu
    initializeMobileMenu();
});
