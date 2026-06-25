const pool = require('../config/database');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { SHIPPING_FLAT_RATE } = require('../config/constants');

async function placeOrder(userId) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const items = await Cart.getCheckoutItems(userId, conn);
    if (items.length === 0) {
      await conn.rollback();
      return { error: 'Cart is empty', status: 400 };
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0) + SHIPPING_FLAT_RATE;
    const orderId = await Order.create(userId, total, conn);

    for (const item of items) {
      await Order.createItem(orderId, item, conn);
    }

    await Cart.clearByUserId(userId, conn);
    await conn.commit();

    return { message: 'Order placed', orderId, total, status: 201 };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getUserOrders(userId) {
  return Order.findByUserIdGrouped(userId);
}

async function getAdminOrders() {
  return Order.findAllAdminGrouped();
}

async function updateOrderStatus(orderId, status) {
  return Order.updateStatus(orderId, status);
}

module.exports = {
  placeOrder,
  getUserOrders,
  getAdminOrders,
  updateOrderStatus
};
