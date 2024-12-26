(function() {
  class Slider {
    constructor(element) {
      // Elements
      this.slider = element;
      this.wrapper = element.querySelector('.slider-wrapper');
      this.slides = element.querySelectorAll('.slide');
      this.dots = element.querySelector('.dots');
      
      // Variables
      this.currentSlide = 0;
      this.startPos = 0;
      this.currentTranslate = 0;
      this.isDragging = false;
      
      this.init();
    }

    init() {
      if (this.slides.length <= 1) return;
      
      this.createDots();
      this.setupEvents();
    }

    createDots() {
      this.dots.innerHTML = '';
      this.slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        this.dots.appendChild(dot);
      });
    }

    setupEvents() {
      const touchStart = (e) => {
        this.isDragging = true;
        this.startPos = e.touches[0].clientX;
        this.currentTranslate = -this.currentSlide * 100;
        this.wrapper.style.transition = 'none';
      };

      const touchMove = (e) => {
        if (!this.isDragging) return;
        
        const currentPosition = e.touches[0].clientX;
        const diff = currentPosition - this.startPos;
        const move = (diff / this.wrapper.offsetWidth) * 100;
        const translate = this.currentTranslate + move;
        
        this.wrapper.style.transform = `translateX(${translate}%)`;
      };

      const touchEnd = () => {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.wrapper.style.transition = 'transform 0.3s ease';
        
        const endTranslate = parseFloat(this.wrapper.style.transform.replace('translateX(', '').replace('%)', ''));
        const diff = endTranslate - (-this.currentSlide * 100);
        
        if (Math.abs(diff) > 20) {
          if (diff > 0 && this.currentSlide > 0) {
            this.currentSlide--;
          } else if (diff < 0 && this.currentSlide < this.slides.length - 1) {
            this.currentSlide++;
          }
        }
        
        this.goToSlide(this.currentSlide);
      };

      this.wrapper.addEventListener('touchstart', touchStart);
      this.wrapper.addEventListener('touchmove', touchMove);
      this.wrapper.addEventListener('touchend', touchEnd);
    }

    goToSlide(index) {
      this.currentSlide = index;
      const translate = -index * 100;
      this.wrapper.style.transform = `translateX(${translate}%)`;
      
      const dots = this.dots.querySelectorAll('.dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
  }

  // Initialize
  function init() {
    document.querySelectorAll('.product-card-media-slider').forEach(slider => {
      new Slider(slider);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();