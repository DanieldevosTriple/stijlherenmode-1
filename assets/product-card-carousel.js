document.addEventListener('DOMContentLoaded', function () {
  console.log('DOMContentLoaded event fired!');

  // Select all product card sliders
  const productCardContainers = document.querySelectorAll('.card-media-custom.product-card-slider');

  if (!productCardContainers.length) {
    console.error('No product card sliders found!');
    return;
  }

  console.log('Product card containers found:', productCardContainers.length);

  // Loop through each product card container
  productCardContainers.forEach((container, containerIndex) => {
    console.log(`Initializing product card ${containerIndex}`);

    // Identify slides and buttons related to this container
    const slides = document.querySelectorAll(`.product-card-slider-slide[data-card-index="${containerIndex}"]`);
    const prevButton = container.nextElementSibling?.querySelector('.prev');
    const nextButton = container.nextElementSibling?.querySelector('.next');

    if (!slides.length) {
      console.error(`No slides found for product card ${containerIndex}`);
      return;
    }

    if (!prevButton || !nextButton) {
      console.error(`Navigation buttons not found for product card ${containerIndex}`);
      return;
    }

    console.log(`Slides found for product card ${containerIndex}:`, slides.length);

    let currentIndex = 0;

    function updateSlides(index) {
      console.log(`Updating slides for product card ${containerIndex}, currentIndex: ${index}`);
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.style.opacity = '1';
          slide.style.zIndex = '1';
          console.log(`Product card ${containerIndex}: Slide ${i} is now active`);
        } else {
          slide.style.opacity = '0';
          slide.style.zIndex = '0';
        }
      });
    }

    function initializeSlider() {
      console.log(`Initializing slider for product card ${containerIndex}...`);
      const firstSlides = Array.from(slides).filter(slide => slide.dataset.slide === '0');

      if (firstSlides.length) {
        slides.forEach(slide => {
          slide.style.opacity = '0';
          slide.style.zIndex = '0';
        });
        firstSlides.forEach(slide => {
          slide.style.opacity = '1';
          slide.style.zIndex = '1';
        });
        currentIndex = 0; // Ensure the current index starts at 0
        console.log(`Product card ${containerIndex}: All slides with data-slide="0" set to active`);
      } else {
        console.error(`Product card ${containerIndex}: No slide with data-slide="0" found!`);
      }
    }

    prevButton.addEventListener('click', () => {
      console.log(`Product card ${containerIndex}: Previous button clicked`);
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlides(currentIndex);
    });

    nextButton.addEventListener('click', () => {
      console.log(`Product card ${containerIndex}: Next button clicked`);
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlides(currentIndex);
    });

    // Run the initialization function
    initializeSlider();
  });
});
