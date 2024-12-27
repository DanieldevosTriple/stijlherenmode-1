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
      this.startX = null;
      this.currentX = null;
      this.minSwipeDistance = 30; // Minimum distance to consider it a swipe
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
        
        // Hide the entire slider navigation
        const sliderNav = this.slider.querySelector('.slider-nav');
        if (sliderNav) {
          sliderNav.style.display = 'none';
        }
    
        // Also hide individual elements as fallback
        if (this.dots) {
          this.dots.style.display = 'none';
          this.dots.innerHTML = '';
        }
        if (this.prevButton) {
          this.prevButton.style.display = 'none';
        }
        if (this.nextButton) {
          this.nextButton.style.display = 'none';
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

    destroy() {
      // Remove event listeners
      if (this.prevButton) {
        this.prevButton.removeEventListener('click', () => this.goToPrevSlide());
      }
      if (this.nextButton) {
        this.nextButton.removeEventListener('click', () => this.goToNextSlide());
      }
      // Reset styles
      if (this.wrapper) {
        this.wrapper.style.transform = '';
        this.wrapper.style.transition = '';
      }
      // Clear dots
      if (this.dots) {
        this.dots.innerHTML = '';
      }
    }

    setupTouchEvents() {
      const handleTouchStart = (e) => {
        // Store the initial touch position
        this.startX = e.touches[0].clientX;
        this.currentX = this.startX;
        this.isDragging = false; // Don't set dragging true immediately
        this.wrapper.style.transition = 'none';
      };

      const handleTouchMove = (e) => {
        if (this.startX === null) return;
        
        this.currentX = e.touches[0].clientX;
        const diffX = Math.abs(this.currentX - this.startX);
        
        // Only start dragging if we've moved more than the minimum distance
        if (diffX > this.minSwipeDistance) {
          this.isDragging = true;
          e.preventDefault(); // Prevent scrolling once we're swiping
          
          const translateX = (this.currentX - this.startX) - (this.currentSlide * this.slideWidth);
          
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
        }
      };

      const handleTouchEnd = (e) => {
        if (this.startX === null) return;
        
        const diffX = this.currentX - this.startX;
        
        // Only handle as a swipe if we were actually dragging
        if (this.isDragging) {
          const threshold = this.slideWidth * 0.2;
          this.wrapper.style.transition = 'transform 0.3s ease';
          
          if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
              this.goToPrevSlide();
            } else {
              this.goToNextSlide();
            }
          } else {
            this.goToSlide(this.currentSlide);
          }
          
          // Prevent the click if we were dragging
          e.preventDefault();
          e.stopPropagation();
        }
        
        // Reset everything
        this.isDragging = false;
        this.startX = null;
        this.currentX = null;
        
        // Reset transition after the swipe
        setTimeout(() => {
          this.wrapper.style.transition = '';
        }, 300);
      };

      this.wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
      this.wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
      this.wrapper.addEventListener('touchend', handleTouchEnd);
      this.wrapper.addEventListener('touchcancel', handleTouchEnd);

      // Add click handler for links
      this.slides.forEach(slide => {
        const link = slide.querySelector('a');
        if (link) {
          link.addEventListener('click', (e) => {
            // Only prevent the click if we were dragging
            if (this.isDragging) {
              e.preventDefault();
            }
          });
        }
      });
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
      // Process each slider independently
      const images = Array.from(slider.querySelectorAll('img.product-card-carousel-image'));
      
      if (images.length === 0) {
        console.log('No images found in slider:', slider);
        return;
      }

      // Check if all images in this slider are already loaded
      if (images.every(img => img.complete && img.naturalWidth > 0)) {
        const instance = new Slider(slider);
        sliderInstances.push(instance);
        console.log('Slider initialized immediately:', slider);
      } else {
        // Wait for just this slider's images
        Promise.all(
          images.map(img => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve();
            return new Promise(resolve => {
              const handleLoad = () => {
                img.removeEventListener('load', handleLoad);
                img.removeEventListener('error', handleLoad);
                resolve();
              };
              img.addEventListener('load', handleLoad);
              img.addEventListener('error', handleLoad);
              
              // Force load if it's a lazy image
              if (img.loading === 'lazy') {
                img.loading = 'eager';
              }
            });
          })
        ).then(() => {
          const instance = new Slider(slider);
          sliderInstances.push(instance);
          console.log('Slider initialized after loading:', slider);
        });
      }
    });
  }

  // Initialize sliders progressively after grid updates
  document.addEventListener('product-grid:updated', () => {
    console.log('Product grid updated - initializing sliders progressively');
    
    // Small delay to ensure initial DOM is updated
    setTimeout(() => {
      initSliders();
    }, 50);
  });

  // Also handle initial page load
  document.addEventListener('DOMContentLoaded', () => {
    // Trigger the same initialization process
    document.dispatchEvent(new CustomEvent('product-grid:updated'));
  });

})();