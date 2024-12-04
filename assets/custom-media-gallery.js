document.addEventListener('DOMContentLoaded', function () {
    const variantSelector = document.querySelector('[name="id"]'); // Variant dropdown
    const colorRadios = document.querySelectorAll('input[type="radio"][name^="Color"]'); // Color swatches
    const mediaItems = document.querySelectorAll('.product__media-item'); // All media items
    const featuredImage = document.querySelector('.featured-media'); // Featured image container

    // Dynamisch het media-gallery element ophalen op basis van section.id
    const sectionId = document.querySelector('[data-section-id]').getAttribute('data-section-id'); // Zorg ervoor dat je het juiste section.id hebt
    const mediaGallery = document.querySelector(`#MediaGallery-${sectionId}`); // Media gallery met het dynamische ID

    const updateMediaGallery = (selectedColor) => {
        console.log('Selected Color:', selectedColor); // Log the selected color
        mediaItems.forEach((item) => {
            const mediaColor = item.dataset.variantColor;
            console.log('Item Color:', mediaColor); // Log the media color for each item

            // Alleen thumbnails aanpassen, de featured image blijft altijd zichtbaar
            if (item.classList.contains('media-thumbnail')) {
                if (mediaColor === selectedColor || selectedColor === 'all') {
                    console.log('Showing thumbnail for color:', mediaColor); // Log when showing an item
                    item.style.display = 'block';
                } else {
                    console.log('Hiding thumbnail for color:', mediaColor); // Log when hiding an item
                    item.style.display = 'none';
                }
            }
        });

        // Update media gallery if swatch is selected
        if (mediaGallery) {
            // Hier kun je de media gallery aanpassen, bijvoorbeeld door de kleur van de galerij bij te werken
            mediaGallery.setAttribute('data-selected-color', selectedColor);
            console.log('Updated media gallery with selected color:', selectedColor); // Log the update
        }
    };

    // Event listener voor swatches
    if (colorRadios.length) {
        colorRadios.forEach((radio) => {
            radio.addEventListener('change', function () {
                if (radio.checked) {
                    const selectedColor = radio.value;
                    console.log('Swatch change detected:', selectedColor); // Log when a swatch is selected
                    updateMediaGallery(selectedColor);
                }
            });
        });

        // Initialiseer de galerij bij laden van de pagina
        const initialRadio = document.querySelector('input[type="radio"][name^="Color"]:checked');
        if (initialRadio) {
            console.log('Initial selected color:', initialRadio.value); // Log initial selected color
            updateMediaGallery(initialRadio.value);
        } else {
            // Als er geen geselecteerde radio is, stel dan een standaardkleur in (bijvoorbeeld 'all')
            console.log('No initial radio selected, setting default color "all"');
            updateMediaGallery('all');
        }
    }
});


