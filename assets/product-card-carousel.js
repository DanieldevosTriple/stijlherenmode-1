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
    this.touchStartY = e.touches[0].clientY;
    this.touchStartTime = Date.now();
    this.isDragging = true;
    this.currentTranslate = -this.currentIndex * 100;
    
    // Prevent default only if we're starting a horizontal swipe
    e.preventDefault();
    
    // Add transition class for smooth movement
    this.wrapper.style.transition = 'none';
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    // Calculate distance moved
    const deltaX = currentX - this.touchStartX;
    const deltaY = currentY - this.touchStartY;
    
    // If vertical scrolling is dominant, stop handling the swipe
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      this.isDragging = false;
      return;
    }
    
    // Calculate new position
    const movePercent = (deltaX / this.slider.offsetWidth) * 100;
    const newTranslate = this.currentTranslate + movePercent;
    
    // Apply the transform with boundaries
    this.wrapper.style.transform = `translateX(${Math.max(Math.min(newTranslate, 0), -((this.slideCount - 1) * 100))}%)`;
  }

  handleTouchEnd() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    const touchEndTime = Date.now();
    const timeElapsed = touchEndTime - this.touchStartTime;
    
    // Calculate swipe velocity
    const deltaX = this.touchEndX - this.touchStartX;
    const velocity = Math.abs(deltaX) / timeElapsed;
    
    // Reset transition
    this.wrapper.style.transition = 'transform 0.3s ease-out';
    
    // Determine direction and if swipe was fast enough
    const threshold = 0.2; // Velocity threshold
    const minSwipeDistance = 50; // Minimum swipe distance in pixels
    
    if (Math.abs(deltaX) > minSwipeDistance || velocity > threshold) {
      if (deltaX > 0 && this.currentIndex > 0) {
        this.prevSlide();
      } else if (deltaX < 0 && this.currentIndex < this.slideCount - 1) {
        this.nextSlide();
      } else {
        // Snap back to current slide if at the end
        this.goToSlide(this.currentIndex);
      }
    } else {
      // Not enough movement or velocity, snap back
      this.goToSlide(this.currentIndex);
    }
  }
}

// Initialize all product card carousels
document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.product-card-media-slider');
  sliders.forEach(slider => new ProductCardCarousel(slider));
});