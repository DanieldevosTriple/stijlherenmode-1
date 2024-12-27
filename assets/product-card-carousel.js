// slider.js

class Slider {
  constructor(element) {
    this.slider = element;
    this.wrapper = element.querySelector('.slider-wrapper');
    this.slides = element.querySelectorAll('.slide');
    this.dots = element.querySelector('.dots');
    this.prevButton = element.querySelector('.prev');
    this.nextButton = element.querySelector('.next');
    this.currentSlide = 0;
    this.slideWidth = 100;
    this.isDragging = false;
    this.init();
  }

  init() {
    if (this.slides.length <= 1) {
      // Hide dots and navigation if there is 1 or fewer slides
      if (this.dots) this.dots.style.display = 'none';
      if (this.prevButton) this.prevButton.style.display = 'none';
      if (this.nextButton) this.nextButton.style.display = 'none';
      return;
    }

    // Create dots and setup navigation only if there are more than 1 slide
    this.createDots();
    this.setupTouchEvents();
    this.setupDesktopNav();
  }

  createDots() {
    this.dots.innerHTML = '';
    this.slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => this.goToSlide(index));
      this.dots.appendChild(dot);
    });
  }

  setupTouchEvents() {
    const handleTouchStart = (e) => {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.currentX = this.startX;
      this.wrapper.style.transition = 'none';
    };

    const handleTouchMove = (e) => {
      if (!this.isDragging) return;

      this.currentX = e.touches[0].clientX;
      const diffX = this.currentX - this.startX;
      const translateX = diffX - (this.currentSlide * this.slideWidth);
      
      // Add resistance at edges
      let actualTranslate = translateX;
      const maxTranslate = this.slideWidth * (this.slides.length - 1);

      if (translateX > 0) {
        actualTranslate = translateX * 0.3;
      } else if (Math.abs(translateX) > maxTranslate) {
        const overScroll = Math.abs(translateX) - maxTranslate;
        actualTranslate = -maxTranslate + (overScroll * 0.3);
      }

      this.wrapper.style.transform = `translateX(${actualTranslate}%)`;
    };

    const handleTouchEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      
      if (this.startX === this.currentX) {
        return;
      }

      const diff = this.currentX - this.startX;
      const threshold = this.slideWidth * 0.2;
      this.wrapper.style.transition = 'transform 0.3s ease';

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.goToPrevSlide();
        } else {
          this.goToNextSlide();
        }
      } else {
        this.goToSlide(this.currentSlide);
      }

      // Reset transition after the swipe
      setTimeout(() => {
        this.wrapper.style.transition = '';
        this.startX = null;
        this.currentX = null;
      }, 300);
    };

    this.wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
    this.wrapper.addEventListener('touchmove', handleTouchMove, { passive: true });
    this.wrapper.addEventListener('touchend', handleTouchEnd);
    this.wrapper.addEventListener('touchcancel', handleTouchEnd);
  }

  setupDesktopNav() {
    if (this.slides.length > 1) {
      if (this.prevButton && this.nextButton) {
        this.prevButton.style.display = 'flex';
        this.nextButton.style.display = 'flex';
        
        this.prevButton.addEventListener('click', () => this.goToPrevSlide());
        this.nextButton.addEventListener('click', () => this.goToNextSlide());
      }
    }
  }

  goToSlide(index) {
    // Loop over if necessary
    if (index < 0) index = this.slides.length - 1;
    if (index >= this.slides.length) index = 0;

    // Update the current slide and move
    this.currentSlide = index;
    this.wrapper.style.transition = 'transform 0.3s ease';
    this.wrapper.style.transform = `translateX(${-this.currentSlide * this.slideWidth}%)`;
    this.updateDots();
  }

  goToNextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
    } else {
      this.currentSlide = 0;
    }
    this.goToSlide(this.currentSlide);
  }

  goToPrevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    } else {
      this.currentSlide = this.slides.length - 1;
    }
    this.goToSlide(this.currentSlide);
  }

  updateDots() {
    const dots = this.dots.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentSlide);
    });
  }
}

// Re-initialize all sliders after filtering and sorting
function reinitializeSliders() {
  document.querySelectorAll('.product-card-media-slider').forEach(slider => new Slider(slider));
}
