document.addEventListener('DOMContentLoaded', function () {
  const slides = document.querySelectorAll('.product-card-slider-slide');
  const prevButton = document.querySelector('.slider-buttons-product .prev');
  const nextButton = document.querySelector('.slider-buttons-product .next');
  let currentIndex = 0;

  function updateSlides(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
  }

  // Initialize the slider with slide index 0 active
  function initializeSlider() {
    currentIndex = 0; // Ensure the first slide is always active
    updateSlides(currentIndex);
  }

  prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlides(currentIndex);
  });

  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlides(currentIndex);
  });

  // Run the initialization function
  initializeSlider();
});
