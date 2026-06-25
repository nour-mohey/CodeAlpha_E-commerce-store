const Cart = require('../models/Cart');

async function getCart(userId) {
  return Cart.findByUserId(userId);
}

async function addToCart(userId, { product_id, color, quantity }) {
  const qty = quantity || 1;
  const existing = await Cart.findItem(userId, product_id, color);

  if (existing) {
    await Cart.incrementQuantity(existing.id, qty);
    return { message: 'Cart updated' };
  }

  const insertId = await Cart.insertItem(userId, product_id, color, qty);
  return { message: 'Added to cart', id: insertId, status: 201 };
}

async function updateCartItem(userId, cartId, quantity) {
  await Cart.updateQuantity(cartId, userId, quantity);
}

async function removeCartItem(userId, cartId) {
  await Cart.deleteItem(cartId, userId);
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
};
