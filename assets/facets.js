class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.debouncedOnSubmit = debounce(this.onSubmitHandler.bind(this), 500);
    this.currentDrawerView = 'main';
    
    this.initializeDesktopAccordion();
    this.initializeMobileDrawer();
    
    const facetForm = this.querySelector('form');
    if (facetForm) {
      facetForm.addEventListener('input', this.debouncedOnSubmit);
    }

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
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
    const rangeInputs = form.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
      input.checked = false;
    });
    
    rangeInputs.forEach(input => {
      input.value = '';
    });

    this.applyFilters();
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(event.target.closest('form'));
    const searchParams = new URLSearchParams(formData).toString();
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
  event.target.closest('summary').setAttribute('aria-expanded', false);
}

customElements.define('facet-filters-form', FacetFiltersForm);