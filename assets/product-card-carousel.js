document.addEventListener('DOMContentLoaded', function () {
  const sliderContainers = document.querySelectorAll('.product-card-slider');

  sliderContainers.forEach((container) => {
    const slides = container.querySelectorAll('.product-card-slider-slide');
    const prevButton = container.closest('.slider-controls').querySelector('.prev');
    const nextButton = container.closest('.slider-controls').querySelector('.next');
    const dotsContainer = container.closest('.slider-controls').querySelector('.slideshow__control-wrapper');
    const dots = dotsContainer.querySelectorAll('.slider-counter__link');
    let currentIndex = 0;

    function updateSlides(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    // Dots click handlers
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateSlides(currentIndex);
      });
    });

    // Navigation button handlers
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
    updateSlides(0);
  });
});
