document.addEventListener('DOMContentLoaded', function () {
    // Selecteer de titel, het JSON-script dat de variantinformatie bevat en de media gallery
    const productTitle = document.querySelector('.product__title h1');
    const variantJsonElement = document.querySelector('script[data-selected-variant]');
    const mediaGallery = document.querySelector('.product__media-gallery');
  
    if (!productTitle) {
      console.error('Product title element is missing.');
      return;
    }
  
    if (!variantJsonElement) {
      console.error('Variant JSON script element is missing.');
      return;
    }
  
    if (!mediaGallery) {
      console.error('Media gallery element is missing.');
      return;
    }
  
    // Functie om de titel bij te werken
    const updateTitle = (color) => {
      const baseTitle = productTitle.closest('.product__title').getAttribute('data-title');
      productTitle.textContent = `${baseTitle} - ${color}`;
      console.log(`Updated title to: ${baseTitle} - ${color}`);
    };
  
    // Functie om de media gallery bij te werken
    const updateMediaGallery = (color) => {
      const mediaItems = mediaGallery.querySelectorAll('.product__media-item');
      const featuredImage = mediaGallery.querySelector('.featured-media img');
  
      if (!featuredImage) {
        console.warn('No featured image found in the media gallery.');
        return;
      }
  
      // Update featured image
      const newFeaturedItem = [...mediaItems].find((item) => {
        const variantColor = item.getAttribute('data-variant-color');
        return variantColor === color || variantColor === 'all';
      });
  
      if (newFeaturedItem) {
        const newFeaturedImg = newFeaturedItem.querySelector('img');
        if (newFeaturedImg) {
          featuredImage.src = newFeaturedImg.src;
          featuredImage.alt = newFeaturedImg.alt;
          console.log(`Updated featured image for color: ${color}`);
        }
      } else {
        console.warn('No matching featured image found for the selected color.');
      }
  
      // Update thumbnails visibility
      mediaItems.forEach((item) => {
        const variantColor = item.getAttribute('data-variant-color');
  
        if (variantColor === 'all' || variantColor === color) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
  
      console.log(`Updated media gallery thumbnails for color: ${color}`);
    };
  
    // Functie om de geselecteerde kleur op te halen
    const getSelectedColor = () => {
      const selectedInput = document.querySelector('input[type="radio"][name^="Color"]:checked');
      return selectedInput ? selectedInput.value : null;
    };
  
    // Initialiseer de titel en media gallery met de geselecteerde variant
    const initialColor = getSelectedColor();
    if (initialColor) {
      updateTitle(initialColor);
      updateMediaGallery(initialColor);
    } else {
      console.warn('No initial color found.');
    }
  
    // Luister naar wijzigingen in de kleur swatches met event delegation
    const colorFieldset = document.querySelector('fieldset[name^="Color"]') || document;
    colorFieldset.addEventListener('change', function (event) {
      const target = event.target;
      if (target && target.type === 'radio' && target.name.startsWith('Color')) {
        const newColor = getSelectedColor();
        if (newColor) {
          updateTitle(newColor);
          updateMediaGallery(newColor);
        } else {
          console.warn('No color selected.');
        }
      }
    });
  });
  