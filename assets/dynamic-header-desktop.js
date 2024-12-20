document.addEventListener('DOMContentLoaded', function () {
    console.log('Script geladen: sticky instelling is actief.');

    const sectionHeader = document.querySelector('.section-header');

    if (sectionHeader) {
        console.log('Element met klasse "section-header" gevonden.');

        let lastScrollY = window.scrollY; // Houdt de vorige scrollpositie bij

        // Scroll event listener toevoegen
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY) {
                // Scrollt naar beneden: header verbergen
                sectionHeader.classList.add('hidden');
                sectionHeader.classList.remove('scroll-up');
                console.log('Scrollt naar beneden: "hidden" toegevoegd.');
            } else {
                // Scrollt naar boven: header tonen
                sectionHeader.classList.add('scroll-up');
                sectionHeader.classList.remove('hidden');
                console.log('Scrollt omhoog: "scroll-up" toegevoegd.');
            }

            // Update de laatste scrollpositie
            lastScrollY = currentScrollY;
        });
    } else {
        console.warn('Element met klasse "section-header" niet gevonden. Controleer of de klasse correct is ingesteld in de HTML.');
    }
});
