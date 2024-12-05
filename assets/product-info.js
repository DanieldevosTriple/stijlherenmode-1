// Controleer of 'product-info' al gedefinieerd is als een custom element
if (!customElements.get('product-info')) {
  customElements.define(
    'product-info',
    class ProductInfo extends HTMLElement {
      // Eigenschappen van de class
      quantityInput = undefined;
      quantityForm = undefined;
      onVariantChangeUnsubscriber = undefined;
      cartUpdateUnsubscriber = undefined;
      abortController = undefined;
      pendingRequestUrl = null;
      preProcessHtmlCallbacks = [];
      postProcessHtmlCallbacks = [];

      // Constructor: wordt aangeroepen bij initialisatie van de component
      constructor() {
        super();
        console.log('[ProductInfo] Constructor called');
        // Zoek het hoeveelheid-invoerveld in de DOM
        this.quantityInput = this.querySelector('.quantity__input');
        console.log('[ProductInfo] Quantity Input:', this.quantityInput);
      }

      // Wordt aangeroepen wanneer het element aan de DOM wordt toegevoegd
      connectedCallback() {
        this.initializeProductSwapUtility(); // Setup voor productwissel
        this.subscribeToEvents(); // Abonneer op events
        this.initQuantityHandlers(); // Initialiseer hoeveelheidgerelateerde handlers

        // Informeer andere componenten dat dit component is geladen
        this.dispatchEvent(new CustomEvent('product-info:loaded', { bubbles: true }));
      }

      // Wordt aangeroepen wanneer het element uit de DOM wordt verwijderd
      disconnectedCallback() {
        this.onVariantChangeUnsubscriber?.(); // Annuleer event-subscribers
        this.cartUpdateUnsubscriber?.();
      }

      /**
       * Abonneer op vereiste events, zoals variantwijzigingen.
       */
      subscribeToEvents() {
        this.onVariantChangeUnsubscriber = subscribe(
          PUB_SUB_EVENTS.optionValueSelectionChange,
          this.handleOptionValueChange.bind(this)
        );
      }

      /**
       * Initialiseer de hoeveelheid-invoer gerelateerde handlers.
       */
      initQuantityHandlers() {
        if (!this.quantityInput) return; // Stop als de invoer niet bestaat

        this.quantityForm = this.querySelector('.product-form__quantity');
        if (!this.quantityForm) return;

        this.setQuantityBoundries(); // Stel min/max grenzen in
        if (!this.dataset.originalSection) {
          this.cartUpdateUnsubscriber = subscribe(
            PUB_SUB_EVENTS.cartUpdate,
            this.fetchQuantityRules.bind(this)
          );
        }
      }

      /**
       * Configureer de functionaliteit voor productwissel.
       */
      initializeProductSwapUtility() {
        // Pre-process HTML callbacks toevoegen
        this.preProcessHtmlCallbacks.push((html) => {
          html.querySelectorAll('.scroll-trigger').forEach((element) => {
            element.classList.add('scroll-trigger--cancel');
          });
        });

        // Post-process HTML callbacks toevoegen
        this.postProcessHtmlCallbacks.push(() => {
          window?.Shopify?.PaymentButton?.init();
          window?.ProductModel?.loadShopifyXR();
        });
      }

      /**
       * Behandel wijzigingen in de geselecteerde productopties.
       */
      handleOptionValueChange({ data: { event, target, selectedOptionValues } }) {
        if (!this.contains(event.target)) return;

        this.resetProductFormState(); // Reset de productformulierstatus

        const productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url;
        this.pendingRequestUrl = productUrl;

        const shouldSwapProduct = this.dataset.url !== productUrl;
        const shouldFetchFullPage = this.dataset.updateUrl === 'true' && shouldSwapProduct;

        this.renderProductInfo({
          requestUrl: this.buildRequestUrlWithParams(productUrl, selectedOptionValues, shouldFetchFullPage),
          targetId: target.id,
          callback: shouldSwapProduct
            ? this.handleSwapProduct(productUrl, shouldFetchFullPage)
            : this.handleUpdateProductInfo(productUrl),
        });
      }

      /**
       * Reset de status van het productformulier.
       */
      resetProductFormState() {
        const productForm = this.productForm;
        productForm?.toggleSubmitButton(true);
        productForm?.handleErrorMessage();
      }

      /**
       * Wissel het product uit en werk de HTML bij.
       */
      handleSwapProduct(productUrl, updateFullPage) {
        return (html) => {
          this.productModal?.remove(); // Verwijder bestaande modals

          const selector = updateFullPage ? "product-info[id^='MainProduct']" : 'product-info';
          const variant = this.getSelectedVariant(html.querySelector(selector));
          this.updateURL(productUrl, variant?.id);

          if (updateFullPage) {
            this.swapFullPage(html);
          } else {
            this.swapPartialPage(html);
          }
        };
      }

      /**
       * Wissel de volledige pagina uit.
       */
      swapFullPage(html) {
        document.querySelector('head title').innerHTML = html.querySelector('head title').innerHTML;
        HTMLUpdateUtility.viewTransition(
          document.querySelector('main'),
          html.querySelector('main'),
          this.preProcessHtmlCallbacks,
          this.postProcessHtmlCallbacks
        );
      }

      /**
       * Wissel alleen het productgedeelte uit.
       */
      swapPartialPage(html) {
        HTMLUpdateUtility.viewTransition(
          this,
          html.querySelector('product-info'),
          this.preProcessHtmlCallbacks,
          this.postProcessHtmlCallbacks
        );
      }

      /**
       * Bouw de URL met parameters voor het ophalen van nieuwe gegevens.
       */
      buildRequestUrlWithParams(url, optionValues, shouldFetchFullPage = false) {
        const params = [];
        if (!shouldFetchFullPage) params.push(`section_id=${this.sectionId}`);
        if (optionValues.length) params.push(`option_values=${optionValues.join(',')}`);
        return `${url}?${params.join('&')}`;
      }

      /**
       * Werk de URL en varianten bij.
       */
      updateURL(url, variantId) {
        this.querySelector('share-button')?.updateUrl(
          `${window.shopUrl}${url}${variantId ? `?variant=${variantId}` : ''}`
        );

        if (this.dataset.updateUrl === 'false') return;
        window.history.replaceState({}, '', `${url}${variantId ? `?variant=${variantId}` : ''}`);
      }

      /**
       * Stel grenzen in voor hoeveelheid-invoer.
       */
      setQuantityBoundries() {
        const data = {
          cartQuantity: parseInt(this.quantityInput.dataset.cartQuantity || '0'),
          min: parseInt(this.quantityInput.dataset.min || '1'),
          max: this.quantityInput.dataset.max ? parseInt(this.quantityInput.dataset.max) : null,
          step: parseInt(this.quantityInput.step || '1'),
        };

        let min = data.min;
        const max = data.max === null ? null : data.max - data.cartQuantity;
        if (max !== null) min = Math.min(min, max);
        if (data.cartQuantity >= data.min) min = Math.min(min, data.step);

        this.quantityInput.min = min;
        max ? (this.quantityInput.max = max) : this.quantityInput.removeAttribute('max');
        this.quantityInput.value = min;

        publish(PUB_SUB_EVENTS.quantityUpdate);
      }

      /**
       * Haal regels voor hoeveelheden op.
       */
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
          .finally(() => {
            this.querySelector('.quantity__rules-cart .loading__spinner').classList.add('hidden');
          });
      }

      /**
       * Werk regels en labels voor hoeveelheden bij.
       */
      updateQuantityRules(sectionId, html) {
        if (!this.quantityInput) return;

        this.setQuantityBoundries();
        const quantityFormUpdated = html.getElementById(`Quantity-Form-${sectionId}`);
        const selectors = ['.quantity__input', '.quantity__rules', '.quantity__label'];

        selectors.forEach((selector) => {
          const current = this.quantityForm.querySelector(selector);
          const updated = quantityFormUpdated.querySelector(selector);
          if (!current || !updated) return;

          if (selector === '.quantity__input') {
            ['data-cart-quantity', 'data-min', 'data-max', 'step'].forEach((attr) => {
              const valueUpdated = updated.getAttribute(attr);
              valueUpdated !== null ? current.setAttribute(attr, valueUpdated) : current.removeAttribute(attr);
            });
          } else {
            current.innerHTML = updated.innerHTML;
          }
        });
      }

      // Getters voor DOM-elementen
      get productForm() {
        return this.querySelector(`product-form`);
      }

      get productModal() {
        return document.querySelector(`#ProductModal-${this.dataset.section}`);
      }

      get sectionId() {
        return this.dataset.originalSection || this.dataset.section;
      }
    }
  );
}
