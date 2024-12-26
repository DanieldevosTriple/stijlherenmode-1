document.addEventListener('DOMContentLoaded', function() {
  const sliders = document.querySelectorAll('.product-card-media-slider');
  
  sliders.forEach(function(slider, sliderIndex) {
    // Get slider ID from DOM or create one
    const sliderId = slider.id || `slider-${sliderIndex}`;
    slider.id = sliderId;
    
    const wrapper = slider.querySelector('.slider-wrapper');
    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelector('.dots');
    
    // Give each slide a unique ID
    slides.forEach((slide, slideIndex) => {
      slide.id = `${sliderId}-slide-${slideIndex}`;
    });
    
    let currentSlide = 0;
    let startX = 0;
    let isDragging = false;
    let initialPosition = 0;
    let currentTranslate = 0;
    
    if (slides.length > 1) {
      console.log(`[${sliderId}] Initializing slider with ${slides.length} slides`);
      
      slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.id = `${sliderId}-dot-${index}`;
        if (index === 0) dot.classList.add('active');
        dots.appendChild(dot);
      });

      wrapper.addEventListener('touchstart', handleTouchStart);
      wrapper.addEventListener('touchmove', handleTouchMove);
      wrapper.addEventListener('touchend', handleTouchEnd);
      
      console.log(`[${sliderId}] Event listeners attached`);
    }

    function handleTouchStart(event) {
      console.log(`[${sliderId}] Touch Start:`, {
        slideId: `${sliderId}-slide-${currentSlide}`,
        clientX: event.touches[0].clientX,
        isDragging: isDragging,
        currentSlide: currentSlide
      });
      
      startX = event.touches[0].clientX;
      isDragging = true;
      initialPosition = currentSlide * -100;
      currentTranslate = initialPosition;
      wrapper.style.transition = 'none';
    }

    function handleTouchMove(event) {
      if (!isDragging) {
        console.log(`[${sliderId}] Touch Move ignored - not dragging`);
        return;
      }
      
      const currentX = event.touches[0].clientX;
      const diff = currentX - startX;
      const movePercent = (diff / wrapper.offsetWidth) * 100;
      currentTranslate = initialPosition + movePercent;
      
      console.log(`[${sliderId}] Touch Move:`, {
        slideId: `${sliderId}-slide-${currentSlide}`,
        currentX: currentX,
        diff: diff,
        movePercent: movePercent,
        currentTranslate: currentTranslate
      });
      
      wrapper.style.transform = `translateX(${currentTranslate}%)`;
    }

    function handleTouchEnd() {
      console.log(`[${sliderId}] Touch End Start:`, {
        slideId: `${sliderId}-slide-${currentSlide}`,
        isDragging: isDragging,
        currentSlide: currentSlide,
        currentTranslate: currentTranslate,
        initialPosition: initialPosition
      });
      
      if (!isDragging) {
        console.log(`[${sliderId}] Touch End ignored - not dragging`);
        return;
      }
      
      isDragging = false;
      wrapper.style.transition = 'transform 0.3s ease';
      
      const movePercent = currentTranslate - initialPosition;
      
      console.log(`[${sliderId}] Movement calculation:`, {
        movePercent: movePercent,
        threshold: 20
      });
      
      if (Math.abs(movePercent) > 20) {
        if (movePercent > 0 && currentSlide > 0) {
          currentSlide--;
          console.log(`[${sliderId}] Moving to previous slide:`, currentSlide);
        } else if (movePercent < 0 && currentSlide < slides.length - 1) {
          currentSlide++;
          console.log(`[${sliderId}] Moving to next slide:`, currentSlide);
        }
      }
      
      goToSlide(currentSlide);
      
      // Reset variables
      startX = 0;
      currentTranslate = 0;
      initialPosition = 0;
      
      console.log(`[${sliderId}] Touch End Complete:`, {
        slideId: `${sliderId}-slide-${currentSlide}`,
        isDragging: isDragging,
        startX: startX,
        currentTranslate: currentTranslate,
        initialPosition: initialPosition
      });
    }

    function goToSlide(index) {
      console.log(`[${sliderId}] Going to slide:`, {
        slideId: `${sliderId}-slide-${index}`,
        fromSlide: currentSlide,
        toSlide: index
      });
      
      currentSlide = index;
      const translate = -index * 100;
      wrapper.style.transform = `translateX(${translate}%)`;
      
      updateDots(index);
    }

    function updateDots(index) {
      const allDots = dots.querySelectorAll('.dot');
      allDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      
      console.log(`[${sliderId}] Dots updated for slide:`, {
        currentDot: `${sliderId}-dot-${index}`,
        slideIndex: index
      });
    }
  });
});