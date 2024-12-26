(function() {
  let sliderInstances = new Map();

  class Slider {
    constructor(element) {
      this.slider = element;
      this.sliderId = element.id;
      this.wrapper = element.querySelector('.slider-wrapper');
      this.slides = element.querySelectorAll('.slide');
      this.dots = element.querySelector('.dots');
      
      // State
      this.currentSlide = 0;
      this.startX = 0;
      this.isDragging = false;
      this.initialPosition = 0;
      this.currentTranslate = 0;
      
      this.init();
    }
    
    init() {
      if (this.slides.length <= 1) return;
      
      console.log(`[${this.sliderId}] Initializing slider`);
      
      // Bind event handlers
      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
      this.handleTouchEnd = this.handleTouchEnd.bind(this);
      
      // Add event listeners
      this.wrapper.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      this.wrapper.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      this.wrapper.addEventListener('touchend', this.handleTouchEnd);
      this.wrapper.addEventListener('touchcancel', this.handleTouchEnd);
      
      // Create dots
      this.createDots();
    }
    
    createDots() {
      this.slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        this.dots.appendChild(dot);
      });
    }
    
    handleTouchStart(e) {
      e.preventDefault();
      this.startX = e.touches[0].clientX;
      this.isDragging = true;
      this.initialPosition = this.currentSlide * -100;
      this.currentTranslate = this.initialPosition;
      this.wrapper.style.transition = 'none';
      
      console.log(`[${this.sliderId}] Touch Start:`, {
        currentSlide: this.currentSlide,
        isDragging: this.isDragging
      });
    }
    
    handleTouchMove(e) {
      if (!this.isDragging) return;
      
      e.preventDefault();
      const currentX = e.touches[0].clientX;
      const diff = currentX - this.startX;
      const movePercent = (diff / this.wrapper.offsetWidth) * 100;
      this.currentTranslate = this.initialPosition + movePercent;
      
      // Add resistance at edges
      if (this.currentTranslate > 0) {
        this.currentTranslate *= 0.3;
      } else if (this.currentTranslate < -((this.slides.length - 1) * 100)) {
        const overScroll = this.currentTranslate + ((this.slides.length - 1) * 100);
        this.currentTranslate = -((this.slides.length - 1) * 100) + (overScroll * 0.3);
      }
      
      this.wrapper.style.transform = `translateX(${this.currentTranslate}%)`;
    }
    
    handleTouchEnd() {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      this.wrapper.style.transition = 'transform 0.3s ease';
      
      const movePercent = this.currentTranslate - this.initialPosition;
      console.log(`[${this.sliderId}] Touch End - Move: ${movePercent.toFixed(2)}%`);
      
      if (Math.abs(movePercent) > 20) {
        if (movePercent > 0 && this.currentSlide > 0) {
          this.currentSlide--;
        } else if (movePercent < 0 && this.currentSlide < this.slides.length - 1) {
          this.currentSlide++;
        }
      }
      
      this.goToSlide(this.currentSlide);
      
      // Reset state
      this.startX = 0;
      this.initialPosition = this.currentSlide * -100;
      this.currentTranslate = this.initialPosition;
      
      console.log(`[${this.sliderId}] Slide Complete:`, {
        currentSlide: this.currentSlide,
        isDragging: this.isDragging
      });
    }
    
    goToSlide(index) {
      this.currentSlide = index;
      const translate = -index * 100;
      this.wrapper.style.transform = `translateX(${translate}%)`;
      this.updateDots(index);
    }
    
    updateDots(index) {
      const dots = this.dots.querySelectorAll('.dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
  }

  function initSliders() {
    document.querySelectorAll('.product-card-media-slider').forEach(element => {
      if (!sliderInstances.has(element.id)) {
        sliderInstances.set(element.id, new Slider(element));
      }
    });
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSliders);
  } else {
    initSliders();
  }
})();