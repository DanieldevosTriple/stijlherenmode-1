// Create a new file called 'lazy-load.js' in your theme's Assets folder

document.addEventListener('DOMContentLoaded', function() {
    // Select all elements that should be animated
    const elements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
    
    // Create the Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Optional: stop observing the element after it's animated
          // observer.unobserve(entry.target);
        }
      });
    }, {
      root: null, // viewport
      threshold: 0.1, // 10% of the item must be visible
      rootMargin: '0px 0px -50px 0px' // Slightly delay the animation until the element is more in view
    });
  
    // Start observing each element
    elements.forEach(element => {
      observer.observe(element);
    });
  });