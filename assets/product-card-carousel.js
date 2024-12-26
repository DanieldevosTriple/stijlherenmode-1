// product-card-carousel.js
(() => {
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
      
      // Initialize drag state
      this.isDragging = false;
      this.startX = 0;
      this.startY = 0;
      this.currentTranslate = 0;
      this.lastMoveX = 0;
      
      this.initialize();
    }

    initialize() {
      // Create dots
      this.createDots();
      
      // Only show navigation if multiple slides
      if (this.slideCount > 1) {
        this.prev.style.display = 'flex';
        this.next.style.display = 'flex';
        this.dotsContainer.style.display = 'flex';
        
        // Add navigation event listeners
        this.prev.addEventListener('click', () => this.prevSlide());
        this.next.addEventListener('click', () => this.nextSlide());
      } else {
        this.prev.style.display = 'none';
        this.next.style.display = 'none';
        this.dotsContainer.style.display = 'none';
      }
      
      // Touch events
      this.wrapper.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
      this.wrapper.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
      this.wrapper.addEventListener('touchend', () => this.handleTouchEnd());
      
      // Mouse events for click and drag
      this.wrapper.addEventListener('mousedown', (e) => this.handleMouseDown(e));
      document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      document.addEventListener('mouseup', () => this.handleMouseUp());
      
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
      this.isDragging = true;
      this.startX = clientX;
      this.startY = clientY;
      this.startTime = Date.now();
      this.currentTranslate = -this.currentIndex * 100;
      
      this.wrapper.style.transition = 'none';
      this.wrapper.style.cursor = 'grabbing';
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
      
      // Calculate new position
      const movePercent = (deltaX / this.slider.offsetWidth) * 100;
      const newTranslate = this.currentTranslate + movePercent;
      
      // Apply the transform with boundaries
      const maxTranslate = -((this.slideCount - 1) * 100);
      this.wrapper.style.transform = `translateX(${Math.max(Math.min(newTranslate, 0), maxTranslate)}%)`;
    }

    // Generic end handler for both mouse and touch
    handleDragEnd() {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      const timeElapsed = Date.now() - this.startTime;
      
      // Calculate swipe
      const deltaX = this.lastMoveX - this.startX;
      const velocity = Math.abs(deltaX) / timeElapsed;
      
      // Reset transition
      this.wrapper.style.transition = 'transform 0.3s ease-out';
      this.wrapper.style.cursor = 'grab';
      
      // Determine direction and if swipe was fast enough
      const threshold = 0.2; // Velocity threshold
      const minSwipeDistance = 50; // Minimum swipe distance in pixels
      
      if (Math.abs(deltaX) > minSwipeDistance || velocity > threshold) {
        if (deltaX > 0 && this.currentIndex > 0) {
          this.prevSlide();
        } else if (deltaX < 0 && this.currentIndex < this.slideCount - 1) {
          this.nextSlide();
        } else {
          this.goToSlide(this.currentIndex);
        }
      } else {
        this.goToSlide(this.currentIndex);
      }
    }

    // Touch event handlers
    handleTouchStart(e) {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleDragStart(touch.clientX, touch.clientY);
    }

    handleTouchMove(e) {
      e.preventDefault();
      const touch = e.touches[0];
      this.lastMoveX = touch.clientX;
      this.handleDragMove(touch.clientX, touch.clientY);
    }

    handleTouchEnd() {
      this.handleDragEnd();
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
      this.handleDragEnd();
    }
  }

  // Initialize all product card carousels
  function initializeCarousels() {
    const sliders = document.querySelectorAll('.product-card-media-slider');
    sliders.forEach(slider => new ProductCardCarousel(slider));
  }

  // Initialize on DOMContentLoaded and after Shopify section updates
  document.addEventListener('DOMContentLoaded', initializeCarousels);
  document.addEventListener('shopify:section:load', initializeCarousels);
})();