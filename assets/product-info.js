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

      constructor() {
        super();

         // Initialiseer de hoeveelheid invoerveld
        this.quantityInput = this.querySelector('.quantity__input');
      }

      connectedCallback() {
        // Functie die wordt uitgevoerd wanneer het element aan de DOM wordt toegevoegd
        this.initializeProductSwapUtility();

        this.onVariantChangeUnsubscriber = subscribe(
          PUB_SUB_EVENTS.optionValueSelectionChange,
          this.handleOptionValueChange.bind(this)
        );
        // Initialiseer hoeveelheid gerelateerde handlers
        this.initQuantityHandlers();
        // Laat andere componenten weten dat dit component is geladen
        this.dispatchEvent(new CustomEvent('product-info:loaded', { bubbles: true }));
      }

      addPreProcessCallback(callback) {
        // Voeg een callback toe die moet worden uitgevoerd vóór HTML-verwerking
        this.preProcessHtmlCallbacks.push(callback);
      }

      initQuantityHandlers() {
        // Configureer de invoer voor hoeveelheden
        if (!this.quantityInput) return;

        this.quantityForm = this.querySelector('.product-form__quantity');
        if (!this.quantityForm) return;

        this.setQuantityBoundries();
        // Abonneer op updates in de winkelwagen (indien nodig)
        if (!this.dataset.originalSection) {
          this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, this.fetchQuantityRules.bind(this));
        }
      }

      disconnectedCallback() {
        // Functie die wordt uitgevoerd wanneer het element uit de DOM wordt verwijderd
        this.onVariantChangeUnsubscriber();
        this.cartUpdateUnsubscriber?.();
      }

      initializeProductSwapUtility() {
        // Configureer functionaliteit voor productwissel
        this.preProcessHtmlCallbacks.push((html) =>
          html.querySelectorAll('.scroll-trigger').forEach((element) => element.classList.add('scroll-trigger--cancel'))
        );
        this.postProcessHtmlCallbacks.push((newNode) => {
          window?.Shopify?.PaymentButton?.init();
          window?.ProductModel?.loadShopifyXR();
        });
      }

      updateTitle(selectedOption) {
        // Zoek het producttitel-element
        const productTitle = this.querySelector('.product__title');
        if (!productTitle) return;
      
        // Haal de originele titel op uit het data-attribuut
        const baseTitle = productTitle.getAttribute('data-title');
        if (!baseTitle) return;
      
        // Werk de inhoud van de titel bij
        const titleElement = productTitle.querySelector('h1');
        if (titleElement) {
          titleElement.textContent = `${baseTitle} - ${selectedOption}`;
          console.log(`Updated title to: ${baseTitle} - ${selectedOption}`);
        }
      }
      

      handleOptionValueChange({ data: { event, target, selectedOptionValues } }) {
        if (!this.contains(event.target)) return;
      
        this.resetProductFormState();
      
        const productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url;
        this.pendingRequestUrl = productUrl;
        const shouldSwapProduct = this.dataset.url !== productUrl;
        const shouldFetchFullPage = this.dataset.updateUrl === 'true' && shouldSwapProduct;
      
        // Haal de geselecteerde variant op
        const productInfoNode = this; // Het huidige product-info-element
        const selectedVariant = this.getSelectedVariant(productInfoNode);
      
        if (selectedVariant?.option1) {
          console.log('Using Variant Option1 for update:', selectedVariant.option1);
          this.updateTitle(selectedVariant.option1); // Update de titel met option1 (kleur)
        } else {
          console.log('No valid option1 found. Skipping title update.');
        }
      
        this.renderProductInfo({
          requestUrl: this.buildRequestUrlWithParams(productUrl, selectedOptionValues, shouldFetchFullPage),
          targetId: target.id,
          callback: shouldSwapProduct
            ? this.handleSwapProduct(productUrl, shouldFetchFullPage)
            : this.handleUpdateProductInfo(productUrl),
        });
      }
         

      resetProductFormState() {
        // Reset de status van het formulier
        const productForm = this.productForm;
        productForm?.toggleSubmitButton(true);
        productForm?.handleErrorMessage();
      }

      handleSwapProduct(productUrl, updateFullPage) {
        // Verwerk het wisselen van producten
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
        // Render productinformatie door HTML op te halen
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
        // Haal de geselecteerde variant op uit een gegeven HTML-node
        const selectedVariant = productInfoNode.querySelector('variant-selects [data-selected-variant]')?.innerHTML;
        console.log('Selected Variant (raw):', selectedVariant); // Log de ruwe geselecteerde variant
      
        // Parse de JSON als deze bestaat
        return !!selectedVariant ? JSON.parse(selectedVariant) : null;
      }
      

      buildRequestUrlWithParams(url, optionValues, shouldFetchFullPage = false) {
        // Bouw de URL voor het opvragen van nieuwe gegevens
        const params = [];

        !shouldFetchFullPage && params.push(`section_id=${this.sectionId}`);

        if (optionValues.length) {
          params.push(`option_values=${optionValues.join(',')}`);
        }

        return `${url}?${params.join('&')}`;
      }

      updateOptionValues(html) {
        // Werk de optievelden bij met nieuwe gegevens
        const variantSelects = html.querySelector('variant-selects');
        if (variantSelects) {
          HTMLUpdateUtility.viewTransition(this.variantSelectors, variantSelects, this.preProcessHtmlCallbacks);
        }
      }

      handleUpdateProductInfo(productUrl) {
        // Werk productinformatie bij zonder productwissel
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

      updateURL(url, variantId) {
        this.querySelector('share-button')?.updateUrl(
          `${window.shopUrl}${url}${variantId ? `?variant=${variantId}` : ''}`
        );

        if (this.dataset.updateUrl === 'false') return;
        window.history.replaceState({}, '', `${url}${variantId ? `?variant=${variantId}` : ''}`);
      }

      setUnavailable() {
        this.productForm?.toggleSubmitButton(true, window.variantStrings.unavailable);

        const selectors = ['price', 'Inventory', 'Sku', 'Price-Per-Item', 'Volume-Note', 'Volume', 'Quantity-Rules']
          .map((id) => `#${id}-${this.dataset.section}`)
          .join(', ');
        document.querySelectorAll(selectors).forEach(({ classList }) => classList.add('hidden'));
      }

      updateMedia(html, variantFeaturedMediaId) {
        if (!variantFeaturedMediaId) return;
      
        // Zoek de bron- en bestemmingsmedia-galerijen
        const mediaGallerySource = this.querySelector('media-gallery');
        const mediaGalleryDestination = html.querySelector('media-gallery');
      
        const refreshSourceData = () => {
          // Zoomen bij hover indien ingesteld
          if (this.hasAttribute('data-zoom-on-hover')) enableZoomOnHover(2);
      
          // Verzamelen van de media-items
          const mediaGallerySourceItems = Array.from(mediaGallerySource.querySelectorAll('.product__media-item[data-media-id]'));
          const sourceSet = new Set(mediaGallerySourceItems.map((item) => item.dataset.mediaId));
          const sourceMap = new Map(
            mediaGallerySourceItems.map((item, index) => [item.dataset.mediaId, { item, index }])
          );
          return [mediaGallerySourceItems, sourceSet, sourceMap];
        };
      
        if (mediaGallerySource && mediaGalleryDestination) {
          let [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();
          const mediaGalleryDestinationItems = Array.from(
            mediaGalleryDestination.querySelectorAll('.product__media-item[data-media-id]')
          );
          const destinationSet = new Set(mediaGalleryDestinationItems.map(({ dataset }) => dataset.mediaId));
          let shouldRefresh = false;
      
          // Voeg items uit de nieuwe gegevens toe die nog niet in de DOM aanwezig zijn
          for (let i = mediaGalleryDestinationItems.length - 1; i >= 0; i--) {
            if (!sourceSet.has(mediaGalleryDestinationItems[i].dataset.mediaId)) {
              mediaGallerySource.prepend(mediaGalleryDestinationItems[i]);
              shouldRefresh = true;
            }
          }
      
          // Verwijder items uit de DOM die niet aanwezig zijn in de nieuwe gegevens
          for (let i = 0; i < mediaGallerySourceItems.length; i++) {
            if (!destinationSet.has(mediaGallerySourceItems[i].dataset.mediaId)) {
              mediaGallerySourceItems[i].remove();
              shouldRefresh = true;
            }
          }
      
          // Vernieuw de gegevens
          if (shouldRefresh) [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();
      
          // Sorteer de galerijitems om de volgorde van de nieuwe gegevens te matchen
          mediaGalleryDestinationItems.forEach((destinationItem, destinationIndex) => {
            const sourceData = sourceMap.get(destinationItem.dataset.mediaId);
      
            if (sourceData && sourceData.index !== destinationIndex) {
              mediaGallerySource.insertBefore(
                sourceData.item,
                mediaGallerySource.querySelector(`.product__media-item:nth-of-type(${destinationIndex + 1})`)
              );
      
              // Vernieuw de bron na wijziging
              [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();
            }
          });
        }
      
        // Zet de uitgelichte media als actief
        const featuredMedia = this.querySelector(`.product__media-item.featured-media`);
        if (featuredMedia) {
          featuredMedia.classList.add('active'); // Zorg ervoor dat de actieve media correct wordt gemarkeerd
        }
      
        // Update de modalcontent van de media
        const modalContent = this.productModal?.querySelector(`.product-media-modal__content`);
        const newModalContent = html.querySelector(`product-modal .product-media-modal__content`);
        if (modalContent && newModalContent) modalContent.innerHTML = newModalContent.innerHTML;
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
        // Haal bijgewerkte regels voor hoeveelheden op
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
        // Werk hoeveelheidregels en labels bij
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
        // Haal het productformulier op
        return this.querySelector(`product-form`);
      }

      get productModal() {
        // Haal de productmodal op
        return document.querySelector(`#ProductModal-${this.dataset.section}`);
      }

      get pickupAvailability() {
        // Haal de ophaalbeschikbaarheid op
        return this.querySelector(`pickup-availability`);
      }

      get variantSelectors() {
        // Haal de selector voor varianten op
        return this.querySelector('variant-selects');
      }

      get relatedProducts() {
        // Haal gerelateerde producten op
        const relatedProductsSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'related-products'
        );
        return document.querySelector(`product-recommendations[data-section-id^="${relatedProductsSectionId}"]`);
      }

      get quickOrderList() {
        // Haal de lijst voor snel bestellen op
        const quickOrderListSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'quick_order_list'
        );
        return document.querySelector(`quick-order-list[data-id^="${quickOrderListSectionId}"]`);
      }

      get sectionId() {
        // Bepaal het sectie-ID
        return this.dataset.originalSection || this.dataset.section;
      }
    }
  );
}
