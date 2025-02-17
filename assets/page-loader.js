document.addEventListener('DOMContentLoaded', () => {
  // Wrap the existing content
  const mainContent = document.getElementById('MainContent');
  if (mainContent) {
    mainContent.classList.add('content-wrapper');
  }

  // Create and add loader
  const loaderContainer = document.createElement('div');
  loaderContainer.className = 'loader-container';
  loaderContainer.innerHTML = '<div class="loader"></div>';
  document.body.insertBefore(loaderContainer, document.body.firstChild);

  // Remove loader after content is loaded
  window.addEventListener('load', () => {
    setTimeout(() => {
      loaderContainer.classList.add('fade-out');
      setTimeout(() => {
        loaderContainer.remove();
      }, 500);
    }, 500);
  });
});