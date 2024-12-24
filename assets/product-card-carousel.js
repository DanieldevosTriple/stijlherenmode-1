document.addEventListener('DOMContentLoaded', function () {
  console.log('DOMContentLoaded event fired!');

  // Select all product card containers
  const productCardContainers = document.querySelectorAll('.card__media.product-card-slider');

  if (!productCardContainers.length) {
    console.error('No product card sliders found!');
    return;
  }

  console.log('Product card containers found:', productCardContainers.length);

  // Loop through each product card container
  productCardContainers.forEach((container, containerIndex) => {
    console.log(`Initializing product card ${containerIndex}`);

    const slider = container; // Current slider
    const slides = slider.querySelectorAll('.product-card-slider-slide');
    const prevButton = slider.nextElementSibling?.querySelector('.prev');
    const nextButton = slider.nextElementSibling?.querySelector('.next');

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
      const offset = -index * 100; // Calculate the translateX percentage
      slider.style.transform = `translateX(${offset}%)`;
    }

    function initializeSlider() {
      console.log(`Initializing slider for product card ${containerIndex}...`);
      slider.style.transform = 'translateX(0%)'; // Start at the first slide
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
