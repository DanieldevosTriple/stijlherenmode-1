class ProductCardCarousel {
  constructor(element) {
    this.slider = element;
    this.wrapper = element.querySelector('.slider-wrapper');
    this.slides = element.querySelectorAll('.slide');
    this.prev = element.querySelector('.prev');
    this.next = element.querySelector('.next');
    this.dotsContainer = element.querySelector('.dots');
    
    this.currentIndex = 0;
    this.slideCount = this.slides.length;
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    this.initialize();
  }

  initialize() {
    // Create dots
    this.createDots();
    
    // Add event listeners
    this.prev.addEventListener('click', () => this.prevSlide());
    this.next.addEventListener('click', () => this.nextSlide());
    
    // Touch events
    this.wrapper.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.wrapper.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.wrapper.addEventListener('touchend', () => this.handleTouchEnd());
    
    // Update active dot
    this.updateDots();
  }

  createDots() {
    for (let i = 0; i < this.slideCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      dot.addEventListener('click', () => this.goToSlide(i));
      this.dotsContainer.appendChild(dot);
    }
  }

  updateDots() {
    const dots = this.dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  goToSlide(index) {
    this.currentIndex = index;
    this.wrapper.style.transform = `translateX(-${index * 100}%)`;
    this.updateDots();
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.slideCount) % this.slideCount;
    this.goToSlide(this.currentIndex);
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slideCount;
    this.goToSlide(this.currentIndex);
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
  }

  handleTouchMove(e) {
    this.touchEndX = e.touches[0].clientX;
  }

  handleTouchEnd() {
    const diff = this.touchStartX - this.touchEndX;
    const threshold = 50; // minimum distance for swipe

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }
}

// Initialize all product card carousels
document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.product-card-media-slider');
  sliders.forEach(slider => new ProductCardCarousel(slider));
});