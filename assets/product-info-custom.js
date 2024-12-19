document.addEventListener('DOMContentLoaded', () => {
    const DEBUG_MODE = true; // Schakel in/uit voor debuginformatie

    const debugLog = (message, data = null) => {
        if (DEBUG_MODE) {
            console.log(`[DEBUG]: ${message}`, data);
        }
    };

    try {
        const productDataElement = document.getElementById('product-data');
        if (!productDataElement) throw new Error("Product data element ontbreekt op de pagina.");

        const productData = JSON.parse(productDataElement.textContent);
        debugLog("Product Data geladen:", productData);

        const mediaGallery = document.querySelector('.media-gallery');
        const variantInput = document.getElementById('selected-variant-id');
        const optionsContainer = document.querySelector('.options-container');
        const secondaryGallery = document.querySelector('.secondary-gallery');
        const descriptionElement = document.querySelector('.product-description');
        const mobileMediaGallery = document.querySelector('.product-gallery-mobile');

        let selectedOptions = {};

        const updateURLWithVariant = (variantId) => {
            try {
                const url = new URL(window.location.href);
                const params = new URLSearchParams(url.search);
        
                // Update of voeg de `variant`-parameter toe
                if (variantId) {
                    params.set('variant', variantId);
                } else {
                    params.delete('variant'); // Verwijder de parameter als er geen variantId is
                }
        
                // Stel de URL opnieuw in met alle bestaande parameters
                url.search = params.toString();
                window.history.replaceState({}, '', url.toString());
        
                debugLog("URL bijgewerkt:", url.toString());
            } catch (error) {
                console.error("Fout bij het bijwerken van de URL:", error);
            }
        };        

        const updateGallery = (variantId) => {
            debugLog("Gallery updaten voor variant:", variantId);
            mediaGallery.innerHTML = '';
            secondaryGallery.innerHTML = '';
            mobileMediaGallery.innerHTML = '';

            const selectedVariant = productData.variants.find(variant => variant.id === variantId);

            const createImageElement = (src, alt, classes = []) => {
                const imgElement = document.createElement('img');
                imgElement.src = src;
                imgElement.alt = alt;
                classes.forEach(cls => imgElement.classList.add(cls));
                return imgElement;
            };

            if (selectedVariant && selectedVariant.featured_image) {
                const imgElement = createImageElement(
                    selectedVariant.featured_image.src,
                    `Featured image for variant ID: ${variantId}`,
                    ['img-fluid', 'w-100', 'mb-3']
                );
                mediaGallery.appendChild(imgElement);

                const mobileImgElement = createImageElement(
                    selectedVariant.featured_image.src,
                    `Featured image for variant ID: ${variantId}`,
                    ['col-12', 'product-gallery-mobile-item']
                );
                mobileMediaGallery.appendChild(mobileImgElement);
            } else {
                const fallbackImage = createImageElement(
                    productData.featured_image,
                    "Fallback featured image",
                    ['img-fluid', 'w-100', 'mb-3']
                );
                mediaGallery.appendChild(fallbackImage);

                const mobileFallbackImage = createImageElement(
                    productData.featured_image,
                    "Fallback featured image",
                    ['col-12', 'product-gallery-mobile-item']
                );
                mobileMediaGallery.appendChild(mobileFallbackImage);
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

                    const imgElement = createImageElement(image.src, image.alt || "Secondary image", ['img-fluid', 'rounded']);
                    colDiv.appendChild(imgElement);
                    secondaryGallery.appendChild(colDiv);

                    const mobileImgElement = createImageElement(image.src, image.alt || "Secondary image", ['col-12', 'product-gallery-mobile-item']);
                    mobileMediaGallery.appendChild(mobileImgElement);
                });
            }
        };

        const updateBuyButton = (variantId) => {
            debugLog("Buy button bijgewerkt met variant ID:", variantId);
            variantInput.value = variantId;
        };

        const updateProductTitle = () => {
            const productTitleElement = document.querySelector('.product-title');
            const baseTitle = productData.title;
            const selectedValues = Object.values(selectedOptions).join(' - ');
            productTitleElement.textContent = `${baseTitle} - ${selectedValues}`;
            debugLog("Product titel bijgewerkt:", productTitleElement.textContent);
        };

        const updatePrice = (variantId) => {
            const priceElement = document.querySelector('.product-price');
            const selectedVariant = productData.variants.find(variant => variant.id === variantId);

            if (selectedVariant && selectedVariant.price) {
                const formattedPrice = (selectedVariant.price / 100).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'EUR'
                });
                priceElement.textContent = formattedPrice;
            } else {
                priceElement.textContent = "Price not available";
            }
            debugLog("Prijs bijgewerkt:", priceElement.textContent);
        };

        const updateURLWithVariant = (variantId) => {
            if (variantId) {
                const url = new URL(window.location.href);
                if (url.searchParams.get('variant') !== variantId.toString()) {
                    url.searchParams.set('variant', variantId);
                    window.history.replaceState({}, '', url.toString());
                }
            }
            debugLog("URL bijgewerkt met variant ID:", variantId);
        };

        const updateProductDescription = (variantId) => {
            const selectedVariant = productData.variants.find(variant => variant.id === variantId);
            if (selectedVariant && selectedVariant.description) {
                descriptionElement.innerHTML = selectedVariant.description;
            } else {
                descriptionElement.innerHTML = productData.description;
            }
            debugLog("Productbeschrijving bijgewerkt:", descriptionElement.innerHTML);
        };

        const handleSelectionChange = () => {
            debugLog("Huidige selectie:", selectedOptions);
            const selectedVariant = productData.variants.find(variant =>
                Object.keys(selectedOptions).every(optionName => {
                    const optionIndex = productData.options.indexOf(optionName);
                    return variant[`option${optionIndex + 1}`] === selectedOptions[optionName];
                })
            );

            if (selectedVariant) {
                debugLog("Geselecteerde variant gevonden:", selectedVariant);
                updateGallery(selectedVariant.id);
                updateBuyButton(selectedVariant.id);
                updateProductTitle();
                updateURLWithVariant(selectedVariant.id);
                updateProductDescription(selectedVariant.id);
                updatePrice(selectedVariant.id);
            } else {
                console.warn("Geen overeenkomstige variant gevonden.");
                updateGallery(null);
                updateProductDescription(null);
            }
        };

        productData.options.forEach((optionName, index) => {
            debugLog(`Optie "${optionName}" verwerken`, index);
            const uniqueValues = [...new Set(productData.variants.map(variant => variant[`option${index + 1}`]))];
            debugLog("Unieke waarden voor optie:", uniqueValues);

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

        updateGallery(initialVariant.id);
        updateBuyButton(initialVariant.id);
        updateProductTitle();
        updateProductDescription(initialVariant.id);
        updatePrice(initialVariant.id);

    } catch (error) {
        console.error("Fout tijdens initialisatie van de productgalerij:", error);
    }
});
