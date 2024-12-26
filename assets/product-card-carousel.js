// product-card-carousel.js
document.addEventListener('DOMContentLoaded', function() {
  const sliders = document.querySelectorAll('.product-card-media-slider');
  const isMobile = window.innerWidth <= 768;
  
  sliders.forEach(function(slider) {
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
      if (!isMobile) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
      } else {
        // Create dots for mobile
        slides.forEach(function(_, index) {
          const dot = document.createElement('div');
          dot.classList.add('dot');
          if (index === 0) dot.classList.add('active');
          dot.addEventListener('click', function() {
            goToSlide(index);
          });
          dots.appendChild(dot);
        });
      }
    }
    
    function updateDots() {
      if (!isMobile) return;
      
      const dotElements = dots.querySelectorAll('.dot');
      dotElements.forEach(function(dot, index) {
        dot.classList.toggle('active', index === currentSlide);
      });
    }
    
    function goToSlide(index) {
      currentSlide = index;
      currentTranslate = -index * 100;
      wrapper.style.transition = 'transform 0.3s ease';
      wrapper.style.transform = `translateX(${currentTranslate}%)`;
      updateDots();
    }
    
    // Mobile-only touch handlers
    if (isMobile) {
      function handleDragStart(e) {
        if (e.type === 'touchstart') {
          startPos = e.touches[0].clientX;
        } else {
          startPos = e.clientX;
        }
        isDragging = true;
        currentTranslate = -currentSlide * 100;
        wrapper.style.transition = 'none';
      }

      function handleDragMove(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        const currentPosition = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const diff = currentPosition - startPos;
        const translate = currentTranslate + (diff / wrapper.offsetWidth) * 100;
        
        wrapper.style.transform = `translateX(${translate}%)`;
      }

      function handleDragEnd(e) {
        if (!isDragging) return;
        
        isDragging = false;
        wrapper.style.transition = 'transform 0.3s ease';
        
        const currentPosition = e.type === 'touchend' ? 
          (e.changedTouches ? e.changedTouches[0].clientX : startPos) : 
          e.clientX;
        const diff = currentPosition - startPos;
        
        const swipePercentage = (diff / wrapper.offsetWidth) * 100;
        
        if (Math.abs(swipePercentage) > 20) {
          if (diff > 0 && currentSlide > 0) {
            currentSlide--;
          } else if (diff < 0 && currentSlide < slides.length - 1) {
            currentSlide++;
          }
        }
        
        goToSlide(currentSlide);
      }
      
      wrapper.addEventListener('touchstart', handleDragStart, { passive: false });
      wrapper.addEventListener('touchmove', handleDragMove, { passive: false });
      wrapper.addEventListener('touchend', handleDragEnd);
      wrapper.addEventListener('touchcancel', handleDragEnd);
    }
    
    // Desktop-only arrow navigation
    if (!isMobile) {
      prevBtn.addEventListener('click', function() {
        if (currentSlide > 0) {
          goToSlide(currentSlide - 1);
        }
      });
      
      nextBtn.addEventListener('click', function() {
        if (currentSlide < slides.length - 1) {
          goToSlide(currentSlide + 1);
        }
      });
    }
  });
});