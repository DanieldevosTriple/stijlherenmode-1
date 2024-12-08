document.addEventListener('DOMContentLoaded', () => {
    console.debug('DOM fully loaded and parsed.');

    // Functie om informatie van de afbeeldingen uit te lezen
    function getImageDetails() {
        const fullPageImages = document.querySelectorAll('.full-page-image img');

        if (fullPageImages.length === 0) {
            console.warn('No <img> tags found inside .full-page-image.');
            return;
        }

        fullPageImages.forEach((img, index) => {
            const src = img.getAttribute('src');
            const srcset = img.getAttribute('srcset');
            const sizes = img.getAttribute('sizes');
            const width = img.width;
            const height = img.height;

            console.info(`Image ${index + 1}:`);
            console.info(`  - src: ${src}`);
            console.info(`  - srcset: ${srcset}`);
            console.info(`  - sizes: ${sizes}`);
            console.info(`  - dimensions: ${width}x${height}`);
        });
    }

    // Utility function to check if an image is dark
    function isImageDark(image) {
        console.debug('Checking if image is dark:', image);

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

        const darkRatio = darkPixelCount / totalPixels;
        console.debug(`Dark pixel ratio: ${darkRatio}`);
        return darkRatio > 0.5; // More than 50% dark pixels
    }

    // Function to handle class toggling
    function updateClasses() {
        console.debug('Running updateClasses...');
        const fullPageImages = document.querySelectorAll('.full-page-image img');
        const firstMenu = document.querySelector('.first-menu .nav-item');
        const logo = document.querySelector('.logo');
        const textSecondMenu = document.querySelector('.text-second-menu');

        if (!firstMenu || !logo || !textSecondMenu) {
            console.error('One or more elements (firstMenu, logo, textSecondMenu) are missing!');
            return;
        }

        fullPageImages.forEach((img, index) => {
            console.debug(`Checking image ${index + 1}...`, img);
            const parent = img.closest('.full-page-image');
            const isActive = parent.getAttribute('aria-hidden') === "true";
            console.debug(`Image active: ${isActive}`);

            if (isActive && isImageDark(img)) {
                console.info('Image is dark and active. Adding classes...');
                firstMenu.classList.add('dark-mode');
                logo.classList.add('dark-mode');
                textSecondMenu.classList.add('dark-mode');
            } else {
                console.info('Image is not dark or not active. Removing classes...');
                firstMenu.classList.remove('dark-mode');
                logo.classList.remove('dark-mode');
                textSecondMenu.classList.remove('dark-mode');
            }
        });
    }

    // Event listeners for scroll and slide changes
    document.addEventListener('scroll', () => {
        console.debug('Scroll event detected');
        updateClasses();
    });

    const observer = new MutationObserver(() => {
        console.debug('Mutation detected');
        updateClasses();
    });

    const images = document.querySelectorAll('.full-page-image');
    if (images.length === 0) {
        console.warn('No .full-page-image elements found.');
    } else {
        console.info(`Found ${images.length} .full-page-image elements. Setting up MutationObserver...`);
        images.forEach(image => {
            observer.observe(image, { attributes: true, attributeFilter: ['aria-hidden'] });
        });
    }

    // Initial call
    console.debug('Initial call to updateClasses...');
    getImageDetails(); // Haal details van de afbeeldingen op
    updateClasses();   // Pas de klassen aan op basis van de condities
});
