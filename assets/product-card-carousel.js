(function() {
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
      this.init();
    }

    init() {
      if (this.slides.length <= 1) return;

      // Create dots
      this.createDots();
      
      // Setup touch events
      this.setupTouchEvents();
      
      // Setup desktop navigation
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
      let isDragging = false;
      
      const handleTouchStart = (e) => {
        console.log("Touch Start", e.touches[0].clientX); // Log the touch start position
        isDragging = true;
        this.startX = e.touches[0].clientX;
        this.currentX = this.startX;
        this.wrapper.style.transition = 'none';
      };

      const handleTouchMove = (e) => {
        if (!isDragging) return;

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
        
        console.log("Touch Move", actualTranslate); // Log the translated position during move
        this.wrapper.style.transform = `translateX(${actualTranslate}%)`;
      };

      const handleTouchEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        
        console.log("Touch End"); // Log when touch ends
        
        if (this.startX === this.currentX) {
          console.log("No movement detected"); // Log if there was no movement
          return;
        }

        const diff = this.currentX - this.startX;
        const threshold = this.slideWidth * 0.2;
        this.wrapper.style.transition = 'transform 0.3s ease';

        if (Math.abs(diff) > threshold) {
          if (diff > 0) {
            console.log("Swiped Right");
            this.goToPrevSlide();
          } else {
            console.log("Swiped Left");
            this.goToNextSlide();
          }
        } else {
          console.log("No threshold crossed, stay on current slide");
          this.goToSlide(this.currentSlide);
        }

        // Reset after transition
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
      if (this.prevButton && this.nextButton) {
        this.prevButton.style.display = 'flex';
        this.nextButton.style.display = 'flex';
        
        this.prevButton.addEventListener('click', () => this.goToPrevSlide());
        this.nextButton.addEventListener('click', () => this.goToNextSlide());
      }
    }

    goToSlide(index) {
      console.log("Go to slide", index); // Log slide change
      this.currentSlide = index;
      this.wrapper.style.transform = `translateX(${-this.currentSlide * this.slideWidth}%)`;
      this.updateDots();
    }

    goToNextSlide() {
      console.log("Go to next slide"); // Log next slide
      if (this.currentSlide >= this.slides.length - 1) {
        // Loop back to first slide
        this.currentSlide = 0;
      } else {
        this.currentSlide++;
      }
      this.goToSlide(this.currentSlide);
    }

    goToPrevSlide() {
      console.log("Go to previous slide"); // Log previous slide
      if (this.currentSlide <= 0) {
        // Loop to last slide
        this.currentSlide = this.slides.length - 1;
      } else {
        this.currentSlide--;
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

  // Initialize sliders and handle faceted filtering
  function initSliders() {
    document.querySelectorAll('.product-card-media-slider').forEach(slider => new Slider(slider));
  }

  // Initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSliders);
  } else {
    initSliders();
  }

  // Handle faceted navigation updates
  document.addEventListener('facets:updated', () => {
    // Re-initialize sliders after facet update
    initSliders();
  });
})();
