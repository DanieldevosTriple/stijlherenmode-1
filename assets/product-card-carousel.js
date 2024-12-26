(function() {
  if (window.sliderInitialized) {
    console.log('Sliders already initialized, removing old listeners...');
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

  document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.product-card-media-slider');
    const isMobile = window.innerWidth <= 768;
    
    sliders.forEach(function(slider, sliderIndex) {
      const sliderId = slider.id || `slider-${sliderIndex}`;
      slider.id = sliderId;
      
      const wrapper = slider.querySelector('.slider-wrapper');
      const slides = slider.querySelectorAll('.slide');
      const dots = slider.querySelector('.dots');
      
      // State variables
      let currentSlide = 0;
      let startX = 0;
      let isDragging = false;
      let initialPosition = 0;
      let currentTranslate = 0;
      
      if (slides.length > 1) {
        console.log(`[${sliderId}] Init with ${slides.length} slides`);
        
        if (isMobile) {
          slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dot.id = `${sliderId}-dot-${index}`;
            if (index === 0) dot.classList.add('active');
            dots.appendChild(dot);
          });
        }

        // Add event listeners
        wrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
        wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
        wrapper.addEventListener('touchend', handleTouchEnd);
        wrapper.addEventListener('touchcancel', handleTouchEnd);
      }

      function handleTouchStart(event) {
        event.preventDefault();
        startX = event.touches[0].clientX;
        isDragging = true;
        initialPosition = currentSlide * -100;
        currentTranslate = initialPosition;
        wrapper.style.transition = 'none';
        
        console.log(`[${sliderId}] Touch Start - Slide: ${currentSlide}, isDragging: ${isDragging}`);
      }

      function handleTouchMove(event) {
        if (!isDragging) {
          console.log(`[${sliderId}] Touch Move ignored - not dragging`);
          return;
        }
        
        event.preventDefault();
        const currentX = event.touches[0].clientX;
        const diff = currentX - startX;
        const movePercent = (diff / wrapper.offsetWidth) * 100;
        currentTranslate = initialPosition + movePercent;
        
        // Add resistance at edges
        if (currentTranslate > 0) {
          currentTranslate = currentTranslate * 0.3;
        } else if (currentTranslate < -((slides.length - 1) * 100)) {
          const overScroll = currentTranslate + ((slides.length - 1) * 100);
          currentTranslate = -((slides.length - 1) * 100) + (overScroll * 0.3);
        }
        
        wrapper.style.transform = `translateX(${currentTranslate}%)`;
      }

      function handleTouchEnd(event) {
        if (!isDragging) {
          console.log(`[${sliderId}] Touch End ignored - not dragging`);
          return;
        }
        
        isDragging = false;
        wrapper.style.transition = 'transform 0.3s ease';
        
        const movePercent = currentTranslate - initialPosition;
        console.log(`[${sliderId}] Touch End - Move: ${movePercent.toFixed(2)}%`);
        
        if (Math.abs(movePercent) > 20) {
          if (movePercent > 0 && currentSlide > 0) {
            currentSlide--;
            console.log(`[${sliderId}] Moving to previous: ${currentSlide}`);
          } else if (movePercent < 0 && currentSlide < slides.length - 1) {
            currentSlide++;
            console.log(`[${sliderId}] Moving to next: ${currentSlide}`);
          }
        }
        
        goToSlide(currentSlide);
        
        // Complete reset of variables
        setTimeout(() => {
          startX = 0;
          currentTranslate = -currentSlide * 100;
          initialPosition = currentTranslate;
          wrapper.style.transition = 'none';
          console.log(`[${sliderId}] Reset complete - Ready for next slide`);
        }, 300); // Same as transition duration
      }

      function goToSlide(index) {
        currentSlide = index;
        const translate = -index * 100;
        wrapper.style.transform = `translateX(${translate}%)`;
        
        if (isMobile) {
          updateDots(index);
        }
        
        console.log(`[${sliderId}] At slide: ${index}`);
      }

      function updateDots(index) {
        const allDots = dots.querySelectorAll('.dot');
        allDots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      }
    });
  });
})();