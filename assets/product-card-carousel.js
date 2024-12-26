(function() {
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
      this.isTransitioning = false;
      
      this.init();
    }
    
    init() {
      if (this.slides.length <= 1) return;
      
      // Bind handlers
      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
      this.handleTouchEnd = this.handleTouchEnd.bind(this);
      
      // Add listeners
      this.addEventListeners();
      this.createDots();
      
      console.log(`[${this.sliderId}] Initialized`);
    }
    
    addEventListeners() {
      // Remove existing listeners first
      this.removeEventListeners();
      
      this.wrapper.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      this.wrapper.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      this.wrapper.addEventListener('touchend', this.handleTouchEnd);
    }
    
    removeEventListeners() {
      this.wrapper.removeEventListener('touchstart', this.handleTouchStart);
      this.wrapper.removeEventListener('touchmove', this.handleTouchMove);
      this.wrapper.removeEventListener('touchend', this.handleTouchEnd);
    }
    
    createDots() {
      this.dots.innerHTML = ''; // Clear existing dots
      this.slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        this.dots.appendChild(dot);
      });
    }
    
    handleTouchStart(e) {
      if (this.isTransitioning) return;
      
      e.stopPropagation(); // Prevent event bubbling
      e.preventDefault();
      
      this.startX = e.touches[0].clientX;
      this.isDragging = true;
      this.currentTranslate = this.currentSlide * -100;
      
      this.wrapper.style.transition = 'none';
      console.log(`[${this.sliderId}] Touch Start:`, { slide: this.currentSlide });
    }
    
    handleTouchMove(e) {
      if (!this.isDragging || this.isTransitioning) return;
      
      e.stopPropagation();
      e.preventDefault();
      
      const currentX = e.touches[0].clientX;
      const diff = currentX - this.startX;
      const movePercent = (diff / this.wrapper.offsetWidth) * 100;
      let translate = this.currentTranslate + movePercent;
      
      // Add resistance at edges
      if (translate > 0) {
        translate *= 0.3;
      } else if (translate < -((this.slides.length - 1) * 100)) {
        const overScroll = translate + ((this.slides.length - 1) * 100);
        translate = -((this.slides.length - 1) * 100) + (overScroll * 0.3);
      }
      
      this.wrapper.style.transform = `translateX(${translate}%)`;
    }
    
    handleTouchEnd(e) {
      if (!this.isDragging || this.isTransitioning) return;
      
      e && e.stopPropagation();
      
      this.isDragging = false;
      this.isTransitioning = true;
      
      const currentTranslate = parseFloat(this.wrapper.style.transform.match(/-?\d+\.?\d*/)[0] || 0);
      const movePercent = currentTranslate - (this.currentSlide * -100);
      
      this.wrapper.style.transition = 'transform 0.3s ease';
      
      console.log(`[${this.sliderId}] Touch End:`, { movePercent });
      
      if (Math.abs(movePercent) > 20) {
        if (movePercent > 0 && this.currentSlide > 0) {
          this.currentSlide--;
        } else if (movePercent < 0 && this.currentSlide < this.slides.length - 1) {
          this.currentSlide++;
        }
      }
      
      this.goToSlide(this.currentSlide);
      
      // Reset state after transition
      setTimeout(() => {
        this.isTransitioning = false;
        this.wrapper.style.transition = 'none';
      }, 300);
    }
    
    goToSlide(index) {
      const translate = -index * 100;
      this.currentSlide = index;
      this.wrapper.style.transform = `translateX(${translate}%)`;
      this.updateDots(index);
      
      console.log(`[${this.sliderId}] At slide:`, index);
    }
    
    updateDots(index) {
      const dots = this.dots.querySelectorAll('.dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
  }

  // Initialize sliders
  function initSliders() {
    const sliders = document.querySelectorAll('.product-card-media-slider');
    sliders.forEach(element => {
      new Slider(element);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSliders);
  } else {
    initSliders();
  }
})();