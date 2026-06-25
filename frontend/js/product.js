/* ============================================
   SATCHEL & CO — product.js
   Product details page specific logic
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof PRODUCTS !== 'undefined' && PRODUCTS.length > 0) {
    renderProductDetail();
    // sync the second category label (under breadcrumb header) used in sidebar
    const catEl = document.getElementById("product-cat");
    const catEl2 = document.getElementById("product-cat-2");
    if (catEl && catEl2) {
      catEl2.textContent = catEl.textContent;
    }
  }
});
