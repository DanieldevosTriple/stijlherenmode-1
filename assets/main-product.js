document.addEventListener('DOMContentLoaded', function () {
    // Selecteer de titel en het JSON-script dat de variantinformatie bevat
    const productTitle = document.querySelector('.product__title h1');
    const variantJsonElement = document.querySelector('script[data-selected-variant]');
    const variantSelector = document.querySelector('[name="id"]'); // Variant dropdown
    const colorRadios = document.querySelectorAll('input[type="radio"][name^="Color"]');
    const mediaItems = document.querySelectorAll('.product__media-item'); // Media gallery items
  
    if (!productTitle) {
      console.error('Product title element is missing.');
      return;
    }
  
    if (!variantJsonElement) {
      console.error('Variant JSON script element is missing.');
      return;
    }
  
    // Functie om de titel bij te werken
    const updateTitle = (color) => {
      const baseTitle = productTitle.closest('.product__title').getAttribute('data-title');
      productTitle.textContent = `${baseTitle} - ${color}`;
      console.log(`Updated title to: ${baseTitle} - ${color}`);
    };
  
    // Functie om de galerij bij te werken
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
  
    // Functie om de geselecteerde kleur op te halen
    const getSelectedColor = () => {
      const selectedInput = document.querySelector('input[type="radio"][name^="Color"]:checked');
      return selectedInput ? selectedInput.value : null;
    };
  
    // Event listener voor dropdown (variant selector)
    if (variantSelector) {
      variantSelector.addEventListener('change', function () {
        const selectedVariant = JSON.parse(variantSelector.selectedOptions[0].dataset.variant);
        const selectedColor = selectedVariant.option1; // Neem aan dat de kleur de eerste optie is
        updateTitle(selectedColor);
        updateMediaGallery(selectedColor);
      });
    }
  
    // Event listener voor kleur swatches
    if (colorRadios.length) {
      colorRadios.forEach((radio) => {
        radio.addEventListener('change', function () {
          if (radio.checked) {
            const selectedColor = radio.value;
            updateTitle(selectedColor);
            updateMediaGallery(selectedColor);
          }
        });
      });
  
      // Initialiseer de titel en galerij bij laden van de pagina
      const initialRadio = document.querySelector('input[type="radio"][name^="Color"]:checked');
      if (initialRadio) {
        const initialColor = initialRadio.value;
        updateTitle(initialColor);
        updateMediaGallery(initialColor);
      } else {
        console.warn('No initial color found.');
      }
    }
  });
  