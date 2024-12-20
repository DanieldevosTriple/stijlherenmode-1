document.addEventListener('DOMContentLoaded', function () {
    console.log('Script geladen: sticky instelling is actief.');

    const sectionHeader = document.querySelector('.section-header');
    const sectionIndexPage = document.querySelector('.index-page');

    if (sectionHeader) {
        console.log('Element met klasse "section-header" gevonden.');

        // Voeg de sticky klasse toe bij het laden
        sectionHeader.classList.add('sticky');
        console.log('Klasse "sticky" succesvol toegevoegd aan section-header.');

        let lastScrollY = window.scrollY; // Houdt de laatste scrollpositie bij
        const visibilityThreshold = 50; // Pixels afstand voor zichtbaar/verborgen maken
        let isHidden = false; // Houdt bij of de header verborgen is

        // Functie om de zichtbaarheid van de header te beheren
        function updateHeaderVisibility() {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > visibilityThreshold) {
                // Scroll naar beneden: verberg de header
                if (!isHidden) {
                    sectionHeader.classList.add('hidden');
                    sectionHeader.classList.remove('scroll-up');
                    isHidden = true;
                    console.log('Scrollt naar beneden: header verborgen.');
                }
            } else if (currentScrollY < lastScrollY) {
                // Scroll naar boven: toon de header
                if (isHidden) {
                    sectionHeader.classList.remove('hidden');
                    sectionHeader.classList.add('scroll-up');
                    isHidden = false;
                    console.log('Scrollt omhoog: header zichtbaar.');
                }
            }

            // Reset de header als de gebruiker bovenaan de pagina is
            if (currentScrollY === 0) {
                sectionHeader.classList.remove('hidden', 'scroll-up');
                if (sectionIndexPage) {
                    sectionIndexPage.classList.remove('hidden', 'scroll-up');
                }
                isHidden = false;
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
