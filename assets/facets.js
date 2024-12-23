class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    
    this.state = {
      loading: false,
      selectedFilters: new Map(),
      currentDrawerView: 'main',
      filterCache: new Map()
    };

    this.filterPreview = new FilterPreview();
    this.virtualizedList = null;

    this.debouncedOnSubmit = debounce((event) => this.onSubmitHandler(event), 500);
    this.debouncedFilterChange = debounce((event) => this.handleFilterChange(event), 150);

    this.initializeFromURL();
    this.initializeDesktopAccordion();
    this.initializeMobileDrawer();
    this.setupEventListeners();
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
        value.split(/,|%2C/).forEach(singleValue => {
          const desktopInput = this.querySelector(`input[name="${key}"][value="${singleValue}"]`);
          const mobileInput = document.querySelector(`input[name="${key}"][value="${singleValue}"]`);
          
          const label = this.getFilterLabel(desktopInput || mobileInput);
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
      document.querySelectorAll('#MobileMenuDrawer input[type="checkbox"]').forEach(input => input.checked = false);
      
      // Set checkboxes based on URL
      params.forEach((value, key) => {
        if (key.startsWith('filter.')) {
          value.split(/,|%2C/).forEach(singleValue => {
            const desktopInput = this.querySelector(`input[name="${key}"][value="${singleValue}"]`);
            const mobileInput = document.querySelector(`#MobileMenuDrawer input[name="${key}"][value="${singleValue}"]`);
            
            if (desktopInput) desktopInput.checked = true;
            if (mobileInput) mobileInput.checked = true;
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

  setupEventListeners() {
    // Desktop form handlers
    const facetForm = this.querySelector('form');
    if (facetForm) {
      facetForm.addEventListener('input', this.debouncedOnSubmit);
    }

    // Keyboard accessibility
    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) {
      facetWrapper.addEventListener('keyup', this.handleKeyPress.bind(this));
    }

    // Mobile filter change handler - Update to trigger immediate changes
    const mobileForm = document.querySelector('#MobileMenuDrawer form');
    if (mobileForm) {
      mobileForm.addEventListener('change', async (event) => {
        await this.handleMobileFilterChange(event);
      });
    }

    // ESC key handler for drawer
    document.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') {
        const mobileDrawer = document.querySelector('#MobileMenuDrawer');
        if (mobileDrawer?.hasAttribute('open')) {
          this.toggleDrawer(false);
        }
      }
    });
  }

  initializeDesktopAccordion() {
    const desktopDetails = this.querySelectorAll('#FacetsWrapperDesktop .facet-accordion__item');
    
    const updateToggleState = (detail) => {
      const toggle = detail.querySelector('.facet-accordion__toggle');
      if (toggle) {
        toggle.textContent = detail.hasAttribute('open') ? '-' : '+';
      }
    };
    
    desktopDetails.forEach((detail) => {
      const summary = detail.querySelector('summary');
      if (!summary) return;

      if (summary._toggleHandler) {
        summary.removeEventListener('click', summary._toggleHandler);
      }

      updateToggleState(detail);

      const toggleHandler = (e) => {
        e.preventDefault();
        const isOpen = detail.hasAttribute('open');

        desktopDetails.forEach((otherDetail) => {
          if (otherDetail !== detail && otherDetail.hasAttribute('open')) {
            otherDetail.removeAttribute('open');
            updateToggleState(otherDetail);
          }
        });

        detail.toggleAttribute('open', !isOpen);
        updateToggleState(detail);
      };

      summary._toggleHandler = toggleHandler;
      summary.addEventListener('click', toggleHandler);
    });
  }

  handleKeyPress(event) {
    if (event.code.toUpperCase() === 'ESCAPE') {
      const openDetail = event.target.closest('details[open]');
      if (openDetail) {
        openDetail.removeAttribute('open');
        const toggle = openDetail.querySelector('.facet-accordion__toggle');
        if (toggle) toggle.textContent = '+';
      }
    }
  }

  async handleMobileFilterChange(event) {
    const checkbox = event.target;
    const filterKey = `${checkbox.name}-${checkbox.value}`;
    
    if (checkbox.checked) {
      const label = this.getFilterLabel(checkbox);
      this.state.selectedFilters.set(filterKey, {
        key: checkbox.name,
        value: checkbox.value,
        label
      });
    } else {
      this.state.selectedFilters.delete(filterKey);
    }

    // Sync desktop checkboxes
    const desktopInput = this.querySelector(`input[name="${checkbox.name}"][value="${checkbox.value}"]`);
    if (desktopInput) {
      desktopInput.checked = checkbox.checked;
    }

    // Update UI immediately
    this.updateMobileApplyButton();
    this.updateFilterPreview();
    this.renderSelectedFilters();

    // Update URL and content immediately
    const queryString = this.buildQueryParams();
    await this.updateURLHash(queryString);
    await this.renderPage(queryString);
  }

  getFilterLabel(input) {
    if (!input) return '';
    const label = input.closest('label')?.querySelector('.mobile-facets__filter-label, .facet-checkbox__text');
    return label ? label.textContent.split(' (')[0] : '';
  }

  updateMobileApplyButton() {
    const applyButton = document.querySelector('.mobile-facets__apply');
    if (!applyButton) return;

    const filterCount = this.state.selectedFilters.size;
    applyButton.disabled = filterCount === 0;
    applyButton.textContent = filterCount ? `Done (${filterCount} selected)` : 'Done';
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

  initializeMobileDrawer() {
    const mobileDrawer = document.querySelector('#MobileMenuDrawer');
    if (!mobileDrawer) return;

    const filterLists = mobileDrawer.querySelectorAll('.mobile-facets__list');
    filterLists.forEach(list => {
      if (list.children.length > 20) {
        this.virtualizedList = new VirtualizedFilterList(list);
      }
    });

    this.setupDrawerControls(mobileDrawer);
  }

  setupDrawerControls(drawer) {
    const controls = {
      open: document.querySelector('.mobile-facets__open-button'),
      close: drawer.querySelector('.mobile-facets__close-button'),
      apply: drawer.querySelector('.mobile-facets__apply'),
      back: drawer.querySelectorAll('.mobile-facets__back-button'),
      categories: drawer.querySelectorAll('.mobile-facets__filter-category')
    };

    controls.open?.addEventListener('click', () => this.toggleDrawer(true));
    controls.close?.addEventListener('click', () => this.toggleDrawer(false));
    controls.apply?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleDrawer(false);
    });

    controls.categories.forEach(category => {
      category.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateToCategory(category.dataset.categoryId);
      });
    });

    controls.back.forEach(button => {
      button.addEventListener('click', () => this.navigateBack());
    });
  }

  navigateToCategory(categoryId) {
    const mainView = document.querySelector('.mobile-facets__main-view');
    const categoryView = document.querySelector(`.mobile-facets__category-view[data-category="${categoryId}"]`);
    
    if (!mainView || !categoryView) return;

    const categoryTitle = categoryView.querySelector('.mobile-facets__back-text')?.textContent;
    const headerTitle = document.querySelector('.mobile-facets__title');
    if (headerTitle && categoryTitle) {
      headerTitle.textContent = categoryTitle;
    }

    requestAnimationFrame(() => {
      mainView.style.transform = 'translateX(-100%)';
      categoryView.style.transform = 'translateX(0)';
      categoryView.setAttribute('aria-hidden', 'false');
      mainView.setAttribute('aria-hidden', 'true');
    });

    this.state.currentDrawerView = categoryId;
  }

  navigateBack() {
    const mainView = document.querySelector('.mobile-facets__main-view');
    const currentCategoryView = document.querySelector(
      `.mobile-facets__category-view[data-category="${this.state.currentDrawerView}"]`
    );
    
    if (!mainView || !currentCategoryView) return;

    const headerTitle = document.querySelector('.mobile-facets__title');
    if (headerTitle) {
      headerTitle.textContent = headerTitle.dataset.defaultTitle || 'Filters';
    }

    requestAnimationFrame(() => {
      mainView.style.transform = 'translateX(0)';
      currentCategoryView.style.transform = 'translateX(100%)';
      currentCategoryView.setAttribute('aria-hidden', 'true');
      mainView.setAttribute('aria-hidden', 'false');
    });

    this.state.currentDrawerView = 'main';
  }

  toggleDrawer(isOpen) {
    const mobileDrawer = document.querySelector('#MobileMenuDrawer');
    if (!mobileDrawer) return;

    if (isOpen) {
      mobileDrawer.setAttribute('open', '');
      document.body.classList.add('overflow-hidden-mobile');
    } else {
      mobileDrawer.removeAttribute('open');
      document.body.classList.remove('overflow-hidden-mobile');
      
      if (this.state.currentDrawerView !== 'main') {
        this.navigateBack();
      }
    }
  }

  buildQueryParams() {
    const params = {};
    this.state.selectedFilters.forEach(filter => {
      if (params[filter.key]) {
        params[filter.key] += `,${filter.value}`;
      } else {
        params[filter.key] = filter.value;
      }
    });

    return new URLSearchParams(params).toString();
  }

  renderSelectedFilters() {
    const container = document.getElementById('SelectedFilters');
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
    const desktopInput = this.querySelector(`input[name="${key}"][value="${value}"]`);
    const mobileInput = document.querySelector(`#MobileMenuDrawer input[name="${key}"][value="${value}"]`);
    
    if (desktopInput) desktopInput.checked = false;
    if (mobileInput) mobileInput.checked = false;
    
    this.state.selectedFilters.delete(`${key}-${value}`);
    
    this.renderSelectedFilters();
    this.updateMobileApplyButton();
    this.updateFilterPreview();
    
    const queryString = this.buildQueryParams();
    this.updateURLHash(queryString);
    this.renderPage(queryString);
  }

  clearFilters() {
    this.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
    document.querySelectorAll('#MobileMenuDrawer input[type="checkbox"]').forEach(input => input.checked = false);
    
    this.state.selectedFilters.clear();
    this.state.filterCache.clear();
    
    this.renderSelectedFilters();
    this.updateMobileApplyButton();
    this.updateFilterPreview();
    
    history.pushState({}, '', window.location.pathname);
    this.renderPage('');
  }

  async onSubmitHandler(event) {
    event.preventDefault();
    const form = event.target.closest('form');
    if (!form) return;

    try {
      const formData = new FormData(form);
      const queryParams = {};

      formData.forEach((value, key) => {
        if (queryParams[key]) {
          queryParams[key] += `,${value}`;
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
              label
            });
          }
        });
      });

      const queryString = this.buildQueryParams();
      this.renderSelectedFilters();
      this.updateURLHash(queryString);
      await this.renderPage(queryString, event);
    } catch (error) {
      console.error('Error handling form submission:', error);
    }
  }

  async renderPage(searchParams, event = null) {
    if (this.state.loading) return;

    try {
      this.state.loading = true;
      const sections = this.getSections();

      await Promise.all(sections.map(section => {
        const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
        return this.renderSectionFromFetch(url, event);
      }));

      this.state.loading = false;
    } catch (error) {
      console.error('Error rendering page:', error);
      this.state.loading = false;
    }
  }

  async renderSectionFromFetch(url, event) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Fetch failed');

      const text = await response.text();
      const html = new DOMParser().parseFromString(text, 'text/html');
      
      this.renderFilters(html, event);
      this.renderProductGrid(html);
      this.renderProductCount(html);
    } catch (error) {
      console.error('Error fetching section:', error);
      throw error;
    }
  }

  updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      '',
      `${window.location.pathname}${searchParams ? '?' + searchParams : ''}`
    );
  }

  getSections() {
    return [{
      section: document.getElementById('product-grid')?.dataset.id
    }].filter(section => section.section);
  }

  renderFilters(html, event) {
    const facetDetailsElements = html.querySelectorAll('#FacetsWrapperDesktop .js-filter');
    const matchesIndex = (element) => {
      return event?.target?.dataset?.index === element.dataset.index;
    };

    facetDetailsElements.forEach((element) => {
      if (matchesIndex(element)) return;
      
      const target = document.querySelector(`[data-index="${element.dataset.index}"]`);
      if (target) {
        target.innerHTML = element.innerHTML;
      }
    });

    this.initializeDesktopAccordion();
  }

  renderProductGrid(html) {
    const productGrid = document.getElementById('ProductGridContainer');
    const newProductGrid = html.getElementById('ProductGridContainer');
    
    if (productGrid && newProductGrid) {
      productGrid.innerHTML = newProductGrid.innerHTML;
    }
  }

  renderProductCount(html) {
    const count = document.getElementById('ProductCount');
    const countMobile = document.getElementById('ProductCountMobile');
    const newCount = html.getElementById('ProductCount');
    const newCountMobile = html.getElementById('ProductCountMobile');

    if (count && newCount) count.innerHTML = newCount.innerHTML;
    if (countMobile && newCountMobile) countMobile.innerHTML = newCountMobile.innerHTML;
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

class VirtualizedFilterList {
  constructor(container) {
    this.container = container;
    this.items = Array.from(container.children);
    this.rowHeight = 40;
    this.visibleItems = Math.ceil(container.clientHeight / this.rowHeight);
    
    this.setupVirtualization();
  }

  setupVirtualization() {
    const totalHeight = this.items.length * this.rowHeight;
    this.container.style.height = `${totalHeight}px`;
    
    let scrollTimeout;
    this.container.addEventListener('scroll', () => {
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = window.requestAnimationFrame(() => this.render());
    });

    this.render();
  }

  render() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.rowHeight);
    const endIndex = Math.min(
      startIndex + this.visibleItems + 1,
      this.items.length
    );

    const visibleItems = this.items
      .slice(startIndex, endIndex)
      .map(item => item.cloneNode(true));

    visibleItems.forEach((item, index) => {
      item.style.position = 'absolute';
      item.style.top = `${(startIndex + index) * this.rowHeight}px`;
    });

    this.container.innerHTML = '';
    visibleItems.forEach(item => this.container.appendChild(item));
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