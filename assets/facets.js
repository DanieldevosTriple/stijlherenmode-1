class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    // Initialize desktop accordion
    this.initializeDesktopAccordion();
    
    // Initialize form handlers
    this.bindEvents();
    
    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  bindEvents() {
    const forms = this.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('input', this.debouncedOnSubmit.bind(this));
    });

    this.bindSortChangeEvent();
  }

  bindSortChangeEvent() {
    const sortSelects = this.querySelectorAll('.facet-filters__sort');
    sortSelects.forEach(select => {
      select.addEventListener('change', this.debouncedOnSubmit.bind(this));
    });
  }

  initializeDesktopAccordion() {
    const desktopDetails = this.querySelectorAll('#FacetsWrapperDesktop .facet-accordion__item');
    
    desktopDetails.forEach((detail) => {
      const summary = detail.querySelector('summary');
      if (!summary) return;

      summary.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = detail.hasAttribute('open');

        // Close all other details
        desktopDetails.forEach((otherDetail) => {
          if (otherDetail !== detail && otherDetail.hasAttribute('open')) {
            otherDetail.removeAttribute('open');
          }
        });

        // Toggle current detail
        if (isOpen) {
          detail.removeAttribute('open');
        } else {
          detail.setAttribute('open', '');
        }
      });
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    
    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(event.target.closest('form'));
    const searchParams = new URLSearchParams(formData).toString();
    
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href.indexOf('?') === -1
      ? ''
      : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = 
      new DOMParser()
        .parseFromString(html, 'text/html')
        .getElementById('ProductGridContainer').innerHTML;
  }

  static renderProductCount(html) {
    const count = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductCount').innerHTML;
    
    const container = document.getElementById('ProductCount');
    if (container) {
      container.innerHTML = count;
      container.classList.remove('loading');
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElements = parsedHTML.querySelectorAll('#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter');
    const matchesIndex = (element) => element.dataset.index === event?.target?.closest('.js-filter')?.dataset?.index;
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);
  }

  static renderActiveFacets(html) {
    const activeFacets = html.querySelectorAll('.active-facets-mobile');
    activeFacets.forEach(activeFacet => {
      document.querySelector('.active-facets-mobile').innerHTML = activeFacet.innerHTML;
    });
  }

  static renderAdditionalElements(html) {
    const mobileElements = html.querySelectorAll('.mobile-facets__open, .mobile-facets__count, .sorting');
    mobileElements.forEach(element => {
      if (!element) return;
      document.querySelector(`.${element.className}`).innerHTML = element.innerHTML;
    });
  }

  static resetFacets() {
    const activeFacets = document.querySelectorAll('.js-facet-remove');
    activeFacets.forEach((element) => {
      element.click();
    });
  }
}

customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);

// Keep your existing PriceRange class unchanged