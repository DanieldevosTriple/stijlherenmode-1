document.addEventListener('DOMContentLoaded', function () {
    const colorRadios = document.querySelectorAll('input[type="radio"][name^="Color"]'); // Color swatches
    const mediaGalleryContainer = document.querySelector('.product__media-gallery'); // Featured image container

    const updateMediaGallery = (selectedColor) => {
      console.log('Selected Color:', selectedColor);  // Log the selected color

      // AJAX request to fetch new product media gallery
      const params = new URLSearchParams();
      params.append('color', selectedColor);

      fetch('/path/to/your/ajax/handler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      })
      .then(response => response.text())
      .then(data => {
        mediaGalleryContainer.innerHTML = data;  // Update the media gallery container with new content
        console.log('Product media gallery updated');
      })
      .catch(error => console.error('Error fetching media gallery:', error));
    };

    // Event listener for swatches
    if (colorRadios.length) {
        colorRadios.forEach((radio) => {
            radio.addEventListener('change', function () {
                if (radio.checked) {
                    const selectedColor = radio.value;
                    console.log('Radio change detected:', selectedColor); // Log when a radio button is selected
                    updateMediaGallery(selectedColor); // Dynamically update the gallery
                }
            });
        });
    }
});
