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
        
        // Only show header when entering submenu
        if (menuHistory.length === 1) {
            document.querySelector('.mobile-menu-header').style.display = 'flex';
        }
        
        currentPanel.style.transform = 'translateX(-100%)';
        nextPanel.style.visibility = 'visible';
        nextPanel.classList.add('active');
        nextPanel.style.transform = 'translateX(0)';
        
        menuHistory.push({ title, panel: nextPanel });
        menuTitle.textContent = title;
        backButton.style.display = 'block';
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
                
                // Hide header when returning to main menu
                if (menuHistory.length === 1) {
                    document.querySelector('.mobile-menu-header').style.display = 'none';
                }
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
        document.querySelectorAll('.menu-panel').forEach(panel => {
            panel.classList.remove('active');
            panel.style.transform = '';
            panel.style.visibility = 'hidden';
        });
     
        menuHistory.length = 1;
        const mainPanel = menuHistory[0].panel;
        mainPanel.style.visibility = 'visible'; 
        mainPanel.style.transform = 'translateX(0)';
        mainPanel.classList.add('active');
        
        // Hide header when returning to main menu
        document.querySelector('.mobile-menu-header').style.display = 'none';
        backButton.style.display = 'none';
        menuTitle.textContent = 'Menu';
     }

    // Initialize mobile menu
    initializeMobileMenu();
});
