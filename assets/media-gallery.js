// Selecteer alle radio buttons, de afbeelding, en de thumbnails
const image = document.querySelector('.featured-media__image');
const thumbnails = document.querySelectorAll('.media-thumbnail');

// Functie om afbeelding en thumbnails te updaten
const updateImageAndThumbnails = () => {
  const selectedRadio = document.querySelector('input[type="radio"][name^="Color"]:checked');
  if (!selectedRadio) {
    console.error('Geen radio button geselecteerd.');
    return;
  }

  // Log de waarde van de geselecteerde radio button
  console.log(`Geselecteerde waarde: ${selectedRadio.value}`);

  // Haal de afbeelding-URL op uit het data-attribuut
  let imageUrl = selectedRadio.getAttribute('data-variant-image');

  // Controleer of de URL begint met //
  if (imageUrl && imageUrl.startsWith('//')) {
    imageUrl = `http:${imageUrl}`;
    console.log(`Protocol toegevoegd aan afbeelding-URL: ${imageUrl}`);
  }
  
  // Log de opgehaalde afbeelding-URL
  console.log(`Afbeeldings-URL opgehaald: ${imageUrl}`);
  
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
    if (variantColor.includes(selectedRadio.value)) {
      // Toon de thumbnail
      thumbnail.style.display = 'block';
      console.log(`Toon thumbnail met data-variant-color: ${variantColor}`);
    } else {
      // Verberg de thumbnail
      thumbnail.style.display = 'none';
      console.log(`Verberg thumbnail met data-variant-color: ${variantColor}`);
    }
  });
};

// Roep de functie aan bij het laden van de pagina
document.addEventListener('DOMContentLoaded', updateImageAndThumbnails);

// Voeg een event listener toe aan elke radio button
radioButtons.forEach(radio => {
  radio.addEventListener('change', updateImageAndThumbnails);
});