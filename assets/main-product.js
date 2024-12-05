document.addEventListener('DOMContentLoaded', function () {
  // Selecteer de titel en het JSON-script dat de variantinformatie bevat
  const productTitle = document.querySelector('.product__title h1');
  const variantJsonElement = document.querySelector('script[data-selected-variant]');

  if (!productTitle) {
    console.error('Product title element is missing.');
    return;
  }

  if (!variantJsonElement) {
    console.error('Variant JSON script element is missing.');
    return;
  }

  // Functie om de titel bij te werken
  const updateTitle = (color) => {
    const baseTitle = productTitle.closest('.product__title').getAttribute('data-title');
    productTitle.textContent = `${baseTitle} - ${color}`;
    console.log(`Updated title to: ${baseTitle} - ${color}`);
  };

  // Functie om de geselecteerde kleur op te halen
  const getSelectedColor = () => {
    const selectedInput = document.querySelector('input[type="radio"][name^="Color"]:checked');
    return selectedInput ? selectedInput.value : null;
  };

  // Initialiseer de titel met de geselecteerde variant
  const initialColor = getSelectedColor();
  if (initialColor) {
    updateTitle(initialColor);
  } else {
    console.warn('No initial color found.');
  }

  // Luister naar wijzigingen in de kleur swatches met event delegation
  const colorFieldset = document.querySelector('fieldset[name^="Color"]') || document;
  colorFieldset.addEventListener('change', function (event) {
    const target = event.target;
    if (target && target.type === 'radio' && target.name.startsWith('Color')) {
      const newColor = getSelectedColor();
      if (newColor) {
        updateTitle(newColor);
      } else {
        console.warn('No color selected.');
      }
    }
  });
});
