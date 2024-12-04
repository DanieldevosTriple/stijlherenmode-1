document.addEventListener('DOMContentLoaded', function () {
    const colorRadios = document.querySelectorAll('input[type="radio"][name^="Color"]'); // Color swatches
    const mediaWrapperContainer = document.querySelector('.product__media-wrapper'); // Container for media gallery

    const updateMediaGallery = (selectedColor) => {
        console.log('Selected Color:', selectedColor);  // Log the selected color

        // Bouw de URL met de query parameters
        const url = new URL(window.location.href);  // Gebruik de huidige URL
        url.searchParams.set('color', selectedColor);  // Voeg de geselecteerde kleur toe aan de query string

        fetch(url, {  // Stuur het GET-verzoek naar de URL met de parameters
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
        .then(response => response.text())
        .then(data => {
            // Gebruik DOMParser om de nieuwe HTML te extraheren
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const updatedGallery = doc.querySelector('.product__media-wrapper').innerHTML;
            mediaWrapperContainer.innerHTML = updatedGallery;  // Vervang de oude galerij met de nieuwe inhoud
            console.log('Product media gallery updated');
        })
        .catch(error => console.error('Error fetching media gallery:', error));
    };

    // Event listener voor swatches
    if (colorRadios.length) {
        colorRadios.forEach((radio) => {
            radio.addEventListener('change', function () {
                if (radio.checked) {
                    const selectedColor = radio.value;
                    console.log('Radio change detected:', selectedColor); // Log wanneer een radio button wordt geselecteerd
                    updateMediaGallery(selectedColor); // Dynamisch de galerij bijwerken
                }
            });
        });
    }
});
