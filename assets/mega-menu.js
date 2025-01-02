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
                    document.querySelector('.mobile-menu-header').style.display = 'flex';
                    backButton.style.display = 'block';
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
        
        // Verberg de hoofdmenu header en toon de submenu header bij het openen van een submenu
        document.querySelector('.mobile-menu-header').style.display = 'flex'; // Toon de header bij submenu

        // Verberg de huidige panel
        currentPanel.classList.remove('active');
        
        // Toon de volgende panel (submenu)
        nextPanel.classList.add('active');
        
        // Update de menu geschiedenis
        menuHistory.push({
            title: title,
            panel: nextPanel
        });

        // Update de titel en toon de back-knop
        menuTitle.textContent = title;
        backButton.style.display = 'block';
    }

    // Navigate back (submenu closes, menu comes back from left)
    function navigateBack() {
        if (menuHistory.length > 1) {
            const currentPanel = menuHistory[menuHistory.length - 1].panel;
            currentPanel.classList.add('close');  // Sluit het huidige submenu (beweegt naar rechts)

            setTimeout(() => {
                // Verwijder de actieve klasse en reset de positie
                currentPanel.classList.remove('active', 'close');
                
                const previousState = menuHistory[menuHistory.length - 2];
                const previousPanel = previousState.panel;
                
                // Toon het vorige paneel (hoofdmenu)
                previousPanel.classList.add('active');
                menuTitle.textContent = previousState.title;
                
                // Verberg de terugknop en de header bij terug naar het hoofdmenu
                backButton.style.display = menuHistory.length > 1 ? 'block' : 'none';
                document.querySelector('.mobile-menu-header').style.display = 'none'; // Verberg de header bij het hoofdmenu
            }, 300);
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
        });
        
        // Reset history
        menuHistory.length = 1;
        menuHistory[0].panel.classList.add('active');
    }

    // Initialize mobile menu
    initializeMobileMenu();
});
