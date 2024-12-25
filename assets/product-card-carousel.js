document.addEventListener('DOMContentLoaded', function () {
  const sliderContainers = document.querySelectorAll('.product-card-slider');
  
  sliderContainers.forEach((container) => {
    const cardMedia = container.closest('.card-media-custom');
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

    // Initialize dots container
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

    // Set up navigation buttons
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

    function handleSwipe() {
      if (!isDragging || isScrolling) return;
      
      const swipeDistance = touchEndX - touchStartX;
      const minSwipeDistance = 50;

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

    // Add touch events to both container and images
    if (cardMedia) {
      const handleTouchStart = e => {
        isDragging = true;
        isScrolling = false;
        touchStartX = e.touches[0].clientX;
        initialTouchY = e.touches[0].clientY;
      };

      const handleTouchMove = e => {
        if (!isDragging) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = Math.abs(currentX - touchStartX);
        const deltaY = Math.abs(currentY - initialTouchY);

        if (deltaY > deltaX) {
          isScrolling = true;
          return;
        }

        if (deltaX > 10 && !isScrolling) {
          e.preventDefault();
        }
      };

      const handleTouchEnd = e => {
        if (!isDragging) return;
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
      };

      // Add listeners to container
      cardMedia.addEventListener('touchstart', handleTouchStart, { passive: true });
      cardMedia.addEventListener('touchmove', handleTouchMove, { passive: false });
      cardMedia.addEventListener('touchend', handleTouchEnd);

      // Add listeners to all images
      slides.forEach(slide => {
        const img = slide.querySelector('img');
        if (img) {
          img.addEventListener('touchstart', handleTouchStart, { passive: true });
          img.addEventListener('touchmove', handleTouchMove, { passive: false });
          img.addEventListener('touchend', handleTouchEnd);
        }
      });
        isDragging = true;
        isScrolling = false;
        touchStartX = e.touches[0].clientX;
        initialTouchY = e.touches[0].clientY;
      }, { passive: true });


    }

    // Button click handlers
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

    // Initialize first slide
    slides[0].classList.add('active');

    // Handle responsive behavior
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