document.addEventListener('DOMContentLoaded', function () {
    // Selecteer het producttitel-element
    const productTitle = document.querySelector('.product__title');
  
    // Controleer of het titel-element bestaat
    if (productTitle) {
      // Luister naar het variantChange-event
      document.addEventListener('variantChange', function (event) {
        const variant = event.detail.variant; // Haal de geselecteerde variant op
  
        // Werk de titel bij als een variant is geselecteerd
        if (variant && variant.option1) {
          const baseTitle = productTitle.getAttribute('data-title'); // Basis titel uit data-attribuut
          productTitle.textContent = `${baseTitle} - ${variant.option1}`;
        }
      });
  
      // Extra: Observeer standaard Shopify-variantselectie (als variantChange niet standaard is)
      document.querySelectorAll('select[name="options[]"], input[type="radio"]').forEach(option => {
        option.addEventListener('change', function () {
          const selectedVariantId = parseInt(this.value); // ID van geselecteerde variant
          const selectedVariant = window.product.variants.find(variant => variant.id === selectedVariantId);
  
          // Trigger variantChange als een nieuwe variant wordt geselecteerd
          if (selectedVariant) {
            const event = new CustomEvent('variantChange', {
              detail: { variant: selectedVariant },
            });
            document.dispatchEvent(event);
          }
        });
      });
    }
  });
  