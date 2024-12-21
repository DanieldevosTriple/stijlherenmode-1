class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.debouncedOnSubmit = debounce(this.onSubmitHandler.bind(this), 500);

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

    const openButton = document.querySelector('.mobile-menu__open-button');
    const closeButton = mobileDrawer.querySelector('.mobile-facets__close-button');

    // Open drawer
    if (openButton) {
      openButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleDrawer(true);
      });
    }

    // Close drawer
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleDrawer(false);
      });
    }

    // Close drawer on ESC key
    document.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE' && mobileDrawer.hasAttribute('open')) {
        this.toggleDrawer(false);
      }
    });
  }

  toggleDrawer(isOpen) {
    const mobileDrawer = document.querySelector('#MobileMenuDrawer');
    if (!mobileDrawer) return;

    if (isOpen) {
      mobileDrawer.setAttribute('open', '');
      mobileDrawer.classList.remove('closing');
      document.body.classList.add('overflow-hidden-mobile');
    } else {
      mobileDrawer.classList.add('closing');
      document.body.classList.remove('overflow-hidden-mobile');

      setTimeout(() => {
        mobileDrawer.removeAttribute('open');
        mobileDrawer.classList.remove('closing');
      }, 300); // Timing moet overeenkomen met de CSS-transitie
    }
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(event.target.closest('form'));
    const searchParams = new URLSearchParams(formData).toString();
    FacetFiltersForm.renderPage(searchParams, event);
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
        FacetFiltersForm.updatePageContent(parsedHTML, event);
      });
  }

  static updatePageContent(html, event) {
    const gridContainer = document.getElementById('ProductGridContainer');
    const countContainer = document.getElementById('ProductCount');

    if (gridContainer) {
      gridContainer.innerHTML = html.getElementById('ProductGridContainer').innerHTML;
    }

    if (countContainer) {
      countContainer.innerHTML = html.getElementById('ProductCount').innerHTML;
    }

    FacetFiltersForm.renderFilters(html, event);
  }

  static renderFilters(html, event) {
    const parsedFilters = html.querySelectorAll('.js-filter');
    parsedFilters.forEach((filter) => {
      const target = document.querySelector(`[data-index="${filter.dataset.index}"]`);
      if (target) {
        target.innerHTML = filter.innerHTML;
      }
    });
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      },
    ];
  }

  static updateURLHash(searchParams) {
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
  if (event.code.toUpperCase() === 'ESCAPE') {
    const openElement = event.target.closest('details[open]');
    if (openElement) openElement.removeAttribute('open');
  }
}

// Define custom elements
customElements.define('facet-filters-form', FacetFiltersForm);
