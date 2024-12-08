document.addEventListener('DOMContentLoaded', function () {
    console.log('Script geladen: sticky instelling is actief.');

    // Controleer of het element met de klasse 'section-header' bestaat
    const sectionHeader = document.querySelector('.section-header');
    
    if (sectionHeader) {
        console.log('Element met klasse "section-header" gevonden.');
        
        // Voeg de klasse 'sticky' toe
        sectionHeader.classList.add('sticky');
        console.log('Klasse "sticky" succesvol toegevoegd aan section-header.');
    } else {
        console.warn('Element met klasse "section-header" niet gevonden. Controleer of de klasse correct is ingesteld in de HTML.');
    }
});