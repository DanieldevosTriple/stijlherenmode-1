document.addEventListener('DOMContentLoaded', function () {
  const sliders = document.querySelectorAll('.product-card-slider');

  sliders.forEach((slider) => {
    const slides = slider.querySelectorAll('.product-card-slider-slide');
    const prevButton = slider.querySelector('.slider-buttons-product .prev');
    const nextButton = slider.querySelector('.slider-buttons-product .next');
    const dotsContainer = slider.querySelector('.slider-counter');

    let currentIndex = 0;

    function updateSlider() {
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentIndex);
      });
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.slider-counter__link');
        dots.forEach((dot, index) => {
          dot.classList.toggle('active', index === currentIndex);
        });
      }
    }

    function goToIndex(index) {
      if (index >= 0 && index < slides.length) {
        currentIndex = index;
        updateSlider();
      }
    }

    if (prevButton && nextButton) {
      prevButton.addEventListener('click', () => goToIndex(currentIndex - 1));
      nextButton.addEventListener('click', () => goToIndex(currentIndex + 1));

      if (slides.length > 1) {
        slider.classList.add('multiple-images');
      }
    }

    if (dotsContainer) {
      slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('slider-counter__link');
        dot.addEventListener('click', () => goToIndex(index));
        dotsContainer.appendChild(dot);
      });
    }

    updateSlider();
  });
});
