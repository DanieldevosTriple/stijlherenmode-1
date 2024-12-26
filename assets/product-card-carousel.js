class ProductCardSlider {
  constructor(element) {
    this.slider = element;
    this.slides = Array.from(this.slider.querySelectorAll('.slide'));
    this.currentSlide = 0;
    this.slideCount = this.slides.length;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isDragging = false;

    // Add navigation dots
    this.createNavigationDots();
    
    // Bind event handlers
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    
    // Initialize touch events
    this.initializeEvents();
  }

  createNavigationDots() {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'slider-dots';
    
    for (let i = 0; i < this.slideCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === 0) {
        dot.classList.add('active');
      }
      
      dot.addEventListener('click', () => {
        this.goToSlide(i);
      });
      
      dotsContainer.appendChild(dot);
    }
    
    this.slider.appendChild(dotsContainer);
    this.dots = Array.from(dotsContainer.children);
  }

  initializeEvents() {
    // Touch events
    this.slider.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.slider.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    this.slider.addEventListener('touchend', this.handleTouchEnd);
    
    // Mouse events for desktop
    this.slider.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.touchStartX = e.clientX;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.touchEndX = e.clientX;
      const diff = this.touchStartX - this.touchEndX;
      this.handleSlideMove(diff);
    });
    
    document.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.handleSlideEnd();
    });
  }

  handleTouchStart(event) {
    this.touchStartX = event.touches[0].clientX;
  }

  handleTouchMove(event) {
    this.touchEndX = event.touches[0].clientX;
    const diff = this.touchStartX - this.touchEndX;
    this.handleSlideMove(diff);
  }

  handleTouchEnd() {
    this.handleSlideEnd();
  }

  handleSlideMove(diff) {
    // Prevent default only if swiping
    if (Math.abs(diff) > 5) {
      event.preventDefault();
    }
  }

  handleSlideEnd() {
    const diff = this.touchStartX - this.touchEndX;
    
    // Minimum distance for swipe
    if (Math.abs(diff) > 50) {
      if (diff > 0 && this.currentSlide < this.slideCount - 1) {
        // Swipe left
        this.goToSlide(this.currentSlide + 1);
      } else if (diff < 0 && this.currentSlide > 0) {
        // Swipe right
        this.goToSlide(this.currentSlide - 1);
      } else {
        // Bounce back if at the end
        this.goToSlide(this.currentSlide);
      }
    } else {
      // Not enough distance, snap back
      this.goToSlide(this.currentSlide);
    }
  }

  goToSlide(index) {
    // Update current slide
    this.currentSlide = index;
    
    // Update slides visibility
    this.slides.forEach((slide, i) => {
      slide.style.transform = `translateX(${100 * (i - index)}%)`;
      slide.style.transition = 'transform 0.3s ease-out';
    });
    
    // Update dots
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