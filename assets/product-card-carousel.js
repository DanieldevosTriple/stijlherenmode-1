document.addEventListener('DOMContentLoaded', function() {
  const carousels = document.querySelectorAll('.product-card-carousel');
  
  carousels.forEach(carousel => {
    const slides = carousel.querySelectorAll('.product-card-carousel-slide');
    let currentSlide = 0;
    
    // Create navigation arrows
    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-prev';
    prevButton.innerHTML = '&#8249;';
    
    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-next';
    nextButton.innerHTML = '&#8250;';
    
    carousel.appendChild(prevButton);
    carousel.appendChild(nextButton);
    
    function showSlide(index) {
      slides.forEach(slide => slide.classList.remove('active'));
      slides[index].classList.add('active');
    }
    
    function nextSlide(e) {
      e.preventDefault();
      e.stopPropagation();
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }
    
    function prevSlide(e) {
      e.preventDefault();
      e.stopPropagation();
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    }
    
    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);
    
    const style = document.createElement('style');
    style.textContent = `
      .product-card-carousel {
        position: relative;
      }
      .product-card-carousel-slide {
        display: none;
      }
      .product-card-carousel-slide.active {
        display: block;
      }
      .carousel-prev, .carousel-next {
        position: absolute;
        top: 10px;
        background: rgba(255,255,255,0.8);
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        font-size: 20px;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s;
      }
      .carousel-prev:hover, .carousel-next:hover {
        background: rgba(255,255,255,0.9);
      }
      .carousel-prev {
        left: 10px;
      }
      .carousel-next {
        right: 10px;
      }
      .media {
        position: relative;
      }
    `;
    document.head.appendChild(style);
  });
});