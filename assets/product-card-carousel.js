document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.product-card-media-slider');
  const isMobile = window.innerWidth <= 768;
  
  sliders.forEach(slider => {
    const wrapper = slider.querySelector('.slider-wrapper');
    const slides = slider.querySelectorAll('.slide');
    const prevBtn = slider.querySelector('.prev');
    const nextBtn = slider.querySelector('.next');
    const dots = slider.querySelector('.dots');
    
    let currentSlide = 0;
    let startPos = 0;
    let currentTranslate = 0;
    let isDragging = false;
    
    // Only show navigation if multiple slides
    if (slides.length > 1) {
      // Show appropriate navigation based on device
      if (!isMobile) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
      } else {
        // Create dots for mobile
        slides.forEach((_, index) => {
          const dot = document.createElement('div');
          dot.classList.add('dot');
          if (index === 0) dot.classList.add('active');
          dot.addEventListener('click', () => goToSlide(index));
          dots.appendChild(dot);
        });
      }
    }
    
    function updateDots() {
      if (!isMobile) return;
      
      const dotElements = dots.querySelectorAll('.dot');
      dotElements.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
      });
    }
    
    function goToSlide(index) {
      currentSlide = index;
      currentTranslate = -index * 100;
      wrapper.style.transform = `translateX(${currentTranslate}%)`;
      updateDots();
    }
    
    // Mobile-only touch handlers
    if (isMobile) {
      let initialX = 0;
      let currentX = 0;

      function handleDragStart(e) {
        isDragging = true;
        initialX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        currentX = initialX;
        startPos = initialX;
        wrapper.style.transition = 'none';
        wrapper.classList.add('dragging');
      }
      
      function handleDragMove(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const diff = currentX - initialX;
        const translate = (diff / slider.offsetWidth) * 100 + currentTranslate;
        
        // Allow movement but with resistance at boundaries
        const maxTranslate = -((slides.length - 1) * 100);
        let finalTranslate = translate;
        
        if (translate > 0) {
          finalTranslate = translate * 0.3; // Add resistance at start
        } else if (translate < maxTranslate) {
          finalTranslate = maxTranslate + (translate - maxTranslate) * 0.3; // Add resistance at end
        }
        
        wrapper.style.transform = `translateX(${finalTranslate}%)`;
      }
      
      function handleDragEnd(e) {
        if (!isDragging) return;
        
        isDragging = false;
        wrapper.classList.remove('dragging');
        wrapper.style.transition = 'transform 0.3s ease';
        
        const diff = currentX - startPos;
        const swipeThreshold = slider.offsetWidth * 0.15; // 15% of slider width
        
        if (Math.abs(diff) > swipeThreshold) {
          if (diff > 0 && currentSlide > 0) {
            goToSlide(currentSlide - 1);
          } else if (diff < 0 && currentSlide < slides.length - 1) {
            goToSlide(currentSlide + 1);
          } else {
            goToSlide(currentSlide);
          }
        } else {
          goToSlide(currentSlide);
        }
        
        // Reset variables
        initialX = 0;
        currentX = 0;
      }
      
      // Touch Events for mobile
      wrapper.addEventListener('touchstart', handleDragStart, { passive: false });
      wrapper.addEventListener('touchmove', handleDragMove, { passive: false });
      wrapper.addEventListener('touchend', handleDragEnd);
    }
    
    // Desktop-only arrow navigation
    if (!isMobile) {
      prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) goToSlide(currentSlide - 1);
      });
      
      nextBtn.addEventListener('click', () => {
        if (currentSlide < slides.length - 1) goToSlide(currentSlide + 1);
      });
    }
  });
});