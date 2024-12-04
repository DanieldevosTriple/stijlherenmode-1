document.addEventListener('DOMContentLoaded', function () {
    const variantSelector = document.querySelector('[name="id"]'); // Dropdown of variant selector
    const mediaItems = document.querySelectorAll('.product__media-item'); // Media items in de galerij
  
    if (variantSelector) {
      variantSelector.addEventListener('change', function () {
        // Extract variant details from the selected option
        const selectedVariant = JSON.parse(variantSelector.selectedOptions[0].dataset.variant);
        const selectedColor = selectedVariant.option1; // Neem aan dat 'Color' de eerste optie is
  
        mediaItems.forEach((item) => {
          const mediaColor = item.dataset.variantColor;
  
          // Toon alleen afbeeldingen die overeenkomen met de geselecteerde kleur of algemeen zijn
          if (mediaColor === selectedColor || mediaColor === 'all') {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    }
  });
  