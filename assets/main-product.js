document.addEventListener('DOMContentLoaded', function () {
    // Selecteer de titel en het JSON-script dat de variantinformatie bevat
    const productTitle = document.querySelector('.product__title h1');
    const variantJsonElement = document.querySelector('script[data-selected-variant]');
  
    if (!productTitle) {
      console.error('Product title element is missing.');
      return;
    }
  
    if (!variantJsonElement) {
      console.error('Variant JSON script element is missing.');
      return;
    }
  
    // Parse de JSON-variantinformatie
    let selectedVariant = JSON.parse(variantJsonElement.textContent);
  
    const updateTitle = (color) => {
      const baseTitle = productTitle.closest('.product__title').getAttribute('data-title');
      productTitle.textContent = `${baseTitle} - ${color}`;
      console.log(`Updated title to: ${baseTitle} - ${color}`);
    };
  
    // Update de titel met de initiële geselecteerde variant
    if (selectedVariant && selectedVariant.option1) {
      updateTitle(selectedVariant.option1);
    } else {
      console.warn('No initial variant found in JSON.');
    }
  
    // Luister naar wijzigingen in de kleur swatches
    const colorInputs = document.querySelectorAll('input[type="radio"][name^="Color"]');
  
    if (colorInputs.length === 0) {
      console.warn('No color swatch inputs found.');
      return;
    }
  
    colorInputs.forEach(input => {
      input.addEventListener('change', function () {
        const selectedColor = this.value;
        console.log(`Color swatch changed to: ${selectedColor}`);
        updateTitle(selectedColor);
      });
    });
  });
  