document.addEventListener('DOMContentLoaded', function () {
  const sliderContainers = document.querySelectorAll('.product-card-slider');

  sliderContainers.forEach((container) => {
      const slides = container.querySelectorAll('.product-card-slider-slide');
      const buttonContainer = container.nextElementSibling;
      const cardMedia = container.closest('.card-media-custom');

      // Enable interaction on card-media-custom
      if (cardMedia) {
          cardMedia.style.pointerEvents = 'auto';
      }

      // Handle single or no slides
      if (slides.length <= 1) {
          if (slides.length === 1) {
              slides[0].classList.add('active');
          }
          if (buttonContainer) {
              buttonContainer.style.display = 'none';
          }
          return;
      }

      // Variables
      let currentIndex = 0;
      let touchStartX = 0;
      let touchEndX = 0;
      let isDragging = false;

      // Create dots for navigation
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

      // Update slides and dots
      function updateSlides(index) {
          slides.forEach((slide, i) => {
              slide.classList.toggle('active', i === index);
          });
          dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
              dot.classList.toggle('active', i === index);
          });
      }

      // Handle swipe logic
      function handleSwipe() {
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
      }

      // Touch Events
      container.addEventListener('touchstart', (e) => {
          isDragging = true;
          touchStartX = e.touches[0].clientX;
      }, { passive: true });

      container.addEventListener('touchmove', (e) => {
          if (!isDragging) return;
          touchEndX = e.touches[0].clientX;
          e.preventDefault(); // Prevent vertical scrolling during swipe
      }, { passive: false });

      container.addEventListener('touchend', () => {
          if (isDragging) handleSwipe();
      });

      // Navigation Buttons
      if (buttonContainer) {
          const prevButton = buttonContainer.querySelector('.prev');
          const nextButton = buttonContainer.querySelector('.next');

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
      }

      // Dynamically show/hide controls based on screen size
      const mediaQuery = window.matchMedia('(min-width: 768px)');
      function handleScreenChange(e) {
          if (buttonContainer) {
              buttonContainer.style.display = e.matches ? 'block' : 'none';
          }
          dotsContainer.style.display = e.matches ? 'none' : 'flex';
      }
      mediaQuery.addEventListener('change', handleScreenChange);
      handleScreenChange(mediaQuery);

      // Initialize the first slide as active
      slides[0].classList.add('active');
  });
});
