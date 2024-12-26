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
    
    // Only show navigation if multiple slides
    if (this.slideCount > 1) {
      this.prev.style.display = 'flex';
      this.next.style.display = 'flex';
      
      // Add navigation event listeners
      this.prev.addEventListener('click', () => this.prevSlide());
      this.next.addEventListener('click', () => this.nextSlide());
    } else {
      this.prev.style.display = 'none';
      this.next.style.display = 'none';
    }
    
    // Touch events
    this.wrapper.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.wrapper.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.wrapper.addEventListener('touchend', () => this.handleTouchEnd());
    
    // Mouse events for click and drag
    this.wrapper.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.wrapper.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.wrapper.addEventListener('mouseup', () => this.handleMouseUp());
    this.wrapper.addEventListener('mouseleave', () => this.handleMouseUp());
    
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

  // Generic start handler for both mouse and touch
  handleDragStart(clientX, clientY) {
    this.startX = clientX;
    this.startY = clientY;
    this.startTime = Date.now();
    this.isDragging = true;
    this.currentTranslate = -this.currentIndex * 100;
    
    // Remove transition for immediate response
    this.wrapper.style.transition = 'none';
  }

  // Generic move handler for both mouse and touch
  handleDragMove(clientX, clientY) {
    if (!this.isDragging) return;
    
    const deltaX = clientX - this.startX;
    const deltaY = clientY - this.startY;
    
    // If vertical scrolling is dominant, stop handling the swipe
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      this.isDragging = false;
      return;
    }
    
    // Prevent page scrolling while dragging
    event.preventDefault();
    
    // Calculate new position
    const movePercent = (deltaX / this.slider.offsetWidth) * 100;
    const newTranslate = this.currentTranslate + movePercent;
    
    // Apply the transform with boundaries
    this.wrapper.style.transform = `translateX(${Math.max(Math.min(newTranslate, 0), -((this.slideCount - 1) * 100))}%)`;
  }

  // Generic end handler for both mouse and touch
  handleDragEnd(endX) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    const timeElapsed = Date.now() - this.startTime;
    
    // Calculate swipe velocity
    const deltaX = endX - this.startX;
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

  // Touch event handlers
  handleTouchStart(e) {
    this.handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  }

  handleTouchMove(e) {
    this.handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
  }

  handleTouchEnd() {
    this.handleDragEnd(this.lastMoveX);
  }

  // Mouse event handlers
  handleMouseDown(e) {
    e.preventDefault();
    this.handleDragStart(e.clientX, e.clientY);
  }

  handleMouseMove(e) {
    this.lastMoveX = e.clientX;
    this.handleDragMove(e.clientX, e.clientY);
  }

  handleMouseUp() {
    this.handleDragEnd(this.lastMoveX);
  }
}

// Initialize all product card carousels
document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.product-card-media-slider');
  sliders.forEach(slider => new ProductCardCarousel(slider));
});