document.addEventListener('DOMContentLoaded', () => {
    const DEBUG_MODE = true;

    const debugLog = (message, data = null) => {
        if (DEBUG_MODE) {
            console.log(`[DEBUG]: ${message}`, data);
        }
    };

    // Initialize accordion functionality - Separate from product logic
    const initializeAccordions = () => {
        document.querySelectorAll('.accordion-header').forEach(header => {
            debugLog('Accordion header gevonden:', header);
            header.addEventListener('click', () => {
                debugLog('Accordion header geklikt:', header);
                const content = header.nextElementSibling;
                if (content) {
                    header.classList.toggle('active');
                    content.classList.toggle('active');
                    
                    // Log the state for debugging
                    debugLog('Accordion state:', {
                        headerActive: header.classList.contains('active'),
                        contentActive: content.classList.contains('active')
                    });
                }
            });
        });
    };

    // Initialize accordions immediately
    initializeAccordions();    

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
        let gallery;

        // Modal creation and gallery initialization
        const createImageModal = () => {
            const modal = document.createElement('div');
            modal.className = 'image-modal';
            // Simplified modal HTML structure
            modal.innerHTML = `
                <span class="close-modal">&times;</span>
                <img class="modal-content" id="modal-image">
                <div class="modal-nav prev-image">&#10094;</div>
                <div class="modal-nav next-image">&#10095;</div>
            `;
            document.body.appendChild(modal);
            return modal;
        };

        const initializeGallery = () => {
            const modal = createImageModal();
            const modalImg = modal.querySelector('#modal-image');
            const closeBtn = modal.querySelector('.close-modal');
            const prevBtn = modal.querySelector('.prev-image');
            const nextBtn = modal.querySelector('.next-image');
            let currentImageIndex = 0;
            let galleryImages = [];
            let modalImages = []; // Separate array for modal display
        
            const updateGalleryImages = () => {
                // Get all images and filter out SVGs
                const allImages = [
                    ...Array.from(document.querySelectorAll('.media-gallery img')),
                    ...Array.from(document.querySelectorAll('.secondary-gallery img')),
                    ...Array.from(document.querySelectorAll('.product-gallery-mobile img'))
                ].filter(img => {
                    // Filter out SVGs and expand icons
                    return !img.src.includes('.svg') && !img.classList.contains('expand-icon');
                });
            
                // Keep the DOM elements for the expandable functionality
                galleryImages = allImages;
                
                // Create clean data for modal display
                modalImages = allImages.map(img => ({
                    src: img.src,
                    alt: img.alt
                }));
            };
        
            const showImage = (index) => {
                currentImageIndex = index;
                modalImg.src = modalImages[index].src;
                modalImg.alt = modalImages[index].alt;
            };
        
            const closeModal = () => {
                modal.style.display = 'none';
            };
        
            const navigateImages = (direction) => {
                currentImageIndex = (currentImageIndex + direction + modalImages.length) % modalImages.length;
                showImage(currentImageIndex);
            };
        
            prevBtn.addEventListener('click', () => navigateImages(-1));
            nextBtn.addEventListener('click', () => navigateImages(1));
            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        
            document.addEventListener('keydown', (e) => {
                if (modal.style.display === 'block') {
                    if (e.key === 'ArrowLeft') navigateImages(-1);
                    if (e.key === 'ArrowRight') navigateImages(1);
                    if (e.key === 'Escape') closeModal();
                }
            });
        
            const createExpandIcon = (container) => {
                const icon = document.createElement('img');
                icon.src = "/cdn/shop/t/22/assets/icon-zoom.svg";
                icon.className = 'icon-zoom';
                icon.alt = 'Expand image';
                container.appendChild(icon);
            };
        
            const makeImageExpandable = (imgElement, index) => {
                const container = document.createElement('div');
                container.className = 'col-12 image-container';
                imgElement.parentNode.insertBefore(container, imgElement);
                container.appendChild(imgElement);
                createExpandIcon(container);
            
                // Make the image itself clickable
                imgElement.style.cursor = 'pointer';
            
                // Add click handler to both container and image
                const handleClick = () => {
                    updateGalleryImages();
                    showImage(index);
                    modal.style.display = 'block';
                };
            
                // Listen for clicks on both the container and the image
                container.addEventListener('click', handleClick);
                imgElement.addEventListener('click', handleClick);
            };
        
            return {
                initializeImages: () => {
                    updateGalleryImages();
                    galleryImages.forEach((img, index) => {
                        makeImageExpandable(img, index);
                    });
                }
            };
        };

        const getVariantFromURL = () => {
            try {
                let url = window.location.href;
        
                if ((url.match(/\?/g) || []).length > 1) {
                    debugLog("Ongeldige URL gedetecteerd, corrigeren...");
                    const [base, ...queryParts] = url.split('?');
                    url = `${base}?${queryParts.join('&')}`;
                    debugLog("Gecorrigeerde URL:", url);
                }
        
                const parsedURL = new URL(url);
                const params = new URLSearchParams(parsedURL.search);
        
                debugLog("Huidige queryparameters:", Array.from(params.entries()));
        
                const variantId = params.get('variant');
                if (variantId) {
                    debugLog("Variant ID gevonden in URL:", variantId);
                    return variantId;
                }
        
                debugLog("Geen 'variant' parameter gevonden in URL.");
                return null;
            } catch (error) {
                console.error("Fout bij het ophalen van variant ID uit URL:", error);
                return null;
            }
        };               

        const updateGallery = (variantId) => {
            debugLog("Gallery updaten voor variant:", variantId);
            mediaGallery.innerHTML = '';
            secondaryGallery.innerHTML = '';
            mobileMediaGallery.innerHTML = '';
        
            const selectedVariant = productData.variants.find(variant => variant.id === variantId);
            let allImages = []; // Array to collect all images for mobile gallery
        
            const createImageElement = (src, alt, classes = []) => {
                const imgElement = document.createElement('img');
                imgElement.src = src;
                imgElement.alt = alt;
                classes.forEach(cls => imgElement.classList.add(cls));
                return imgElement;
            };
        
            // Add featured/main image
            if (selectedVariant && selectedVariant.featured_image) {
                const imgElement = createImageElement(
                    selectedVariant.featured_image.src,
                    `Featured image for variant ID: ${variantId}`,
                    ['img-fluid', 'w-100', 'mb-3']
                );
                mediaGallery.appendChild(imgElement);
                allImages.push({
                    src: selectedVariant.featured_image.src,
                    alt: `Featured image for variant ID: ${variantId}`
                });
            } else {
                const fallbackImage = createImageElement(
                    productData.featured_image,
                    "Fallback featured image",
                    ['img-fluid', 'w-100', 'mb-3']
                );
                mediaGallery.appendChild(fallbackImage);
                allImages.push({
                    src: productData.featured_image,
                    alt: "Fallback featured image"
                });
            }
        
            // Add secondary images
            if (selectedVariant) {
                const relevantOptions = Object.values(selectedOptions).filter(option => option.length > 3);
                const secondaryImages = productData.media.filter(media =>
                    media.alt && relevantOptions.some(option => 
                        media.alt.toLowerCase().includes(option.toLowerCase())
                    )
                );
        
                secondaryImages.forEach(image => {
                    const colDiv = document.createElement('div');
                    colDiv.classList.add('secondary-image');
        
                    const imgElement = createImageElement(
                        image.src, 
                        image.alt || "Secondary image", 
                        ['img-fluid', 'rounded']
                    );
                    colDiv.appendChild(imgElement);
                    secondaryGallery.appendChild(colDiv);
        
                    allImages.push({
                        src: image.src,
                        alt: image.alt || "Secondary image"
                    });
                });
            }
        
            // Create or get dots container
            let dotsContainer = document.querySelector('.slider-dots');
            if (!dotsContainer) {
                dotsContainer = document.createElement('ul');
                dotsContainer.className = 'slider-dots';
                mobileMediaGallery.parentNode.appendChild(dotsContainer);
            }
            dotsContainer.innerHTML = '';
        
            // Add all images to mobile gallery with dots
            allImages.forEach((image, index) => {
                // Create image for mobile gallery
                const mobileImgElement = createImageElement(
                    image.src,
                    image.alt,
                    ['col-12', 'product-gallery-mobile-item']
                );
                mobileMediaGallery.appendChild(mobileImgElement);
        
                // Create corresponding dot
                const dot = document.createElement('li');
                dot.classList.add('slider-dot');
                if (index === 0) dot.classList.add('active');
                dotsContainer.appendChild(dot);
            });
        
            // Update dots on scroll
            const updateDots = () => {
                const index = Math.round(mobileMediaGallery.scrollLeft / mobileMediaGallery.offsetWidth);
                dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
            };
        
            // Add scroll event listener for dots
            mobileMediaGallery.addEventListener('scroll', () => {
                requestAnimationFrame(updateDots);
            });
        
            // Re-initialize expandable images after gallery update
            setTimeout(() => gallery.initializeImages(), 100);
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

        // Initialize option buttons
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
                    const variantWithImage = productData.variants.find(variant => 
                        variant[`option${index + 1}`] === value && variant.featured_image);
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

        // Initialize accordion functionality
        document.querySelectorAll('.accordion-header').forEach(header => {
            debugLog('Accordion header gevonden:', header);
            header.addEventListener('click', () => {
                debugLog('Accordion header geklikt:', header);
                const content = header.nextElementSibling;
                header.classList.toggle('active');
                content.classList.toggle('active');
            });
        });

        // Initialize the gallery functionality
        gallery = initializeGallery();

        // Handle initial variant selection
        const variantIdFromURL = getVariantFromURL();
        let initialVariant = productData.variants[0];

        if (variantIdFromURL) {
            const variantFromURL = productData.variants.find(variant => 
                variant.id.toString() === variantIdFromURL);
            if (variantFromURL) {
                initialVariant = variantFromURL;
            }
        }

        productData.options.forEach((optionName, index) => {
            const value = initialVariant[`option${index + 1}`];
            selectedOptions[optionName] = value;
            const button = optionsContainer.querySelector(
                `[data-option="${optionName}"][data-value="${value}"]`);
            if (button) {
                button.classList.add('active');
            }
        });

// Initialize with initial variant
updateGallery(initialVariant.id);
updateBuyButton(initialVariant.id);
updateProductTitle();
updateProductDescription(initialVariant.id);
updatePrice(initialVariant.id);

} catch (error) {
console.error("Fout tijdens initialisatie van de productgalerij:", error);
}
});