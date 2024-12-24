document.addEventListener('DOMContentLoaded', function () {
  const sliderContainers = document.querySelectorAll('.product-card-slider');
  
  sliderContainers.forEach((container) => {
    const slides = container.querySelectorAll('.product-card-slider-slide');
    const buttonContainer = container.nextElementSibling;
    
    if (slides.length <= 1) {
      if (slides.length === 1) {
        slides[0].classList.add('active');
      }
      if (buttonContainer) {
        buttonContainer.style.display = 'none';
      }
      return;
    }

    // Create dots container and dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'slider-dots';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = i === 0 ? 'dot active' : 'dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateSlides(currentIndex);
      });
      dotsContainer.appendChild(dot);
    });
    container.parentNode.appendChild(dotsContainer);
    
    const prevButton = buttonContainer?.querySelector('.prev');
    const nextButton = buttonContainer?.querySelector('.next');
    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    
    function updateSlides(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      // Update dots
      dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    function handleGesture() {
      const minSwipeDistance = 50;
      const swipeDistance = touchEndX - touchStartX;
      
      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
          // Swipe right
          currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        } else {
          // Swipe left
          currentIndex = (currentIndex + 1) % slides.length;
        }
        updateSlides(currentIndex);
      }
    }

    // Touch events
    container.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    });

    container.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    });

    // Desktop drag events
    container.addEventListener('mousedown', e => {
      touchStartX = e.screenX;
    });

    container.addEventListener('mouseup', e => {
      touchEndX = e.screenX;
      handleGesture();
    });
    
    // Initialize first slide
    slides[0].classList.add('active');

    // Show/hide navigation based on screen size
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    function handleScreenChange(e) {
      if (buttonContainer) {
        buttonContainer.style.display = e.matches ? 'block' : 'none';
      }
      dotsContainer.style.display = e.matches ? 'none' : 'flex';
    }
    mediaQuery.addListener(handleScreenChange);
    handleScreenChange(mediaQuery);
  });
});