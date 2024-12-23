class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    
    this.state = {
      loading: false,
      selectedFilters: new Map(),
      currentView: 'main',
      filterCache: new Map(),
      isMobileView: window.innerWidth <= 991
    };

    this.filterPreview = new FilterPreview();
    this.virtualizedList = null;
    
    this.debouncedOnChange = debounce((event) => this.handleFilterChange(event), 150);
    
    this.initializeFromURL();
    this.initializeAccordion();
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

    // Keyboard accessibility
    document.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') {
        if (this.state.isMobileView) {
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

  initializeAccordion() {
    const accordionItems = this.querySelectorAll('.facet-accordion__item');
    
    accordionItems.forEach((item) => {
      const summary = item.querySelector('summary');
      const toggle = item.querySelector('.facet-accordion__toggle');
      
      if (!summary || !toggle) return;

      const updateToggle = () => {
        toggle.textContent = item.hasAttribute('open') ? '-' : '+';
      };
      
      updateToggle();

      summary.addEventListener('click', (event) => {
        event.preventDefault();

        if (!this.state.isMobileView) {
          accordionItems.forEach((other) => {
            if (other !== item && other.hasAttribute('open')) {
              other.removeAttribute('open');
              const otherToggle = other.querySelector('.facet-accordion__toggle');
              if (otherToggle) otherToggle.textContent = '+';
            }
          });
        }

        item.toggleAttribute('open');
        updateToggle();
      });
    });
  }

  toggleMobileView(isOpen) {
    const wrapper = this.querySelector('.facets__wrapper');
    if (!wrapper) return;

    if (isOpen) {
      wrapper.setAttribute('open', '');
      document.body.classList.add('overflow-hidden-mobile');
    } else {
      wrapper.removeAttribute('open');
      document.body.classList.remove('overflow-hidden-mobile');
      this.closeOpenAccordions();
    }
  }

  closeOpenAccordions() {
    this.querySelectorAll('.facet-accordion__item[open]').forEach(item => {
      item.removeAttribute('open');
      const toggle = item.querySelector('.facet-accordion__toggle');
      if (toggle) toggle.textContent = '+';
    });
  }

  updateMobileApplyButton() {
    const applyButton = this.querySelector('.mobile-facets__apply');
    if (!applyButton) return;

    const filterCount = this.state.selectedFilters.size;
    applyButton.disabled = filterCount === 0;
    applyButton.textContent = filterCount ? `Done (${filterCount} selected)` : 'Done';
  }

  buildQueryParams() {
    // Group values by filter key
    const groupedParams = {};
    this.state.selectedFilters.forEach(filter => {
      if (!groupedParams[filter.key]) {
        groupedParams[filter.key] = [];
      }
      groupedParams[filter.key].push(filter.value);
    });

    // Build URL-friendly string with comma-separated values
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

  getSections() {
    return [{
      section: document.getElementById('product-grid')?.dataset.id
    }].filter(section => section.section);
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