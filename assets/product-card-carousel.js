class ProductCardSlider {
  constructor(element) {
    this.slider = element;
    this.slides = Array.from(this.slider.querySelectorAll('.slide'));
    this.currentSlide = 0;
    this.slideCount = this.slides.length;
    
    // Touch tracking variables
    this.touchStartX = 0;
    this.touchMoveX = 0;
    this.isDragging = false;

    // Initialize slider
    this.initializeSlider();
    this.createNavigationDots();
    this.initializeEvents();
    
    // Set initial slide
    this.updateSlidePositions();
  }

  initializeSlider() {
    // Set initial styles for the slider container
    this.slider.style.position = 'relative';
    this.slider.style.overflow = 'hidden';
    
    // Initialize each slide
    this.slides.forEach((slide, index) => {
      slide.style.position = 'absolute';
      slide.style.left = '0';
      slide.style.top = '0';
      slide.style.width = '100%';
      slide.style.transition = 'transform 0.3s ease-out';
      slide.style.transform = `translateX(${100 * index}%)`;
    });
  }

  createNavigationDots() {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'slider-dots';
    
    for (let i = 0; i < this.slideCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      
      dot.addEventListener('click', () => this.goToSlide(i));
      dotsContainer.appendChild(dot);
    }
    
    this.slider.appendChild(dotsContainer);
    this.dots = Array.from(dotsContainer.children);
  }

  initializeEvents() {
    // Touch events
    this.slider.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.isDragging = true;
    }, { passive: true });

    this.slider.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      
      this.touchMoveX = e.touches[0].clientX;
      const diff = this.touchStartX - this.touchMoveX;
      const offset = -diff;
      
      // Apply live transform during swipe
      this.slides.forEach((slide, index) => {
        const baseOffset = (index - this.currentSlide) * 100;
        slide.style.transform = `translateX(calc(${baseOffset}% + ${offset}px))`;
      });
    }, { passive: true });

    this.slider.addEventListener('touchend', () => {
      if (!this.isDragging) return;
      
      const diff = this.touchStartX - this.touchMoveX;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0 && this.currentSlide < this.slideCount - 1) {
          // Swipe left - next slide
          this.goToSlide(this.currentSlide + 1);
        } else if (diff < 0 && this.currentSlide > 0) {
          // Swipe right - previous slide
          this.goToSlide(this.currentSlide - 1);
        } else {
          // Bounce back if at the end
          this.updateSlidePositions();
        }
      } else {
        // Not enough distance, snap back
        this.updateSlidePositions();
      }
      
      this.isDragging = false;
    });
  }

  updateSlidePositions() {
    this.slides.forEach((slide, index) => {
      slide.style.transform = `translateX(${100 * (index - this.currentSlide)}%)`;
    });
  }

  goToSlide(index) {
    if (index < 0 || index >= this.slideCount) return;
    
    this.currentSlide = index;
    this.updateSlidePositions();
    
    // Update navigation dots
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }
}

// Initialize all product card sliders on the page
document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.product-card-media-slider');
  sliders.forEach(slider => new ProductCardSlider(slider));
});