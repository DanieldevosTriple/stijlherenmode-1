document.addEventListener('DOMContentLoaded', function() {
  const sliders = document.querySelectorAll('.product-card-media-slider');
  
  sliders.forEach(function(slider) {
    const wrapper = slider.querySelector('.slider-wrapper');
    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelector('.dots');
    
    let currentSlide = 0;
    let startX = 0;
    let currentTranslate = 0;
    let isDragging = false;
    let currentPosition = 0;
    
    // Only setup if we have multiple slides
    if (slides.length > 1) {
      // Create dots
      slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dots.appendChild(dot);
      });

      // Touch events
      wrapper.addEventListener('touchstart', touchStart);
      wrapper.addEventListener('touchmove', touchMove);
      wrapper.addEventListener('touchend', touchEnd);
    }

    function touchStart(event) {
      startX = event.touches[0].clientX;
      isDragging = true;
      currentPosition = currentSlide * -100;
      wrapper.style.transition = 'none';
    }

    function touchMove(event) {
      if (!isDragging) return;
      
      const currentX = event.touches[0].clientX;
      const diff = currentX - startX;
      const movePercent = (diff / wrapper.offsetWidth) * 100;
      currentTranslate = currentPosition + movePercent;
      
      // Limit the swipe to adjacent slides only
      if (currentTranslate > 0 || currentTranslate < -((slides.length - 1) * 100)) {
        return;
      }
      
      wrapper.style.transform = `translateX(${currentTranslate}%)`;
    }

    function touchEnd() {
      if (!isDragging) return;
      
      isDragging = false;
      wrapper.style.transition = 'transform 0.3s ease';
      
      // Calculate if we should move to next/previous slide
      const movePercent = currentTranslate - currentPosition;
      
      if (Math.abs(movePercent) > 20) {
        if (movePercent > 0 && currentSlide > 0) {
          currentSlide--;
        } else if (movePercent < 0 && currentSlide < slides.length - 1) {
          currentSlide++;
        }
      }
      
      // Update slide position
      goToSlide(currentSlide);
    }

    function goToSlide(index) {
      currentSlide = index;
      const translate = -index * 100;
      wrapper.style.transform = `translateX(${translate}%)`;
      
      // Update dots
      const allDots = dots.querySelectorAll('.dot');
      allDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
  });
});