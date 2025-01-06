class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.state = {
      loading: false,
      selectedFilters: new Map(),
      currentView: 'main',
      filterCache: new Map(),
      isMobileView: window.innerWidth <= 991,
      currentSort: '',
      isSearchPage: window.location.pathname.includes('/search'), // Add check for search page
      searchTerms: new URLSearchParams(window.location.search).get('q') || '' // Store search terms
    };

    this.filterPreview = new FilterPreview();
    this.debouncedOnChange = debounce((event) => this.handleFilterChange(event), 150);

    this.initializeFromURL();
    this.initializeAccordion();
    this.setupEventListeners();
    this.setupResizeObserver();
    this.updateProductCount();
  }


  setupEventListeners() {
    // Price range inputs - both mobile and desktop
    const priceInputs = this.querySelectorAll('.facet-range__input');
    priceInputs.forEach(input => {
      input.addEventListener('change', (e) => this.handlePriceRangeChange(e)); // Updated handler
    });

    // Add sort input handlers
    const sortInputs = this.querySelectorAll('input[name="sort_by_desktop"], input[name="sort_by_mobile"]');
    console.log('Sort inputs found:', sortInputs); // Debug: Controleer gevonden inputs
    sortInputs.forEach(input => {
      input.addEventListener('change', (event) => {
        console.log('Sort input changed:', event.target.value); // Debug: Log verandering
        this.handleSortChange(event);
      });
    });

    // Form change handler for all checkboxes
    const form = this.querySelector('form');
    if (form) {
      form.addEventListener('change', this.debouncedOnChange);
    }

    // Mobile-specific controls 
    const mobileControls = {
      open: document.querySelector('.mobile-facets__open-button'),
      close: this.querySelector('.mobile-facets__close-button'),
      back: this.querySelector('.mobile-facets__back-button'),
      clear: this.querySelector('.mobile-facets__clear'),
      apply: this.querySelector('.mobile-facets__apply')
    };

    mobileControls.open?.addEventListener('click', () => this.openMobileDrawer());
    mobileControls.close?.addEventListener('click', () => this.closeMobileDrawer());
    mobileControls.back?.addEventListener('click', () => this.closeMobileSubmenu());
    mobileControls.clear?.addEventListener('click', () => this.clearFilters());
    mobileControls.apply?.addEventListener('click', () => this.applyMobileFilters());

    // Mobile submenu buttons
    this.querySelectorAll('.mobile-facets__menu-button').forEach(button => {
      button.addEventListener('click', () => {
        const submenuId = button.closest('.facet-accordion__item').dataset.submenu;
        this.openMobileSubmenu(submenuId);
      });
    });

    // Keyboard accessibility
    document.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') {
        if (this.state.currentView === 'submenu') {
          this.closeMobileSubmenu();
        } else if (this.state.isMobileView) {
          this.closeMobileDrawer();
        }
      }
    });
  }

  handleSortChange(event) {
    console.log('handleSortChange triggered'); // Log aanroepen van de functie
    const sortValue = event.target.value;
    console.log('Selected radio value:', sortValue); // Log de waarde van de geselecteerde radio

    this.state.currentSort = sortValue;

    // Synchroniseer tussen desktop en mobiel
    const isDesktop = event.target.name === 'sort_by_desktop';
    const otherInputName = isDesktop ? 'sort_by_mobile' : 'sort_by_desktop';
    const otherInput = this.querySelector(`input[name="${otherInputName}"][value="${sortValue}"]`);

    if (otherInput) {
      otherInput.checked = true;
      console.log(`Synchronized ${otherInputName} to value:`, sortValue);
    }

    this.applySortAndFilters();
  }


  initializeAccordion() {
    const accordionItems = this.querySelectorAll('.facet-accordion__item');

    accordionItems.forEach((item) => {
      const toggle = item.querySelector('.facet-accordion__toggle');
      if (toggle) {
        toggle.textContent = item.hasAttribute('open') ? '-' : '+';
      }
    });
  }

  openMobileDrawer() {
    const wrapper = this.querySelector('.facets__wrapper');
    if (!wrapper) return;

    wrapper.setAttribute('open', '');
    document.body.classList.add('overflow-hidden-mobile');
  }

  closeMobileDrawer() {
    const wrapper = this.querySelector('.facets__wrapper');
    if (!wrapper) return;

    wrapper.removeAttribute('open');
    document.body.classList.remove('overflow-hidden-mobile');
    this.closeMobileSubmenu();
  }

  openMobileSubmenu(submenuId) {
    if (!submenuId) return;

    // Show back button
    const backButton = this.querySelector('.mobile-facets__back-button');
    backButton?.classList.remove('hidden');

    // Update title
    const submenuTitle = this.querySelector(`.facet-accordion__item[data-submenu="${submenuId}"] .mobile-facets__menu-button span`)?.textContent;
    if (submenuTitle) {
      this.querySelector('.mobile-facets__title').textContent = submenuTitle;
    }

    // Show submenu content
    this.querySelector(`.facet-accordion__item[data-submenu="${submenuId}"] .mobile-facets__submenu`)?.classList.add('active');
  }

  closeMobileSubmenu() {
    // Hide back button
    this.querySelector('.mobile-facets__back-button')?.classList.add('hidden');

    // Reset title
    this.querySelector('.mobile-facets__title').textContent = 'Filter & Sort';

    // Hide all submenus
    this.querySelectorAll('.mobile-facets__submenu').forEach(submenu => {
      submenu.classList.remove('active');
    });
  }

  setupResizeObserver() {
    window.addEventListener('resize', debounce(() => {
      const isMobile = window.innerWidth <= 991;
      if (isMobile !== this.state.isMobileView) {
        this.state.isMobileView = isMobile;
        if (!isMobile) {
          this.closeMobileDrawer();
        }
      }
    }, 250));
  }

  handleFilterChange(event) {
    if (this.state.loading) return;

    // Determine if the input is a checkbox
    const input = event.target;
    const isCheckbox = input.type === 'checkbox';
    const formData = new FormData(input.closest('form'));
    const queryParams = {};

    if (isCheckbox && !input.checked) {
      // If a checkbox is unchecked, remove the corresponding filter
      const filterKey = input.name;
      const filterValue = input.value;

      this.state.selectedFilters.delete(`${filterKey}-${filterValue}`);

      // Uncheck the corresponding checkbox on the other view (desktop/mobile)
      const otherInput = this.querySelector(
        `.facets__${this.state.isMobileView ? 'desktop' : 'mobile'} input[name="${filterKey}"][value="${filterValue}"]`
      );
      if (otherInput) otherInput.checked = false;

      // Update the UI and URL
      this.renderSelectedFilters();
      this.updateMobileApplyButton();
      this.applySortAndFilters();
      return;
    }

    // Update selected filters for checked checkboxes and other inputs
    formData.forEach((value, key) => {
      if (queryParams[key]) {
        queryParams[key] = queryParams[key] + `,${value}`;
      } else {
        queryParams[key] = value;
      }
    });

    // Clear and rebuild the selectedFilters state
    this.state.selectedFilters.clear();
    Object.entries(queryParams).forEach(([key, value]) => {
      value.split(',').forEach(singleValue => {
        const input = this.querySelector(`input[name="${key}"][value="${singleValue}"]`);
        const label = this.getFilterLabel(input);

        if (label) {
          this.state.selectedFilters.set(`${key}-${singleValue}`, {
            key,
            value: singleValue,
            label,
          });
        }
      });
    });

    // Sync checkboxes between mobile and desktop
    this.state.selectedFilters.forEach(filter => {
      const desktopInput = this.querySelector(
        `.facets__desktop input[name="${filter.key}"][value="${filter.value}"]`
      );
      const mobileInput = this.querySelector(
        `.facets__mobile input[name="${filter.key}"][value="${filter.value}"]`
      );

      if (desktopInput) desktopInput.checked = true;
      if (mobileInput) mobileInput.checked = true;
    });

    // Update UI and apply filters
    this.renderSelectedFilters();
    this.updateMobileApplyButton();
    this.applySortAndFilters();
  }

  applyMobileFilters() {
    // Get current form data to capture unchecked boxes
    const form = this.querySelector('form');
    const formData = new FormData(form);

    // Clear existing filters that aren't in form data
    this.state.selectedFilters.forEach((filter, key) => {
      if (filter.key !== 'price_filter' && !formData.has(filter.key)) {
        this.state.selectedFilters.delete(key);
      }
    });

    // Handle price range inputs
    const minInput = this.querySelector('input[name^="min_"]');
    const maxInput = this.querySelector('input[name^="max_"]');

    if (minInput && maxInput) {
      const min = parseInt(minInput.value) || '';
      const max = parseInt(maxInput.value) || '';

      if (min || max) {
        this.state.selectedFilters.set('price_filter', {
          key: 'price_filter',
          value: `${min}-${max}`,
          label: `Price: $${min || '0'} - $${max || '∞'}`
        });
      } else {
        this.state.selectedFilters.delete('price_filter');
      }
    }

    // Apply sorting and filtering then close drawer
    this.applySortAndFilters();
    this.closeMobileDrawer();
  }

  // Update the applySortAndFilters method
  applySortAndFilters() {
    if (this.state.loading) return;

    const searchParams = this.buildQueryParams();
    const gridContainer = document.getElementById('ProductGridContainer');
    
    if (gridContainer) {
      gridContainer.classList.add('is-loading');
    }

    // Update URL first
    this.updateURLHash(searchParams);

    // Render the page with new filters
    this.renderPage(searchParams).finally(() => {
      if (gridContainer) {
        gridContainer.classList.remove('is-loading');
      }
      this.updateProductCount();
    });
  }

  clearFilters() {
    // Add radio reset
    this.querySelectorAll('input[type="radio"]').forEach(input => {
      input.checked = false;
    });
    this.state.currentSort = '';

    // Clear all price inputs (mobile + desktop)
    this.querySelectorAll('.facet-range__input').forEach(input => {
      input.value = '';
    });

    // Clear all checkboxes (both mobile and desktop)
    this.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.checked = false;
    });

    this.state.selectedFilters.clear();
    this.state.filterCache.clear();

    this.renderSelectedFilters();
    this.updateMobileApplyButton();

    // Update URL and re-render page
    history.pushState({}, '', window.location.pathname);
    this.renderPage('');

    // Close mobile drawer after clearing
    this.closeMobileDrawer();
  }

  updateMobileApplyButton() {
    const applyButton = this.querySelector('.mobile-facets__apply');
    if (!applyButton) return;

    const hasChanges = this.state.selectedFilters.size > 0 || this.state.currentSort;
    applyButton.disabled = !hasChanges;
    applyButton.textContent = hasChanges ? `Apply (${this.state.selectedFilters.size})` : 'Apply';
  }

  getFilterLabel(input) {
    if (!input) return '';
    const label = input.closest('label')?.querySelector('.facet-checkbox__text');
    return label ? label.textContent.split(' (')[0] : '';
  }

  handlePriceRangeChange(event) {
    const minInput = this.querySelector('input[name="min_filter.v.price"]');
    const maxInput = this.querySelector('input[name="max_filter.v.price"]');

    if (!minInput || !maxInput) return;

    const min = parseInt(minInput.value) || '';
    const max = parseInt(maxInput.value) || '';

    // Prevent min > max scenario
    if (min && max && min > max) {
      if (event.target === minInput) {
        minInput.value = max;
      } else {
        maxInput.value = min;
      }
    }

    const filterKey = 'price_filter';

    // Update the selected filters for price range
    if (min || max) {
      this.state.selectedFilters.set(filterKey, {
        key: filterKey,
        value: `${min}-${max}`,
        label: `Price: €${min || '0'} - €${max || '∞'}`
      });
    } else {
      this.state.selectedFilters.delete(filterKey);
    }

    // Update the UI and apply filters
    this.renderSelectedFilters();
    this.updateMobileApplyButton();
    this.applySortAndFilters();
  }

  buildQueryParams() {
    const urlParts = [];

    // Preserve search query if on search page
    if (this.state.isSearchPage && this.state.searchTerms) {
      urlParts.push(`q=${encodeURIComponent(this.state.searchTerms)}`);
      urlParts.push('options[prefix]=last');
    }

    // Add the sort if it's set
    if (this.state.currentSort) {
      urlParts.push(`sort_by=${encodeURIComponent(this.state.currentSort)}`);
    }

    const groupedParams = {};
    this.state.selectedFilters.forEach(filter => {
      if (filter.key === 'price_filter') {
        const [min, max] = filter.value.split('-');
        if (min) groupedParams['filter.v.price.gte'] = min;
        if (max) groupedParams['filter.v.price.lte'] = max;
      } else {
        if (!groupedParams[filter.key]) {
          groupedParams[filter.key] = [];
        }
        groupedParams[filter.key].push(filter.value);
      }
    });

    Object.entries(groupedParams).forEach(([key, values]) => {
      const encodedKey = encodeURIComponent(key);
      if (Array.isArray(values)) {
        const encodedValues = values.map(v => encodeURIComponent(v)).join(',');
        urlParts.push(`${encodedKey}=${encodedValues}`);
      } else {
        urlParts.push(`${encodedKey}=${encodeURIComponent(values)}`);
      }
    });

    return urlParts.join('&');
  }

  async renderPage(searchParams) {
    if (this.state.loading) return;

    try {
      const gridContainer = document.getElementById('ProductGridContainer');
      if (gridContainer) {
        gridContainer.classList.add('is-loading');
      }

      this.state.loading = true;
      const sections = this.getSections();

      await Promise.all(
        sections.map(section => {
          // Build URL based on whether we're on search page or collection page
          const baseUrl = this.state.isSearchPage ? '/search' : window.location.pathname;
          const url = `${baseUrl}?section_id=${section.section}&${searchParams}`;
          return this.renderSectionFromFetch(url);
        })
      );

      if (gridContainer) {
        gridContainer.classList.remove('is-loading');
      }

      this.state.loading = false;
      this.updateProductCount();
    } catch (error) {
      console.error('Error rendering page:', error);
      this.state.loading = false;
    }
  }

  getSelectedFiltersFromURL() {
    const filters = new Map();
    const params = new URLSearchParams(window.location.search);

    params.forEach((value, key) => {
      if (key.startsWith('filter.') && !key.includes('price')) {
        value.split(',').forEach(singleValue => {
          const input = this.querySelector(`input[name="${key}"][value="${singleValue}"]`);
          const label = this.getFilterLabel(input);

          if (label) {
            filters.set(`${key}-${singleValue}`, {
              key,
              value: singleValue,
              label
            });
          }
        });
      }
    });

    const min = params.get('filter.v.price.gte');
    const max = params.get('filter.v.price.lte');

    if (min || max) {
      filters.set('price_filter', {
        key: 'price_filter',
        value: `${min || ''}-${max || ''}`,
        label: `Price: $${min || '0'} - $${max || '∞'}`
      });
    }

    return filters;
  }

  // Add method to handle product count updates
  updateProductCount() {
    const productArticles = document.querySelectorAll('.product-article');
    const countContainer = document.querySelector('.product-count');
    
    if (countContainer) {
      const count = productArticles.length;
      const productText = count === 1 ? 'product' : 'products';
      countContainer.textContent = `${count} ${productText}`;
    }
  }

  initializeFromURL() {
    const params = new URLSearchParams(window.location.search);

    // Store search terms if present
    this.state.searchTerms = params.get('q') || '';
    
    // Initialize the selected filters based on URL parameters
    this.state.selectedFilters = new Map();

    params.forEach((value, key) => {
      if (key === 'filter.v.price.gte' || key === 'filter.v.price.lte') {
        const min = params.get('filter.v.price.gte') || '';
        const max = params.get('filter.v.price.lte') || '';

        if (min || max) {
          this.state.selectedFilters.set('price_filter', {
            key: 'price_filter',
            value: `${min}-${max}`,
            label: `Price: €${min || '0'} - €${max || '∞'}`
          });
        }
      } else if (key.startsWith('filter.')) {
        value.split(',').forEach(singleValue => {
          const input = this.querySelector(`input[name="${key}"][value="${singleValue}"]`);
          if (input) {
            input.checked = true;
            const label = this.getFilterLabel(input);
            if (label) {
              this.state.selectedFilters.set(`${key}-${singleValue}`, {
                key,
                value: singleValue,
                label
              });
            }
          }
        });
      } else if (key === 'sort_by') {
        this.state.currentSort = value;
        const sortInputs = this.querySelectorAll(`input[name^="sort_by"][value="${value}"]`);
        sortInputs.forEach(input => input.checked = true);
      }
    });

    // Initialize price range inputs
    const minPriceInput = this.querySelector('input[name^="min_filter.v.price"]');
    const maxPriceInput = this.querySelector('input[name^="max_filter.v.price"]');
    const minPrice = params.get('filter.v.price.gte') || '';
    const maxPrice = params.get('filter.v.price.lte') || '';

    if (minPriceInput) minPriceInput.value = minPrice;
    if (maxPriceInput) maxPriceInput.value = maxPrice;

    this.renderSelectedFilters();
    this.updateMobileApplyButton();
  }

  syncFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);

      // Reset all inputs first
      this.querySelectorAll('input[type="checkbox"], .facet-range__input, input[name="sort_by"]').forEach(input => {
        if (input.type === 'checkbox') {
          input.checked = false;
        } else if (input.type === 'radio') {
          input.checked = input.value === this.state.currentSort;
        } else {
          input.value = '';
        }
      });

      // Set other filter values from URL
      params.forEach((value, key) => {
        if (key.startsWith('filter.')) {
          if (key === 'filter.v.price.gte' || key === 'filter.v.price.lte') {
            const inputName = key === 'filter.v.price.gte' ? 'min_price' : 'max_price';
            const inputs = this.querySelectorAll(`input[name="${inputName}"]`);
            inputs.forEach(input => input.value = value);
          } else {
            value.split(',').forEach(singleValue => {
              const input = this.querySelector(`input[name="${key}"][value="${singleValue}"]`);
              if (input) input.checked = true;
            });
          }
        }
      });

      this.renderSelectedFilters();
      this.updateMobileApplyButton();
      this.updateFilterPreview();
    } catch (error) {
      console.error('Error syncing from URL:', error);
    }
  }

  updateURLHash(searchParams) {
    console.log('Updating URL with:', searchParams); // Debugging
    history.pushState(
      { searchParams },
      '',
      `${window.location.pathname}${searchParams ? '?' + searchParams : ''}`
    );
  }

  // Voeg dit toe aan je facets.js
  async renderPage(searchParams) {
    if (this.state.loading) return;

    try {
      // Voeg loading class toe
      const gridContainer = document.getElementById('ProductGridContainer');
      if (gridContainer) {
        gridContainer.classList.add('is-loading');
      }

      this.state.loading = true;
      const sections = this.getSections();
      console.log('Sections to render:', sections);

      await Promise.all(
        sections.map(section => {
          const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
          console.log('Fetching section from URL:', url);
          return this.renderSectionFromFetch(url);
        })
      );

      // Verwijder loading class
      if (gridContainer) {
        gridContainer.classList.remove('is-loading');
      }

      this.state.loading = false;
      this.updateProductCount(); // Ensure the product count is updated after rendering
    } catch (error) {
      console.error('Error rendering page:', error);
      this.state.loading = false;
    }
  }

  // Update the renderSectionFromFetch method
  async renderSectionFromFetch(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const text = await response.text();
      const html = new DOMParser().parseFromString(text, 'text/html');

      // Update filters while preserving focus
      this.renderFilters(html);
      
      // Update product grid with variant handling
      this.renderProductGrid(html);
      
      // Update product count
      this.updateProductCount();
      
      // Update URL parameters
      const searchParams = new URL(url).searchParams.toString();
      this.updateURLHash(searchParams);
      
      // Reinitialize any necessary components
      this.initializeAccordion();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error fetching section:', error);
      return Promise.reject(error);
    }
  }

  renderFilters(html) {
    const facetDetailsElements = html.querySelectorAll('#FacetsWrapper .js-filter');

    facetDetailsElements.forEach((element) => {
      const target = document.querySelector(`[data-index="${element.dataset.index}"]`);
      if (target && !target.contains(document.activeElement)) {
        target.innerHTML = element.innerHTML;
      }
    });

    this.initializeAccordion();
  }

  renderProductGrid(html) {
    const grid = document.getElementById('ProductGridContainer');
    const newGrid = html.getElementById('ProductGridContainer');
  
    if (grid && newGrid) {
      // Before updating the grid, store references to any existing event listeners
      const existingArticles = grid.querySelectorAll('.product-article');
      const existingListeners = new Map();
      
      existingArticles.forEach(article => {
        const clone = article.cloneNode(true);
        existingListeners.set(article.dataset.productId, clone);
      });
  
      // Update the grid content
      grid.innerHTML = newGrid.innerHTML;
  
      // Re-attach event listeners to new product articles
      const newArticles = grid.querySelectorAll('.product-article');
      newArticles.forEach(article => {
        const productId = article.dataset.productId;
        if (existingListeners.has(productId)) {
          const savedArticle = existingListeners.get(productId);
          // Copy over any event listeners and data
          article.addEventListener('click', (e) => {
            // Handle click events
          });
        }
      });
  
      // Ensure proper variant handling
      this.initializeVariantSelectors();
      
      // Emit a custom event after the grid is updated
      document.dispatchEvent(new CustomEvent('product-grid:updated', {
        detail: {
          container: grid
        }
      }));
    }
  }

  // Add method to handle variant selectors
  initializeVariantSelectors() {
    const productArticles = document.querySelectorAll('.product-article');
    
    productArticles.forEach(article => {
      const productId = article.dataset.productId;
      const variantId = article.dataset.variantId;
      
      if (productId && window.products && window.products[productId]) {
        const product = window.products[productId];
        
        // Handle color swatches if they exist
        const colorSwatches = article.querySelectorAll('.color-swatch');
        colorSwatches.forEach(swatch => {
          swatch.addEventListener('click', (e) => {
            e.preventDefault();
            const color = swatch.dataset.value;
            
            // Find the variant with this color
            const variant = product.variants.find(v => v.color === color);
            if (variant) {
              // Update the product article data
              article.dataset.variantId = variant.id;
              
              // Update the image if it exists
              const productImage = article.querySelector('.card-product__image img');
              if (productImage && variant.image) {
                productImage.src = variant.image;
                productImage.srcset = variant.image;
              }
            }
          });
        });
      }
    });
  }

  renderProductCount(html) {
    const count = document.getElementById('ProductCount');
    const newCount = html.getElementById('ProductCount');

    if (count && newCount) {
      count.innerHTML = newCount.innerHTML;
    }
  }

  // Update the getSections method to use the correct selector
  getSections() {
    const productGrid = document.querySelector('.product-grid-container');
    return [{
      section: productGrid?.dataset.id || 'main-collection-product-grid'
    }].filter(section => section.section);
  }

  renderSelectedFilters() {
    const container = this.querySelector('#SelectedFilters');
    if (!container) return;

    const filterElements = Array.from(this.state.selectedFilters.values()).map(filter => {
      return `
        <div class="selected-filter" data-key="${filter.key}" data-value="${filter.value}">
          <span>${filter.label}</span>
          <button type="button" class="selected-filter__remove" aria-label="Remove ${filter.label} filter">
            <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = filterElements;

    container.querySelectorAll('.selected-filter__remove').forEach(button => {
      button.addEventListener('click', (e) => {
        const filter = e.target.closest('.selected-filter');
        this.removeFilter(filter.dataset.key, filter.dataset.value);
      });
    });
  }

  removeFilter(key, value) {
    // Handle the price filter specifically
    if (key === 'price_filter') {
      this.state.selectedFilters.delete('price_filter');

      // Reset price input fields
      const minInput = this.querySelector('input[name="min_filter.v.price"]');
      const maxInput = this.querySelector('input[name="max_filter.v.price"]');
      if (minInput) minInput.value = '';
      if (maxInput) maxInput.value = '';

    } else {
      // For other filters, uncheck the input elements
      const desktopInput = this.querySelector(`.facets__desktop input[name="${key}"][value="${value}"]`);
      const mobileInput = this.querySelector(`.facets__mobile input[name="${key}"][value="${value}"]`);

      // Reset UI for both desktop and mobile
      if (desktopInput) desktopInput.checked = false;
      if (mobileInput) mobileInput.checked = false;

      this.state.selectedFilters.delete(`${key}-${value}`);
    }

    // Update the UI after deletion
    this.renderSelectedFilters();
    this.updateMobileApplyButton();
    this.applySortAndFilters();
  }
}

class FilterPreview {
  constructor() {
    this.container = document.createElement('div');
    this.container.classList.add('filter-preview');

    const footer = document.querySelector('.mobile-facets__footer');
    if (footer) {
      footer.prepend(this.container);
    }
  }

  update(count) {
    this.container.innerHTML = `
      <div class="preview-content">
        <span class="preview-count">${count} products</span>
      </div>
    `;
  }
}

function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

customElements.define('facet-filters-form', FacetFiltersForm);