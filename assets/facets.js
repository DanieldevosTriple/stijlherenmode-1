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
    console.log('Syncing filters from URL:', params.toString());
  
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
  
          console.log(`Synced checkbox: ${key} = ${singleValue}`);
        });
      }
    });
  
    this.renderSelectedFilters();
  }   
  
  initializeDesktopAccordion() {
    console.log('Reinitializing accordion toggles...');
  
    const desktopDetails = this.querySelectorAll('#FacetsWrapperDesktop .facet-accordion__item');
    console.log('Found accordion items:', desktopDetails.length);
  
    const updateToggleState = (detail) => {
      const toggle = detail.querySelector('.facet-accordion__toggle');
      if (toggle) {
        toggle.textContent = detail.hasAttribute('open') ? '-' : '+';
        console.log(`Updated toggle state for ${detail.id || 'accordion item'}: Open=${detail.hasAttribute('open')}`);
      }
    };
  
    desktopDetails.forEach((detail, index) => {
      const summary = detail.querySelector('summary');
      const toggle = summary?.querySelector('.facet-accordion__toggle');
  
      if (!summary || !toggle) {
        console.warn(`Skipping invalid accordion item at index ${index}`);
        return;
      }
  
      // Remove any existing event listeners to prevent duplicates
      if (summary._toggleHandler) {
        summary.removeEventListener('click', summary._toggleHandler);
        console.log(`Removed previous toggle handler for ${detail.id || 'accordion item'} at index ${index}`);
      }
  
      // Initialize toggle state
      updateToggleState(detail);
  
      // Define and attach toggle handler
      const toggleHandler = (e) => {
        e.preventDefault();
        const isOpen = detail.hasAttribute('open');
        console.log(`Toggling accordion: ${detail.id || 'accordion item'}, Current state: Open=${isOpen}`);
  
        // Close other accordion items
        desktopDetails.forEach((otherDetail) => {
          if (otherDetail !== detail && otherDetail.hasAttribute('open')) {
            otherDetail.removeAttribute('open');
            updateToggleState(otherDetail);
          }
        });
  
        // Toggle the clicked accordion item
        detail.toggleAttribute('open', !isOpen);
        updateToggleState(detail);
      };
  
      summary._toggleHandler = toggleHandler; // Store reference for cleanup
      summary.addEventListener('click', toggleHandler);
      console.log(`Attached toggle handler for ${detail.id || 'accordion item'} at index ${index}`);
    });
  }    

  initializeMobileDrawer() {
    const mobileDrawer = document.querySelector('#MobileMenuDrawer');
    if (!mobileDrawer) return;
  
    const checkboxes = mobileDrawer.querySelectorAll('input[type="checkbox"]');
    const openButton = document.querySelector('.mobile-facets__open-button');
    const closeButton = mobileDrawer.querySelector('.mobile-facets__close-button');
    const applyButton = mobileDrawer.querySelector('.mobile-facets__apply');
  
    // Open and close drawer
    openButton?.addEventListener('click', () => this.toggleDrawer(true));
    closeButton?.addEventListener('click', () => this.toggleDrawer(false));
  
    // Handle checkbox input event
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('input', (e) => {
        console.log(`Checkbox changed: ${e.target.name} = ${e.target.value}, Checked: ${e.target.checked}`);
  
        const formData = new FormData(mobileDrawer.querySelector('form'));
        const queryParams = {};
  
        // Group selected filters manually
        formData.forEach((value, key) => {
          if (queryParams[key]) {
            queryParams[key] += `,${value}`;
          } else {
            queryParams[key] = value;
          }
        });
  
        const queryString = Object.keys(queryParams)
          .map(key => `${encodeURIComponent(key)}=${queryParams[key]}`)
          .join('&');
  
        console.log('Updated query string:', queryString);
  
        // Dynamically update the URL
        this.updateURLHash(queryString);
      });
    });
  
    // Apply filters on "Apply" button click
    applyButton?.addEventListener('click', (e) => {
      e.preventDefault();
      this.applyMobileFilters();
      this.toggleDrawer(false);
    });
  
    // Close drawer on ESC key press
    document.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE' && mobileDrawer.hasAttribute('open')) {
        this.toggleDrawer(false);
      }
    });
  }  

  applyMobileFilters() {
    const mobileDrawer = document.querySelector('#MobileMenuDrawer');
    if (!mobileDrawer) return;
  
    const formData = new FormData(mobileDrawer.querySelector('form'));
    const queryParams = {};
  
    // Group filter values manually
    formData.forEach((value, key) => {
      if (queryParams[key]) {
        queryParams[key] += `,${value}`;
      } else {
        queryParams[key] = value;
      }
    });
  
    const queryString = Object.keys(queryParams)
      .map(key => `${encodeURIComponent(key)}=${queryParams[key]}`)
      .join('&');
  
    console.log('Mobile filters applied. Query string:', queryString);
  
    // Update URL and render page content
    this.updateURLHash(queryString);
    this.renderPage(queryString);
  }   

  navigateToCategory(categoryId) {
    const mainView = document.querySelector('.mobile-facets__main-view');
    const categoryView = document.querySelector(`.mobile-facets__category-view[data-category="${categoryId}"]`);
  
    if (!mainView || !categoryView) {
      console.warn('Could not find main view or category view for:', categoryId);
      return;
    }
  
    // Update header title for the category
    const categoryTitle = categoryView.querySelector('.mobile-facets__back-text')?.textContent;
    const headerTitle = document.querySelector('.mobile-facets__title');
    if (headerTitle && categoryTitle) {
      headerTitle.textContent = categoryTitle;
      console.log('Updated header title to:', categoryTitle);
    }
  
    // Transition views
    mainView.style.transform = 'translateX(-100%)';
    categoryView.style.transform = 'translateX(0)';
    categoryView.setAttribute('aria-hidden', 'false');
  
    // Update current drawer view state
    this.currentDrawerView = categoryId;
    console.log('Navigated to category view:', categoryId);
  }  

  navigateBack() {
    const mainView = document.querySelector('.mobile-facets__main-view');
    const currentCategoryView = document.querySelector(
      `.mobile-facets__category-view[data-category="${this.currentDrawerView}"]`
    );
  
    if (!mainView || !currentCategoryView) {
      console.warn('Could not find main view or current category view:', this.currentDrawerView);
      return;
    }
  
    // Reset header title to default
    const headerTitle = document.querySelector('.mobile-facets__title');
    if (headerTitle) {
      headerTitle.textContent = headerTitle.dataset.defaultTitle || 'Filters';
      console.log('Reset header title to default.');
    }
  
    // Transition back to the main view
    mainView.style.transform = 'translateX(0)';
    currentCategoryView.style.transform = 'translateX(100%)';
    currentCategoryView.setAttribute('aria-hidden', 'true');
  
    // Update current drawer view state
    this.currentDrawerView = 'main';
    console.log('Navigated back to main view.');
  }
  

  toggleDrawer(isOpen) {
    const mobileDrawer = document.querySelector('#MobileMenuDrawer');
    if (isOpen) {
      mobileDrawer.setAttribute('open', '');
      document.body.classList.add('overflow-hidden-mobile');
      console.log('Mobile drawer opened.');
    } else {
      mobileDrawer.removeAttribute('open');
      document.body.classList.remove('overflow-hidden-mobile');
      console.log('Mobile drawer closed.');
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
    const queryParams = {};
  
    // Group values for the same key manually
    formData.forEach((value, key) => {
      if (queryParams[key]) {
        queryParams[key] += `,${value}`; // Append values with raw comma
      } else {
        queryParams[key] = value;
      }
    });
  
    // Construct the query string manually
    const queryString = Object.keys(queryParams)
      .map(key => `${encodeURIComponent(key)}=${queryParams[key]}`)
      .join('&');
  
    // Update selected filters dynamically
    this.selectedFilters.clear(); // Reset filters
    Object.entries(queryParams).forEach(([key, value]) => {
      value.split(',').forEach(singleValue => {
        const desktopInput = this.querySelector(`input[name="${key}"][value="${singleValue}"]`);
        const label = desktopInput?.closest('label')?.querySelector('.facet-checkbox__text')?.textContent;
  
        if (label) {
          this.selectedFilters.set(`${key}-${singleValue}`, {
            key,
            value: singleValue,
            label: label.split(' (')[0],
          });
        }
      });
    });
  
    // Render the updated selected filters
    this.renderSelectedFilters();
  
    // Update the URL and page content
    this.updateURLHash(queryString);
    this.renderPage(queryString, event);
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
    console.log('Rendering filters...');
    const facetDetailsElements = html.querySelectorAll('#FacetsWrapperDesktop .js-filter');
    const matchesIndex = (element) => element.dataset.index === event?.target?.dataset?.index;
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
  
    facetsToRender.forEach((element, index) => {
      const target = document.querySelector(`[data-index="${element.dataset.index}"]`);
      if (target) {
        target.innerHTML = element.innerHTML;
        console.log(`Updated filter at index ${index}`);
      } else {
        console.warn(`No target found for filter at index ${index}`);
      }
    });
  
    // Reinitialize accordion toggles
    this.initializeDesktopAccordion();
  }  
  
  renderSectionFromFetch(url, event) {
    console.log(`Fetching content from URL: ${url}`);
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        this.renderFilters(html, event);
        this.renderProductGrid(html);
        this.renderProductCount(html);
  
        // Ensure toggles are reinitialized after rendering
        this.initializeDesktopAccordion();
        console.log('Accordion toggles reinitialized after fetch.');
      })
      .catch((error) => {
        console.error('Error fetching content:', error);
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
