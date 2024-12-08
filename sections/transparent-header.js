// Utility function to check if an image is dark
function isImageDark(image) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let darkPixelCount = 0;
    const totalPixels = imageData.length / 4;

    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const brightness = (r + g + b) / 3;
        if (brightness < 100) darkPixelCount++; // Threshold for "dark"
    }

    return darkPixelCount / totalPixels > 0.5; // More than 50% dark pixels
}

// Function to handle class toggling
function updateClasses() {
    const fullPageImages = document.querySelectorAll('.full-page-image');
    const firstMenu = document.querySelector('.first-menu .nav-item');
    const logo = document.querySelector('.logo');
    const textSecondMenu = document.querySelector('.text-second-menu');

    fullPageImages.forEach(image => {
        const isActive = image.getAttribute('aria-hidden') === "true";
        if (isActive && isImageDark(image)) {
            firstMenu.classList.add('dark-mode');
            logo.classList.add('dark-mode');
            textSecondMenu.classList.add('dark-mode');
        } else {
            firstMenu.classList.remove('dark-mode');
            logo.classList.remove('dark-mode');
            textSecondMenu.classList.remove('dark-mode');
        }
    });
}

// Event listeners for scroll and slide changes
document.addEventListener('scroll', updateClasses);

const observer = new MutationObserver(() => {
    updateClasses();
});

document.querySelectorAll('.full-page-image').forEach(image => {
    observer.observe(image, { attributes: true, attributeFilter: ['aria-hidden'] });
});

// Initial call
updateClasses();
