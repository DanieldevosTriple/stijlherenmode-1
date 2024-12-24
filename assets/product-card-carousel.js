document.addEventListener('DOMContentLoaded', function() {
    // Debugging function
    function debugLog(message, data) {
      if (window.debugMode) {
        console.log(message, data);
      }
    }
  
    // Carousel initialization and logic
    function initProductCardCarousels() {
      const carousels = document.querySelectorAll('.product-card-carousel-container');
      
      carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.product-card-carousel-slide');
        const prevButton = carousel.querySelector('.product-card-carousel-prev');
        const nextButton = carousel.querySelector('.product-card-carousel-next');
        const dots = carousel.querySelectorAll('.product-card-carousel-dot');
        
        // Debug logging
        debugLog('Carousel Initialized', {
          totalSlides: slides.length,
          hasPrevButton: !!prevButton,
          hasNextButton: !!nextButton,
          hasDots: dots.length > 0
        });
  
        let currentSlide = 0;
        const totalSlides = slides.length;
  
        // Show specific slide
        function showSlide(index) {
          // Validate index
          if (index < 0 || index >= totalSlides) {
            debugLog('Invalid slide index', { index, totalSlides });
            return;
          }
  
          // Remove active classes
          slides.forEach(slide => slide.classList.remove('active'));
          dots.forEach(dot => dot.classList.remove('active'));
          
          // Add active classes to current slide and dot
          slides[index].classList.add('active');
          dots[index].classList.add('active');
          
          currentSlide = index;
          
          debugLog('Slide Changed', { 
            newSlide: currentSlide, 
            slideElement: slides[currentSlide] 
          });
        }
  
        // Navigation functions
        function goToPrevSlide() {
          const newIndex = (currentSlide - 1 + totalSlides) % totalSlides;
          showSlide(newIndex);
        }
  
        function goToNextSlide() {
          const newIndex = (currentSlide + 1) % totalSlides;
          showSlide(newIndex);
        }
  
        // Event Listeners
        if (prevButton) {
          prevButton.addEventListener('click', goToPrevSlide);
        }
  
        if (nextButton) {
          nextButton.addEventListener('click', goToNextSlide);
        }
  
        // Dot navigation
        dots.forEach((dot, index) => {
          dot.addEventListener('click', () => showSlide(index));
        });
  
        // Touch/Swipe Support
        let touchStartX = 0;
        let touchEndX = 0;
  
        carousel.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
        });
  
        carousel.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
        });
  
        function handleSwipe() {
          const minSwipeDistance = 50; // Minimum swipe distance
          
          if (touchEndX < touchStartX - minSwipeDistance) {
            // Swiped left
            goToNextSlide();
          } else if (touchEndX > touchStartX + minSwipeDistance) {
            // Swiped right
            goToPrevSlide();
          }
        }
      });
    }
  
    // Initialize carousels
    initProductCardCarousels();
  
    // Optional: Re-initialize if dynamically added content
    document.addEventListener('product-card-added', initProductCardCarousels);
  });