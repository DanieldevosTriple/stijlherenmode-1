document.addEventListener('DOMContentLoaded', function () {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const closeMenuButton = document.querySelector('.close-menu');
    const backButton = document.querySelector('.back-button');
    const menuTitle = document.querySelector('.current-menu-title');
    const menuContainer = document.querySelector('.menu-container');
    const body = document.body;
    let resizeTimer;

    // Menu state management for mobile
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
                    // Show the mobile menu header when opening a submenu
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

    // Mobile Menu Navigation Functions
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
            // Slide animation
            menuContainer.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                // Remove the current menu state
                menuHistory.pop();
                const previousState = menuHistory[menuHistory.length - 1];
                
                // Hide all panels
                document.querySelectorAll('.menu-panel').forEach(panel => {
                    panel.classList.remove('active');
                });
                
                // Show the previous panel
                previousState.panel.classList.add('active');
                
                // Restore title and back button
                menuTitle.textContent = previousState.title;
                backButton.style.display = menuHistory.length > 1 ? 'block' : 'none';
                
                // Reset the transform
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

    function resetMenuState() {
        currentLevel = 0;
        menuHistory.length = 1; // Reset menu history
        menuHistory[0].panel.classList.add('active'); // Show the initial menu
        menuTitle.textContent = 'Menu'; // Reset title
        backButton.style.display = 'none'; // Hide back button
        document.querySelector('.mobile-menu-header').style.display = 'none'; // Hide header
    }

    // Initialize mobile menu
    initializeMobileMenu();

    // ==========================================
    // Desktop Menu Functionality (Mega Menu)
    // ==========================================
    const desktopNavItems = document.querySelectorAll('.nav-item');

    // Show mega-menu on hover
    desktopNavItems.forEach(item => {
        const megaMenu = item.querySelector('.mega-menu');

        if (megaMenu) {
            item.addEventListener('mouseenter', function () {
                megaMenu.style.display = 'block';
            });

            item.addEventListener('mouseleave', function () {
                megaMenu.style.display = 'none';
            });
        }
    });

    // Dynamically adjust the number of columns in the mega-menu
    function updateMegaMenuColumns(megaMenu) {
        const links = megaMenu.querySelectorAll('.mega-menu__link');
        let columns = 4; // Default to 4 columns

        if (links.length <= 6) {
            columns = 2;
        } else if (links.length <= 12) {
            columns = 3;
        } else {
            columns = 4;
        }

        megaMenu.querySelector('.mega-menu__content').style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    desktopNavItems.forEach(item => {
        const megaMenu = item.querySelector('.mega-menu');
        if (megaMenu) {
            updateMegaMenuColumns(megaMenu);
        }
    });
});
