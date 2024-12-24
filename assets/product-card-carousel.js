document.addEventListener('DOMContentLoaded', function () {
  const slides = document.querySelectorAll('.product-card-slider-slide');
  const prevButton = document.querySelector('.slider-buttons-product .prev');
  const nextButton = document.querySelector('.slider-buttons-product .next');
  let currentIndex = 0;

  function updateSlides(index) {
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
  }

  // Initialize the slider and set slide 0 as active
  function initializeSlider() {
    const firstSlide = document.querySelector('.product-card-slider-slide[data-slide="0"]');
    if (firstSlide) {
      slides.forEach(slide => slide.classList.remove('active')); // Clear all active classes
      firstSlide.classList.add('active'); // Set slide 0 as active
      currentIndex = 0;
    } else {
      console.error('No slide with data-slide="0" found!');
    }
  }

  prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlides(currentIndex);
  });

  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlides(currentIndex);
  });

  // Initialize the slider
  initializeSlider();
});
