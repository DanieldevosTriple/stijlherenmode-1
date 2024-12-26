/* product-card-carousel.js */
document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.product-card-media-slider');
  
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
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
      
      // Create dots
      slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dots.appendChild(dot);
      });
    }
    
    function updateDots() {
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
    
    function handleDragStart(e) {
      isDragging = true;
      startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      wrapper.style.transition = 'none';
    }
    
    function handleDragMove(e) {
      if (!isDragging) return;
      
      e.preventDefault();
      const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      const diff = currentPosition - startPos;
      const translate = (diff / slider.offsetWidth) * 100 + currentTranslate;
      
      // Add boundaries
      if (translate > 0 || translate < -((slides.length - 1) * 100)) return;
      
      wrapper.style.transform = `translateX(${translate}%)`;
    }
    
    function handleDragEnd(e) {
      if (!isDragging) return;
      
      isDragging = false;
      wrapper.style.transition = 'transform 0.3s ease';
      
      const currentPosition = e.type.includes('mouse') ? e.pageX : (e.changedTouches ? e.changedTouches[0].pageX : startPos);
      const diff = currentPosition - startPos;
      
      if (Math.abs(diff) > slider.offsetWidth / 4) {
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
    }
    
    // Mouse Events
    wrapper.addEventListener('mousedown', handleDragStart);
    wrapper.addEventListener('mousemove', handleDragMove);
    wrapper.addEventListener('mouseup', handleDragEnd);
    wrapper.addEventListener('mouseleave', handleDragEnd);
    
    // Touch Events
    wrapper.addEventListener('touchstart', handleDragStart);
    wrapper.addEventListener('touchmove', handleDragMove);
    wrapper.addEventListener('touchend', handleDragEnd);
    
    // Button navigation
    prevBtn.addEventListener('click', () => {
      if (currentSlide > 0) goToSlide(currentSlide - 1);
    });
    
    nextBtn.addEventListener('click', () => {
      if (currentSlide < slides.length - 1) goToSlide(currentSlide + 1);
    });
  });
});