const ProductCardCarousel = (function() {
  let instances = new WeakMap();
  
  class Slider {
    constructor(element) {
      if (instances.has(element)) {
        return instances.get(element);
      }
      
      this.slider = element;
      this.sliderId = element.id;
      this.wrapper = element.querySelector('.slider-wrapper');
      this.slides = element.querySelectorAll('.slide');
      this.dots = element.querySelector('.dots');
      
      // State
      this.state = {
        currentSlide: 0,
        isDragging: false,
        startX: null,
        currentX: null,
        translateX: 0,
        lastTranslate: 0,
        isAnimating: false
      };
      
      this.init();
      instances.set(element, this);
    }
    
    init() {
      if (this.slides.length <= 1) return;
      
      this.addDots();
      this.bindEvents();
      console.log(`[${this.sliderId}] Initialized with ${this.slides.length} slides`);
    }
    
    bindEvents() {
      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
      this.handleTouchEnd = this.handleTouchEnd.bind(this);
      
      this.wrapper.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      this.wrapper.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      this.wrapper.addEventListener('touchend', this.handleTouchEnd);
    }
    
    addDots() {
      this.dots.innerHTML = '';
      this.slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        this.dots.appendChild(dot);
      });
    }
    
    handleTouchStart(e) {
      if (this.state.isAnimating) return;
      
      e.preventDefault();
      
      this.state.isDragging = true;
      this.state.startX = e.touches[0].clientX;
      this.state.currentX = this.state.startX;
      this.state.lastTranslate = this.state.translateX;
      
      this.wrapper.style.transition = 'none';
      
      console.log(`[${this.sliderId}] Start:`, {
        slide: this.state.currentSlide,
        translateX: this.state.translateX
      });
    }
    
    handleTouchMove(e) {
      if (!this.state.isDragging) return;
      
      e.preventDefault();
      
      this.state.currentX = e.touches[0].clientX;
      const diff = this.state.currentX - this.state.startX;
      const newTranslate = this.state.lastTranslate + diff;
      
      // Add resistance at edges
      if (newTranslate > 0) {
        this.state.translateX = newTranslate * 0.3;
      } else if (newTranslate < -(this.slides.length - 1) * this.wrapper.offsetWidth) {
        const overscroll = newTranslate + (this.slides.length - 1) * this.wrapper.offsetWidth;
        this.state.translateX = -(this.slides.length - 1) * this.wrapper.offsetWidth + (overscroll * 0.3);
      } else {
        this.state.translateX = newTranslate;
      }
      
      this.updateTransform();
    }
    
    handleTouchEnd() {
      if (!this.state.isDragging) return;
      
      this.state.isDragging = false;
      this.state.isAnimating = true;
      
      const moveDistance = this.state.translateX - this.state.lastTranslate;
      const movePercent = (moveDistance / this.wrapper.offsetWidth) * 100;
      
      console.log(`[${this.sliderId}] End:`, { movePercent });
      
      this.wrapper.style.transition = 'transform 0.3s ease';
      
      if (Math.abs(movePercent) > 20) {
        if (movePercent > 0 && this.state.currentSlide > 0) {
          this.state.currentSlide--;
        } else if (movePercent < 0 && this.state.currentSlide < this.slides.length - 1) {
          this.state.currentSlide++;
        }
      }
      
      this.snapToSlide();
      
      setTimeout(() => {
        this.state.isAnimating = false;
        this.wrapper.style.transition = 'none';
      }, 300);
    }
    
    snapToSlide() {
      this.state.translateX = -(this.state.currentSlide * this.wrapper.offsetWidth);
      this.updateTransform();
      this.updateDots();
    }
    
    updateTransform() {
      const percent = (this.state.translateX / this.wrapper.offsetWidth) * 100;
      this.wrapper.style.transform = `translateX(${percent}%)`;
    }
    
    updateDots() {
      const dots = this.dots.querySelectorAll('.dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === this.state.currentSlide);
      });
    }
  }
  
  return {
    init: function() {
      const sliders = document.querySelectorAll('.product-card-media-slider');
      sliders.forEach(element => new Slider(element));
    }
  };
})();

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ProductCardCarousel.init);
} else {
  ProductCardCarousel.init();
}