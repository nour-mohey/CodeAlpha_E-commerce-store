const User = require('../models/User');
const productService = require('../services/productService');
const orderService = require('../services/orderService');

async function getUsers(req, res) {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateUserRole(req, res) {
  const { role } = req.body;

  if (role !== 'customer' && role !== 'admin') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const affected = await User.updateRole(req.params.id, role);
    if (affected === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User role updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createProduct(req, res) {
  const { id, name, category, price, description, colors, details, stock } = req.body;

  if (!id || !name || !category || price === undefined) {
    return res.status(400).json({ error: 'ID, name, category, and price are required' });
  }

  if (Number(price) <= 0) {
    return res.status(400).json({ error: 'Price must be greater than 0' });
  }

  try {
    await productService.createProduct({ id, name, category, price, description, colors, details, stock });
    res.status(201).json({ message: 'Product created successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateProduct(req, res) {
  const { name, category, price, description, colors, details, stock } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: 'Name, category, and price are required' });
  }

  if (Number(price) <= 0) {
    return res.status(400).json({ error: 'Price must be greater than 0' });
  }

  try {
    const affected = await productService.updateProduct(req.params.id, {
      name, category, price, description, colors, details, stock
    });
    if (affected === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const affected = await productService.deleteProduct(req.params.id);
    if (affected === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllOrders(req, res) {
  try {
    const orders = await orderService.getAdminOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateOrderStatus(req, res) {
  const { status } = req.body;
  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const affected = await orderService.updateOrderStatus(req.params.id, status);
    if (affected === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getUsers,
  updateUserRole,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus
};
