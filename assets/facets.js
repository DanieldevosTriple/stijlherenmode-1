class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.debouncedOnSubmit = debounce(this.onSubmitHandler.bind(this), 500);
    this.currentDrawerView = 'main';
    
    this.initializeDesktopAccordion();
    this.initializeMobileDrawer();
    this.initializeSelectedFilters();
    this.syncMenus();
    
    const facetForm = this.querySelector('form');
    if (facetForm) {
      facetForm.addEventListener('input', (event) => {
        this.debouncedOnSubmit(event);
        this.updateSelectedFilters();
      });
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

  initializeSelectedFilters() {
    // Create selected filters container if it doesn't exist
    const desktopWrapper = document.querySelector('#FacetsWrapperDesktop');
    if (!desktopWrapper) return;

    const selectedFiltersContainer = document.createElement('div');
    selectedFiltersContainer.id = 'SelectedFilters';
    selectedFiltersContainer.className = 'selected-filters';
    desktopWrapper.insertBefore(selectedFiltersContainer, desktopWrapper.firstChild);

    // Add styles for filters and checkboxes
    const style = document.createElement('style');
    style.textContent = `
      .selected-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }
      .selected-filter {
        display: inline-flex;
        align-items: center;
        background: #f5f5f5;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 14px;
      }
      .selected-filter button {
        border: none;
        background: none;
        padding: 0;
        margin-left: 8px;
        cursor: pointer;
        font-size: 16px;
      }
      .mobile-facets__filter-option {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        cursor: pointer;
        user-select: none;
      }
      .mobile-facets__filter-checkbox {
        margin-right: 10px;
        width: 20px;
        height: 20px;
      }
      .mobile-facets__filter-label {
        flex: 1;
      }
      .mobile-facets__filter-option:hover {
        background-color: #f5f5f5;
      }
    `;
    document.head.appendChild(style);
  }

  updateSelectedFilters() {
    const container = document.querySelector('#SelectedFilters');
    if (!container) return;

    container.innerHTML = '';
    
    // Get all checked checkboxes and active price ranges
    const checkedInputs = this.querySelectorAll('input[type="checkbox"]:checked');
    const priceInputs = this.querySelectorAll('input[type="number"][value]:not([value=""])');

    // Add filter tags for checked boxes
    checkedInputs.forEach(input => {
      const label = input.closest('label').textContent.trim();
      this.addFilterTag(container, label, () => {
        input.checked = false;
        this.applyFilters();
      });
    });

    // Add filter tag for price range if set
    if (priceInputs.length === 2) {
      const minPrice = priceInputs[0].value;
      const maxPrice = priceInputs[1].value;
      this.addFilterTag(container, `Price: $${minPrice} - $${maxPrice}`, () => {
        priceInputs.forEach(input => input.value = '');
        this.applyFilters();
      });
    }
  }

  addFilterTag(container, label, onRemove) {
    const tag = document.createElement('div');
    tag.className = 'selected-filter';
    tag.innerHTML = `
      ${label}
      <button type="button" aria-label="Remove filter">×</button>
    `;
    tag.querySelector('button').addEventListener('click', onRemove);
    container.appendChild(tag);
  }

  syncMenus() {
    // Function to sync a single input across mobile and desktop
    const syncInput = (input, isMobile = false) => {
      const selector = isMobile ? '#FacetsWrapperDesktop' : '.mobile-facets__drawer';
      const counterpart = document.querySelector(`${selector} input[name="${input.name}"][value="${input.value}"]`);
      
      if (counterpart) {
        // Sync initial state
        counterpart.checked = input.checked;
        
        // Handle mobile checkbox click events
        if (isMobile) {
          const mobileLabel = input.closest('label');
          if (mobileLabel) {
            mobileLabel.addEventListener('click', (e) => {
              // Prevent default to handle checkbox manually
              e.preventDefault();
              input.checked = !input.checked;
              counterpart.checked = input.checked;
              this.updateSelectedFilters();
              this.applyFilters();
            });
          }
        } else {
          // Desktop checkbox change handler
          input.addEventListener('change', () => {
            counterpart.checked = input.checked;
            this.updateSelectedFilters();
            this.applyFilters();
          });
        }
      }
    };

    // Sync all desktop inputs with mobile
    const desktopInputs = this.querySelectorAll('#FacetsWrapperDesktop input[type="checkbox"]');
    desktopInputs.forEach(input => syncInput(input));

    // Sync all mobile inputs with desktop
    const mobileInputs = this.querySelectorAll('.mobile-facets__drawer input[type="checkbox"].mobile-facets__filter-checkbox');
    mobileInputs.forEach(input => syncInput(input, true));

    // Sync price range inputs
    const desktopPriceInputs = this.querySelectorAll('#FacetsWrapperDesktop input[type="number"]');
    const mobilePriceInputs = this.querySelectorAll('.mobile-facets__drawer input[type="number"]');

    desktopPriceInputs.forEach((desktop, index) => {
      const mobile = mobilePriceInputs[index];
      if (mobile) {
        // Sync initial state
        mobile.value = desktop.value;
        
        // Add input listeners
        desktop.addEventListener('input', () => {
          mobile.value = desktop.value;
          this.updateSelectedFilters();
          this.applyFilters();
        });
        
        mobile.addEventListener('input', () => {
          desktop.value = mobile.value;
          this.updateSelectedFilters();
          this.applyFilters();
        });
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

    this.updateSelectedFilters();
    this.applyFilters();
  }

  applyFilters() {
    const form = this.querySelector('form');
    if (form) {
      this.debouncedOnSubmit({ target: form, preventDefault: () => {} });
      this.updateSelectedFilters();
    }
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(event.target.closest('form'));
    const searchParams = new URLSearchParams(formData).toString();
    
    // Ensure both menus are in sync before rendering
    const form = event.target.closest('form');
    const inputs = form.querySelectorAll('input[type="checkbox"], input[type="number"]');
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        const selector = form.closest('.mobile-facets__drawer') ? '#FacetsWrapperDesktop' : '.mobile-facets__drawer';
        const counterpart = document.querySelector(`${selector} input[name="${input.name}"][value="${input.value}"]`);
        if (counterpart) counterpart.checked = input.checked;
      } else if (input.type === 'number') {
        const selector = form.closest('.mobile-facets__drawer') ? '#FacetsWrapperDesktop' : '.mobile-facets__drawer';
        const counterpart = document.querySelector(`${selector} input[name="${input.name}"]`);
        if (counterpart) counterpart.value = input.value;
      }
    });
    
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

    this.updateSelectedFilters();
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