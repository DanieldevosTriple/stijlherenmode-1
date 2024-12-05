// Selecteer alle radio buttons en de afbeelding
const radioButtons = document.querySelectorAll('input[type="radio"][name^="Color"]:checked');
const image = document.querySelector('.featured-media__image');

// Voeg een event listener toe aan elke radio button
radioButtons.forEach(radio => {
  radio.addEventListener('change', () => {
    // Update de src van de afbeelding
    image.src = radio.value;
  });
});