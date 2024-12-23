class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    
    this.state = {
      loading: false,
      selectedFilters: new Map(),
      currentView: 'main',
      activeSubmenu: null,
      filterCache: new Map(),
      isMobileView: window.innerWidth <= 991
    };

    this.filterPreview = new FilterPreview();
    this.debouncedOnChange = debounce((event) => this.handleFilterChange(event), 150);
    
    this.initializeFromURL();
    this.initializeAccordion();
    this.setupEventListeners();
    this.setupResizeObserver();
  }

  setupEventListeners() {
    // Form change handler
    const form = this.querySelector('form');
    if (form) {
      form.addEventListener('change', this.debouncedOnChange);
    }

    // Mobile navigation controls
    const mobileControls = {
      open: document.querySelector('.mobile-facets__open-button'),
      close: this.querySelector('.mobile-facets__close-button'),
      back: this.querySelector('.mobile-facets__back-button'),
      clear: this.querySelector('.mobile-facets__clear'),
      apply: this.querySelector('.mobile-facets__apply')
    };

    mobileControls.open?.addEventListener('click', () => this.openDrawer());
    mobileControls.close?.addEventListener('click', () => this.closeDrawer());
    mobileControls.back?.addEventListener('click', () => this.closeSubmenu());
    mobileControls.clear?.addEventListener('click', () => this.clearFilters());
    mobileControls.apply?.addEventListener('click', () => this.closeDrawer());

    // Desktop accordion headers
    this.querySelectorAll('.facet-accordion__header').forEach(header => {
      header.addEventListener('click', (event) => {
        if (!this.state.isMobileView) {
          this.toggleAccordion(event);
        }
      });
    });

    // Mobile submenu buttons
    this.querySelectorAll('.mobile-facets__menu-button').forEach(button => {
      button.addEventListener('click', () => {
        if (this.state.isMobileView) {
          const submenuId = button.closest('.facet-accordion__item').dataset.submenu;
          this.openSubmenu(submenuId);
        }
      });
    });

    // Keyboard accessibility
    document.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') {
        if (this.state.currentView === 'submenu') {
          this.closeSubmenu();
        } else if (this.state.isMobileView) {
          this.closeDrawer();
        } else {
          this.closeAllAccordions();
        }
      }
    });
  }

  initializeAccordion() {
    this.querySelectorAll('.facet-accordion__item').forEach(item => {
      const toggle = item.querySelector('.facet-accordion__toggle');
      if (toggle) {
        toggle.textContent = item.hasAttribute('open') ? '-' : '+';
      }
    });
  }

  toggleAccordion(event) {
    event.preventDefault();
    const header = event.target.closest('.facet-accordion__header');
    const item = header.closest('.facet-accordion__item');
    const toggle = item.querySelector('.facet-accordion__toggle');

    if (!this.state.isMobileView) {
      // Close other accordions
      this.querySelectorAll('.facet-accordion__item[open]').forEach(other => {
        if (other !== item) {
          other.removeAttribute('open');
          const otherToggle = other.querySelector('.facet-accordion__toggle');
          if (otherToggle) otherToggle.textContent = '+';
        }
      });

      // Toggle current accordion
      item.toggleAttribute('open');
      if (toggle) {
        toggle.textContent = item.hasAttribute('open') ? '-' : '+';
      }
    }
  }

  closeAllAccordions() {
    this.querySelectorAll('.facet-accordion__item[open]').forEach(item => {
      item.removeAttribute('open');
      const toggle = item.querySelector('.facet-accordion__toggle');
      if (toggle) toggle.textContent = '+';
    });
  }

  openDrawer() {
    if (!this.state.isMobileView) return;
    
    const wrapper = this.querySelector('.facets__wrapper');
    if (!wrapper) return;

    wrapper.setAttribute('open', '');
    document.body.classList.add('overflow-hidden-mobile');
    this.state.currentView = 'main';
  }

  closeDrawer() {
    const wrapper = this.querySelector('.facets__wrapper');
    if (!wrapper) return;

    wrapper.removeAttribute('open');
    document.body.classList.remove('overflow-hidden-mobile');
    this.state.currentView = 'main';
    this.state.activeSubmenu = null;

    // Apply filters if on mobile
    if (this.state.isMobileView) {
      this.applyFilters();
    }

    // Reset submenu state
    this.querySelector('.mobile-facets__back-button')?.classList.add('hidden');
    this.querySelectorAll('.mobile-facets__submenu').forEach(submenu => {
      submenu.classList.remove('active');
    });
  }

  openSubmenu(submenuId) {
    if (!this.state.isMobileView) return;

    this.state.currentView = 'submenu';
    this.state.activeSubmenu = submenuId;

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

  closeSubmenu() {
    this.state.currentView = 'main';
    this.state.activeSubmenu = null;

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
        this.resetView();
      }
    }, 250));
  }

  resetView() {
    if (!this.state.isMobileView) {
      this.closeDrawer();
      this.initializeAccordion();
    } else {
      this.closeAllAccordions();
    }
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

  handleFilterChange(event) {
    if (this.state.loading) return;

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

    // Update UI
    this.updateMobileApplyButton();
    this.updateFilterPreview();
    this.renderSelectedFilters();

    // Only apply filters immediately on desktop
    if (!this.state.isMobileView) {
      this.applyFilters();
    }
  }

  applyFilters() {
    const queryString = this.buildQueryParams();
    this.updateURLHash(queryString);
    this.renderPage(queryString);
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
    
    if (this.state.isMobileView) {
      // Don't update URL until Apply is clicked on mobile
      this.closeDrawer();
    } else {
      history.pushState({}, '', window.location.pathname);
      this.renderPage('');
    }
  }

  updateMobileApplyButton() {
    const applyButton = this.querySelector('.mobile-facets__apply');
    if (!applyButton) return;

    const filterCount = this.state.selectedFilters.size;
    applyButton.disabled = filterCount === 0;
    applyButton.textContent = filterCount ? `Apply (${filterCount})` : 'Apply';
  }

  getFilterLabel(input) {
    if (!input) return '';
    const label = input.closest('label')?.querySelector('.facet-checkbox__text');
    return label ? label.textContent.trim().split(' (')[0] : '';
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

      const requests = sections.map(section => {
        const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
        return this.renderSectionFromFetch(url);
      });

      await Promise.all(requests);
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