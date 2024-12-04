document.addEventListener('DOMContentLoaded', function () {
    const variantSelector = document.querySelector('[name="id"]'); // Variant dropdown
    const colorRadios = document.querySelectorAll('input[type="radio"][name^="Color"]'); // Color swatches
    const mediaItems = document.querySelectorAll('.product__media-item'); // All media items
    const featuredImage = document.querySelector('.product__media-gallery'); // Featured image container
  
    const updateMediaGallery = (selectedColor) => {
      console.log('Selected Color:', selectedColor);  // Log the selected color
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

