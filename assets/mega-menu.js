document.addEventListener('DOMContentLoaded', function() {
    // Common Elements
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
    // Mega Menu Desktop Functionality
    // ==========================================
    function initializeMegaMenu() {
        const menuItems = document.querySelectorAll('.has-megamenu');
        
        menuItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            const menuId = link.textContent.trim().toLowerCase().replace(/\s+/g, '-');
            const megaMenu = document.querySelector(`.mega-menu[data-parent="${menuId}"]`);
            
            if (megaMenu) {
                // Handle mouse enter on menu item
                item.addEventListener('mouseenter', () => {
                    // Close any other open mega menus
                    document.querySelectorAll('.mega-menu.active').forEach(menu => {
                        if (menu !== megaMenu) {
                            menu.classList.remove('active');
                        }
                    });

                    // Update mega menu position based on header height
                    const headerHeight = document.querySelector('sticky-header').offsetHeight;
                    megaMenu.style.setProperty('--header-height', `${headerHeight}px`);
                    megaMenu.classList.add('active');
                });

                // Handle mouse leave from menu item
                item.addEventListener('mouseleave', (event) => {
                    if (!event.relatedTarget?.closest('.mega-menu')) {
                        megaMenu.classList.remove('active');
                    }
                });

                // Handle mouse leave from mega menu
                megaMenu.addEventListener('mouseleave', () => {
                    megaMenu.classList.remove('active');
                });

                // Handle touch events for mobile/tablet
                link.addEventListener('click', (event) => {
                    if (window.innerWidth > 991 && megaMenu && !megaMenu.classList.contains('active')) {
                        event.preventDefault();
                        megaMenu.classList.add('active');
                    }
                });
            }
        });

        // Close mega menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.has-megamenu') && !event.target.closest('.mega-menu')) {
                document.querySelectorAll('.mega-menu.active').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });
    }

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
            // Slide animation
            menuContainer.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                // Remove current menu state
                menuHistory.pop();
                const previousState = menuHistory[menuHistory.length - 1];
                
                // Hide all panels
                document.querySelectorAll('.menu-panel').forEach(panel => {
                    panel.classList.remove('active');
                });
                
                // Show previous panel
                previousState.panel.classList.add('active');
                
                // Update title and back button
                menuTitle.textContent = previousState.title;
                backButton.style.display = menuHistory.length > 1 ? 'block' : 'none';
                
                // Reset transform
                menuContainer.style.transform = 'translateX(0)';
                
                currentLevel--;
            }, 300);
        }
    }

    function resetMenuState() {
        // Reset menu history
        menuHistory.length = 1;
        currentLevel = 0;
        
        // Hide all panels except main menu
        document.querySelectorAll('.menu-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.querySelector('.menu-panel[data-level="0"]').classList.add('active');
        
        // Reset title and back button
        menuTitle.textContent = 'Menu';
        backButton.style.display = 'none';
        
        // Reset transform
        if (menuContainer) {
            menuContainer.style.transform = 'translateX(0)';
        }
    }

    function closeMobileMenu() {
        mobileMenuOverlay.classList.remove('show');
        closeMenuButton.classList.remove('show');
        hamburgerMenu.classList.remove('hidden');
        body.classList.remove('no-scroll');
        resetMenuState();
    }

    // ==========================================
    // Window Resize Handling
    // ==========================================
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 991) {
                // Reset mobile menu state when switching to desktop
                if (mobileMenuOverlay?.classList.contains('show')) {
                    closeMobileMenu();
                }
            }
            
            // Update mega menu positions
            document.querySelectorAll('.mega-menu.active').forEach(menu => {
                const headerHeight = document.querySelector('sticky-header').offsetHeight;
                menu.style.setProperty('--header-height', `${headerHeight}px`);
            });
        }, 250);
    });

    // Initialize both menus
    initializeMegaMenu();
    initializeMobileMenu();
});