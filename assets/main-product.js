document.addEventListener('DOMContentLoaded', function () {
    const productTitle = document.querySelector('.product__title h1');
  
    // Debugging: Controleer of het product object en de titel bestaan
    console.log('Product object:', window.product);
  
    if (!window.product) {
      console.error('window.product is not defined. Ensure it is injected using Liquid.');
      return;
    }
  
    if (!productTitle) {
      console.error('Product title element is not found on the page.');
      return;
    }
  
    if (!window.product.variants || !Array.isArray(window.product.variants)) {
      console.error('window.product.variants is not defined or not an array.');
      return;
    }
  
    // Functie om de titel bij te werken
    const updateTitle = (variant) => {
      if (variant && variant.option1) {
        const baseTitle = productTitle.closest('.product__title').getAttribute('data-title');
        productTitle.textContent = `${baseTitle} - ${variant.option1}`;
        console.log(`Title updated to: ${baseTitle} - ${variant.option1}`);
      } else {
        console.warn('Variant is undefined or does not have a valid option1.');
      }
    };
  
    // Luister naar swatch-selecties
    const swatchSelectors = document.querySelectorAll('input[type="radio"][name^="option"], select[name^="option"]');
    if (swatchSelectors.length === 0) {
      console.warn('No swatch or dropdown selectors found. Ensure your inputs are correctly named.');
    }
  
    swatchSelectors.forEach(selector => {
      selector.addEventListener('change', function () {
        console.log(`Swatch or dropdown changed. Value: ${this.value}`);
        const selectedVariantId = parseInt(this.value, 10);
        const selectedVariant = window.product.variants.find(variant => variant.id === selectedVariantId);
        if (selectedVariant) {
          console.log('Selected variant:', selectedVariant);
          updateTitle(selectedVariant);
        } else {
          console.warn('No variant found for the selected value:', this.value);
        }
      });
    });
  
    // Trigger standaard variant bij het laden van de pagina
    if (window.product.selected_or_first_available_variant) {
      console.log('Initial variant:', window.product.selected_or_first_available_variant);
      updateTitle(window.product.selected_or_first_available_variant);
    } else {
      console.warn('No initial variant found on page load.');
    }
  });
  