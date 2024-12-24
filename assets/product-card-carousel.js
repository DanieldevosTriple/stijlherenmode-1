document.addEventListener('DOMContentLoaded', function () {
  // Select all product card sliders
  const sliderContainers = document.querySelectorAll('.product-card-slider');
  
  sliderContainers.forEach((container, containerIndex) => {
    const slides = container.querySelectorAll('.product-card-slider-slide');
    const buttonContainer = container.nextElementSibling;
    const prevButton = buttonContainer?.querySelector('.prev');
    const nextButton = buttonContainer?.querySelector('.next');
    
    if (!slides.length || !prevButton || !nextButton) return;
    
    let currentIndex = 0;
    
    function updateSlides(index) {
      slides.forEach((slide, i) => {
        slide.style.opacity = i === index ? '1' : '0';
        slide.style.zIndex = i === index ? '1' : '0';
      });
    }
    
    function initializeSlider() {
      slides.forEach((slide, i) => {
        slide.style.opacity = i === 0 ? '1' : '0';
        slide.style.zIndex = i === 0 ? '1' : '0';
      });
    }
    
    prevButton.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlides(currentIndex);
    });
    
    nextButton.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlides(currentIndex);
    });
    
    initializeSlider();
  });
});