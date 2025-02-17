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
    this.updateProductCount(); // Initial count update
  }

  async renderSectionFromFetch(url) {
    try {
      const baseUrl = window.location.origin;
      const fullUrl = new URL(url, baseUrl);
      
      const response = await fetch(fullUrl.toString(), {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const text = await response.text();
      const html = new DOMParser().parseFromString(text, 'text/html');

      this.renderFilters(html);
      this.renderProductGrid(html);
      this.updateProductCount(); // Update count after rendering
      
      this.initializeAccordion();
      this.initializeVariantSelectors();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error fetching section:', error);
      this.updateProductCount(); // Ensure count is updated even on error
      return Promise.reject(error);
    }
  }

  handleSortChange(event) {
    const sortValue = event.target.value;
    console.log('Sort changed to:', sortValue);
    
    this.querySelectorAll('input[name="sort_by_desktop"], input[name="sort_by_mobile"]').forEach(input => {
      if (input.value !== sortValue) {
        input.checked = false;
      }
    });

    this.state.currentSort = sortValue;

    const isDesktop = event.target.name === 'sort_by_desktop';
    const otherInputName = isDesktop ? 'sort_by_mobile' : 'sort_by_desktop';
    const otherInput = this.querySelector(`input[name="${otherInputName}"][value="${sortValue}"]`);
    
    if (otherInput) {
      otherInput.checked = true;
    }

    const searchParams = new URLSearchParams(window.location.search);
    if (sortValue) {
      searchParams.set('sort_by', sortValue);
    } else {
      searchParams.delete('sort_by');
    }

    this.applySortAndFilters();
    this.updateProductCount(); // Update count after sort change
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
      this.updateProductCount(); // Update count after filter removal
      return;
    }

    // Rest of handleFilterChange implementation...
    this.syncFiltersAcrossViews();
    this.renderSelectedFilters();
    this.updateMobileApplyButton();
    this.applySortAndFilters();
    this.updateProductCount(); // Update count after filter change
  }

  clearFilters() {
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

    this.state.selectedFilters.clear();
    this.state.filterCache.clear();

    this.renderSelectedFilters();
    this.updateMobileApplyButton();

    history.pushState({}, '', window.location.pathname);
    this.renderPage('');
    this.updateProductCount(); // Update count after clearing filters

    this.closeMobileDrawer();
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
      this.updateProductCount(); // Ensure count is updated after filters are applied
    });
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