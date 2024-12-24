class ProductCardCarousel {
  constructor(element) {
    this.carousel = element;
    this.container = element.querySelector('.product-card-carousel-container');
    this.slides = Array.from(element.querySelectorAll('.product-card-carousel-slide'));
    
    if (this.slides.length <= 1) return;
    
    this.currentSlide = 0;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isDragging = false;
    
    this.container.style.transform = 'translateX(0)';
    
    this.setupControls();
    this.setupEventListeners();
  }

  setupControls() {
    // Add arrows
    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-arrow carousel-arrow-prev';
    prevButton.innerHTML = '←';
    
    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-arrow carousel-arrow-next';
    nextButton.innerHTML = '→';
    
    // Add dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    
    this.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => this.goToSlide(index));
      dotsContainer.appendChild(dot);
    });
    
    this.carousel.appendChild(prevButton);
    this.carousel.appendChild(nextButton);
    this.carousel.appendChild(dotsContainer);
    
    this.dots = dotsContainer.querySelectorAll('.carousel-dot');
  }

  setupEventListeners() {
    // Arrow navigation
    this.carousel.querySelector('.carousel-arrow-prev')
      .addEventListener('click', () => this.prevSlide());
    this.carousel.querySelector('.carousel-arrow-next')
      .addEventListener('click', () => this.nextSlide());
    
    // Mouse and Touch events
    const startDrag = (e) => {
      if (e.type === 'mousedown' && e.button !== 0) return;
      this.touchStartX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
      this.isDragging = true;
      this.container.style.transition = 'none';
    };
    
    const onDrag = (e) => {
      if (!this.touchStartX || !this.isDragging) return;
      
      e.preventDefault();
      const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
      const diff = this.touchStartX - currentX;
      const transform = -this.currentSlide * 100 - (diff / this.carousel.offsetWidth * 100);
      this.container.style.transform = `translateX(${transform}%)`;
    };
    
    const endDrag = (e) => {
      if (!this.isDragging) return;
      
      this.touchEndX = e.type === 'mouseup' ? e.clientX : (e.changedTouches ? e.changedTouches[0].clientX : this.touchStartX);
      const diff = this.touchStartX - this.touchEndX;
      
      this.container.style.transition = 'transform 0.3s ease-in-out';
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) this.nextSlide();
        else this.prevSlide();
      } else {
        this.goToSlide(this.currentSlide);
      }
      
      this.touchStartX = null;
      this.touchEndX = null;
      this.isDragging = false;
    };

    // Add mouse and touch event listeners
    this.container.addEventListener('mousedown', startDrag);
    this.container.addEventListener('mousemove', onDrag);
    this.container.addEventListener('mouseup', endDrag);
    this.container.addEventListener('mouseleave', endDrag);
    
    this.container.addEventListener('touchstart', startDrag);
    this.container.addEventListener('touchmove', onDrag);
    this.container.addEventListener('touchend', endDrag);
  }

  goToSlide(index) {
    this.currentSlide = index;
    this.container.style.transition = 'transform 0.3s ease-in-out';
    this.container.style.transform = `translateX(-${index * 100}%)`;
    
    // Update dots
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  nextSlide() {
    const next = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(next);
  }

  prevSlide() {
    const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prev);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.product-card-carousel').forEach(carousel => {
    new ProductCardCarousel(carousel);
  });
});