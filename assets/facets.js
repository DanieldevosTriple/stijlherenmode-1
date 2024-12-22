class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.debouncedOnSubmit = debounce(this.onSubmitHandler.bind(this), 500);
    this.currentDrawerView = 'main';
    this.selectedFilters = new Map();
    
    // Initialize from URL first
    this.initializeFromURL();
    this.initializeDesktopAccordion();
    this.initializeMobileDrawer();
    
    const facetForm = this.querySelector('form');
    if (facetForm) {
      facetForm.addEventListener('input', this.debouncedOnSubmit);
    }

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);

    // Listen for browser back/forward
    window.addEventListener('popstate', (event) => {
      this.initializeFromURL();
    });
  }

  initializeFromURL() {
    const searchParams = new URLSearchParams(window.location.search);
    const desktopForm = this.querySelector('form');
    const mobileForm = document.querySelector('menu-drawer form');

    // Clear all existing selections first
    this.selectedFilters.clear();
    
    // Reset all checkboxes
    if (desktopForm) {
      desktopForm.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
    }
    if (mobileForm) {
      mobileForm.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
    }

    // Apply selections from URL
    searchParams.forEach((value, key) => {
      if (key.startsWith('filter.')) {
        // Update desktop checkboxes
        const desktopInput = desktopForm?.querySelector(`input[name="${key}"][value="${value}"]`);
        if (desktopInput) {
          desktopInput.checked = true;
          const label = desktopInput.closest('label')?.querySelector('.facet-checkbox__text')?.textContent;
          if (label) {
            this.addSelectedFilter(key, value, label);
          }
        }

        // Update mobile checkboxes
        const mobileInput = mobileForm?.querySelector(`input[name="${key}"][value="${value}"]`);
        if (mobileInput) {
          mobileInput.checked = true;
        }
      }
    });

    // Render selected filters
    this.renderSelectedFilters();

    // Update the product grid if needed
    if (searchParams.toString()) {
      this.renderPage(searchParams.toString(), null, false); // false to prevent URL update
    }
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

    // Handle apply filters in both main and category views
    const applyButtonsAll = document.querySelectorAll('.mobile-facets__apply');
    applyButtonsAll.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Get all forms to combine their data
        const mobileForm = document.querySelector('menu-drawer form');
        const desktopForm = this.querySelector('form');
        const formData = new FormData(mobileForm || desktopForm);
        
        // Sync with desktop form if it exists
        if (desktopForm && mobileForm) {
          mobileForm.querySelectorAll('input[type="checkbox"]:checked').forEach(input => {
            const desktopInput = desktopForm.querySelector(`input[name="${input.name}"][value="${input.value}"]`);
            if (desktopInput) desktopInput.checked = true;
          });
        }

        const searchParams = new URLSearchParams(formData).toString();
        this.renderPage(searchParams, null, true); // true to ensure URL updates
        this.toggleDrawer(false);
      });
    });

    // Handle clear filters in both main and category views
    const clearButtonsAll = document.querySelectorAll('.mobile-facets__clear');
    clearButtonsAll.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const currentView = button.closest('.mobile-facets__category-view');
        
        if (currentView) {
          // Clear only checkboxes in current category view
          const categoryCheckboxes = currentView.querySelectorAll('input[type="checkbox"]');
          categoryCheckboxes.forEach(input => {
            if (input.checked) {
              input.checked = false;
              this.syncCheckboxState(input);
            }
          });
        } else {
          // Clear all filters
          this.clearFilters();
        }
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
    
    // Get label text from the source input
    const label = sourceInput.closest('label')?.querySelector('.facet-checkbox__text, .mobile-facets__filter-label')?.textContent;
    if (!label) return;

    // Update desktop checkbox
    const desktopForm = this.querySelector('form');
    const desktopInput = desktopForm?.querySelector(targetSelector);
    if (desktopInput && desktopInput !== sourceInput) {
      desktopInput.checked = checked;
    }

    // Update mobile checkbox
    const mobileForm = document.querySelector('menu-drawer form');
    const mobileInput = mobileForm?.querySelector(targetSelector);
    if (mobileInput && mobileInput !== sourceInput) {
      mobileInput.checked = checked;
    }

    // Update selected filters
    if (checked) {
      this.addSelectedFilter(name, value, label);
    } else {
      this.removeSelectedFilter(name, value);
    }

    // Update URL immediately when checkbox changes
    const formData = new FormData(sourceInput.closest('form'));
    const searchParams = new URLSearchParams(formData).toString();
    this.renderPage(searchParams, null, true);
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

    if (updateURLHash) {
      this.updateURLHash(searchParams);
      
      // Update selected filters based on URL
      const params = new URLSearchParams(searchParams);
      this.selectedFilters.clear();
      
      params.forEach((value, key) => {
        if (key.startsWith('filter.')) {
          const desktopInput = this.querySelector(`input[name="${key}"][value="${value}"]`);
          const mobileInput = document.querySelector(`menu-drawer input[name="${key}"][value="${value}"]`);
          
          if (desktopInput || mobileInput) {
            const label = (desktopInput?.closest('label')?.querySelector('.facet-checkbox__text') || 
                          mobileInput?.closest('label')?.querySelector('.mobile-facets__filter-label'))?.textContent;
            
            if (label) {
              this.addSelectedFilter(key, value, label);
            }
          }
        }
      });
      
      this.renderSelectedFilters();
    }}
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
    const mobileForm = document.querySelector('menu-drawer form');
    
    if (!form && !mobileForm) return;

    // Clear desktop inputs
    if (form) {
      const inputs = form.querySelectorAll('input[type="checkbox"], input[type="radio"]');
      const rangeInputs = form.querySelectorAll('input[type="number"]');
      
      inputs.forEach(input => {
        if (input.checked) {
          input.checked = false;
          this.syncCheckboxState(input);
        }
      });
      rangeInputs.forEach(input => input.value = '');
    }

    // Clear mobile inputs
    if (mobileForm) {
      const mobileInputs = mobileForm.querySelectorAll('input[type="checkbox"], input[type="radio"]');
      mobileInputs.forEach(input => {
        if (input.checked) {
          input.checked = false;
          this.syncCheckboxState(input);
        }
      });
    }
    
    this.selectedFilters.clear();
    this.renderSelectedFilters();
    
    // Submit the form with empty filters
    const formData = new FormData(form || mobileForm);
    const searchParams = new URLSearchParams(formData).toString();
    this.renderPage(searchParams, null);
  }

  getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ];
  }

  updateURLHash(searchParams) {
    // Preserve any existing non-filter parameters
    const currentParams = new URLSearchParams(window.location.search);
    const newParams = new URLSearchParams(searchParams);
    
    // Clear only filter-related parameters
    const paramsToKeep = new URLSearchParams();
    currentParams.forEach((value, key) => {
      if (!key.startsWith('filter.') && !key.startsWith('sort_by')) {
        paramsToKeep.append(key, value);
      }
    });
    
    // Add new filter parameters
    newParams.forEach((value, key) => {
      paramsToKeep.append(key, value);
    });

    const newUrl = `${window.location.pathname}${paramsToKeep.toString() ? '?' + paramsToKeep.toString() : ''}`;
    history.pushState({ searchParams: paramsToKeep.toString() }, '', newUrl);
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