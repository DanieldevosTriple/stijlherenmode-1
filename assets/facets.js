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
        value.split(/,|%2C/).forEach(singleValue => {
          const desktopInput = this.querySelector(`input[name="${key}"][value="${singleValue}"]`);
          const mobileInput = document.querySelector(`input[name="${key}"][value="${singleValue}"]`);
          
          console.log(`Desktop Input: ${key}=${singleValue}`, desktopInput);
          console.log(`Mobile Input: ${key}=${singleValue}`, mobileInput);
  
          const label = desktopInput?.closest('label')?.querySelector('.facet-checkbox__text')?.textContent || 
                        mobileInput?.closest('label')?.querySelector('.mobile-facets__filter-label')?.textContent;
  
          if (label) {
            console.log('Label found:', label);
            filters.set(`${key}-${singleValue}`, { key, value: singleValue, label: label.split(' (')[0] });
          }
        });
      }
    });
  
    console.log('Selected Filters:', filters);
    return filters;
  }   

  syncFromURL() {
    const params = new URLSearchParams(window.location.search);
    console.log('Syncing from URL with params:', params.toString());
  
    this.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
  
    params.forEach((value, key) => {
      if (key.startsWith('filter.')) {
        value.split(',').forEach(singleValue => {
          const desktopInput = this.querySelector(`input[name="${key}"][value="${singleValue}"]`);
          if (desktopInput) {
            desktopInput.checked = true;
            console.log(`Checked filter: ${key}=${singleValue}`);
          }
        });
      }
    });
  
    this.renderSelectedFilters();
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
          if (otherDetail !== detail) {
            otherDetail.removeAttribute('open');
            otherDetail.querySelector('.facet-accordion__toggle').textContent = '+';
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

    const openButton = document.querySelector('.mobile-facets__open-button');
    const closeButton = mobileDrawer.querySelector('.mobile-facets__close-button');
    const filterCategories = mobileDrawer.querySelectorAll('.mobile-facets__filter-category');
    const backButtons = mobileDrawer.querySelectorAll('.mobile-facets__back-button');
    const clearButtons = mobileDrawer.querySelectorAll('.mobile-facets__clear');

    // Open and close drawer
    openButton?.addEventListener('click', () => this.toggleDrawer(true));
    closeButton?.addEventListener('click', () => this.toggleDrawer(false));

    // Navigate to category
    filterCategories?.forEach(category => {
      category.addEventListener('click', (e) => {
        e.preventDefault();
        const categoryId = category.dataset.categoryId;
        this.navigateToCategory(categoryId);
      });
    });

    // Navigate back
    backButtons.forEach(button => {
      button.addEventListener('click', () => this.navigateBack());
    });

    // Clear filters
    clearButtons.forEach(button => {
      button.addEventListener('click', () => this.clearFilters());
    });

    document.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE' && mobileDrawer.hasAttribute('open')) {
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
    if (isOpen) {
      mobileDrawer.setAttribute('open', '');
      document.body.classList.add('overflow-hidden-mobile');
    } else {
      mobileDrawer.removeAttribute('open');
      document.body.classList.remove('overflow-hidden-mobile');
    }
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

    container.querySelectorAll('.selected-filter__remove').forEach(button => {
      button.addEventListener('click', (e) => {
        const filter = e.target.closest('.selected-filter');
        this.removeFilter(filter.dataset.key, filter.dataset.value);
      });
    });
  }

  removeFilter(key, value) {
    const desktopInput = this.querySelector(`input[name="${key}"][value="${value}"]`);
    const mobileInput = document.querySelector(`menu-drawer input[name="${key}"][value="${value}"]`);
  
    if (desktopInput) desktopInput.checked = false;
    if (mobileInput) mobileInput.checked = false;
  
    this.selectedFilters.delete(`${key}-${value}`);
  
    const form = this.querySelector('form');
    if (form) {
      const formData = new FormData(form);
      const params = new URLSearchParams();
  
      // Rebuild query string without the removed filter
      formData.forEach((formValue, formKey) => {
        if (formKey === key) {
          const values = params.has(formKey) ? params.get(formKey).split(',') : [];
          params.set(formKey, values.filter(v => v !== value).join(','));
        } else {
          params.append(formKey, formValue);
        }
      });
  
      this.updateURLHash(params.toString());
    }
  
    this.renderSelectedFilters();
  }  

  clearFilters() {
    this.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
    document.querySelectorAll('menu-drawer input[type="checkbox"]').forEach(input => input.checked = false);
  
    this.selectedFilters.clear();
    this.renderSelectedFilters();
    history.pushState({}, '', window.location.pathname);
  }  

  onSubmitHandler(event) {
    event.preventDefault();
    const form = event.target.closest('form');
    if (!form) return;
  
    const formData = new FormData(form);
    const params = new URLSearchParams();
  
    // Group values for the same key
    formData.forEach((value, key) => {
      if (params.has(key)) {
        params.set(key, `${params.get(key)},${value}`);
      } else {
        params.append(key, value);
      }
    });
  
    this.selectedFilters = this.getSelectedFiltersFromURL();
    this.renderSelectedFilters();
    this.updateURLHash(params.toString());
    this.renderPage(params.toString(), event);
  }  

  renderPage(searchParams, event) {
    const sections = this.getSections();

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      this.renderSectionFromFetch(url, event);
    });
  }

  renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        this.renderFilters(html, event);
        this.renderProductGrid(html);
        this.renderProductCount(html);
  
        // Ensure sync after rendering
        this.syncFromURL();
      });
  }  

  updateURLHash(searchParams) {
    console.log('Updating URL with params:', searchParams);
    history.pushState({}, '', `${window.location.pathname}${searchParams ? '?' + searchParams : ''}`);
  }  

  getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ];
  }

  renderFilters(html, event) {
    const facetDetailsElements = html.querySelectorAll('#FacetsWrapperDesktop .js-filter');
    const matchesIndex = (element) => element.dataset.index === event?.target?.dataset?.index;
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
  
    facetsToRender.forEach((element) => {
      const target = document.querySelector(`[data-index="${element.dataset.index}"]`);
      if (target) target.innerHTML = element.innerHTML;
    });
  
    // Reattach event listeners
    this.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('input', this.debouncedOnSubmit);
    });
  
    this.syncFromURL();
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
}

customElements.define('facet-filters-form', FacetFiltersForm);
