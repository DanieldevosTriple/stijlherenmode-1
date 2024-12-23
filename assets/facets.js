class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.state = {
      loading: false,
      selectedFilters: new Map(),
      currentView: 'main',
      filterCache: new Map(),
      isMobileView: window.innerWidth <= 991,
      currentSort: '', // Added
      accordionState: new Map() // Store accordion state
    };

    this.filterPreview = new FilterPreview();
    this.debouncedOnChange = debounce((event) => this.handleFilterChange(event), 150);

    this.initializeFromURL();
    this.initializeAccordion();
    this.setupEventListeners();
    this.setupResizeObserver();
  }

  saveAccordionState() {
    this.state.accordionState.clear();
    this.querySelectorAll('.facet-accordion__item').forEach((item) => {
      const isOpen = item.hasAttribute('open');
      const index = item.dataset.index;
      if (index) {
        this.state.accordionState.set(index, isOpen);
      }
    });
  }
  
  restoreAccordionState() {
    this.querySelectorAll('.facet-accordion__item').forEach((item) => {
      const index = item.dataset.index;
      if (index && this.state.accordionState.has(index)) {
        if (this.state.accordionState.get(index)) {
          item.setAttribute('open', '');
        } else {
          item.removeAttribute('open');
        }
      }
    });
  }
  
  setupEventListeners() {
    // Price range inputs - both mobile and desktop
    const priceInputs = this.querySelectorAll('.facet-range__input');
    priceInputs.forEach(input => {
      input.addEventListener('change', this.debouncedOnChange);
      input.addEventListener('input', (e) => this.validatePriceInput(e));
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

    // Price range inputs
    if (event.target.classList.contains('facet-range__input')) {
    // Sync mobile/desktop price inputs
    const isDesktop = event.target.closest('.facets__desktop');
    const selector = isDesktop ? '.facets__mobile' : '.facets__desktop';
    const otherInput = this.querySelector(`${selector} input[name="${event.target.name}"]`);
    if (otherInput) otherInput.value = event.target.value;

    this.handlePriceRangeChange(event);
    return;
    }

    const formData = new FormData(event.target.closest('form'));
    const queryParams = {};

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

    // Sync checkboxes between mobile and desktop
    this.state.selectedFilters.forEach(filter => {
      const desktopInput = this.querySelector(`.facets__desktop input[name="${filter.key}"][value="${filter.value}"]`);
      const mobileInput = this.querySelector(`.facets__mobile input[name="${filter.key}"][value="${filter.value}"]`);

      if (desktopInput) desktopInput.checked = true;
      if (mobileInput) mobileInput.checked = true;
    });

    // Update UI
    this.updateMobileApplyButton();
    this.renderSelectedFilters();

    const isDesktopCheckbox = event.target.closest('.facets__desktop') !== null;

    // Voor desktop: direct updaten bij checkbox change
    if (isDesktopCheckbox) {
      this.applySortAndFilters();
    }
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

   applySortAndFilters() {
    console.log('applySortAndFilters called'); // Debugging
    const queryString = this.buildQueryParams();
    console.log('Query string:', queryString);
    this.updateURLHash(queryString);
    this.renderPage(queryString);
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
    const minInput = this.querySelector('input[name^="min_"]');
    const maxInput = this.querySelector('input[name^="max_"]');

    if (!minInput || !maxInput) return;

    const min = parseInt(minInput.value) || '';
    const max = parseInt(maxInput.value) || '';

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
        label: `Price: $${min || '0'} - $${max || '∞'}`
      });
    } else {
      this.state.selectedFilters.delete(filterKey);
    }

    this.renderSelectedFilters();
    this.updateMobileApplyButton();

    if (!this.state.isMobileView) {
      this.applyFilters();
    }
  }

  buildQueryParams() {
    console.log('Current sort state:', this.state.currentSort); // Debug de sorteerwaarde
  
    const urlParts = []; // Correcte variabele
  
    if (this.state.currentSort) {
      urlParts.push(`sort_by=${encodeURIComponent(this.state.currentSort)}`);
    }

    // Voeg debuglog toe om geselecteerde filters te bekijken
    console.log('Selected filters:', Array.from(this.state.selectedFilters.entries())); 
  
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
  
    console.log('Built query params:', urlParts.join('&')); // Debug de uiteindelijke querystring
    return urlParts.join('&');
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

  initializeFromURL() {
    const params = new URLSearchParams(window.location.search);
    const sortBy = params.get('sort_by') || '';
  
    // Sync desktop and mobile radios
    const desktopInput = this.querySelector(`input[name="sort_by_desktop"][value="${sortBy}"]`);
    const mobileInput = this.querySelector(`input[name="sort_by_mobile"][value="${sortBy}"]`);
  
    if (desktopInput) desktopInput.checked = true;
    if (mobileInput) mobileInput.checked = true;
  
    this.state.currentSort = sortBy;
    console.log('Initialized sort state from URL:', this.state.currentSort);
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

  async renderPage(searchParams) {
    console.log('Rendering page with params:', searchParams);
    if (this.state.loading) return;
  
    try {
      this.state.loading = true;
  
      // Save current accordion state
      this.saveAccordionState();
  
      const sections = this.getSections();
      console.log('Sections to render:', sections);
  
      await Promise.all(
        sections.map(section => {
          const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
          console.log('Fetching section from URL:', url);
          return this.renderSectionFromFetch(url);
        })
      );
  
      // Restore accordion state
      this.restoreAccordionState();
  
      this.state.loading = false;
    } catch (error) {
      console.error('Error rendering page:', error);
      this.state.loading = false;
    }
  }  
  
  async renderSectionFromFetch(url) {
    try {
      console.log('Fetching URL:', url); // Debugging
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

  getSections() {
    return [{
      section: document.getElementById('product-grid')?.dataset.id
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
    const desktopInput = this.querySelector(`.facets__desktop input[name="${key}"][value="${value}"]`);
    const mobileInput = this.querySelector(`.facets__mobile input[name="${key}"][value="${value}"]`);

    // Update both desktop and mobile inputs
    if (desktopInput) {
      desktopInput.checked = false;
      this.handleFilterChange({ target: desktopInput });
    }
    if (mobileInput) {
      mobileInput.checked = false;
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