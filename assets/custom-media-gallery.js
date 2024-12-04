document.addEventListener('DOMContentLoaded', function () {
    const variantSelectors = document.querySelectorAll('[name="id"]');
    const mediaItems = document.querySelectorAll('.product__media-item');
  
    variantSelectors.forEach((selector) => {
      selector.addEventListener('change', (event) => {
        const selectedVariantId = event.target.value;
  
        mediaItems.forEach((item) => {
          if (item.dataset.variantId === selectedVariantId || !item.dataset.variantId) {
            item.style.display = 'block'; // Toon afbeeldingen voor de geselecteerde variant
          } else {
            item.style.display = 'none'; // Verberg niet-geselecteerde afbeeldingen
          }
        });
      });
    });
  });
  