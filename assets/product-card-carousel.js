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
    
    // Alleen setup als er meerdere slides zijn
    if (slides.length > 1) {
      // Maak dots aan
      slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dots.appendChild(dot);
      });

      // Touch events
      wrapper.addEventListener('touchstart', handleTouchStart);
      wrapper.addEventListener('touchmove', handleTouchMove);
      wrapper.addEventListener('touchend', handleTouchEnd);
    }

    function handleTouchStart(event) {
      startX = event.touches[0].clientX;
      isDragging = true;
      initialPosition = currentSlide * -100; // Calculate initial position based on current slide
      currentTranslate = initialPosition;
      wrapper.style.transition = 'none';
    }

    function handleTouchMove(event) {
      if (!isDragging) return;
      
      const currentX = event.touches[0].clientX;
      const diff = currentX - startX;
      const movePercent = (diff / wrapper.offsetWidth) * 100;
      
      // Update position based on initial position and movement
      currentTranslate = initialPosition + movePercent;
      
      // Add resistance at edges
      if (currentTranslate > 0) {
        currentTranslate = currentTranslate * 0.3; // More resistance at start
      } else if (currentTranslate < -((slides.length - 1) * 100)) {
        const overScroll = currentTranslate + ((slides.length - 1) * 100);
        currentTranslate = -((slides.length - 1) * 100) + (overScroll * 0.3);
      }
      
      wrapper.style.transform = `translateX(${currentTranslate}%)`;
    }

    function handleTouchEnd() {
      if (!isDragging) return;
      
      isDragging = false;
      wrapper.style.transition = 'transform 0.3s ease';
      
      // Calculate movement since touch start
      const movePercent = currentTranslate - initialPosition;
      
      // Determine if we should change slide
      if (Math.abs(movePercent) > 20) {
        if (movePercent > 0 && currentSlide > 0) {
          currentSlide--;
        } else if (movePercent < 0 && currentSlide < slides.length - 1) {
          currentSlide++;
        }
      }
      
      // Reset to proper position
      goToSlide(currentSlide);
      
      // Reset variables for next swipe
      startX = 0;
      currentTranslate = 0;
      initialPosition = 0;
    }

    function goToSlide(index) {
      currentSlide = index;
      const translate = -index * 100;
      wrapper.style.transform = `translateX(${translate}%)`;
      
      // Update dots
      updateDots(index);
    }

    function updateDots(index) {
      const allDots = dots.querySelectorAll('.dot');
      allDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
  });
});