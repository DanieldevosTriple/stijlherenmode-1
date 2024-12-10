document.addEventListener('DOMContentLoaded', function () {
    console.log('Script geladen: sticky instelling met kleurenswitch is actief.');

    const sectionHeader = document.querySelector('.section-header');
    const sectionIndexPage = document.querySelector('.index-page');
    const navLinks = document.querySelectorAll('.nav-link, .search, .cart-link');
    let lastScrollY = window.scrollY;

    if (sectionHeader && sectionIndexPage) {
        console.log('Elementen "section-header" en "index-page" gevonden.');

        // Check initial state on page load
        function checkInitialConditions() {
            if (sectionIndexPage && window.scrollY === 0 && sectionIndexPage.dataset.theme === 'dark' && sectionIndexPage.getAttribute('aria-hidden') === 'false') {
                navLinks.forEach(link => {
                    link.style.color = 'white';
                    link.style.setProperty('color', 'white', 'important');
                });
                console.log('Initial: Kleur van links aangepast naar wit.');
            } else {
                navLinks.forEach(link => {
                    link.style.color = '';
                });
            }
        }

        checkInitialConditions();

        // Scroll event listener toevoegen
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY) {
                // Gebruiker scrollt naar beneden
                sectionHeader.classList.remove('scroll-up');
                sectionHeader.classList.add('hidden');
                navLinks.forEach(link => {
                    link.style.color = '';
                });
                console.log('Scrollt naar beneden: "hidden" toegevoegd, kleur reset.');
            } else if (currentScrollY < lastScrollY) {
                // Gebruiker scrollt omhoog
                sectionHeader.classList.remove('hidden');
                sectionHeader.classList.add('scroll-up');
                sectionIndexPage.classList.add('scroll-up');
                console.log('Scrollt omhoog: "scroll-up" toegevoegd, "hidden" verwijderd.');

                if (window.scrollY === 0 && sectionIndexPage.dataset.theme === 'dark' && sectionIndexPage.getAttribute('aria-hidden') === 'false') {
                    navLinks.forEach(link => {
                        link.style.color = 'white';
                        link.style.setProperty('color', 'white', 'important');
                    });
                    console.log('Scroll omhoog en bovenaan: Kleur van links aangepast naar wit.');
                }
            }

            // Wanneer de gebruiker bovenaan is
            if (currentScrollY === 0) {
                sectionHeader.classList.remove('hidden', 'scroll-up');
                sectionIndexPage.classList.remove('hidden', 'scroll-up');

                if (sectionIndexPage.dataset.theme === 'dark' && sectionIndexPage.getAttribute('aria-hidden') === 'false') {
                    navLinks.forEach(link => {
                        link.style.color = 'white';
                        link.style.setProperty('color', 'white', 'important');
                    });
                    console.log('Bovenaan de pagina: Kleur van links aangepast naar wit.');
                } else {
                    navLinks.forEach(link => {
                        link.style.color = '';
                    });
                }
            }

            // Update de laatste scrollpositie
            lastScrollY = currentScrollY;
        });

        // Observer voor aria-hidden veranderingen
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'aria-hidden') {
                    const isHidden = sectionIndexPage.getAttribute('aria-hidden') === 'true';
                    if (isHidden) {
                        navLinks.forEach(link => {
                            link.style.color = '';
                        });
                        console.log('aria-hidden = true: Kleur reset.');
                    } else if (!isHidden && sectionIndexPage.dataset.theme === 'dark') {
                        navLinks.forEach(link => {
                            link.style.color = 'white';
                            link.style.setProperty('color', 'white', 'important');
                        });
                        console.log('aria-hidden = false en dark theme: Kleur van links aangepast naar wit.');
                    }
                }
            });
        });

        observer.observe(sectionIndexPage, { attributes: true });
    } else {
        console.warn('Elementen "section-header" of "index-page" niet gevonden. Controleer je HTML.');
    }
});
