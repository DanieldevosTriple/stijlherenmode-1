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

  // ... rest of your existing methods ...
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