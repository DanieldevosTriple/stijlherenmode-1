// product-card-carousel.js
(function() {
  class Slider {
    constructor(element) {
      this.slider = element;
      this.wrapper = element.querySelector('.slider-wrapper');
      this.slides = element.querySelectorAll('.slide');
      this.dots = element.querySelector('.dots');
      this.prevButton = element.querySelector('.prev');
      this.nextButton = element.querySelector('.next');
      this.currentSlide = 0;
      this.slideWidth = 100;
      this.init();
    }

    init() {
      if (this.slides.length <= 1) return;

      // Create dots
      this.createDots();
      
      // Setup touch events
      this.setupTouchEvents();
      
      // Setup desktop navigation
      this.setupDesktopNav();
    }

    createDots() {
      this.dots.innerHTML = '';
      this.slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => this.goToSlide(index));
        this.dots.appendChild(dot);
      });
    }

    setupTouchEvents() {
      this.wrapper.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.startX = e.touches[0].clientX;
        this.currentX = this.startX;
        this.wrapper.style.transition = 'none';
      }, { passive: false });

      this.wrapper.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!this.startX) return;
        this.currentX = e.touches[0].clientX;
        const diffX = this.currentX - this.startX;
        const translateX = diffX - (this.currentSlide * this.slideWidth);
        this.wrapper.style.transform = `translateX(${translateX}%)`;
      }, { passive: false });

      this.wrapper.addEventListener('touchend', () => {
        if (!this.startX || this.startX === this.currentX) return;
        const diff = this.currentX - this.startX;
        const threshold = this.slideWidth * 0.2;
        this.wrapper.style.transition = 'transform 0.3s ease';

        if (Math.abs(diff) > threshold) {
          if (diff > 0) {
            this.goToPrevSlide();
          } else {
            this.goToNextSlide();
          }
        } else {
          this.goToSlide(this.currentSlide);
        }

        // Reset values
        this.startX = null;
        this.currentX = null;
        this.wrapper.style.transition = '';
      });
    }

    setupDesktopNav() {
      if (this.prevButton && this.nextButton) {
        this.prevButton.style.display = 'flex';
        this.nextButton.style.display = 'flex';
        
        this.prevButton.addEventListener('click', () => this.goToPrevSlide());
        this.nextButton.addEventListener('click', () => this.goToNextSlide());
      }
    }

    goToSlide(index) {
      this.currentSlide = index;
      this.wrapper.style.transform = `translateX(${-this.currentSlide * this.slideWidth}%)`;
      this.updateDots();
    }

    goToNextSlide() {
      if (this.currentSlide >= this.slides.length - 1) {
        // Loop back to first slide
        this.currentSlide = 0;
      } else {
        this.currentSlide++;
      }
      this.goToSlide(this.currentSlide);
    }

    goToPrevSlide() {
      if (this.currentSlide <= 0) {
        // Loop to last slide
        this.currentSlide = this.slides.length - 1;
      } else {
        this.currentSlide--;
      }
      this.goToSlide(this.currentSlide);
    }

    updateDots() {
      const dots = this.dots.querySelectorAll('.dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === this.currentSlide);
      });
    }
  }

  // Initialize sliders and handle faceted filtering
  function initSliders() {
    document.querySelectorAll('.product-card-media-slider').forEach(slider => new Slider(slider));
  }

  // Initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSliders);
  } else {
    initSliders();
  }

  // Handle faceted navigation updates
  document.addEventListener('facets:updated', () => {
    // Re-initialize sliders after facet update
    initSliders();
  });
})();