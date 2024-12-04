document.querySelectorAll('input[type="radio"][name="options"]').forEach(function(swatch) {
    swatch.addEventListener('change', function() {
      // Haal de juiste gegevens van de geselecteerde swatch
      var variantId = this.dataset.variantId;
      var variantImage = this.dataset.variantImage;
      var variantAlt = this.dataset.variantAlt;
      var variantColor = this.dataset.variantColor;
  
      // Update de featured image
      var featuredImage = document.querySelector('#featured-image-' + variantId);
      if (featuredImage) {
        featuredImage.src = variantImage;
        featuredImage.alt = variantAlt;
      }
  
      // Update de media-thumbnails
      document.querySelectorAll('.product__media-item').forEach(function(thumbnail) {
        if (thumbnail.dataset.variantColor === variantColor) {
          thumbnail.querySelector('img').src = variantImage;
          thumbnail.querySelector('img').alt = variantAlt;
        }
      });
    });
  });
  