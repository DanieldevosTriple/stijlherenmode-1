document.addEventListener('DOMContentLoaded', () => {
  try {
      const productData = JSON.parse(document.getElementById('product-data').textContent);
      console.log("Product Data:", productData);

      const mediaGallery = document.querySelector('.media-gallery');
      const variantInput = document.getElementById('selected-variant-id');
      const optionsContainer = document.querySelector('.options-container');
      const secondaryGallery = document.querySelector('.secondary-gallery');
      const descriptionElement = document.querySelector('.product-description');
      const mobileMediaGallery = document.querySelector('.product-gallery-mobile');

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
              mobileMediaGallery.appendChild(imgElement);
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
                  colDiv.classList.add('secondary-image');
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

      const updatePrice = (variantId) => {
        const priceElement = document.querySelector('.product-price');
        const selectedVariant = productData.variants.find(variant => variant.id === variantId);
    
        if (selectedVariant && selectedVariant.price) {
            // Format price as currency
            const formattedPrice = (selectedVariant.price / 100).toLocaleString('en-US', {
                style: 'currency',
                currency: 'EUR'
            });
            priceElement.textContent = formattedPrice;
        } else {
            priceElement.textContent = "Price not available";
        }
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

      const updateProductDescription = (variantId) => {
          const selectedVariant = productData.variants.find(variant => variant.id === variantId);
          if (selectedVariant && selectedVariant.description) {
              descriptionElement.innerHTML = selectedVariant.description;
          } else {
              descriptionElement.innerHTML = productData.description; // Gebruik algemene productbeschrijving
          }
      };

      const handleSelectionChange = () => {
          console.log("Selected Options:", selectedOptions);
          const selectedVariant = productData.variants.find(variant =>
              Object.keys(selectedOptions).every(optionName => {
                  const optionIndex = productData.options.indexOf(optionName);
                  return variant[`option${optionIndex + 1}`] === selectedOptions[optionName];
              })
          );

          if (selectedVariant) {
              console.log("Matching Variant Found:", selectedVariant);
              updateGallery(selectedVariant.id);
              updateBuyButton(selectedVariant.id);
              updateProductTitle();
              updateURLWithVariant(selectedVariant.id);
              updateProductDescription(selectedVariant.id);
              updatePrice(selectedVariant.id);
          } else {
              console.warn("No matching variant found. Loading default images.");
              updateGallery(null);
              updateProductDescription(null);
          }
      };

      // Dynamisch opties genereren
      productData.options.forEach((optionName, index) => {
          const uniqueValues = [...new Set(productData.variants.map(variant => variant[`option${index + 1}`]))];

          const optionContainer = document.createElement('div');
          optionContainer.classList.add('option-group');

          const optionTitle = document.createElement('div');
          optionTitle.classList.add('option-title');
          optionTitle.innerHTML = `<strong>${optionName}</strong>`;
          optionContainer.appendChild(optionTitle);

          const buttonContainer = document.createElement('div');
          buttonContainer.classList.add('button-container');

          uniqueValues.forEach(value => {
              const button = document.createElement('button');
              button.classList.add('option-swatch');
              button.dataset.option = optionName;
              button.dataset.value = value;

              if (optionName.toLowerCase() === 'color') {
                  const variantWithImage = productData.variants.find(variant => variant[`option${index + 1}`] === value && variant.featured_image);
                  if (variantWithImage && variantWithImage.featured_image) {
                      const imgElement = document.createElement('img');
                      imgElement.src = variantWithImage.featured_image.src;
                      imgElement.alt = value;
                      imgElement.classList.add('img-fluid', 'swatch-image');
                      button.appendChild(imgElement);
                      button.classList.add('has-image');
                  } else {
                      button.textContent = value;
                  }
              } else {
                  button.textContent = value;
              }

              button.addEventListener('click', () => {
                  selectedOptions[optionName] = value;
                  buttonContainer.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
                  button.classList.add('active');
                  handleSelectionChange();
              });

              buttonContainer.appendChild(button);
          });

          optionContainer.appendChild(buttonContainer);
          optionsContainer.appendChild(optionContainer);
      });

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

      // Update alle elementen bij initialisatie
      updateGallery(initialVariant.id);
      updateBuyButton(initialVariant.id);
      updateProductTitle();
      updateProductDescription(initialVariant.id);
      updatePrice(initialVariant.id);

  } catch (error) {
      console.error("Error initializing product media gallery:", error);
  }
});
