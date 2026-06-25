const orderService = require('../services/orderService');

async function placeOrder(req, res) {
  try {
    const result = await orderService.placeOrder(req.user.id);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    res.status(201).json({
      message: result.message,
      orderId: result.orderId,
      total: result.total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOrders(req, res) {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { placeOrder, getOrders };
