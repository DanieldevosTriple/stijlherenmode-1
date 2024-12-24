document.addEventListener('DOMContentLoaded', function () {
  console.log('DOMContentLoaded event fired!');

  const slides = document.querySelectorAll('.product-card-slider-slide');
  const prevButton = document.querySelector('.slider-buttons-product .prev');
  const nextButton = document.querySelector('.slider-buttons-product .next');

  console.log('Slides found:', slides);
  console.log('Previous button:', prevButton);
  console.log('Next button:', nextButton);

  let currentIndex = 0;

  function updateSlides(index) {
    console.log(`Updating slides, currentIndex: ${index}`);
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
        console.log(`Slide ${i} is now active`);
      } else {
        slide.classList.remove('active');
      }
    });
  }

  // Initialize the slider and set slide 0 as active
  function initializeSlider() {
    console.log('Initializing slider...');
    const firstSlide = document.querySelector('.product-card-slider-slide[data-slide="0"]');
    if (firstSlide) {
      slides.forEach(slide => slide.classList.remove('active')); // Clear all active classes
      firstSlide.classList.add('active'); // Set slide 0 as active
      currentIndex = 0;
      console.log('Slide 0 set as active');
    } else {
      console.error('No slide with data-slide="0" found!');
    }
  }

  prevButton.addEventListener('click', () => {
    console.log('Previous button clicked');
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlides(currentIndex);
  });

  nextButton.addEventListener('click', () => {
    console.log('Next button clicked');
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlides(currentIndex);
  });

  // Run the initialization function
  initializeSlider();
});
