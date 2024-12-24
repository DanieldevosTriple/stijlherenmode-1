document.addEventListener('DOMContentLoaded', function () {
  console.log('DOMContentLoaded event fired!');

  // Select all product card sliders
  const productCardSliders = document.querySelectorAll('.card__media.product-card-slider');

  if (!productCardSliders.length) {
    console.error('No product card sliders found!');
    return;
  }

  console.log('Product card sliders found:', productCardSliders.length);

  // Loop through each product card slider
  productCardSliders.forEach((slider, sliderIndex) => {
    console.log(`Initializing slider ${sliderIndex}`);

    const slides = slider.querySelectorAll('.product-card-slider-slide');
    const prevButton = slider.nextElementSibling?.querySelector('.prev');
    const nextButton = slider.nextElementSibling?.querySelector('.next');

    if (!slides.length) {
      console.error(`No slides found for slider ${sliderIndex}`);
      return;
    }

    if (!prevButton || !nextButton) {
      console.error(`Navigation buttons not found for slider ${sliderIndex}`);
      return;
    }

    console.log(`Slides found for slider ${sliderIndex}:`, slides.length);

    let currentIndex = 0;

    function updateSlides(index) {
      console.log(`Updating slides for slider ${sliderIndex}, currentIndex: ${index}`);
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add('active');
          console.log(`Slider ${sliderIndex}: Slide ${i} is now active`);
        } else {
          slide.classList.remove('active');
        }
      });
    }

    function initializeSlider() {
      console.log(`Initializing slider ${sliderIndex}...`);
      const firstSlides = slider.querySelectorAll('[data-slide="0"]');

      if (firstSlides.length) {
        slides.forEach(slide => slide.classList.remove('active')); // Clear all active classes
        firstSlides.forEach(slide => slide.classList.add('active')); // Set all slides with data-slide="0" as active
        currentIndex = 0; // Ensure the current index starts at 0
        console.log(`Slider ${sliderIndex}: All slides with data-slide="0" set to active`);
      } else {
        console.error(`Slider ${sliderIndex}: No slide with data-slide="0" found!`);
      }
    }

    prevButton.addEventListener('click', () => {
      console.log(`Slider ${sliderIndex}: Previous button clicked`);
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlides(currentIndex);
    });

    nextButton.addEventListener('click', () => {
      console.log(`Slider ${sliderIndex}: Next button clicked`);
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlides(currentIndex);
    });

    // Initialize the slider
    initializeSlider();
  });
});
