document.addEventListener('DOMContentLoaded', function() {
  const sliders = document.querySelectorAll('.product-card-media-slider');
  
  sliders.forEach(function(slider) {
    const wrapper = slider.querySelector('.slider-wrapper');
    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelector('.dots');
    
    let currentSlide = 0;
    let startX = 0;
    let isDragging = false;
    let initialPosition = 0;
    let currentTranslate = 0;
    
    if (slides.length > 1) {
      // Add debug message for initialization
      console.log('Initializing slider with slides:', slides.length);
      
      slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dots.appendChild(dot);
      });

      wrapper.addEventListener('touchstart', handleTouchStart);
      wrapper.addEventListener('touchmove', handleTouchMove);
      wrapper.addEventListener('touchend', handleTouchEnd);
      
      // Debug message for event listeners
      console.log('Event listeners attached');
    }

    function handleTouchStart(event) {
      console.log('Touch Start:', {
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
        console.log('Touch Move ignored - not dragging');
        return;
      }
      
      const currentX = event.touches[0].clientX;
      const diff = currentX - startX;
      const movePercent = (diff / wrapper.offsetWidth) * 100;
      currentTranslate = initialPosition + movePercent;
      
      console.log('Touch Move:', {
        currentX: currentX,
        diff: diff,
        movePercent: movePercent,
        currentTranslate: currentTranslate
      });
      
      wrapper.style.transform = `translateX(${currentTranslate}%)`;
    }

    function handleTouchEnd() {
      console.log('Touch End Start:', {
        isDragging: isDragging,
        currentSlide: currentSlide,
        currentTranslate: currentTranslate,
        initialPosition: initialPosition
      });
      
      if (!isDragging) {
        console.log('Touch End ignored - not dragging');
        return;
      }
      
      isDragging = false;
      wrapper.style.transition = 'transform 0.3s ease';
      
      const movePercent = currentTranslate - initialPosition;
      
      console.log('Movement calculation:', {
        movePercent: movePercent,
        threshold: 20
      });
      
      if (Math.abs(movePercent) > 20) {
        if (movePercent > 0 && currentSlide > 0) {
          currentSlide--;
          console.log('Moving to previous slide:', currentSlide);
        } else if (movePercent < 0 && currentSlide < slides.length - 1) {
          currentSlide++;
          console.log('Moving to next slide:', currentSlide);
        }
      }
      
      goToSlide(currentSlide);
      
      // Reset variables
      startX = 0;
      currentTranslate = 0;
      initialPosition = 0;
      
      console.log('Touch End Complete:', {
        currentSlide: currentSlide,
        isDragging: isDragging,
        startX: startX,
        currentTranslate: currentTranslate,
        initialPosition: initialPosition
      });
    }

    function goToSlide(index) {
      console.log('Going to slide:', index);
      
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
      
      console.log('Dots updated for slide:', index);
    }
  });
});