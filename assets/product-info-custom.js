document.addEventListener('DOMContentLoaded', () => {
    try {
      const productData = JSON.parse(document.getElementById('product-data').textContent);
      console.log("Product Data:", productData);
  
      const colorSwatchContainer = document.querySelector('.color-swatches');
      const sizeSwatchContainer = document.querySelector('.size-swatches');
      const mediaGallery = document.querySelector('.media-gallery');
      const variantInput = document.getElementById('selected-variant-id');
  
      let activeColor = null;
      let activeSize = null;
  
      const updateGallery = (variantId) => {
        console.log(`Updating gallery for variant ID: ${variantId}`);
        mediaGallery.innerHTML = ''; // Clear de gallery
        const secondaryGallery = document.querySelector('.secondary-gallery');
        secondaryGallery.innerHTML = ''; // Clear de secondary gallery
      
        // Vind de geselecteerde variant
        const selectedVariant = productData.variants.find(variant => variant.id === variantId);
        console.log("Selected Variant:", selectedVariant);
      
        if (selectedVariant && selectedVariant.featured_image) {
          console.log("Using variant-specific featured image:", selectedVariant.featured_image.src);
          const imgElement = document.createElement('img');
          imgElement.src = selectedVariant.featured_image.src;
          imgElement.alt = `Featured image for variant ID: ${variantId}`;
          mediaGallery.appendChild(imgElement);
        } else {
          console.warn("No specific variant featured image found. Using default images.");
          const fallbackImages = [productData.featured_image, ...productData.images.slice(0, 2)];
          fallbackImages.forEach(image => {
            const imgElement = document.createElement('img');
            imgElement.src = image;
            imgElement.alt = "Fallback image";
            mediaGallery.appendChild(imgElement);
          });
        }
      
        // Voeg secundaire afbeeldingen toe
        if (selectedVariant) {
          const color = selectedVariant.option1.toLowerCase(); // Neem de kleur uit de variant
          const secondaryImages = productData.media.filter(media =>
            media.alt && media.alt.toLowerCase().includes(color)
          );
      
          console.log(`Secondary images for color ${color}:`, secondaryImages);
      
          secondaryImages.forEach(image => {
            const colDiv = document.createElement('div');
            colDiv.classList.add('col-6'); // Voeg col-6 styling toe
      
            const imgElement = document.createElement('img');
            imgElement.src = image.src;
            imgElement.alt = image.alt || "Secondary image";
      
            colDiv.appendChild(imgElement);
            secondaryGallery.appendChild(colDiv);
          });
        }
      };          
  
        // Update buy button with variant ID
        const updateBuyButton = (variantId) => {
            console.log(`Updating buy button with variant ID: ${variantId}`);
            variantInput.value = variantId;
        };

        // Update the product title dynamically
        const updateProductTitle = (color) => {
            const productTitleElement = document.querySelector('.product-title');
            const baseTitle = productData.title; // Basis producttitel
            productTitleElement.textContent = color ? `${baseTitle} - ${color}` : baseTitle;
        };
  
        // Update active swatch
        const updateActiveSwatch = (container, activeSwatch) => {
            container.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
            activeSwatch.classList.add('active');
        };
    
        // Handle selection of color and size
        const handleSelectionChange = (color, size) => {
            console.log(`Color: ${color}, Size: ${size}`);
            const selectedVariant = productData.variants.find(
            variant => variant.option1 === color && variant.option2 === size
            );
    
            if (selectedVariant) {
            console.log("Selected Variant ID:", selectedVariant.id);
            updateGallery(selectedVariant.id);
            updateBuyButton(selectedVariant.id);
            updateProductTitle(activeColor); // Update de titel met de geselecteerde kleur
            } else {
            console.warn("No matching variant found. Loading default images.");
            updateGallery(null);
            }
        };
  
        // Verzamel unieke kleuren uit de varianten
        const uniqueColors = [...new Set(productData.variants.map(variant => variant.option1).filter(Boolean))];

        console.log("Available Colors in Variants:", productData.variants.map(variant => variant.option1));
        console.log("Unique Colors for Swatches:", uniqueColors);

        // Genereer swatches voor elke unieke kleur
        uniqueColors.forEach(color => {
        console.log(`Generating color swatch for: ${color}`);
        
        const swatch = document.createElement('button');
        swatch.classList.add('color-swatch');
        swatch.dataset.color = color;
        swatch.textContent = color;
        swatch.style.backgroundColor = color.toLowerCase();

        swatch.addEventListener('click', () => {
            activeColor = color;
            updateActiveSwatch(colorSwatchContainer, swatch);
            updateProductTitle(activeColor); // Update de titel met de geselecteerde kleur
            handleSelectionChange(activeColor, activeSize);
          });          

        colorSwatchContainer.appendChild(swatch);
        });

      // Create size swatches
      const uniqueSizes = [...new Set(productData.variants.map(variant => variant.option2))];
      uniqueSizes.forEach(size => {
        const swatch = document.createElement('button');
        swatch.classList.add('size-swatch');
        swatch.dataset.size = size;
        swatch.textContent = size;
  
        swatch.addEventListener('click', () => {
          activeSize = size;
          updateActiveSwatch(sizeSwatchContainer, swatch);
          handleSelectionChange(activeColor, activeSize);
        });
  
        sizeSwatchContainer.appendChild(swatch);
      });
  
      // Load variant from URL
      const validateVariantFromURL = () => {
        const urlParams = new URL(window.location.href).searchParams;
        const variantId = parseInt(urlParams.get('variant'), 10);
        if (!isNaN(variantId)) {
          console.log("Loading variant ID from URL:", variantId);
          const selectedVariant = productData.variants.find(variant => variant.id === variantId);
          if (selectedVariant) {
            activeColor = selectedVariant.option1;
            activeSize = selectedVariant.option2;
  
            updateGallery(selectedVariant.id);
            updateBuyButton(selectedVariant.id);
            updateProductTitle(activeColor); // Update de titel met de geselecteerde kleur
  
            // Mark swatches as active
            const activeColorSwatch = colorSwatchContainer.querySelector(`[data-color="${activeColor}"]`);
            if (activeColorSwatch) updateActiveSwatch(colorSwatchContainer, activeColorSwatch);
  
            const activeSizeSwatch = sizeSwatchContainer.querySelector(`[data-size="${activeSize}"]`);
            if (activeSizeSwatch) updateActiveSwatch(sizeSwatchContainer, activeSizeSwatch);
          }
        } else {
          console.warn("No valid variant ID in URL. Using default values.");
          activeColor = productData.variants[0].option1;
          activeSize = productData.variants[0].option2;
  
          handleSelectionChange(activeColor, activeSize);
        }
      };
  
      // Initialize
      validateVariantFromURL();
    } catch (error) {
      console.error("Error initializing product media gallery:", error);
    }
  });  