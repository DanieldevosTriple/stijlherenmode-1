document.addEventListener('DOMContentLoaded', function () {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const closeMenuButton = document.querySelector('.close-menu');
    const backButton = document.querySelector('.back-button');
    const menuTitle = document.querySelector('.current-menu-title');
    const menuContainer = document.querySelector('.menu-container');
    const body = document.body;
    let resizeTimer;

    // Menu state management
    let currentLevel = 0;
    const menuHistory = [{
        title: 'Menu',
        panel: document.querySelector('.menu-panel[data-level="0"]')
    }];

    // ==========================================
    // Mobile Menu Functionality
    // ==========================================
    function initializeMobileMenu() {
        // Toggle menu visibility
        hamburgerMenu?.addEventListener('click', () => {
            mobileMenuOverlay.classList.add('show');
            closeMenuButton.classList.add('show');
            hamburgerMenu.classList.add('hidden');
            body.classList.add('no-scroll');
            
            // Reset menu state
            resetMenuState();
        });

        // Close menu
        closeMenuButton?.addEventListener('click', closeMobileMenu);
        
        // Handle submenu navigation
        document.querySelectorAll('.submenu-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const targetId = toggle.getAttribute('data-target');
                const nextPanel = document.querySelector(`.menu-panel[data-menu="${targetId}"]`);
                const nextTitle = toggle.closest('.nav-item').querySelector('.nav-link').textContent.trim();
                
                if (nextPanel) {
                    // Toon de mobile menu header bij het openen van een submenu
                    document.querySelector('.mobile-menu-header').style.display = 'flex';
                    backButton.style.display = 'block';
                    menuTitle.textContent = nextTitle;

                    navigateForward(nextPanel, nextTitle);
                }
            });
        });

        // Back button navigation
        backButton?.addEventListener('click', navigateBack);

        // Close menu when clicking overlay
        mobileMenuOverlay?.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) {
                closeMobileMenu();
            }
        });
    }

    // ==========================================
    // Mobile Menu Navigation Functions
    // ==========================================
    function navigateForward(nextPanel, title) {
        const currentPanel = menuHistory[menuHistory.length - 1].panel;
        
        // Slide animation
        menuContainer.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            // Hide current panel
            currentPanel.classList.remove('active');
            
            // Show next panel
            nextPanel.classList.add('active');
            
            // Update menu state
            currentLevel++;
            menuHistory.push({
                title: title,
                panel: nextPanel
            });
            
            // Show back button and update title
            backButton.style.display = 'block';
            menuTitle.textContent = title;
            
            // Reset transform
            menuContainer.style.transform = 'translateX(0)';
        }, 300);
    }

    function navigateBack() {
        if (menuHistory.length > 1) {
            // Slide animatie
            menuContainer.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                // Verwijder de huidige menu status
                menuHistory.pop();
                const previousState = menuHistory[menuHistory.length - 1];
                
                // Verberg alle panelen
                document.querySelectorAll('.menu-panel').forEach(panel => {
                    panel.classList.remove('active');
                });
                
                // Toon het vorige paneel
                previousState.panel.classList.add('active');
                
                // Herstel de titel en de back-knop
                menuTitle.textContent = previousState.title;
                backButton.style.display = menuHistory.length > 1 ? 'block' : 'none';
                
                // Reset de transform
                menuContainer.style.transform = 'translateX(0)';
                
                currentLevel--;
            }, 300);
        }
    }    

    function navigateBack() {
        if (menuHistory.length > 1) {
            // Slide animatie
            menuContainer.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                // Verwijder de huidige menu status
                menuHistory.pop();
                const previousState = menuHistory[menuHistory.length - 1];
                
                // Verberg alle panelen
                document.querySelectorAll('.menu-panel').forEach(panel => {
                    panel.classList.remove('active');
                });
                
                // Toon het vorige paneel
                previousState.panel.classList.add('active');
                
                // Herstel de titel en de back-knop
                menuTitle.textContent = previousState.title;
                backButton.style.display = menuHistory.length > 1 ? 'block' : 'none';
                
                // Verberg de header als we teruggaan naar het hoofdmenu
                document.querySelector('.mobile-menu-header').style.display = 'none';
                
                // Reset de transform
                menuContainer.style.transform = 'translateX(0)';
                
                currentLevel--;
            }, 300);
        }
    }    

    function closeMobileMenu() {
        mobileMenuOverlay.classList.remove('show');
        closeMenuButton.classList.remove('show');
        hamburgerMenu.classList.remove('hidden');
        body.classList.remove('no-scroll');
        resetMenuState();
    }

    // Initialize mobile menu
    initializeMobileMenu();
});
