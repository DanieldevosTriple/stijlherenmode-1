document.addEventListener('DOMContentLoaded', () => {
    try {
      const productData = JSON.parse(document.getElementById('product-data').textContent);
      console.log("Product Data:", productData);
  
      const mediaGallery = document.querySelector('.media-gallery');
      const variantInput = document.getElementById('selected-variant-id');
      const optionsContainer = document.querySelector('.options-container'); // Container voor dynamische opties
      const secondaryGallery = document.querySelector('.secondary-gallery'); // Container voor secundaire afbeeldingen
  
      let selectedOptions = {}; // Huidige selectie van opties
  
      // Update de gallery met de geselecteerde variant
      const updateGallery = (variantId) => {
        console.log(`Updating gallery for variant ID: ${variantId}`);
        mediaGallery.innerHTML = ''; // Clear de gallery
        secondaryGallery.innerHTML = ''; // Clear de secondary gallery
  
        const selectedVariant = productData.variants.find(variant => variant.id === variantId);
        console.log("Selected Variant in updateGallery:", selectedVariant);
  
        // Voeg de featured image toe
        if (selectedVariant && selectedVariant.featured_image) {
          console.log("Using variant-specific featured image:", selectedVariant.featured_image.src);
          const imgElement = document.createElement('img');
          imgElement.src = selectedVariant.featured_image.src;
          imgElement.alt = `Featured image for variant ID: ${variantId}`;
          imgElement.classList.add('img-fluid', 'w-100', 'mb-3'); // Bootstrap styling
          mediaGallery.appendChild(imgElement);
        } else {
          console.warn("No specific variant featured image found. Using fallback image.");
          const fallbackImage = document.createElement('img');
          fallbackImage.src = productData.featured_image;
          fallbackImage.alt = "Fallback featured image";
          fallbackImage.classList.add('img-fluid', 'w-100', 'mb-3');
          mediaGallery.appendChild(fallbackImage);
        }
  
        // Voeg secundaire afbeeldingen toe
        if (selectedVariant) {
          const relevantOptions = Object.values(selectedOptions).filter(option => option.length > 3);
          console.log(`Filtering secondary images for options: ${relevantOptions}`);
  
          // Filter afbeeldingen waarvan de alt-tekst een relevante optie bevat
          const secondaryImages = productData.media.filter(media =>
            media.alt && relevantOptions.some(option => media.alt.toLowerCase().includes(option.toLowerCase()))
          );
  
          console.log("Filtered Secondary Images:", secondaryImages);
  
          secondaryImages.forEach(image => {
            const colDiv = document.createElement('div');
            colDiv.classList.add('col-6'); // Voeg Bootstrap kolom styling toe
  
            const imgElement = document.createElement('img');
            imgElement.src = image.src;
            imgElement.alt = image.alt || "Secondary image";
            imgElement.classList.add('img-fluid', 'rounded'); // Styling voor responsiviteit en afronding
  
            colDiv.appendChild(imgElement);
            secondaryGallery.appendChild(colDiv);
          });
        } else {
          console.warn("No secondary images found for the selected variant.");
        }
      };
  
      // Update de koopknop met de variant-ID
      const updateBuyButton = (variantId) => {
        console.log(`Updating buy button with variant ID: ${variantId}`);
        variantInput.value = variantId;
      };
  
      // Update de producttitel dynamisch
      const updateProductTitle = () => {
        const productTitleElement = document.querySelector('.product-title');
        const baseTitle = productData.title;
        const selectedValues = Object.values(selectedOptions).join(' - ');
        console.log(`Updating product title: ${baseTitle} - ${selectedValues}`);
        productTitleElement.textContent = `${baseTitle} - ${selectedValues}`;
      };

      // Update URL Dynamisch
      const updateURLWithVariant = (variantId) => {
        if (variantId) {
          const url = new URL(window.location.href);
          url.searchParams.set('variant', variantId);
          window.history.replaceState({}, '', url.toString());
          console.log(`Updated URL with variant ID: ${variantId}`);
        }
      };

      // Update Product Vendor
      const updateProductVendor = () => {
        const vendorElement = document.querySelector('.product-vendor');
        vendorElement.textContent = `Brand: ${productData.vendor}`;
      };
  
      // Handle selectie en update
      const handleSelectionChange = () => {
        console.log("Selected Options:", selectedOptions);
        const selectedVariant = productData.variants.find(variant => {
          return Object.keys(selectedOptions).every(optionName => {
            const optionIndex = productData.options.indexOf(optionName);
            return variant[`option${optionIndex + 1}`] === selectedOptions[optionName];
          });
        });
  
        if (selectedVariant) {
          console.log("Matching Variant Found:", selectedVariant);
          updateGallery(selectedVariant.id);
          updateBuyButton(selectedVariant.id);
          updateProductTitle();
          updateURLWithVariant(selectedVariant.id); // URL bijwerken met variant-ID
        } else {
          console.warn("No matching variant found. Loading default images.");
          updateGallery(null);
        }
      };
  
      // Dynamisch opties genereren
      productData.options.forEach((optionName, index) => {
        console.log(`Processing Option: ${optionName}`);
        const uniqueValues = [...new Set(productData.variants.map(variant => variant[`option${index + 1}`]))];
        console.log(`Unique Values for ${optionName}:`, uniqueValues);
      
        const optionContainer = document.createElement('div');
        optionContainer.classList.add('option-group');
        optionContainer.innerHTML = `<strong>${optionName}</strong>`;
      
        uniqueValues.forEach(value => {
          console.log(`Creating button for value: ${value}`);
          const button = document.createElement('button');
          button.classList.add('option-swatch');
          button.dataset.option = optionName;
          button.dataset.value = value;
      
          // Voor Color opties: toon een afbeelding als deze beschikbaar is
          if (optionName.toLowerCase() === 'color') {
            const variantWithImage = productData.variants.find(variant => variant[`option${index + 1}`] === value && variant.featured_image);
            if (variantWithImage && variantWithImage.featured_image) {
              console.log(`Using image swatch for color: ${value}`);
              const imgElement = document.createElement('img');
              imgElement.src = variantWithImage.featured_image.src;
              imgElement.alt = value;
              imgElement.classList.add('img-fluid', 'swatch-image'); // Styling voor de afbeelding
              button.appendChild(imgElement);
            } else {
              console.warn(`No featured image found for color: ${value}`);
              button.textContent = value; // Fallback naar tekst als er geen afbeelding is
            }
          } else {
            button.textContent = value; // Voor andere opties, gebruik tekst
          }
      
          button.addEventListener('click', () => {
            console.log(`Swatch clicked: ${optionName} = ${value}`);
            selectedOptions[optionName] = value;
            optionContainer.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
            button.classList.add('active');
            handleSelectionChange();
          });
      
          optionContainer.appendChild(button);
        });
      
        optionsContainer.appendChild(optionContainer);
      });
      
  
      // Initialiseer standaardwaarden
      productData.options.forEach((optionName, index) => {
        const defaultValue = productData.variants[0][`option${index + 1}`];
        console.log(`Default Value for ${optionName}: ${defaultValue}`);
        selectedOptions[optionName] = defaultValue;
  
        const defaultButton = optionsContainer.querySelector(`[data-option="${optionName}"][data-value="${defaultValue}"]`);
        if (defaultButton) {
          console.log(`Setting default active button: ${defaultValue}`);
          defaultButton.classList.add('active');
        }
      });
  
      console.log("Initial Selected Options:", selectedOptions);
      handleSelectionChange();
    } catch (error) {
      console.error("Error initializing product media gallery:", error);
    }
  });
  