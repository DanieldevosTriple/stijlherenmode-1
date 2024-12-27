document.addEventListener('DOMContentLoaded', function () {
  // Haal de winkelwagentje-gegevens op
  fetch('/cart.js')
    .then(response => response.json())
    .then(data => {
      const cartItemCount = data.item_count || 0;

      // Zoek de desktop cart-link en update het aantal artikelen
      const desktopCartLink = document.querySelector('.d-none.d-lg-block .cart-link');
      if (desktopCartLink) {
        if (cartItemCount > 0) {
          desktopCartLink.innerHTML = `Winkelwagen (${cartItemCount})`;
        } else {
          desktopCartLink.innerHTML = `Winkelwagen`;
        }
      }

      // Zoek de mobiele cart-link en update het aantal artikelen en het pictogram
      const mobileCartLink = document.querySelector('.d-lg-none .cart-link');
      const mobileCartBubble = document.querySelector('.d-lg-none .cart-bubble');
      const mobileCartIcon = mobileCartLink.querySelector('img');

      if (mobileCartLink) {
        // Update het aantal artikelen in de bubble
        if (cartItemCount > 0) {
          mobileCartBubble.textContent = cartItemCount;
        } else {
          mobileCartBubble.textContent = '';
        }

        // Update het winkelwagentje-icoon
        if (mobileCartIcon) {
          if (cartItemCount === 0) {
            mobileCartLink.innerHTML = `{{ 'icon-cart-empty.svg' | inline_asset_content }}<p class="cart-bubble"></p>`;
          } else {
            mobileCartLink.innerHTML = `{{ 'icon-cart.svg' | inline_asset_content }}<p class="cart-bubble">${cartItemCount}</p>`;
          }
        }
      }
    })
    .catch(error => console.error('Error fetching cart data:', error));
});
