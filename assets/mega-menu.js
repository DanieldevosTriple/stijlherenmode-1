// mega-menu.js
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.querySelector('.mobile-menu-overlay');
    const backButton = document.querySelector('.back-button');
    const menuTitle = document.querySelector('.current-menu-title');
    const menuStack = [];

    // Initialize submenu navigation
    function initializeSubmenus() {
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
                    
                    // Hide all other active submenus at the same level
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
    }

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

    // Reset mobile menu state
    function resetMobileMenu() {
        menuStack.length = 0;
        if (menuTitle) {
            menuTitle.textContent = 'Menu';
        }
        if (backButton) {
            backButton.style.display = 'none';
        }
        document.querySelectorAll('.submenu-panel.active').forEach(panel => {
            panel.classList.remove('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu && 
            mobileMenu.classList.contains('show') && 
            !e.target.closest('.mobile-menu-overlay') && 
            !e.target.closest('.hamburger-menu')) {
            mobileMenu.classList.remove('show');
            resetMobileMenu();
        }
    });

    // Initialize functionality
    initializeSubmenus();
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 991) {
                resetMobileMenu();
            }
        }, 250);
    });
});