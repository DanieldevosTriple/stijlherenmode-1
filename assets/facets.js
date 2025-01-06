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
      isSearchPage: window.location.pathname.includes('/search'),
      searchTerms: new URLSearchParams(window.location.search).get('q') || ''
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
      input.addEventListener('change', (e) => this.handlePriceRangeChange(e));
    });

    // Sort inputs
    const sortInputs = this.querySelectorAll('input[name="sort_by_desktop"], input[name="sort_by_mobile"]');
    sortInputs.forEach(input => {
      input.addEventListener('change', (event) => {
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

    // Selected filter removal
    const selectedFiltersContainer = this.querySelector('#SelectedFilters');
    if (selectedFiltersContainer) {
      selectedFiltersContainer.addEventListener('click', (event) => {
        const removeButton = event.target.closest('.selected-filter__remove');
        if (removeButton) {
          const filter = removeButton.closest('.selected-filter');
          this.removeFilter(filter.dataset.key, filter.dataset.value);
        }
      });
    }
  }

  handleSortChange(event) {
    const sortValue = event.target.value;
    this.state.currentSort = sortValue;

    // Sync between desktop and mobile
    const isDesktop = event.target.name === 'sort_by_desktop';
    const otherInputName = isDesktop ? 'sort_by_mobile' : 'sort_by_desktop';
    const otherInput = this.querySelector(`input[name="${otherInputName}"][value="${sortValue}"]`);

    if (otherInput) {
      otherInput.checked = true;
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
    const backButton = this.querySelector('.mobile-facets__back-button');
    backButton?.classList.remove('hidden');

    const submenuTitle = this.querySelector(`.facet-accordion__item[data-submenu="${submenuId}"] .mobile-facets__menu-button span`)?.textContent;
    if (submenuTitle) {
      this.querySelector('.mobile-facets__title').textContent = submenuTitle;
    }

    this.querySelector(`.facet-accordion__item[data-submenu="${submenuId}"] .mobile-facets__submenu`)?.classList.add('active');
    this.state.currentView = 'submenu';
  }

  closeMobileSubmenu() {
    this.querySelector('.mobile-facets__back-button')?.classList.add('hidden');
    this.querySelector('.mobile-facets__title').textContent = 'Filter & Sort';
    this.querySelectorAll('.mobile-facets__submenu').forEach(submenu => {
      submenu.classList.remove('active');
    });
    this.state.currentView = 'main';
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

    const input = event.target;
    const isCheckbox = input.type === 'checkbox';
    const formData = new FormData(input.closest('form'));
    const queryParams = {};

    if (isCheckbox && !input.checked) {
      const filterKey = input.name;
      const filterValue = input.value;
      this.state.selectedFilters.delete(`${filterKey}-${filterValue}`);

      const otherInput = this.querySelector(
        `.facets__${this.state.isMobileView ? 'desktop' : 'mobile'} input[name="${filterKey}"][value="${filterValue}"]`
      );
      if (otherInput) otherInput.checked = false;

      this.renderSelectedFilters();
      this.updateMobileApplyButton();
      this.applySortAndFilters();
      return;
    }

    formData.forEach((value, key) => {
      if (queryParams[key]) {
        queryParams[key] = queryParams[key] + `,${value}`;
      } else {
        queryParams[key] = value;
      }
    });

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

    this.syncFiltersAcrossViews();
    this.renderSelectedFilters();
    this.updateMobileApplyButton();
    this.applySortAndFilters();
  }

  syncFiltersAcrossViews() {
    this.state.selectedFilters.forEach(filter => {
      ['desktop', 'mobile'].forEach(view => {
        const input = this.querySelector(
          `.facets__${view} input[name="${filter.key}"][value="${filter.value}"]`
        );
        if (input) input.checked = true;
      });
    });
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

      if (sections.length === 0) {
        console.warn('No sections found to render');
        return;
      }

      await Promise.all(
        sections.map(section => {
          const basePath = this.state.isSearchPage ? '/search' : window.location.pathname;
          let url = basePath;
          
          if (section.section) {
            url += `?section_id=${encodeURIComponent(section.section)}`;
          }
          
          if (searchParams) {
            url += (url.includes('?') ? '&' : '?') + searchParams;
          }
          
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
      if (gridContainer) {
        gridContainer.classList.remove('is-loading');
      }
    }
  }

  async renderSectionFromFetch(url) {
    try {
      const baseUrl = window.location.origin;
      const fullUrl = new URL(url, baseUrl);
      
      const response = await fetch(fullUrl.toString());
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const text = await response.text();
      const html = new DOMParser().parseFromString(text, 'text/html');

      this.renderFilters(html);
      this.renderProductGrid(html);
      this.updateProductCount();
      
      const searchParams = fullUrl.searchParams.toString();
      if (searchParams) {
        this.updateURLHash(searchParams);
      }
      
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
      // Store existing event listeners and data
      const existingArticles = grid.querySelectorAll('.product-article');
      const existingListeners = new Map();
      
      existingArticles.forEach(article => {
        const clone = article.cloneNode(true);
        existingListeners.set(article.dataset.productId, clone);
      });
  
      // Update grid content
      grid.innerHTML = newGrid.innerHTML;
  
      // Re-attach event listeners to new articles
      const newArticles = grid.querySelectorAll('.product-article');
      newArticles.forEach(article => {
        const productId = article.dataset.productId;
        if (existingListeners.has(productId)) {
          const savedArticle = existingListeners.get(productId);
          article.addEventListener('click', (e) => {
            // Handle click events
          });
        }
      });
  
      // Initialize variant selectors and swatches
      this.initializeVariantSelectors();
      
      // Dispatch update event
      document.dispatchEvent(new CustomEvent('product-grid:updated', {
        detail: { container: grid }
      }));
    }
  }

  initializeVariantSelectors() {
    const productArticles = document.querySelectorAll('.product-article');
    
    productArticles.forEach(article => {
      const productId = article.dataset.productId;
      const variantId = article.dataset.variantId;
      
      if (productId && window.products && window.products[productId]) {
        const product = window.products[productId];
        
        // Handle color swatches
        const colorSwatches = article.querySelectorAll('.color-swatch');
        colorSwatches.forEach(swatch => {
          swatch.addEventListener('click', (e) => {
            e.preventDefault();
            const color = swatch.dataset.value;
            
            const variant = product.variants.find(v => v.color === color);
            if (variant) {
              article.dataset.variantId = variant.id;
              
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

  getSections() {
    const productGrid = document.querySelector('.product-grid-container');
    return [{
      section: productGrid?.dataset.id || 'main-collection-product-grid'
    }].filter(section => section.section);
  }

  updateProductCount() {
    const productArticles = document.querySelectorAll('.product-article');
    const countContainer = document.querySelector('.product-count');
    
    if (countContainer) {
      const count = productArticles.length;
      const productText = count === 1 ? 'product' : 'products';
      countContainer.textContent = `${count} ${productText}`;
    }
  }

  buildQueryParams() {
    const urlParts = [];

    // Add search parameters if on search page
    if (this.state.isSearchPage && this.state.searchTerms) {
      urlParts.push(`q=${encodeURIComponent(this.state.searchTerms)}`);
      urlParts.push('options[prefix]=last');
    }

    // Add sort parameter
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
          label: `Price: €${min || '0'} - €${max || '∞'}`
        });
      } else {
        this.state.selectedFilters.delete('price_filter');
      }
    }

    // Apply filters and close drawer
    this.applySortAndFilters();
    this.closeMobileDrawer();
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

    if (min || max) {
      this.state.selectedFilters.set(filterKey, {
        key: filterKey,
        value: `${min}-${max}`,
        label: `Price: €${min || '0'} - €${max || '∞'}`
      });
    } else {
      this.state.selectedFilters.delete(filterKey);
    }

    this.renderSelectedFilters();
    this.updateMobileApplyButton();
    this.applySortAndFilters();
  }

  clearFilters() {
    // Reset all inputs
    this.querySelectorAll('input[type="radio"]').forEach(input => {
      input.checked = false;
    });
    this.state.currentSort = '';

    this.querySelectorAll('.facet-range__input').forEach(input => {
      input.value = '';
    });

    this.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.checked = false;
    });

    // Clear state
    this.state.selectedFilters.clear();
    this.state.filterCache.clear();

    // Update UI
    this.renderSelectedFilters();
    this.updateMobileApplyButton();

    // Reset URL and re-render
    history.pushState({}, '', window.location.pathname);
    this.renderPage('');

    // Close mobile drawer
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

  initializeFromURL() {
    const params = new URLSearchParams(window.location.search);
    this.state.searchTerms = params.get('q') || '';
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

          // Set input values
          const minInput = this.querySelector('input[name^="min_filter.v.price"]');
          const maxInput = this.querySelector('input[name^="max_filter.v.price"]');
          if (minInput) minInput.value = min;
          if (maxInput) maxInput.value = max;
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
        this.querySelectorAll(`input[name^="sort_by"][value="${value}"]`)
          .forEach(input => input.checked = true);
      }
    });

    this.renderSelectedFilters();
    this.updateMobileApplyButton();
  }

  updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      '',
      `${window.location.pathname}${searchParams ? '?' + searchParams : ''}`
    );
  }

  applySortAndFilters() {
    if (this.state.loading) return;

    const searchParams = this.buildQueryParams();
    const gridContainer = document.getElementById('ProductGridContainer');
    
    if (gridContainer) {
      gridContainer.classList.add('is-loading');
    }

    this.updateURLHash(searchParams);
    this.renderPage(searchParams).finally(() => {
      if (gridContainer) {
        gridContainer.classList.remove('is-loading');
      }
      this.updateProductCount();
    });
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

    // Attach event listeners for filter removal
    container.querySelectorAll('.selected-filter__remove').forEach(button => {
      button.addEventListener('click', (e) => {
        const filter = e.target.closest('.selected-filter');
        this.removeFilter(filter.dataset.key, filter.dataset.value);
      });
    });
  }

  removeFilter(key, value) {
    if (key === 'price_filter') {
      this.state.selectedFilters.delete('price_filter');
      
      // Reset price inputs
      const minInput = this.querySelector('input[name="min_filter.v.price"]');
      const maxInput = this.querySelector('input[name="max_filter.v.price"]');
      if (minInput) minInput.value = '';
      if (maxInput) maxInput.value = '';
    } else {
      // Uncheck both desktop and mobile inputs
      ['desktop', 'mobile'].forEach(view => {
        const input = this.querySelector(`.facets__${view} input[name="${key}"][value="${value}"]`);
        if (input) input.checked = false;
      });

      this.state.selectedFilters.delete(`${key}-${value}`);
    }

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