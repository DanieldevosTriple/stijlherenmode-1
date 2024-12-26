(function() {
  if (window.sliderInitialized) {
    document.querySelectorAll('.product-card-media-slider').forEach(slider => {
      const oldWrapper = slider.querySelector('.slider-wrapper');
      if (oldWrapper) {
        const newWrapper = oldWrapper.cloneNode(true);
        oldWrapper.parentNode.replaceChild(newWrapper, oldWrapper);
      }
    });
    return;
  }
  
  window.sliderInitialized = true;

  function initSliders() {
    const sliders = document.querySelectorAll('.product-card-media-slider');
    const isMobile = window.innerWidth <= 768;
    
    sliders.forEach(function(slider) {
      const sliderId = slider.id;
      const wrapper = slider.querySelector('.slider-wrapper');
      const slides = slider.querySelectorAll('.slide');
      const dots = slider.querySelector('.dots');
      
      // State variables
      let currentSlide = 0;
      let startX = 0;
      let isDragging = false;
      let initialPosition = 0;
      let currentTranslate = 0;
      let isTransitioning = false;
      
      if (slides.length <= 1) return;

      // Mobile dot indicators
      if (isMobile) {
        slides.forEach((_, index) => {
          const dot = document.createElement('div');
          dot.classList.add('dot');
          if (index === 0) dot.classList.add('active');
          dots.appendChild(dot);
        });
      }

      function handleTouchStart(event) {
        if (isTransitioning) {
          console.log(`[${sliderId}] Touch ignored - still transitioning`);
          return;
        }

        event.preventDefault();
        startX = event.touches[0].clientX;
        isDragging = true;
        initialPosition = currentSlide * -100;
        currentTranslate = initialPosition;
        wrapper.style.transition = 'none';
        
        console.log(`[${sliderId}] Touch Start:`, {
          currentSlide,
          isDragging,
          initialPosition,
          startX
        });
      }

      function handleTouchMove(event) {
        if (!isDragging || isTransitioning) return;
        
        event.preventDefault();
        const currentX = event.touches[0].clientX;
        const diff = currentX - startX;
        const movePercent = (diff / wrapper.offsetWidth) * 100;
        currentTranslate = initialPosition + movePercent;
        
        // Edge resistance
        if (currentTranslate > 0) {
          currentTranslate *= 0.3;
        } else if (currentTranslate < -((slides.length - 1) * 100)) {
          const overScroll = currentTranslate + ((slides.length - 1) * 100);
          currentTranslate = -((slides.length - 1) * 100) + (overScroll * 0.3);
        }
        
        wrapper.style.transform = `translateX(${currentTranslate}%)`;
      }

      function handleTouchEnd() {
        if (!isDragging || isTransitioning) return;
        
        isDragging = false;
        isTransitioning = true;
        wrapper.style.transition = 'transform 0.3s ease';
        
        const movePercent = currentTranslate - initialPosition;
        
        console.log(`[${sliderId}] Touch End:`, {
          movePercent,
          currentSlide,
          currentTranslate
        });
        
        if (Math.abs(movePercent) > 20) {
          if (movePercent > 0 && currentSlide > 0) {
            currentSlide--;
          } else if (movePercent < 0 && currentSlide < slides.length - 1) {
            currentSlide++;
          }
        }
        
        goToSlide(currentSlide);
        
        // Reset after transition
        setTimeout(() => {
          isTransitioning = false;
          isDragging = false;
          startX = 0;
          currentTranslate = -currentSlide * 100;
          initialPosition = currentTranslate;
          wrapper.style.transition = 'none';
          
          console.log(`[${sliderId}] Reset Complete:`, {
            currentSlide,
            isDragging,
            isTransitioning,
            currentTranslate
          });
        }, 300);
      }

      function goToSlide(index) {
        currentSlide = index;
        const translate = -index * 100;
        wrapper.style.transform = `translateX(${translate}%)`;
        
        if (isMobile) {
          updateDots(index);
        }
      }

      function updateDots(index) {
        const allDots = dots.querySelectorAll('.dot');
        allDots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      }

      // Event Listeners
      wrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
      wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
      wrapper.addEventListener('touchend', handleTouchEnd);
      wrapper.addEventListener('touchcancel', handleTouchEnd);

      // Initialize
      console.log(`[${sliderId}] Initialized with ${slides.length} slides`);
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSliders);
  } else {
    initSliders();
  }
})();