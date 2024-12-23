class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    
    this.state = {
      loading: false,
      selectedFilters: new Map(),
      currentView: 'main',
      selectedCategory: null,
      filterCache: new Map(),
      isMobileView: window.innerWidth <= 991
    };

    this.filterPreview = new FilterPreview();
    this.debouncedOnChange = debounce((event) => this.handleFilterChange(event), 150);
    
    this.initializeFromURL();
    this.setupEventListeners();
    this.setupResizeObserver();
  }

  setupEventListeners() {
    // Form change handler for all checkboxes
    const form = this.querySelector('form');
    if (form) {
      form.addEventListener('change', this.debouncedOnChange);
    }

    // Mobile-specific controls
    const mobileControls = {
      open: document.querySelector('.mobile-facets__open-button'),
      close: this.querySelector('.mobile-facets__close-button'),
      clear: this.querySelector('.mobile-facets__clear'),
      apply: this.querySelector('.mobile-facets__apply')
    };

    mobileControls.open?.addEventListener('click', () => this.toggleMobileView(true));
    mobileControls.close?.addEventListener('click', () => this.toggleMobileView(false));
    mobileControls.clear?.addEventListener('click', () => this.clearFilters());
    mobileControls.apply?.addEventListener('click', () => this.toggleMobileView(false));

    // Mobile navigation
    this.querySelectorAll('.mobile-facets__filter-category').forEach(button => {
      button.addEventListener('click', (event) => {
        const categoryId = event.currentTarget.dataset.categoryId;
        this.navigateToCategory(categoryId);
      });
    });

    this.querySelector('.mobile-facets__back-button')?.addEventListener('click', () => {
      this.navigateBack();
    });

    // Keyboard accessibility
    document.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') {
        if (this.state.currentView === 'category') {
          this.navigateBack();
        } else if (this.state.isMobileView) {
          this.toggleMobileView(false);
        } else {
          this.closeOpenAccordions();
        }
      }
    });
  }

  setupResizeObserver() {
    window.addEventListener('resize', debounce(() => {
      const isMobile = window.innerWidth <= 991;
      if (isMobile !== this.state.isMobileView) {
        this.state.isMobileView = isMobile;
        if (!isMobile) {
          this.toggleMobileView(false);
        }
      }
    }, 250));
  }

  initializeFromURL() {
    try {
      this.state.selectedFilters = this.getSelectedFiltersFromURL();
      this.renderSelectedFilters();
      this.syncFromURL();
    } catch (error) {
      console.error('Error initializing from URL:', error);
      this.state.selectedFilters = new Map();
    }
  }

  getSelectedFiltersFromURL() {
    const filters = new Map();
    const params = new URLSearchParams(window.location.search);
    
    params.forEach((value, key) => {
      if (key.startsWith('filter.')) {
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
  
    return filters;
  }

  syncFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      
      // Reset all checkboxes
      this.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
      
      // Set checkboxes based on URL
      params.forEach((value, key) => {
        if (key.startsWith('filter.')) {
          value.split(',').forEach(singleValue => {
            const input = this.querySelector(`input[name="${key}"][value="${singleValue}"]`);
            if (input) input.checked = true;
          });
        }
      });
      
      this.renderSelectedFilters();
      this.updateMobileApplyButton();
      this.updateFilterPreview();
    } catch (error) {
      console.error('Error syncing from URL:', error);
    }
  }

  navigateToCategory(categoryId) {
    if (!this.state.isMobileView) return;

    this.state.currentView = 'category';
    this.state.selectedCategory = categoryId;
    
    const drawer = this.querySelector('.mobile-facets__drawer');
    const mainView = drawer.querySelector('.mobile-facets__main-view');
    const categoryView = drawer.querySelector('.mobile-facets__category-view');

    mainView.style.transform = 'translateX(-100%)';
    categoryView.style.transform = 'translateX(0)';

    // Update category view content
    this.updateCategoryView(categoryId);
  }

  navigateBack() {
    if (!this.state.isMobileView) return;

    this.state.currentView = 'main';
    this.state.selectedCategory = null;

    const drawer = this.querySelector('.mobile-facets__drawer');
    const mainView = drawer.querySelector('.mobile-facets__main-view');
    const categoryView = drawer.querySelector('.mobile-facets__category-view');

    mainView.style.transform = 'translateX(0)';
    categoryView.style.transform = 'translateX(100%)';
  }

  updateCategoryView(categoryId) {
    const category = this.querySelector(`[data-index="${categoryId}"]`);
    if (!category) return;

    const categoryView = this.querySelector('.mobile-facets__category-view');
    const backButton = categoryView.querySelector('.mobile-facets__back-button .mobile-facets__back-text');
    const optionsContainer = categoryView.querySelector('.mobile-facets__filter-options');

    // Update back button text
    backButton.textContent = category.querySelector('.facet-accordion__label').textContent.trim();

    // Update filter options
    const options = Array.from(category.querySelectorAll('.facet-checkbox')).map(checkbox => {
      const input = checkbox.querySelector('input');
      const label = checkbox.querySelector('.facet-checkbox__text');
      
      return `
        <label class="mobile-facets__filter-option${checkbox.classList.contains('disabled') ? ' disabled' : ''}">
          <input
            type="checkbox"
            name="${input.name}"
            value="${input.value}"
            class="mobile-facets__filter-checkbox"
            ${input.checked ? 'checked' : ''}
            ${input.disabled ? 'disabled' : ''}
          >
          <span class="mobile-facets__filter-label">${label.textContent}</span>
        </label>
      `;
    }).join('');

    optionsContainer.innerHTML = options;
  }

  async handleFilterChange(event) {
    if (this.state.loading) return;

    const formData = new FormData(event.target.closest('form'));
    const queryParams = {};

    // Group filter values by key
    formData.forEach((value, key) => {
      if (queryParams[key]) {
        queryParams[key] = queryParams[key] + `,${value}`;
      } else {
        queryParams[key] = value;
      }
    });

    // Update selected filters state
    this.state.selectedFilters.clear();
    Object.entries(queryParams).forEach(([key, value]) => {
      value.split(',').forEach(singleValue => {
        const input = this.querySelector(`input[name="${key}"][value="${singleValue}"]`);
        const label = this.getFilterLabel(input);
        
        if (label) {
          this.state.selectedFilters.set(`${key}-${singleValue}`, {
            key,
            value: singleValue,
            label
          });
        }
      });
    });

    // Update UI
    this.updateMobileApplyButton();
    await this.updateFilterPreview();
    this.renderSelectedFilters();

    // Update URL and refresh products
    const queryString = this.buildQueryParams();
    await this.updateURLHash(queryString);
    await this.renderPage(queryString);
  }

  toggleMobileView(isOpen) {
    const wrapper = this.querySelector('.facets__wrapper');
    if (!wrapper) return;

    if (isOpen) {
      wrapper.setAttribute('open', '');
      document.body.classList.add('overflow-hidden-mobile');
      // Reset to main view when opening
      this.navigateBack();
    } else {
      wrapper.removeAttribute('open');
      document.body.classList.remove('overflow-hidden-mobile');
    }
  }

  updateMobileApplyButton() {
    const applyButton = this.querySelector('.mobile-facets__apply');
    if (!applyButton) return;

    const filterCount = this.state.selectedFilters.size;
    applyButton.disabled = filterCount === 0;
    applyButton.textContent = filterCount ? `Apply (${filterCount})` : 'Apply';
  }

  buildQueryParams() {
    const groupedParams = {};
    this.state.selectedFilters.forEach(filter => {
      if (!groupedParams[filter.key]) {
        groupedParams[filter.key] = [];
      }
      groupedParams[filter.key].push(filter.value);
    });

    const urlParts = [];
    Object.entries(groupedParams).forEach(([key, values]) => {
      const encodedKey = encodeURIComponent(key);
      const encodedValues = values.map(v => encodeURIComponent(v)).join(',');
      urlParts.push(`${encodedKey}=${encodedValues}`);
    });

    return urlParts.join('&');
  }

  getFilterLabel(input) {
    if (!input) return '';
    const label = input.closest('label')?.querySelector('.facet-checkbox__text');
    return label ? label.textContent.split(' (')[0] : '';
  }

  async updateFilterPreview() {
    if (this.state.loading) return;

    try {
      const params = this.buildQueryParams();
      const cachedResult = this.state.filterCache.get(params);
      
      if (cachedResult) {
        this.filterPreview.update(cachedResult);
        return;
      }

      const count = await this.fetchFilterPreview(params);
      this.state.filterCache.set(params, count);
      this.filterPreview.update(count);
    } catch (error) {
      console.error('Error updating filter preview:', error);
    }
  }

  async fetchFilterPreview(params) {
    const response = await fetch(`/api/filter-preview?${params}`);
    if (!response.ok) throw new Error('Preview fetch failed');
    const data = await response.json();
    return data.count;
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
    const input = this.querySelector(`input[name="${key}"][value="${value}"]`);
    if (input) {
      input.checked = false;
      this.handleFilterChange({ target: input });
    }
  }

  clearFilters() {
    this.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.checked = false;
    });
    
    this.state.selectedFilters.clear();
    this.state.filterCache.clear();
    
    this.renderSelectedFilters();
    this.updateMobileApplyButton();
    this.updateFilterPreview();
    
    history.pushState({}, '', window.location.pathname);
    this.renderPage('');
  }

  updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      '',
      `${window.location.pathname}${searchParams ? '?' + searchParams : ''}`
    );
  }

  async renderPage(searchParams) {
    if (this.state.loading) return;

    try {
      this.state.loading = true;
      const sections = this.getSections();

      await Promise.all(sections.map(section => {
        const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
        return this.renderSectionFromFetch(url);
      }));

      this.state.loading = false;
    } catch (error) {
      console.error('Error rendering page:', error);
      this.state.loading = false;
    }
  }

  getSections() {
    return [{
      section: document.getElementById('product-grid')?.dataset.id
    }].filter(section => section.section);
  }

  async renderSectionFromFetch(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Fetch failed');

      const text = await response.text();
      const html = new DOMParser().parseFromString(text, 'text/html');
      
      this.renderFilters(html);
      this.renderProductGrid(html);
      this.renderProductCount(html);
    } catch (error) {
      console.error('Error fetching section:', error);
      throw error;
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
  }

  renderProductGrid(html) {
    const grid = document.getElementById('ProductGridContainer');
    const newGrid = html.getElementById('ProductGridContainer');
    
    if (grid && newGrid) {
      grid.innerHTML = newGrid.innerHTML;
    }
  }

  renderProductCount(html) {
    const count = document.getElementById('ProductCount');
    const newCount = html.getElementById('ProductCount');

    if (count && newCount) {
      count.innerHTML = newCount.innerHTML;
    }
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