if (!customElements.get('product-info')) {
  customElements.define(
    'product-info',
    class ProductInfo extends HTMLElement {
      quantityInput = undefined;
      quantityForm = undefined;
      onVariantChangeUnsubscriber = undefined;
      cartUpdateUnsubscriber = undefined;
      abortController = undefined;
      pendingRequestUrl = null;
      preProcessHtmlCallbacks = [];
      postProcessHtmlCallbacks = [];

      // Constructor: initialisatie van de class
      constructor() {
        super();
        console.log('[ProductInfo] Constructor called');
        // Zoek het hoeveelheid-invoerveld in de DOM
        this.quantityInput = this.querySelector('.quantity__input');
        console.log('[ProductInfo] Quantity Input:', this.quantityInput);
      }

      connectedCallback() {
        this.initializeProductSwapUtility();

        this.onVariantChangeUnsubscriber = subscribe(
          PUB_SUB_EVENTS.optionValueSelectionChange,
          this.handleOptionValueChange.bind(this)
        );

        this.initQuantityHandlers();
        this.dispatchEvent(new CustomEvent('product-info:loaded', { bubbles: true }));
      }

      addPreProcessCallback(callback) {
        this.preProcessHtmlCallbacks.push(callback);
      }

      initQuantityHandlers() {
        if (!this.quantityInput) return;

        this.quantityForm = this.querySelector('.product-form__quantity');
        if (!this.quantityForm) return;

        this.setQuantityBoundries();
        if (!this.dataset.originalSection) {
          this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, this.fetchQuantityRules.bind(this));
        }
      }

      disconnectedCallback() {
        this.onVariantChangeUnsubscriber();
        this.cartUpdateUnsubscriber?.();
      }

      initializeProductSwapUtility() {
        this.preProcessHtmlCallbacks.push((html) =>
          html.querySelectorAll('.scroll-trigger').forEach((element) => element.classList.add('scroll-trigger--cancel'))
        );
        this.postProcessHtmlCallbacks.push((newNode) => {
          window?.Shopify?.PaymentButton?.init();
          window?.ProductModel?.loadShopifyXR();
        });
      }

      handleOptionValueChange({ data: { event, target, selectedOptionValues } }) {
        console.log('[ProductInfo] Option value change detected:', selectedOptionValues);

        if (!this.contains(event.target)) {
          console.warn('[ProductInfo] Event target not part of this component');
          return;
        }

        this.resetProductFormState(); // Reset de formulierstatus

        const productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url;
        this.pendingRequestUrl = productUrl;

        const shouldSwapProduct = this.dataset.url !== productUrl;
        const shouldFetchFullPage = this.dataset.updateUrl === 'true' && shouldSwapProduct;

        console.log('[ProductInfo] Product URL:', productUrl);
        console.log('[ProductInfo] Should Swap Product:', shouldSwapProduct);
        console.log('[ProductInfo] Should Fetch Full Page:', shouldFetchFullPage);

        this.renderProductInfo({
          requestUrl: this.buildRequestUrlWithParams(productUrl, selectedOptionValues, shouldFetchFullPage),
          targetId: target.id,
          callback: shouldSwapProduct
            ? this.handleSwapProduct(productUrl, shouldFetchFullPage)
            : this.handleUpdateProductInfo(productUrl),
        });
      }

      resetProductFormState() {
        const productForm = this.productForm;
        productForm?.toggleSubmitButton(true);
        productForm?.handleErrorMessage();
      }

      handleSwapProduct(productUrl, updateFullPage) {
        return (html) => {
          this.productModal?.remove();

          const selector = updateFullPage ? "product-info[id^='MainProduct']" : 'product-info';
          const variant = this.getSelectedVariant(html.querySelector(selector));
          this.updateURL(productUrl, variant?.id);

          if (updateFullPage) {
            document.querySelector('head title').innerHTML = html.querySelector('head title').innerHTML;

            HTMLUpdateUtility.viewTransition(
              document.querySelector('main'),
              html.querySelector('main'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks
            );
          } else {
            HTMLUpdateUtility.viewTransition(
              this,
              html.querySelector('product-info'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks
            );
          }
        };
      }

      renderProductInfo({ requestUrl, targetId, callback }) {
        this.abortController?.abort();
        this.abortController = new AbortController();

        fetch(requestUrl, { signal: this.abortController.signal })
          .then((response) => response.text())
          .then((responseText) => {
            this.pendingRequestUrl = null;
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            callback(html);
          })
          .then(() => {
            // set focus to last clicked option value
            document.querySelector(`#${targetId}`)?.focus();
          })
          .catch((error) => {
            if (error.name === 'AbortError') {
              console.log('Fetch aborted by user');
            } else {
              console.error(error);
            }
          });
      }

      getSelectedVariant(productInfoNode) {
        const selectedVariant = productInfoNode.querySelector('variant-selects [data-selected-variant]')?.innerHTML;
        return !!selectedVariant ? JSON.parse(selectedVariant) : null;
      }

      buildRequestUrlWithParams(url, optionValues, shouldFetchFullPage = false) {
        const params = [];

        !shouldFetchFullPage && params.push(`section_id=${this.sectionId}`);

        if (optionValues.length) {
          params.push(`option_values=${optionValues.join(',')}`);
        }

        return `${url}?${params.join('&')}`;
      }

      updateOptionValues(html) {
        const variantSelects = html.querySelector('variant-selects');
        if (variantSelects) {
          HTMLUpdateUtility.viewTransition(this.variantSelectors, variantSelects, this.preProcessHtmlCallbacks);
        }
      }

      handleUpdateProductInfo(productUrl) {
        return (html) => {
          const variant = this.getSelectedVariant(html);

          this.pickupAvailability?.update(variant);
          this.updateOptionValues(html);
          this.updateURL(productUrl, variant?.id);
          this.updateVariantInputs(variant?.id);

          if (!variant) {
            this.setUnavailable();
            return;
          }

          this.updateMedia(html, variant?.featured_media?.id);

          const updateSourceFromDestination = (id, shouldHide = (source) => false) => {
            const source = html.getElementById(`${id}-${this.sectionId}`);
            const destination = this.querySelector(`#${id}-${this.dataset.section}`);
            if (source && destination) {
              destination.innerHTML = source.innerHTML;
              destination.classList.toggle('hidden', shouldHide(source));
            }
          };

          updateSourceFromDestination('price');
          updateSourceFromDestination('Sku', ({ classList }) => classList.contains('hidden'));
          updateSourceFromDestination('Inventory', ({ innerText }) => innerText === '');
          updateSourceFromDestination('Volume');
          updateSourceFromDestination('Price-Per-Item', ({ classList }) => classList.contains('hidden'));

          this.updateQuantityRules(this.sectionId, html);
          this.querySelector(`#Quantity-Rules-${this.dataset.section}`)?.classList.remove('hidden');
          this.querySelector(`#Volume-Note-${this.dataset.section}`)?.classList.remove('hidden');

          this.productForm?.toggleSubmitButton(
            html.getElementById(`ProductSubmitButton-${this.sectionId}`)?.hasAttribute('disabled') ?? true,
            window.variantStrings.soldOut
          );

          publish(PUB_SUB_EVENTS.variantChange, {
            data: {
              sectionId: this.sectionId,
              html,
              variant,
            },
          });
        };
      }

      updateVariantInputs(variantId) {
        this.querySelectorAll(
          `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
        ).forEach((productForm) => {
          const input = productForm.querySelector('input[name="id"]');
          input.value = variantId ?? '';
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }

      /**
       * Update de URL van de pagina en het share-element.
       * 
       * @param {string} url - De basis-URL van het product.
       * @param {string | null} variantId - De ID van de geselecteerde variant (optioneel).
       */
      updateURL(url, variantId) {
        // Bouw de nieuwe URL op basis van de product-URL en variant-ID
        const newUrl = `${window.shopUrl}${url}${variantId ? `?variant=${variantId}` : ''}`;
        
        console.log('[updateURL] New URL:', newUrl); // Log de nieuwe URL

        // Update de share-button URL als deze bestaat
        const shareButton = this.querySelector('share-button');
        if (shareButton) {
          console.log('[updateURL] Updating share-button URL');
          shareButton.updateUrl(newUrl);
        } else {
          console.warn('[updateURL] Share-button element not found');
        }

        // Controleer of de URL niet moet worden geüpdatet in de browsergeschiedenis
        if (this.dataset.updateUrl === 'false') {
          console.log('[updateURL] URL update in browser history disabled');
          return;
        }

        // Vervang de huidige browsergeschiedenis met de nieuwe URL
        console.log('[updateURL] Updating browser history to:', newUrl);
        window.history.replaceState({}, '', newUrl);
      }

      setUnavailable() {
        this.productForm?.toggleSubmitButton(true, window.variantStrings.unavailable);

        const selectors = ['price', 'Inventory', 'Sku', 'Price-Per-Item', 'Volume-Note', 'Volume', 'Quantity-Rules']
          .map((id) => `#${id}-${this.dataset.section}`)
          .join(', ');
        document.querySelectorAll(selectors).forEach(({ classList }) => classList.add('hidden'));
      }

      updateMedia(html, variantFeaturedMediaId) {
        if (!variantFeaturedMediaId) {
          console.log("Geen variantFeaturedMediaId opgegeven, functie stopt.");
          return;
        }
      
        const mediaGallerySource = this.querySelector('media-gallery');
        const mediaGalleryDestination = html.querySelector('media-gallery');
      
        if (!mediaGallerySource || !mediaGalleryDestination) {
          console.error("Media-galerijen niet gevonden:", {
            mediaGallerySource,
            mediaGalleryDestination,
          });
          return;
        }
      
        console.log("Start updateMedia met variantFeaturedMediaId:", variantFeaturedMediaId);
      
        // Voeg nieuwe items toe vanuit de bestemming naar de bron
        const fetchAndAddNewMediaItems = () => {
          const destinationItems = Array.from(mediaGalleryDestination.querySelectorAll('.product__media-item'));
          console.log("Controleer ontbrekende items in de bron:", destinationItems);
      
          destinationItems.forEach((destinationItem) => {
            if (!mediaGallerySource.querySelector(`[data-media-id="${destinationItem.dataset.mediaId}"]`)) {
              console.log("Voeg nieuw item toe:", destinationItem);
              mediaGallerySource.appendChild(destinationItem.cloneNode(true));
            }
          });
        };
      
        // Markeer en verplaats de featured-media naar de bovenkant
        const setFeaturedMedia = () => {
          const featuredMedia = mediaGallerySource.querySelector(`[data-media-id="${variantFeaturedMediaId}"]`);
          if (featuredMedia) {
            console.log("Markeer en plaats featured-media bovenaan:", featuredMedia);
            
            // Verwijder de huidige featured-media indien nodig
            if (featuredMedia.parentNode) {
              featuredMedia.parentNode.removeChild(featuredMedia);
            }
      
            // Voeg de featured-media opnieuw toe aan de bovenkant
            mediaGallerySource.insertBefore(featuredMedia, mediaGallerySource.firstChild);
      
            // Voeg de juiste CSS-classes toe
            featuredMedia.classList.add('featured-media', 'active');
          } else {
            console.warn("Featured media niet gevonden:", variantFeaturedMediaId);
          }
        };
      
        // Sorteer items in de juiste volgorde
        const sortMediaItems = () => {
          const destinationItems = Array.from(mediaGalleryDestination.querySelectorAll('.product__media-item'));
          console.log("Sorteer items volgens bestemming:", destinationItems);
      
          destinationItems.forEach((destinationItem, index) => {
            const sourceItem = mediaGallerySource.querySelector(`[data-media-id="${destinationItem.dataset.mediaId}"]`);
            if (sourceItem) {
              console.log(`Verplaats item naar index ${index}:`, sourceItem);
              mediaGallerySource.insertBefore(sourceItem, mediaGallerySource.children[index]);
            }
          });
        };
      
        console.log("Toevoegen van nieuwe items...");
        fetchAndAddNewMediaItems();
      
        console.log("Instellen van featured-media...");
        setFeaturedMedia();
      
        console.log("Sorteren van items...");
        sortMediaItems();
      
        // Update modal-content indien aanwezig
        const modalContent = this.querySelector('.product-media-modal__content');
        const newModalContent = html.querySelector('product-modal .product-media-modal__content');
        if (modalContent && newModalContent) {
          console.log("Bijwerken van modal-content...");
          modalContent.innerHTML = newModalContent.innerHTML;
        }
      
        console.log("updateMedia voltooid.");
      }
      
      setQuantityBoundries() {
        const data = {
          cartQuantity: this.quantityInput.dataset.cartQuantity ? parseInt(this.quantityInput.dataset.cartQuantity) : 0,
          min: this.quantityInput.dataset.min ? parseInt(this.quantityInput.dataset.min) : 1,
          max: this.quantityInput.dataset.max ? parseInt(this.quantityInput.dataset.max) : null,
          step: this.quantityInput.step ? parseInt(this.quantityInput.step) : 1,
        };

        let min = data.min;
        const max = data.max === null ? data.max : data.max - data.cartQuantity;
        if (max !== null) min = Math.min(min, max);
        if (data.cartQuantity >= data.min) min = Math.min(min, data.step);

        this.quantityInput.min = min;

        if (max) {
          this.quantityInput.max = max;
        } else {
          this.quantityInput.removeAttribute('max');
        }
        this.quantityInput.value = min;

        publish(PUB_SUB_EVENTS.quantityUpdate, undefined);
      }

      fetchQuantityRules() {
        const currentVariantId = this.productForm?.variantIdInput?.value;
        if (!currentVariantId) return;

        this.querySelector('.quantity__rules-cart .loading__spinner').classList.remove('hidden');
        fetch(`${this.dataset.url}?variant=${currentVariantId}&section_id=${this.dataset.section}`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            this.updateQuantityRules(this.dataset.section, html);
          })
          .catch((e) => console.error(e))
          .finally(() => this.querySelector('.quantity__rules-cart .loading__spinner').classList.add('hidden'));
      }

      updateQuantityRules(sectionId, html) {
        if (!this.quantityInput) return;
        this.setQuantityBoundries();

        const quantityFormUpdated = html.getElementById(`Quantity-Form-${sectionId}`);
        const selectors = ['.quantity__input', '.quantity__rules', '.quantity__label'];
        for (let selector of selectors) {
          const current = this.quantityForm.querySelector(selector);
          const updated = quantityFormUpdated.querySelector(selector);
          if (!current || !updated) continue;
          if (selector === '.quantity__input') {
            const attributes = ['data-cart-quantity', 'data-min', 'data-max', 'step'];
            for (let attribute of attributes) {
              const valueUpdated = updated.getAttribute(attribute);
              if (valueUpdated !== null) {
                current.setAttribute(attribute, valueUpdated);
              } else {
                current.removeAttribute(attribute);
              }
            }
          } else {
            current.innerHTML = updated.innerHTML;
          }
        }
      }

      get productForm() {
        return this.querySelector(`product-form`);
      }

      get productModal() {
        return document.querySelector(`#ProductModal-${this.dataset.section}`);
      }

      get pickupAvailability() {
        return this.querySelector(`pickup-availability`);
      }

      get variantSelectors() {
        return this.querySelector('variant-selects');
      }

      get relatedProducts() {
        const relatedProductsSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'related-products'
        );
        return document.querySelector(`product-recommendations[data-section-id^="${relatedProductsSectionId}"]`);
      }

      get quickOrderList() {
        const quickOrderListSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'quick_order_list'
        );
        return document.querySelector(`quick-order-list[data-id^="${quickOrderListSectionId}"]`);
      }

      get sectionId() {
        return this.dataset.originalSection || this.dataset.section;
      }
    }
  );
}
