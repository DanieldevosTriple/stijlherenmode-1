document.addEventListener('DOMContentLoaded', function () {
    const productTitle = document.querySelector('.product__title h1');
    const variantSelector = document.querySelector('[name="id"]');
    const colorRadios = document.querySelectorAll('input[type="radio"][name^="Color"]');
  
    const updateTitle = (color) => {
      const baseTitle = productTitle.closest('.product__title').getAttribute('data-title');
      productTitle.textContent = `${baseTitle} - ${color}`;
      console.log(`Updated title to: ${baseTitle} - ${color}`);
    };
  
    // Dropdown logic
    if (variantSelector) {
      variantSelector.addEventListener('change', function () {
        const selectedVariant = JSON.parse(variantSelector.selectedOptions[0].dataset.variant);
        const selectedColor = selectedVariant.option1; // Kleur is de eerste optie
        updateTitle(selectedColor);
      });
    }
  
    // Swatch logic
    if (colorRadios.length) {
      colorRadios.forEach((radio) => {
        radio.addEventListener('change', function () {
          if (radio.checked) {
            updateTitle(radio.value);
          }
        });
      });
  
      // Initialiseer de titel bij laden van de pagina
      const initialRadio = document.querySelector('input[type="radio"][name^="Color"]:checked');
      if (initialRadio) {
        updateTitle(initialRadio.value);
      }
    }
  });
  