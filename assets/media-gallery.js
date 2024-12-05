// Selecteer alle radio buttons en de afbeelding
const radioButtons = document.querySelectorAll('input[type="radio"][name^="Color"]');
const image = document.querySelector('.featured-media__image');

// Log het aantal gevonden radio buttons
console.log(`Aantal radio buttons gevonden: ${radioButtons.length}`);

// Voeg een event listener toe aan elke radio button
radioButtons.forEach(radio => {
  radio.addEventListener('change', () => {
    // Log de waarde van de geselecteerde radio button
    console.log(`Geselecteerde waarde: ${radio.value}`);
    
    // Update de src van de afbeelding
    image.src = radio.value;

    // Log de nieuwe afbeelding die is ingesteld
    console.log(`Afbeeldingsbron aangepast naar: ${image.src}`);
  });
});