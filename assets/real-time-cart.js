document.addEventListener('DOMContentLoaded', function () {
    fetch('/cart.js')
      .then(response => response.json())
      .then(data => {
        const cartItemCount = data.item_count || 0;
        const cartIcon = document.querySelector('.cart-icon img');
  
        if (cartItemCount === 0) {
          cartIcon.src = '{{ "icon-cart-empty.svg" | asset_url }}'; // Pas het pad aan
          cartIcon.alt = 'Empty Cart';
        } else {
          cartIcon.src = '{{ "icon-cart.svg" | asset_url }}'; // Pas het pad aan
          cartIcon.alt = 'Cart with Items';
        }
      })
      .catch(error => console.error('Error fetching cart data:', error));
  });
  