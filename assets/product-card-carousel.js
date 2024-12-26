(function() {
  class Slider {
    constructor(element) {
      // Elements
      this.slider = element;
      this.wrapper = element.querySelector('.slider-wrapper');
      this.slides = element.querySelectorAll('.slide');
      this.dots = element.querySelector('.dots');
      
      // Reset alle start waardes
      this.resetValues();
      this.init();
    }

    resetValues() {
      this.currentSlide = 0;
      this.startX = 0;
      this.currentX = 0;
      this.isDragging = false;
      this.slideWidth = 100; // percentage
    }

    init() {
      if (this.slides.length <= 1) return;
      this.createDots();
      this.addEvents();
    }

    createDots() {
      this.dots.innerHTML = '';
      this.slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        this.dots.appendChild(dot);
      });
    }

    addEvents() {
      this.wrapper.addEventListener('touchstart', (e) => this.touchStart(e));
      this.wrapper.addEventListener('touchmove', (e) => this.touchMove(e));
      this.wrapper.addEventListener('touchend', () => this.touchEnd());
    }

    touchStart(e) {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.wrapper.style.transition = 'none';
    }

    touchMove(e) {
      if (!this.isDragging) return;
      
      this.currentX = e.touches[0].clientX;
      const walk = this.currentX - this.startX;
      const movePercent = (walk / this.wrapper.offsetWidth) * 100;
      const translate = movePercent - (this.currentSlide * 100);
      
      this.wrapper.style.transform = `translateX(${translate}%)`;
    }

    touchEnd() {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      this.wrapper.style.transition = 'transform 0.3s ease';
      
      const currentTranslate = parseFloat(this.wrapper.style.transform.replace('translateX(', '').replace('%)', ''));
      const movePercent = currentTranslate + (this.currentSlide * 100);

      if (Math.abs(movePercent) > 20) {
        if (movePercent > 0 && this.currentSlide > 0) {
          this.currentSlide--;
        } else if (movePercent < 0 && this.currentSlide < this.slides.length - 1) {
          this.currentSlide++;
        }
      }

      // Ga naar slide en reset daarna
      this.goToSlide(this.currentSlide, () => {
        this.resetAfterSlide();
      });
    }

    goToSlide(index, callback) {
      this.currentSlide = index;
      const translate = -(index * 100);
      this.wrapper.style.transform = `translateX(${translate}%)`;
      
      // Update dots
      const dots = this.dots.querySelectorAll('.dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });

      // Wacht tot transitie klaar is
      setTimeout(() => {
        if (callback) callback();
      }, 300);
    }

    resetAfterSlide() {
      // Reset alle belangrijke waardes
      this.startX = 0;
      this.currentX = 0;
      this.isDragging = false;
      
      // Reset styles
      this.wrapper.style.transition = 'none';
      
      // Force browser reflow
      this.wrapper.offsetHeight;
      
      console.log(`Reset completed. Ready for next slide. Current slide: ${this.currentSlide}`);
    }
  }

  // Prevent multiple initializations
  let isInitialized = false;

  function initSliders() {
    if (isInitialized) return;
    
    document.querySelectorAll('.product-card-media-slider').forEach(slider => {
      new Slider(slider);
    });
    
    isInitialized = true;
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSliders);
  } else {
    initSliders();
  }
})();