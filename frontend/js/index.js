/* ============================================
   SATCHEL & CO — index.js
   Home page specific logic
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  // If products are already loaded synchronously, render immediately.
  // Otherwise, script.js DOMContentLoaded listener will handle it once async fetch completes.
  if (typeof PRODUCTS !== 'undefined' && PRODUCTS.length > 0) {
    renderProductGrid("product-grid");
  }
});
