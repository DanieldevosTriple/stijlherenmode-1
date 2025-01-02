document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const closeMenuButton = document.querySelector('.close-menu');
    const backButton = document.querySelector('.back-button');
    const menuTitle = document.querySelector('.current-menu-title');
    const body = document.body;
    const menuStack = [];

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
        // Handle hamburger menu click
        if (hamburgerMenu) {
            hamburgerMenu.addEventListener('click', () => {
                mobileMenuOverlay.classList.add('show');
                closeMenuButton.classList.add('show');
                hamburgerMenu.classList.add('hidden');
                body.classList.add('no-scroll');
            });
        }

        // Handle close button click
        if (closeMenuButton) {
            closeMenuButton.addEventListener('click', () => {
                closeMobileMenu();
            });
        }

        // Initialize submenu navigation
        document.querySelectorAll('.has-submenu').forEach(item => {
            const submenuToggle = item.querySelector('.submenu-toggle');
            const submenu = item.querySelector('.submenu-panel');
            
            if (submenuToggle && submenu) {
                submenuToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const parentTitle = submenu.dataset.parent;
                    menuStack.push(menuTitle.textContent);
                    menuTitle.textContent = parentTitle;
                    
                    // Hide all other submenus at the same level
                    const currentLevel = submenu.parentElement.parentElement;
                    currentLevel.querySelectorAll('.submenu-panel.active').forEach(panel => {
                        if (panel !== submenu) {
                            panel.classList.remove('active');
                        }
                    });
                    
                    submenu.classList.add('active');
                    backButton.style.display = 'block';
                });
            }
        });

        // Handle back button navigation
        if (backButton) {
            backButton.addEventListener('click', () => {
                const activeSubmenu = document.querySelector('.submenu-panel.active');
                if (activeSubmenu) {
                    activeSubmenu.classList.remove('active');
                    menuTitle.textContent = menuStack.pop();
                    
                    if (menuStack.length === 0) {
                        backButton.style.display = 'none';
                    }
                }
            });
        }

        // Close menu when clicking overlay
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', (e) => {
                if (e.target === mobileMenuOverlay) {
                    closeMobileMenu();
                }
            });
        }
    }

    // ==========================================
    // Helper Functions
    // ==========================================
    function closeMobileMenu() {
        mobileMenuOverlay.classList.remove('show');
        closeMenuButton.classList.remove('show');
        hamburgerMenu.classList.remove('hidden');
        body.classList.remove('no-scroll');
        resetMobileMenuState();
    }

    function resetMobileMenuState() {
        menuStack.length = 0;
        if (menuTitle) menuTitle.textContent = 'Menu';
        if (backButton) backButton.style.display = 'none';
        document.querySelectorAll('.submenu-panel.active').forEach(panel => {
            panel.classList.remove('active');
        });
    }

    // ==========================================
    // Window Resize Handling
    // ==========================================
    let resizeTimer;
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