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
    console.log('Sort changed to:', sortValue);
    
    // Clear previous sort value
    this.querySelectorAll('input[name="sort_by_desktop"], input[name="sort_by_mobile"]').forEach(input => {
      if (input.value !== sortValue) {
        input.checked = false;
      }
    });

    // Set new sort value
    this.state.currentSort = sortValue;

    // Sync between desktop and mobile views
    const isDesktop = event.target.name === 'sort_by_desktop';
    const otherInputName = isDesktop ? 'sort_by_mobile' : 'sort_by_desktop';
    const otherInput = this.querySelector(`input[name="${otherInputName}"][value="${sortValue}"]`);
    
    if (otherInput) {
      otherInput.checked = true;
    }

    // Set URL parameter for sort
    const searchParams = new URLSearchParams(window.location.search);
    if (sortValue) {
      searchParams.set('sort_by', sortValue);
    } else {
      searchParams.delete('sort_by');
    }

    // Apply the sorting
    this.applySortAndFilters();
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
      
      const response = await fetch(fullUrl.toString(), {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'text/html, application/json'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const text = await response.text();
      const html = new DOMParser().parseFromString(text, 'text/html');

      // Extract the total count from the response if available
      const newGridContainer = html.getElementById('ProductGridContainer');
      const totalProducts = newGridContainer?.dataset.totalProducts;
      
      if (totalProducts) {
        const currentGridContainer = document.getElementById('ProductGridContainer');
        if (currentGridContainer) {
          currentGridContainer.dataset.totalProducts = totalProducts;
        }
      }

      this.renderFilters(html);
      this.renderProductGrid(html);
      
      // Initialize any new components
      this.initializeAccordion();
      this.initializeVariantSelectors();
      
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
  
      // Update grid content and maintain data attributes
      grid.innerHTML = newGrid.innerHTML;
      
      // Copy over data attributes from new grid to maintain total count
      Array.from(newGrid.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
          grid.setAttribute(attr.name, attr.value);
        }
      });
  
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
      
      // Update the product count immediately after grid update
      this.updateProductCount();
      
      // Dispatch update event
      document.dispatchEvent(new CustomEvent('product-grid:updated', {
        detail: { container: grid }
      }));
    }
  }

  updateProductCount() {
    const countContainer = document.querySelector('.product-count');
    if (!countContainer) return;

    // Get the total count from the grid container's data attribute
    const gridContainer = document.getElementById('ProductGridContainer');
    const totalCount = gridContainer?.dataset.totalProducts || '0';
    
    // Parse the count and format the text
    const count = parseInt(totalCount, 10);
    const productText = count === 1 ? 'product' : 'products';
    
    // Update all product count elements
    const countElements = document.querySelectorAll('.product-count');
    countElements.forEach(element => {
      element.textContent = `${count} ${productText}`;
    });

    // Update mobile filter preview
    if (this.filterPreview) {
      this.filterPreview.update(count);
    }
    
    // Update mobile apply button count
    const applyButton = this.querySelector('.mobile-facets__apply');
    if (applyButton) {
      const filterCount = this.state.selectedFilters.size;
      applyButton.textContent = filterCount > 0 ? `Apply (${filterCount})` : 'Apply';
    }
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

  getSections() {
    const productGrid = document.querySelector('.product-grid-container');
    return [{
      section: productGrid?.dataset.id || 'main-collection-product-grid'
    }].filter(section => section.section);
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

  updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      '',
      `${window.location.pathname}${searchParams ? '?' + searchParams : ''}`
    );
  }

  getFilterLabel(input) {
    if (!input) return '';
    const label = input.closest('label')?.querySelector('.facet-checkbox__text');
    return label ? label.textContent.split(' (')[0] : '';
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
        <span class="preview-count">${count} producten</span>
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