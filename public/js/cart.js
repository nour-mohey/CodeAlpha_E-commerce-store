/* ============================================
   SATCHEL & CO — cart.js
   Shopping cart page specific logic
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof PRODUCTS !== 'undefined' && PRODUCTS.length > 0) {
    renderCartPage();
  }
});
