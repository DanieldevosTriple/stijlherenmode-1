document.addEventListener('DOMContentLoaded', function () {
    const productTitle = document.querySelector('.product__title h1');
  
    if (productTitle && window.product && window.product.variants) {
      // Functie om de titel bij te werken
      const updateTitle = (variant) => {
        if (variant && variant.option1) {
          const baseTitle = productTitle.closest('.product__title').getAttribute('data-title');
          productTitle.textContent = `${baseTitle} - ${variant.option1}`;
        }
      };
  
      // Luister naar swatch-selecties
      const swatchSelectors = document.querySelectorAll('input[type="radio"][name^="option"], select[name^="option"]');
      swatchSelectors.forEach(selector => {
        selector.addEventListener('change', function () {
          const selectedVariantId = parseInt(this.value);
          const selectedVariant = window.product.variants.find(variant => variant.id === selectedVariantId);
          if (selectedVariant) {
            updateTitle(selectedVariant);
          }
        });
      });
  
      // Trigger standaard variant bij het laden van de pagina
      const initialVariant = window.product.selected_or_first_available_variant;
      if (initialVariant) {
        updateTitle(initialVariant);
      } else {
        console.warn('No initial variant found.');
      }
    } else {
      console.error('Product object or product title element is missing.');
    }
  });
  
  