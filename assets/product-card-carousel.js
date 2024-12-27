(function() {
  let sliderInstances = []; // Array to store slider instances

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
      console.log('Initializing slider:', this.slider);
      
      // First, get all images that are actually loaded in the slides
      const validSlides = Array.from(this.slides).filter(slide => {
        const image = slide.querySelector('img.product-card-carousel-image');
        // Check if the image exists, has a source, and is loaded
        const isValid = image && 
                       image.src && 
                       image.src !== '' && 
                       image.complete &&
                       !image.src.includes('placeholder');
        
        console.log('Checking slide:', {
          slideElement: slide,
          hasImage: !!image,
          imageSrc: image?.src,
          isValid: isValid
        });
        return isValid;
      });
    
      console.log('Valid slides count:', validSlides.length);
    
      // Important: Store the valid slides count
      this.validSlidesCount = validSlides.length;
    
      // If there's only one valid slide or no slides
      if (this.validSlidesCount <= 1) {
        console.log('Single or no image detected - hiding navigation');
        
        // Hide slider navigation with !important
        const sliderNav = this.slider.querySelector('.slider-nav');
        if (sliderNav) {
          sliderNav.setAttribute('style', 'display: none !important');
        }
    
        // Hide individual elements
        if (this.dots) {
          this.dots.setAttribute('style', 'display: none !important');
        }
        if (this.prevButton) {
          this.prevButton.setAttribute('style', 'display: none !important');
          this.prevButton.disabled = true;
        }
        if (this.nextButton) {
          this.nextButton.setAttribute('style', 'display: none !important');
          this.nextButton.disabled = true;
        }
    
        // Remove event listeners
        if (this.prevButton) {
          this.prevButton.removeEventListener('click', this.goToPrevSlide);
        }
        if (this.nextButton) {
          this.nextButton.removeEventListener('click', this.goToNextSlide);
        }
    
        // Reset wrapper styles
        if (this.wrapper) {
          this.wrapper.style.transform = 'none';
        }
        return;
      }
    
      // Only continue with slider setup if we have multiple valid slides
      this.createDots();
      this.setupTouchEvents();
      this.setupDesktopNav();
    }
    
    destroy() {
      console.log('Destroying slider instance:', this.slider.id);
      
      // Store references to the bound event handlers
      this.prevClickHandler = () => this.goToPrevSlide();
      this.nextClickHandler = () => this.goToNextSlide();
      
      // Remove navigation event listeners
      if (this.prevButton) {
        this.prevButton.removeEventListener('click', this.prevClickHandler);
        this.prevButton.setAttribute('style', 'display: none !important');
        this.prevButton.disabled = true;
      }
      if (this.nextButton) {
        this.nextButton.removeEventListener('click', this.nextClickHandler);
        this.nextButton.setAttribute('style', 'display: none !important');
        this.nextButton.disabled = true;
      }
      
      // Remove touch event listeners
      if (this.wrapper) {
        this.wrapper.removeEventListener('touchstart', this.handleTouchStart);
        this.wrapper.removeEventListener('touchmove', this.handleTouchMove);
        this.wrapper.removeEventListener('touchend', this.handleTouchEnd);
        this.wrapper.removeEventListener('touchcancel', this.handleTouchEnd);
        
        // Reset wrapper styles
        this.wrapper.style.transform = '';
        this.wrapper.style.transition = '';
      }
      
      // Remove dots and their event listeners
      if (this.dots) {
        const dots = this.dots.querySelectorAll('.dot');
        dots.forEach(dot => {
          dot.removeEventListener('click', this.dotClickHandler);
        });
        this.dots.innerHTML = '';
        this.dots.setAttribute('style', 'display: none !important');
      }
    
      // Hide slider navigation
      const sliderNav = this.slider.querySelector('.slider-nav');
      if (sliderNav) {
        sliderNav.setAttribute('style', 'display: none !important');
      }
    
      // Reset instance variables
      this.currentSlide = 0;
      this.isDragging = false;
      this.startX = null;
      this.currentX = null;
    }

    createDots() {
      // Only create dots if we have multiple valid slides
      if (this.validSlidesCount <= 1) return;
      
      this.dots.innerHTML = '';
      for (let i = 0; i < this.validSlidesCount; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => this.goToSlide(i));
        this.dots.appendChild(dot);
      }
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
      if (this.prevButton && this.nextButton) {
        this.prevButton.style.display = 'flex';
        this.nextButton.style.display = 'flex';
        
        this.prevButton.addEventListener('click', () => this.goToPrevSlide());
        this.nextButton.addEventListener('click', () => this.goToNextSlide());
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

  // Modified initialization function
  function initSliders() {
    console.log('Initializing sliders...'); // Debug log
    
    // First, cleanup existing instances
    sliderInstances.forEach(instance => {
      instance.destroy();
    });
    sliderInstances = [];

    // Initialize new instances
    const sliders = document.querySelectorAll('.product-card-media-slider');
    console.log(`Found ${sliders.length} sliders`); // Debug log
    
    sliders.forEach(slider => {
      // Check if slider is fully loaded in DOM
      const images = slider.querySelectorAll('img');
      const areImagesLoaded = Array.from(images).every(img => img.complete);
      
      if (areImagesLoaded) {
        const instance = new Slider(slider);
        sliderInstances.push(instance);
      } else {
        // Wait for images to load
        Promise.all(Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })).then(() => {
          const instance = new Slider(slider);
          sliderInstances.push(instance);
        });
      }
    });
  }

  // Initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSliders);
  } else {
    initSliders();
  }

// Handle faceted navigation updates
document.addEventListener('facets:updated', () => {
  // First destroy all existing instances
  sliderInstances.forEach(instance => {
    instance.destroy();
  });
  sliderInstances = [];

  // Wait for DOM to be fully updated
  setTimeout(() => {
    console.log('Running slider initialization after facet update');
    // Get only sliders from the newly rendered products
    const newSliders = document.querySelectorAll('.product-card-media-slider');
    console.log(`Found ${newSliders.length} new sliders after facet update`);
    
    newSliders.forEach(slider => {
      // Check if slider is fully loaded in DOM
      const images = slider.querySelectorAll('img.product-card-carousel-image');
      const areImagesLoaded = Array.from(images).every(img => img.complete);
      
      if (areImagesLoaded) {
        const instance = new Slider(slider);
        sliderInstances.push(instance);
      } else {
        // Wait for images to load
        Promise.all(Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })).then(() => {
          const instance = new Slider(slider);
          sliderInstances.push(instance);
        });
      }
    });
  }, 200); // Slightly longer delay to ensure old content is removed
});
})();