document.addEventListener('DOMContentLoaded', function() {
  const productCardSliders = document.querySelectorAll('.card__media.product-card-slider');
 
  productCardSliders.forEach((slider) => {
    const slides = slider.querySelectorAll('.product-card-slider-slide');
    const prevButton = slider.nextElementSibling?.querySelector('.prev');
    const nextButton = slider.nextElementSibling?.querySelector('.next');
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
 
    function init() {
      slides[0].classList.add('active');
    }
 
    prevButton?.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlides(currentIndex);
    });
 
    nextButton?.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlides(currentIndex);
    });
 
    init();
  });
 });