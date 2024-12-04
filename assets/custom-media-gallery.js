document.addEventListener('DOMContentLoaded', function () {
    const variantSelector = document.querySelector('[name="id"]'); // Variant dropdown
    const colorRadios = document.querySelectorAll('input[type="radio"][name^="Color"]'); // Color swatches
    const mediaItems = document.querySelectorAll('.product__media-item'); // Media gallery items
  
    const updateMediaGallery = (selectedColor) => {
      mediaItems.forEach((item) => {
        const mediaColor = item.dataset.variantColor;
  
        // Toon alleen afbeeldingen die overeenkomen met de geselecteerde kleur of 'all'
        if (mediaColor === selectedColor) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    };
  
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
  