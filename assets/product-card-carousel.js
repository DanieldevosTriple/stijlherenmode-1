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
      // Create dots for mobile
      if (isMobile) {
        slides.forEach(function(_, index) {
          const dot = document.createElement('div');
          dot.classList.add('dot');
          if (index === 0) dot.classList.add('active');
          dot.addEventListener('click', function() {
            goToSlide(index);
          });
          dots.appendChild(dot);
        });
      } else {
        // Show arrows for desktop
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
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
      let lastTouchX = 0;
      let initialXOffset = 0;

      function handleDragStart(e) {
        let clientX;
        if (e.type === 'touchstart') {
          clientX = e.touches[0].clientX;
        } else {
          clientX = e.clientX;
        }
        
        isDragging = true;
        startPos = clientX;
        lastTouchX = clientX;
        initialXOffset = -currentSlide * 100;
        
        console.log('DragStart:', {
          isDragging,
          startPos,
          lastTouchX,
          initialXOffset,
          currentSlide
        });
        
        wrapper.style.transition = 'none';
      }

      function handleDragMove(e) {
        if (!isDragging) {
          console.log('Move ignored - not dragging');
          return;
        }
        
        e.preventDefault();
        let clientX;
        if (e.type === 'touchmove') {
          clientX = e.touches[0].clientX;
        } else {
          clientX = e.clientX;
        }
        
        lastTouchX = clientX;
        const diff = clientX - startPos;
        const translate = initialXOffset + (diff / wrapper.offsetWidth) * 100;
        
        console.log('DragMove:', {
          lastTouchX,
          diff,
          translate,
          currentSlide
        });
        
        wrapper.style.transform = `translateX(${translate}%)`;
      }

      function handleDragEnd(e) {
        if (!isDragging) {
          console.log('End ignored - not dragging');
          return;
        }
        
        console.log('DragEnd Start:', {
          lastTouchX,
          startPos,
          currentSlide,
          isDragging
        });
        
        isDragging = false;
        wrapper.style.transition = 'transform 0.3s ease';
        
        const diff = lastTouchX - startPos;
        const swipePercentage = (diff / wrapper.offsetWidth) * 100;
        
        console.log('Swipe Calculation:', {
          diff,
          swipePercentage,
          threshold: 15
        });
        
        if (Math.abs(swipePercentage) > 15) {
          if (diff > 0 && currentSlide > 0) {
            currentSlide--;
            console.log('Swiping right to slide:', currentSlide);
          } else if (diff < 0 && currentSlide < slides.length - 1) {
            currentSlide++;
            console.log('Swiping left to slide:', currentSlide);
          }
        }
        
        goToSlide(currentSlide);
        
        console.log('DragEnd Complete:', {
          currentSlide,
          isDragging,
          lastTouchX,
          startPos
        });
      }

      function goToSlide(index) {
        console.log('GoToSlide:', {
          fromSlide: currentSlide,
          toSlide: index
        });
        
        currentSlide = index;
        const translate = -index * 100;
        wrapper.style.transition = 'transform 0.3s ease';
        wrapper.style.transform = `translateX(${translate}%)`;
        updateDots();
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