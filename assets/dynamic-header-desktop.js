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

        // Scroll event listener toevoegen
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            // Scroll naar beneden
            if (currentScrollY > lastScrollY) {
                if (!sectionHeader.classList.contains('hidden')) {
                    sectionHeader.classList.remove('scroll-up');
                    sectionHeader.classList.add('hidden');
                    console.log('Scrollt naar beneden: "hidden" toegevoegd, "scroll-up" verwijderd.');
                }
            }
            // Scroll naar boven
            else if (currentScrollY < lastScrollY) {
                if (!sectionHeader.classList.contains('scroll-up')) {
                    sectionHeader.classList.remove('hidden');
                    sectionHeader.classList.add('scroll-up');
                    if (sectionIndexPage) {
                        sectionIndexPage.classList.add('scroll-up');
                    }
                    console.log('Scrollt omhoog: "scroll-up" toegevoegd, "hidden" verwijderd.');
                }
            }

            // Gebruiker is bovenaan
            if (currentScrollY === 0) {
                if (sectionHeader.classList.contains('hidden') || sectionHeader.classList.contains('scroll-up')) {
                    sectionHeader.classList.remove('hidden', 'scroll-up');
                    if (sectionIndexPage) {
                        sectionIndexPage.classList.remove('hidden', 'scroll-up');
                    }
                    console.log('Bovenaan de pagina: alleen "sticky" aanwezig.');
                }
            }

            // Update de laatste scrollpositie
            lastScrollY = currentScrollY;
        });
    } else {
        console.warn('Element met klasse "section-header" niet gevonden. Controleer of de klasse correct is ingesteld in de HTML.');
    }
});
