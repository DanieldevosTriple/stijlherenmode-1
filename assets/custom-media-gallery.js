document.addEventListener('DOMContentLoaded', function () {
    const variantSelector = document.querySelector('[name="id"]'); // Variant dropdown
    const colorImages = document.querySelectorAll('img.variant-image'); // Color images with checked class
    const mediaItems = document.querySelectorAll('.product__media-item'); // All media items
    const featuredImage = document.querySelector('.featured-media'); // Featured image container
  
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

    // Event listener voor afbeelding met de 'checked' class
    if (colorImages.length) {
      colorImages.forEach((img) => {
        img.addEventListener('click', function () {
          if (img.classList.contains('checked')) {
            const selectedColor = img.alt; // Use alt text or another property as the selected color
            console.log('Image clicked, selected color:', selectedColor); // Log selected color
            updateMediaGallery(selectedColor);
          }
        });
      });

      // Initialiseer de galerij bij laden van de pagina op basis van de 'checked' class
      const initialImage = document.querySelector('img.variant-image.checked');
      if (initialImage) {
        console.log('Initial selected color based on checked class:', initialImage.alt); // Log initial selected color
        updateMediaGallery(initialImage.alt);
      } else {
        // Als er geen geselecteerde afbeelding is, stel dan een standaardkleur in (bijvoorbeeld 'all')
        console.log('No initial checked image, setting default color "all"');
        updateMediaGallery('all');
      }
    }
  });

