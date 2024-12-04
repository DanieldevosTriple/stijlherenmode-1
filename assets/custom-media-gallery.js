document.addEventListener('DOMContentLoaded', function () {
    const colorRadios = document.querySelectorAll('input[type="radio"][name^="Color"]'); // Color swatches
    const mediaItems = document.querySelectorAll('.product__media-item'); // All media items (thumbnails)
    const featuredImage = document.querySelector('.product__media-item.featured-media img'); // Featured image

    // Functie om de galerij bij te werken
    const updateMediaGallery = (selectedColor) => {
        console.log('Selected Color:', selectedColor);  // Log the selected color

        mediaItems.forEach((item) => {
            const mediaColor = item.dataset.variantColor;
            console.log('Item Color:', mediaColor); // Log the media color for each item

            // Thumbnails zichtbaar maken op basis van de geselecteerde kleur
            if (item.classList.contains('media-thumbnail')) {
                if (mediaColor === selectedColor || selectedColor === 'all') {
                    item.style.display = 'block'; // Toon de thumbnail
                } else {
                    item.style.display = 'none'; // Verberg de thumbnail
                }
            }

            // Featured image bijwerken op basis van de geselecteerde kleur
            if (item.classList.contains('featured-media')) {
                const featuredImageColor = item.dataset.variantColor;
                if (featuredImageColor === selectedColor || selectedColor === 'all') {
                    const newFeaturedImage = item.querySelector('img');
                    if (newFeaturedImage) {
                        featuredImage.src = newFeaturedImage.src;  // Update de featured image
                        featuredImage.alt = newFeaturedImage.alt;
                        console.log('Updated featured image to:', newFeaturedImage.src); // Log for debugging
                    }
                }
            }
        });
    };

    // Event listener voor swatches
    if (colorRadios.length) {
        colorRadios.forEach((radio) => {
            radio.addEventListener('change', function () {
                if (radio.checked) {
                    const selectedColor = radio.value;
                    console.log('Radio change detected:', selectedColor); // Log when a radio button is selected
                    updateMediaGallery(selectedColor);
                }
            });
        });

        // Initialiseer de galerij bij laden van de pagina
        const initialRadio = document.querySelector('input[type="radio"][name^="Color"]:checked');
        if (initialRadio) {
            console.log('Initial selected color:', initialRadio.value); // Log initial selected color
            updateMediaGallery(initialRadio.value);
        }
    }
});
