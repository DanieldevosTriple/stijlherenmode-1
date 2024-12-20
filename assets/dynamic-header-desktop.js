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
        let threshold = 10; // Minimale verandering in scrollpositie om updates te triggeren
        let isHidden = false; // Houd bij of de header verborgen is

        // Scroll event listener toevoegen
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            // Alleen reageren als de scrollpositie significant verandert
            if (Math.abs(currentScrollY - lastScrollY) < threshold) {
                return;
            }

            if (currentScrollY > lastScrollY) {
                // Gebruiker scrollt naar beneden
                if (!isHidden) {
                    sectionHeader.classList.remove('scroll-up');
                    sectionHeader.classList.add('hidden');
                    isHidden = true; // Markeer de header als verborgen
                    console.log('Scrollt naar beneden: "hidden" toegevoegd, "scroll-up" verwijderd.');
                }
            } else if (currentScrollY < lastScrollY) {
                // Gebruiker scrollt omhoog
                if (isHidden) {
                    sectionHeader.classList.remove('hidden');
                    sectionHeader.classList.add('scroll-up');
                    if (sectionIndexPage) {
                        sectionIndexPage.classList.add('scroll-up');
                    }
                    isHidden = false; // Markeer de header als zichtbaar
                    console.log('Scrollt omhoog: "scroll-up" toegevoegd, "hidden" verwijderd.');
                }
            }

            // Wanneer de gebruiker bovenaan is
            if (currentScrollY === 0) {
                sectionHeader.classList.remove('hidden', 'scroll-up');
                if (sectionIndexPage) {
                    sectionIndexPage.classList.remove('hidden', 'scroll-up');
                }
                isHidden = false; // Reset de zichtbaarheid van de header
                console.log('Bovenaan de pagina: alleen "sticky" aanwezig.');
            }

            // Update de laatste scrollpositie
            lastScrollY = currentScrollY;
        });
    } else {
        console.warn('Element met klasse "section-header" niet gevonden. Controleer of de klasse correct is ingesteld in de HTML.');
    }
}); 
