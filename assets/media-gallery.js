// Selecteer alle radio buttons, de afbeelding, en de thumbnails
const radioButtons = document.querySelectorAll('input[type="radio"][name^="Color"]');
const image = document.querySelector('.featured-media__image');
const thumbnails = document.querySelectorAll('.media-thumbnail');

// Log het aantal gevonden radio buttons
console.log(`Aantal radio buttons gevonden: ${radioButtons.length}`);

// Voeg een event listener toe aan elke radio button
radioButtons.forEach(radio => {
  radio.addEventListener('change', () => {
    // Log de waarde van de geselecteerde radio button
    console.log(`Geselecteerde waarde: ${radio.value}`);

    // Haal de afbeelding-URL op uit het data-attribuut
    const imageUrl = radio.getAttribute('data-variant-image');
    
    if (imageUrl) {
      // Update de src van de afbeelding
      image.src = imageUrl;

      // Log de nieuwe afbeelding-URL
      console.log(`Afbeeldingsbron aangepast naar: ${imageUrl}`);
    } else {
      console.error('Geen afbeelding gevonden voor de geselecteerde variant.');
    }
    
    // Loop door alle thumbnails en toon/verberg op basis van data-variant-color
    thumbnails.forEach(thumbnail => {
      const variantColor = thumbnail.getAttribute('data-variant-color');
      if (variantColor.includes(radio.value)) {
        // Toon de thumbnail
        thumbnail.style.display = 'block';
        console.log(`Toon thumbnail met data-variant-color: ${variantColor}`);
      } else {
        // Verberg de thumbnail
        thumbnail.style.display = 'none';
        console.log(`Verberg thumbnail met data-variant-color: ${variantColor}`);
      }
    });
  });
});