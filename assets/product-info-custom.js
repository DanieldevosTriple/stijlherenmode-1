document.addEventListener('DOMContentLoaded', () => {
  try {
      const productData = JSON.parse(document.getElementById('product-data').textContent);
      console.log("Product Data:", productData);

      const mediaGallery = document.querySelector('.media-gallery');
      const variantInput = document.getElementById('selected-variant-id');
      const optionsContainer = document.querySelector('.options-container');
      const secondaryGallery = document.querySelector('.secondary-gallery');

      let selectedOptions = {};

      // Functie om variant ID uit de URL te halen
      const getVariantFromURL = () => {
          const url = new URL(window.location.href);
          return url.searchParams.get('variant');
      };

      // Update de gallery met de geselecteerde variant
      const updateGallery = (variantId) => {
          mediaGallery.innerHTML = '';
          secondaryGallery.innerHTML = '';

          const selectedVariant = productData.variants.find(variant => variant.id === variantId);

          if (selectedVariant && selectedVariant.featured_image) {
              const imgElement = document.createElement('img');
              imgElement.src = selectedVariant.featured_image.src;
              imgElement.alt = `Featured image for variant ID: ${variantId}`;
              imgElement.classList.add('img-fluid', 'w-100', 'mb-3');
              mediaGallery.appendChild(imgElement);
          } else {
              const fallbackImage = document.createElement('img');
              fallbackImage.src = productData.featured_image;
              fallbackImage.alt = "Fallback featured image";
              fallbackImage.classList.add('img-fluid', 'w-100', 'mb-3');
              mediaGallery.appendChild(fallbackImage);
          }

          if (selectedVariant) {
              const relevantOptions = Object.values(selectedOptions).filter(option => option.length > 3);
              const secondaryImages = productData.media.filter(media =>
                  media.alt && relevantOptions.some(option => media.alt.toLowerCase().includes(option.toLowerCase()))
              );

              secondaryImages.forEach(image => {
                  const colDiv = document.createElement('div');
                  colDiv.classList.add('col-6');
                  const imgElement = document.createElement('img');
                  imgElement.src = image.src;
                  imgElement.alt = image.alt || "Secondary image";
                  imgElement.classList.add('img-fluid', 'rounded');
                  colDiv.appendChild(imgElement);
                  secondaryGallery.appendChild(colDiv);
              });
          }
      };

      const updateBuyButton = (variantId) => {
          variantInput.value = variantId;
      };

      const updateProductTitle = () => {
          const productTitleElement = document.querySelector('.product-title');
          const baseTitle = productData.title;
          const selectedValues = Object.values(selectedOptions).join(' - ');
          productTitleElement.textContent = `${baseTitle} - ${selectedValues}`;
      };

      const updateURLWithVariant = (variantId) => {
          if (variantId) {
              const url = new URL(window.location.href);
              if (url.searchParams.get('variant') !== variantId.toString()) {
                  url.searchParams.set('variant', variantId);
                  window.history.replaceState({}, '', url.toString());
              }
          }
      };

      const handleSelectionChange = () => {
          const selectedVariant = productData.variants.find(variant =>
              Object.keys(selectedOptions).every(optionName => {
                  const optionIndex = productData.options.indexOf(optionName);
                  return variant[`option${optionIndex + 1}`] === selectedOptions[optionName];
              })
          );

          if (selectedVariant) {
              updateGallery(selectedVariant.id);
              updateBuyButton(selectedVariant.id);
              updateProductTitle();
              updateURLWithVariant(selectedVariant.id);
          } else {
              updateGallery(null);
          }
      };

      // Stel standaardwaarden in of gebruik variant uit URL
      const variantIdFromURL = getVariantFromURL();
      let initialVariant = productData.variants[0];

      if (variantIdFromURL) {
          const variantFromURL = productData.variants.find(variant => variant.id.toString() === variantIdFromURL);
          if (variantFromURL) {
              initialVariant = variantFromURL;
          }
      }

      productData.options.forEach((optionName, index) => {
          const value = initialVariant[`option${index + 1}`];
          selectedOptions[optionName] = value;
          const button = optionsContainer.querySelector(`[data-option="${optionName}"][data-value="${value}"]`);
          if (button) {
              button.classList.add('active');
          }
      });

      handleSelectionChange();
  } catch (error) {
      console.error("Error initializing product media gallery:", error);
  }
});
