(function() {
  class Slider {
    constructor(element) {
      this.slider = element;
      this.wrapper = element.querySelector('.slider-wrapper');
      this.slides = element.querySelectorAll('.slide');
      this.dots = element.querySelector('.dots');
      
      this.currentSlide = 0;
      this.slideWidth = 100;
      
      this.init();
    }

    init() {
      if (this.slides.length <= 1) return;
      
      // Create dots
      this.slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        this.dots.appendChild(dot);
      });

      // Setup touch events
      this.wrapper.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.startX = e.touches[0].clientX;
        this.currentX = this.startX;
        this.wrapper.style.transition = 'none';
      }, { passive: false });

      // Move
      this.wrapper.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!this.startX) return;

        this.currentX = e.touches[0].clientX;
        const diffX = this.currentX - this.startX;
        const translateX = diffX - (this.currentSlide * this.slideWidth);
        
        // Add resistance at edges
        let actualTranslate = translateX;
        if (translateX > 0) {
          actualTranslate = translateX * 0.3;
        } else if (translateX < -(this.slides.length - 1) * this.slideWidth) {
          const overScroll = translateX + (this.slides.length - 1) * this.slideWidth;
          actualTranslate = -(this.slides.length - 1) * this.slideWidth + (overScroll * 0.3);
        }

        this.wrapper.style.transform = `translateX(${actualTranslate}%)`;
      }, { passive: false });

      // End
      this.wrapper.addEventListener('touchend', () => {
        if (!this.startX || this.startX === this.currentX) return;

        const diff = this.currentX - this.startX;
        const threshold = this.slideWidth * 0.2;

        this.wrapper.style.transition = 'transform 0.3s ease';

        if (Math.abs(diff) > threshold) {
          if (diff > 0 && this.currentSlide > 0) {
            this.currentSlide--;
          } else if (diff < 0 && this.currentSlide < this.slides.length - 1) {
            this.currentSlide++;
          }
        }

        // Move slider to the correct slide
        this.wrapper.style.transform = `translateX(${-this.currentSlide * this.slideWidth}%)`;
        
        // Update dots
        const dots = this.dots.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
          dot.classList.toggle('active', index === this.currentSlide);
        });

        // Reset values after slide change
        this.startX = null;
        this.currentX = null;
        this.wrapper.style.transition = '';
        console.log('Reset complete, current slide:', this.currentSlide);

        // Re-enable swipe after reset by allowing new touch events to work again
        this.wrapper.addEventListener('touchstart', this.touchStartHandler);
      });
    }
  }

  // Initialize on load
  let initialized = false;
  function init() {
    if (initialized) return;
    document.querySelectorAll('.product-card-media-slider').forEach(slider => new Slider(slider));
    initialized = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
