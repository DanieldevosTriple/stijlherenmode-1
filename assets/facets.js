class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.debouncedOnSubmit = debounce((event) => this.onSubmitHandler(event), 500);
    this.currentDrawerView = 'main';
    
    // Initialize selected filters from URL
    this.selectedFilters = this.getSelectedFiltersFromURL();
    this.renderSelectedFilters();

    // Initialize accordion and drawer
    this.initializeDesktopAccordion();
    this.initializeMobileDrawer();

    // Setup form handlers
    const facetForm = this.querySelector('form');
    if (facetForm) {
      facetForm.addEventListener('input', this.debouncedOnSubmit);
    }

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);

    // Sync initial state from URL
    this.syncFromURL();
  }

  getSelectedFiltersFromURL() {
    const filters = new Map();
    const params = new URLSearchParams(window.location.search);

    params.forEach((value, key) => {
      if (key.startsWith('filter.')) {
        const desktopInput = this.querySelector(`input[name="${key}"][value="${value}"]`);
        const mobileInput = document.querySelector(`input[name="${key}"][value="${value}"]`);
        const label = desktopInput?.closest('label')?.querySelector('.facet-checkbox__text')?.textContent || 
                     mobileInput?.closest('label')?.querySelector('.mobile-facets__filter-label')?.textContent;

        if (label) {
          filters.set(`${key}-${value}`, { key, value, label: label.split(' (')[0] });
        }
      }
    });

    return filters;
  }

  syncFromURL() {
    const params = new URLSearchParams(window.location.search);

    // Reset all checkboxes
    this.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
    document.querySelectorAll('menu-drawer input[type="checkbox"]').forEach(input => input.checked = false);

    // Set checkboxes based on URL
    params.forEach((value, key) => {
      if (key.startsWith('filter.')) {
        // Update desktop
        const desktopInput = this.querySelector(`input[name="${key}"][value="${value}"]`);
        if (desktopInput) desktopInput.checked = true;

        // Update mobile
        const mobileInput = document.querySelector(`menu-drawer input[name="${key}"][value="${value}"]`);
        if (mobileInput) mobileInput.checked = true;
      }
    });
  }

  initializeDesktopAccordion() {
    const desktopDetails = this.querySelectorAll('#FacetsWrapperDesktop .facet-accordion__item');

    desktopDetails.forEach((detail) => {
      const summary = detail.querySelector('summary');
      const toggle = summary?.querySelector('.facet-accordion__toggle');

      if (!summary || !toggle) return;

      toggle.textContent = detail.hasAttribute('open') ? '-' : '+';

      summary.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = detail.hasAttribute('open');

        desktopDetails.forEach((otherDetail) => {
          if (otherDetail !== detail && otherDetail.hasAttribute('open')) {
            otherDetail.removeAttribute('open');
            const otherToggle = otherDetail.querySelector('.facet-accordion__toggle');
            if (otherToggle) otherToggle.textContent = '+';
          }
        });

        detail.toggleAttribute('open', !isOpen);
        toggle.textContent = isOpen ? '+' : '-';
      });
    });
  }

  initializeMobileDrawer() {
    const mobileDrawer = document.querySelector('#MobileMenuDrawer');
    if (!mobileDrawer) return;

    // Initialize main drawer controls
    const openButton = document.querySelector('.mobile-facets__open-button');
    const closeButton = mobileDrawer.querySelector('.mobile-facets__close-button');
    const filterCategories = mobileDrawer.querySelectorAll('.mobile-facets__filter-category');

    // Open drawer
    if (openButton) {
      openButton.addEventListener('click', () => this.toggleDrawer(true));
    }

    // Close drawer
    if (closeButton) {
      closeButton.addEventListener('click', () => this.toggleDrawer(false));
    }

    // Initialize category navigation
    filterCategories?.forEach(category => {
      category.addEventListener('click', (e) => {
        e.preventDefault();
        const categoryId = category.dataset.categoryId;
        this.navigateToCategory(categoryId);
      });
    });

    // Handle back buttons
    const backButtons = mobileDrawer.querySelectorAll('.mobile-facets__back-button');
    backButtons.forEach(button => {
      button.addEventListener('click', () => this.navigateBack());
    });

    // Handle apply buttons
    const applyButtons = mobileDrawer.querySelectorAll('.mobile-facets__apply');
    applyButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        // Get all checked inputs from mobile
        const checkedInputs = document.querySelectorAll('menu-drawer input[type="checkbox"]:checked');
        if (checkedInputs.length > 0) {
          const formData = new FormData();
          
          // Add all checked inputs to formData
          checkedInputs.forEach(input => {
            formData.append(input.name, input.value);
          });
          
          // Create search params and update URL
          const searchParams = new URLSearchParams(formData).toString();
          
          // Update URL and render page
          window.history.pushState(
            { searchParams }, 
            '', 
            `${window.location.pathname}${searchParams ? '?' + searchParams : ''}`
          );
          
          // Render the page with new filters
          this.renderPage(searchParams, null);
        }
        
        // Close drawer
        if (mobileDrawer.hasAttribute('open')) {
          mobileDrawer.classList.add('closing');
          document.body.classList.remove('overflow-hidden-mobile');
          
          setTimeout(() => {
            mobileDrawer.removeAttribute('open');
            mobileDrawer.classList.remove('closing');
          }, 300);
        }
      });
    });

    // Handle clear buttons
    const clearButtons = mobileDrawer.querySelectorAll('.mobile-facets__clear');
    clearButtons.forEach(button => {
      button.addEventListener('click', () => this.clearFilters());
    });

    // Close drawer on ESC key
    document.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE' && mobileDrawer.hasAttribute('open')) {
        this.toggleDrawer(false);
      }
    });

    // Handle backdrop clicks
    mobileDrawer.addEventListener('click', (event) => {
      if (event.target === mobileDrawer) {
        this.toggleDrawer(false);
      }
    });
  }

  navigateToCategory(categoryId) {
    const mainView = document.querySelector('.mobile-facets__main-view');
    const categoryView = document.querySelector(`.mobile-facets__category-view[data-category="${categoryId}"]`);
    
    if (!mainView || !categoryView) return;

    // Update header title
    const categoryTitle = categoryView.querySelector('.mobile-facets__back-text')?.textContent;
    const headerTitle = document.querySelector('.mobile-facets__title');
    if (headerTitle && categoryTitle) {
      headerTitle.textContent = categoryTitle;
    }

    // Slide out main view and slide in category view
    mainView.style.transform = 'translateX(-100%)';
    categoryView.style.transform = 'translateX(0)';
    categoryView.setAttribute('aria-hidden', 'false');
    
    this.currentDrawerView = categoryId;
  }

  navigateBack() {
    const mainView = document.querySelector('.mobile-facets__main-view');
    const currentCategoryView = document.querySelector(
      `.mobile-facets__category-view[data-category="${this.currentDrawerView}"]`
    );
    
    if (!mainView || !currentCategoryView) return;

    // Reset header title
    const headerTitle = document.querySelector('.mobile-facets__title');
    if (headerTitle) {
      headerTitle.textContent = headerTitle.dataset.defaultTitle || 'Filters';
    }

    // Slide back to main view
    mainView.style.transform = 'translateX(0)';
    currentCategoryView.style.transform = 'translateX(100%)';
    currentCategoryView.setAttribute('aria-hidden', 'true');
    
    this.currentDrawerView = 'main';
  }

  toggleDrawer(isOpen) {
    const mobileDrawer = document.querySelector('#MobileMenuDrawer');
    if (!mobileDrawer) return;

    if (isOpen) {
      mobileDrawer.setAttribute('open', '');
      document.body.classList.add('overflow-hidden-mobile');
      this.resetToMainView();
    } else {
      mobileDrawer.classList.add('closing');
      document.body.classList.remove('overflow-hidden-mobile');
      
      setTimeout(() => {
        mobileDrawer.removeAttribute('open');
        mobileDrawer.classList.remove('closing');
      }, 300);
    }
  }

  resetToMainView() {
    const mainView = document.querySelector('.mobile-facets__main-view');
    const categoryViews = document.querySelectorAll('.mobile-facets__category-view');
    const headerTitle = document.querySelector('.mobile-facets__title');
    
    if (mainView) {
      mainView.style.transform = 'translateX(0)';
    }
    
    categoryViews.forEach(view => {
      view.style.transform = 'translateX(100%)';
      view.setAttribute('aria-hidden', 'true');
    });

    if (headerTitle) {
      headerTitle.textContent = headerTitle.dataset.defaultTitle || 'Filters';
    }
    
    this.currentDrawerView = 'main';
  }

  renderSelectedFilters() {
    const container = document.getElementById('SelectedFilters');
    if (!container) return;

    const filterElements = Array.from(this.selectedFilters.values()).map(filter => {
      return `
        <div class="selected-filter" data-key="${filter.key}" data-value="${filter.value}">
          <span>${filter.label}</span>
          <button type="button" class="selected-filter__remove" aria-label="Remove filter">
            <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = filterElements;

    // Add event listeners to remove buttons
    container.querySelectorAll('.selected-filter__remove').forEach(button => {
      button.addEventListener('click', (e) => {
        const filter = e.target.closest('.selected-filter');
        this.removeFilter(filter.dataset.key, filter.dataset.value);
      });
    });
  }

  removeFilter(key, value) {
    // Uncheck corresponding checkboxes
    const desktopInput = this.querySelector(`input[name="${key}"][value="${value}"]`);
    const mobileInput = document.querySelector(`menu-drawer input[name="${key}"][value="${value}"]`);
    
    if (desktopInput) desktopInput.checked = false;
    if (mobileInput) mobileInput.checked = false;

    // Remove from selected filters
    this.selectedFilters.delete(`${key}-${value}`);
    this.renderSelectedFilters();

    // Update URL and render
    const form = this.querySelector('form');
    if (form) {
      const formData = new FormData(form);
      const searchParams = new URLSearchParams(formData).toString();
      this.renderPage(searchParams, null);
    }
  }

  clearFilters() {
    // Clear checkboxes
    this.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
    document.querySelectorAll('menu-drawer input[type="checkbox"]').forEach(input => input.checked = false);

    // Clear selected filters
    this.selectedFilters.clear();
    this.renderSelectedFilters();

    // Update URL and render
    const form = this.querySelector('form');
    if (form) {
      const formData = new FormData(form);
      const searchParams = new URLSearchParams(formData).toString();
      this.renderPage(searchParams, null);
    }
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const form = event.target.closest('form');
    if (!form) return;

    const formData = new FormData(form);
    const searchParams = new URLSearchParams(formData).toString();

    // Update selected filters
    this.selectedFilters = this.getSelectedFiltersFromURL();
    this.renderSelectedFilters();

    // Render page with new filters
    this.renderPage(searchParams, event);
  }

  renderPage(searchParams, event) {
    try {
      const sections = this.getSections();
      
      // Update URL first
      window.history.pushState(
        { searchParams }, 
        '', 
        `${window.location.pathname}${searchParams ? '?' + searchParams : ''}`
      );
      
      // Then update sections
      sections.forEach((section) => {
        const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
        this.renderSectionFromFetch(url, event);
      });

      // Update selected filters
      const checkedInputs = document.querySelectorAll('input[type="checkbox"]:checked');
      this.selectedFilters.clear();
      
      checkedInputs.forEach(input => {
        const label = input.closest('label')?.querySelector('.facet-checkbox__text, .mobile-facets__filter-label')?.textContent;
        if (label) {
          this.selectedFilters.set(`${input.name}-${input.value}`, {
            key: input.name,
            value: input.value,
            label: label.split(' (')[0]
          });
        }
      });
      
      this.renderSelectedFilters();
    } catch (error) {
      console.error('Error in renderPage:', error);
    }
  }
  }

  renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        this.renderFilters(html, event);
        this.renderProductGrid(html);
        this.renderProductCount(html);
      });
  }

  renderProductGrid(html) {
    const productGrid = document.getElementById('ProductGridContainer');
    if (productGrid) {
      productGrid.innerHTML = html.getElementById('ProductGridContainer').innerHTML;
    }
  }

  renderProductCount(html) {
    const count = document.getElementById('ProductCount');
    const countMobile = document.getElementById('ProductCountMobile');
    
    if (count) {
      count.innerHTML = html.getElementById('ProductCount').innerHTML;
    }
    if (countMobile) {
      countMobile.innerHTML = html.getElementById('ProductCountMobile').innerHTML;
    }
  }

  renderFilters(html, event) {
    const facetDetailsElements = html.querySelectorAll('#FacetsWrapperDesktop .js-filter');
    const matchesIndex = (element) => element.dataset.index === event?.target?.dataset?.index;
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));

    facetsToRender.forEach((element) => {
      document.querySelector(`[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    this.syncFromURL();
  }

  getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ];
  }

  updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      '',
      `${window.location.pathname}${searchParams ? '?' + searchParams : ''}`
    );
  }
}

// Debounce Helper
function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

// Escape Key Helper
function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;
  
  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;
  
  openDetailsElement.removeAttribute('open');
  openDetailsElement.querySelector('summary').setAttribute('aria-expanded', false);
}

customElements.define('facet-filters-form', FacetFiltersForm);