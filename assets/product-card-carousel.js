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
    container.appendChild(dotsContainer);
    
    const prevButton = buttonContainer?.querySelector('.prev');
    const nextButton = buttonContainer?.querySelector('.next');
    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let initialTouchY = 0;
    let isDragging = false;
    let isScrolling = false;
    
    function updateSlides(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    function handleGesture() {
      if (!isDragging || isScrolling) return;
      
      const minSwipeDistance = 50;
      const swipeDistance = touchEndX - touchStartX;
      
      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
          currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        } else {
          currentIndex = (currentIndex + 1) % slides.length;
        }
        updateSlides(currentIndex);
      }
      isDragging = false;
      isScrolling = false;
    }

    container.addEventListener('touchstart', e => {
      isDragging = true;
      isScrolling = false;
      touchStartX = e.touches[0].clientX;
      initialTouchY = e.touches[0].clientY;
    }, { passive: true });

    container.addEventListener('touchmove', e => {
      if (!isDragging) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = Math.abs(currentX - touchStartX);
      const deltaY = Math.abs(currentY - initialTouchY);

      // Als de gebruiker meer verticaal dan horizontaal beweegt, laat de pagina scrollen
      if (deltaY > deltaX) {
        isScrolling = true;
        return;
      }

      // Anders voorkom de scroll en laat de slider werken
      if (deltaX > 10 && !isScrolling) {
        e.preventDefault();
      }
    }, { passive: false });

    container.addEventListener('touchend', e => {
      if (!isDragging) return;
      touchEndX = e.changedTouches[0].clientX;
      handleGesture();
    });

    // Button events
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlides(currentIndex);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlides(currentIndex);
      });
    }
    
    slides[0].classList.add('active');

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