document.addEventListener('DOMContentLoaded', function () {
    const variantSelector = document.querySelector('[name="id"]'); // Variant dropdown
    const colorRadios = document.querySelectorAll('input[type="radio"][name^="Color"]'); // Color swatches
    const mediaItems = document.querySelectorAll('.product__media-item'); // Media gallery items
  
    const updateMediaGallery = (selectedColor) => {
      mediaItems.forEach((item) => {
        const mediaColor = item.dataset.variantColor;
  
        // Toon alleen afbeeldingen die overeenkomen met de geselecteerde kleur of 'all'
        if (mediaColor === selectedColor || mediaColor === 'all') {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    };
  
    // Event listener voor dropdown
    if (variantSelector) {
      variantSelector.addEventListener('change', function () {
        const selectedVariant = JSON.parse(variantSelector.selectedOptions[0].dataset.variant);
        const selectedColor = selectedVariant.option1; // Neem aan dat de kleur de eerste optie is
        updateMediaGallery(selectedColor);
      });
    }
  
    // Event listener voor swatches
    if (colorRadios.length) {
      colorRadios.forEach((radio) => {
        radio.addEventListener('change', function () {
          if (radio.checked) {
            const selectedColor = radio.value;
            updateMediaGallery(selectedColor);
          }
        });
      });
  
      // Initialiseer de galerij bij laden van de pagina
      const initialRadio = document.querySelector('input[type="radio"][name^="Color"]:checked');
      if (initialRadio) {
        updateMediaGallery(initialRadio.value);
      }
    }
  });
  