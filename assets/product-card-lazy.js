// product-card-lazy.js
document.addEventListener('DOMContentLoaded', function() {
    // Create intersection observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          const srcset = img.dataset.srcset;
  
          if (srcset) {
            img.srcset = srcset;
          }
          if (src) {
            img.src = src;
          }
  
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
  
    // Find all product card images and set up lazy loading
    const productImages = document.querySelectorAll('.product-card-carousel-image');
    productImages.forEach(img => {
      // Store original src and srcset in data attributes
      const src = img.src;
      const srcset = img.srcset;
      
      img.dataset.src = src;
      img.dataset.srcset = srcset;
      
      // Clear src and srcset
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      img.srcset = '';
      
      // Add loading style
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease-in-out';
      
      // Observe the image
      imageObserver.observe(img);
    });
  
    // Add CSS for fade-in effect
    const style = document.createElement('style');
    style.textContent = `
      .product-card-carousel-image {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }
      
      .product-card-carousel-image.loaded {
        opacity: 1;
      }
  
      .product-card {
        min-height: 300px;
        position: relative;
      }
  
      .product-card::before {
        content: '';
        display: block;
        padding-bottom: 133%; /* Maintain aspect ratio */
      }
    `;
    document.head.appendChild(style);
  });