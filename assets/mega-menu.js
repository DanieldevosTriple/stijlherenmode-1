document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const closeMenuButton = document.querySelector('.close-menu');
    const backButton = document.querySelector('.back-button');
    const menuTitle = document.querySelector('.current-menu-title');
    const body = document.body;
    let activeMenu = null;
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
                openMobileMenu();
            });
        }

        // Handle close button click
        if (closeMenuButton) {
            closeMenuButton.addEventListener('click', () => {
                closeMobileMenu();
            });
        }

        // Initialize submenu buttons
        document.querySelectorAll('.mobile-facets__menu-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const submenu = e.currentTarget.nextElementSibling;
                if (submenu) {
                    openSubmenu(submenu);
                }
            });
        });

        // Handle back button
        if (backButton) {
            backButton.addEventListener('click', () => {
                goBack();
            });
        }

        // Close when clicking overlay
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', (e) => {
                if (e.target === mobileMenuOverlay) {
                    closeMobileMenu();
                }
            });
        }
    }

    // ==========================================
    // Mobile Menu Navigation Functions
    // ==========================================
    function openMobileMenu() {
        mobileMenuOverlay.classList.add('show');
        closeMenuButton.classList.add('show');
        hamburgerMenu.classList.add('hidden');
        body.classList.add('no-scroll');
        activeMenu = 'main';
        updateMenuTitle('Menu');
    }

    function closeMobileMenu() {
        mobileMenuOverlay.classList.remove('show');
        closeMenuButton.classList.remove('show');
        hamburgerMenu.classList.remove('hidden');
        body.classList.remove('no-scroll');
        resetMobileMenu();
    }

    function openSubmenu(submenu) {
        const currentTitle = submenu.dataset.title || submenu.previousElementSibling.textContent.trim();
        menuStack.push({ menu: activeMenu, title: menuTitle.textContent });
        activeMenu = submenu.dataset.submenu;
        
        backButton.classList.remove('hidden');
        submenu.classList.add('active');
        updateMenuTitle(currentTitle);
    }

    function goBack() {
        const lastMenu = menuStack.pop();
        if (lastMenu) {
            const currentSubmenu = document.querySelector(`.mobile-facets__submenu.active`);
            if (currentSubmenu) {
                currentSubmenu.classList.remove('active');
            }
            activeMenu = lastMenu.menu;
            updateMenuTitle(lastMenu.title);

            if (menuStack.length === 0) {
                backButton.classList.add('hidden');
            }
        }
    }

    function updateMenuTitle(title) {
        if (menuTitle) {
            menuTitle.textContent = title;
        }
    }

    function resetMobileMenu() {
        menuStack.length = 0;
        activeMenu = null;
        backButton.classList.add('hidden');
        updateMenuTitle('Menu');
        document.querySelectorAll('.mobile-facets__submenu.active').forEach(submenu => {
            submenu.classList.remove('active');
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
                if (mobileMenuOverlay?.classList.contains('show')) {
                    closeMobileMenu();
                }
            }
        }, 250);
    });

    // Initialize both menus
    initializeMegaMenu();
    initializeMobileMenu();
});