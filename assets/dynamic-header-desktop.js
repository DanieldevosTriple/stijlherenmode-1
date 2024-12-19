document.addEventListener('DOMContentLoaded', function () {
    console.log('Script geladen: sticky instelling is actief.');

    const sectionHeader = document.querySelector('.section-header');
    const sectionIndexPage = document.querySelector('.index-page');

    if (!sectionHeader) {
        console.warn('Element met klasse "section-header" niet gevonden. Controleer of de klasse correct is ingesteld in de HTML.');
        return;
    }

    sectionHeader.classList.add('sticky');
    console.log('Klasse "sticky" succesvol toegevoegd aan section-header.');

    let lastScrollY = window.scrollY;
    let scrollTimeout;

    function handleScroll() {
        const currentScrollY = window.scrollY;

        // Drempel om kleine, onbedoelde verschuivingen te voorkomen
        const delta = currentScrollY - lastScrollY;
        if (Math.abs(delta) < 5) {
            // Bij hele kleine verschuiving niets doen
            return;
        }

        if (currentScrollY > lastScrollY) {
            // Gebruiker scrollt naar beneden
            sectionHeader.classList.remove('scroll-up');
            sectionHeader.classList.add('hidden');
            console.log('Scrollt naar beneden: "hidden" toegevoegd, "scroll-up" verwijderd.');
        } else if (currentScrollY < lastScrollY) {
            // Gebruiker scrollt omhoog
            sectionHeader.classList.remove('hidden');
            sectionHeader.classList.add('scroll-up');
            if (sectionIndexPage) {
                sectionIndexPage.classList.add('scroll-up');
            }
            console.log('Scrollt omhoog: "scroll-up" toegevoegd, "hidden" verwijderd.');
        }

        // Wanneer de gebruiker bovenaan is
        if (currentScrollY === 0) {
            sectionHeader.classList.remove('hidden', 'scroll-up');
            if (sectionIndexPage) {
                sectionIndexPage.classList.remove('hidden', 'scroll-up');
            }
            console.log('Bovenaan de pagina: alleen "sticky" aanwezig.');
        }

        lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', () => {
        // Clear bestaande timeout
        clearTimeout(scrollTimeout);
        // Wacht bijvoorbeeld 100ms na scroll voor update
        scrollTimeout = setTimeout(handleScroll, 100);
    });
});
