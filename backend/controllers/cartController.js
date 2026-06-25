const cartService = require('../services/cartService');

async function getCart(req, res) {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addToCart(req, res) {
  const { product_id, color, quantity } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'product_id is required' });
  }

  const qty = quantity || 1;
  if (qty < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  try {
    const result = await cartService.addToCart(req.user.id, { product_id, color, quantity: qty });
    if (result.status === 201) {
      return res.status(201).json({ message: result.message, id: result.id });
    }
    res.json({ message: result.message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateCartItem(req, res) {
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  try {
    await cartService.updateCartItem(req.user.id, req.params.id, quantity);
    res.json({ message: 'Quantity updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function removeCartItem(req, res) {
  try {
    await cartService.removeCartItem(req.user.id, req.params.id);
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
