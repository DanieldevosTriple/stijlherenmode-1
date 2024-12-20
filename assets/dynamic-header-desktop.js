document.addEventListener('DOMContentLoaded', function () {
    console.log('Script geladen: sticky instelling is actief.');

    const sectionHeader = document.querySelector('.section-header');
    const sectionIndexPage = document.querySelector('.index-page');

    if (sectionHeader) {
        console.log('Element met klasse "section-header" gevonden.');

        // Voeg de sticky klasse toe bij het laden
        sectionHeader.classList.add('sticky');
        console.log('Klasse "sticky" succesvol toegevoegd aan section-header.');

        let lastScrollY = window.scrollY;
        let isHidden = false; // Houdt bij of de header verborgen is
        let isScrollingUp = false; // Houdt bij of de gebruiker omhoog scrolt
        const visibilityThreshold = 50; // Pixels afstand voor zichtbaar maken

        // Functie om de zichtbaarheid van de header te beheren
        function updateHeaderVisibility() {
            const currentScrollY = window.scrollY;

            // Scroll naar beneden
            if (currentScrollY > lastScrollY + visibilityThreshold && !isHidden) {
                sectionHeader.classList.remove('scroll-up');
                sectionHeader.classList.add('hidden');
                isHidden = true;
                isScrollingUp = false;
                console.log('Scrollt naar beneden: header verborgen.');
            }

            // Scroll naar boven
            if (currentScrollY < lastScrollY - visibilityThreshold && isHidden) {
                sectionHeader.classList.remove('hidden');
                sectionHeader.classList.add('scroll-up');
                isHidden = false;
                isScrollingUp = true;
                console.log('Scrollt omhoog: header zichtbaar.');
            }

            // Als de gebruiker bovenaan is, reset de header
            if (currentScrollY === 0) {
                sectionHeader.classList.remove('hidden', 'scroll-up');
                if (sectionIndexPage) {
                    sectionIndexPage.classList.remove('hidden', 'scroll-up');
                }
                isHidden = false;
                isScrollingUp = false;
                console.log('Bovenaan de pagina: header gereset.');
            }

            lastScrollY = currentScrollY; // Update laatste scrollpositie
        }

        // Scroll event listener
        window.addEventListener('scroll', updateHeaderVisibility);
    } else {
        console.warn('Element met klasse "section-header" niet gevonden. Controleer of de klasse correct is ingesteld in de HTML.');
    }
});
