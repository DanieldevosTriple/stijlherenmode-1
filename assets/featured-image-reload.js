document.addEventListener('DOMContentLoaded', function () {
    const colorRadios = document.querySelectorAll('input[type="radio"][name^="Color"]'); // Color swatches
    const mediaWrapperContainer = document.querySelector('.product__media-wrapper'); // Container for media gallery

    const updateMediaGallery = (selectedColor) => {
        console.log('Selected Color:', selectedColor);  // Log the selected color

        // AJAX request to fetch the new product media gallery with the selected color
        const params = new URLSearchParams();
        params.append('color', selectedColor);  // Send selected color

        fetch(window.location.href, {  // Send AJAX request to current page
            method: 'GET', 
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        })
        .then(response => response.text())
        .then(data => {
            // Extract the updated media gallery content from the response
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const updatedGallery = doc.querySelector('.product__media-wrapper').innerHTML;
            mediaWrapperContainer.innerHTML = updatedGallery;  // Replace the old gallery with the new one
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

