class ProductCardCarousel {
  constructor(element) {
    this.carousel = element;
    this.container = element.querySelector('.product-card-carousel-container');
    this.slides = Array.from(element.querySelectorAll('.product-card-carousel-slide'));
    
    if (this.slides.length <= 1) return;
    
    this.currentSlide = 0;
    this.touchStartX = 0;
    this.touchEndX = 0;
    
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
    
    // Touch events
    this.container.addEventListener('touchstart', e => {
      this.touchStartX = e.touches[0].clientX;
    });
    
    this.container.addEventListener('touchmove', e => {
      if (!this.touchStartX) return;
      
      e.preventDefault();
      const currentX = e.touches[0].clientX;
      const diff = this.touchStartX - currentX;
      const transform = -this.currentSlide * 100 - (diff / this.carousel.offsetWidth * 100);
      this.container.style.transform = `translateX(${transform}%)`;
    });
    
    this.container.addEventListener('touchend', e => {
      this.touchEndX = e.changedTouches[0].clientX;
      const diff = this.touchStartX - this.touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) this.nextSlide();
        else this.prevSlide();
      } else {
        this.goToSlide(this.currentSlide);
      }
      
      this.touchStartX = null;
      this.touchEndX = null;
    });
  }

  goToSlide(index) {
    this.currentSlide = index;
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