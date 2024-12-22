class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.debouncedOnSubmit = debounce(this.onSubmitHandler.bind(this), 500);
    this.currentDrawerView = 'main';
    this.selectedFilters = new Map();
    
    this.initializeDesktopAccordion();
    this.initializeMobileDrawer();
    this.initializeFromURL();
    this.renderSelectedFilters();
    
    const facetForm = this.querySelector('form');
    if (facetForm) {
      facetForm.addEventListener('input', this.debouncedOnSubmit);
    }

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  initializeFromURL() {
    const searchParams = new URLSearchParams(window.location.search);
    const form = this.querySelector('form');
    if (!form) return;

    // Clear existing selections
    this.selectedFilters.clear();

    searchParams.forEach((value, key) => {
      const inputDesktop = form.querySelector(`input[name="${key}"][value="${value}"]`);
      const inputMobile = document.querySelector(`input[name="${key}"][value="${value}"]`);

      if (inputDesktop) {
        inputDesktop.checked = true;
        this.addSelectedFilter(key, value, inputDesktop.closest('label').querySelector('.facet-checkbox__text').textContent);
      }
      if (inputMobile) {
        inputMobile.checked = true;
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
    const applyButtons = mobileDrawer.querySelectorAll('.mobile-facets__apply');
    const clearButtons = mobileDrawer.querySelectorAll('.mobile-facets__clear');

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

    // Handle back buttons in category views
    const backButtons = mobileDrawer.querySelectorAll('.mobile-facets__back-button');
    backButtons.forEach(button => {
      button.addEventListener('click', () => this.navigateBack());
    });

    // Handle apply filters
    applyButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.applyFilters();
        this.toggleDrawer(false);
      });
    });

    // Handle clear filters
    clearButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.clearFilters();
      });
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

  addSelectedFilter(key, value, label) {
    this.selectedFilters.set(`${key}-${value}`, {
      key,
      value,
      label: label.split(' (')[0] // Remove count from label
    });
    this.renderSelectedFilters();
  }

  removeSelectedFilter(key, value) {
    this.selectedFilters.delete(`${key}-${value}`);
    this.renderSelectedFilters();

    // Uncheck corresponding checkboxes
    const desktopInput = this.querySelector(`input[name="${key}"][value="${value}"]`);
    const mobileInput = document.querySelector(`input[name="${key}"][value="${value}"]`);
    
    if (desktopInput) desktopInput.checked = false;
    if (mobileInput) mobileInput.checked = false;

    // Trigger form submission
    this.applyFilters();
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
        this.removeSelectedFilter(filter.dataset.key, filter.dataset.value);
      });
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
      // Reset to main view when opening drawer
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

  syncCheckboxState(sourceInput) {
    const { name, value, checked } = sourceInput;
    const targetSelector = `input[name="${name}"][value="${value}"]`;
    const label = sourceInput.closest('label').querySelector('.facet-checkbox__text, .mobile-facets__filter-label').textContent;

    // Update desktop checkbox
    const desktopInput = this.querySelector(targetSelector);
    if (desktopInput && desktopInput !== sourceInput) {
      desktopInput.checked = checked;
    }

    // Update mobile checkbox
    const mobileInput = document.querySelector(`menu-drawer ${targetSelector}`);
    if (mobileInput && mobileInput !== sourceInput) {
      mobileInput.checked = checked;
    }

    // Update selected filters
    if (checked) {
      this.addSelectedFilter(name, value, label);
    } else {
      this.removeSelectedFilter(name, value);
    }
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const form = event.target.closest('form');
    if (!form) return;

    const formData = new FormData(form);
    const searchParams = new URLSearchParams(formData).toString();

    // Sync checkbox states if the change came from a checkbox
    if (event.target.type === 'checkbox') {
      this.syncCheckboxState(event.target);
    }

    this.renderPage(searchParams, event);
  }

  renderPage(searchParams, event, updateURLHash = true) {
    const sections = this.getSections();
    
    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      this.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) this.updateURLHash(searchParams);
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
  }

  applyFilters() {
    const form = this.querySelector('form');
    if (form) {
      this.debouncedOnSubmit({ target: form, preventDefault: () => {} });
    }
  }

  clearFilters() {
    const form = this.querySelector('form');
    if (!form) return;

    const inputs = form.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    const mobileInputs = document.querySelectorAll('menu-drawer input[type="checkbox"], menu-drawer input[type="radio"]');
    const rangeInputs = form.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => input.checked = false);
    mobileInputs.forEach(input => input.checked = false);
    rangeInputs.forEach(input => input.value = '');
    
    this.selectedFilters.clear();
    this.renderSelectedFilters();
    this.applyFilters();
  }

  getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ];
  }

  updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}?${searchParams}`);
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