const pool = require('../config/database');

class Order {
  static async create(userId, totalAmount, conn) {
    const db = conn || pool;
    const [result] = await db.query(
      'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
      [userId, totalAmount]
    );
    return result.insertId;
  }

  static async createItem(orderId, item, conn) {
    const db = conn || pool;
    await db.query(
      'INSERT INTO order_items (order_id, product_id, color, quantity, price) VALUES (?, ?, ?, ?, ?)',
      [orderId, item.product_id, item.color, item.quantity, item.price]
    );
  }

  static async findByUserIdGrouped(userId) {
    const query = `
      SELECT o.id AS order_id, o.total_amount, o.status, o.created_at,
             oi.id AS item_id, oi.product_id, oi.color, oi.quantity, oi.price,
             p.name AS product_name, p.category AS product_category
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;
    const [rows] = await pool.query(query, [userId]);
    return groupOrderRows(rows);
  }

  static async findAllAdminGrouped() {
    const query = `
      SELECT o.id AS order_id, o.total_amount, o.status, o.created_at,
             u.name AS user_name, u.email AS user_email,
             oi.id AS item_id, oi.product_id, oi.color, oi.quantity, oi.price,
             p.name AS product_name, p.category AS product_category
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      ORDER BY o.created_at DESC
    `;
    const [rows] = await pool.query(query);
    return groupAdminOrderRows(rows);
  }

  static async updateStatus(id, status) {
    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows;
  }
}

function groupOrderRows(results) {
  const ordersMap = {};
  results.forEach((row) => {
    if (!ordersMap[row.order_id]) {
      ordersMap[row.order_id] = {
        id: row.order_id,
        total_amount: Number(row.total_amount),
        status: row.status,
        created_at: row.created_at,
        items: []
      };
    }
    if (row.item_id) {
      ordersMap[row.order_id].items.push({
        id: row.item_id,
        product_id: row.product_id,
        product_name: row.product_name,
        product_category: row.product_category,
        color: row.color,
        quantity: row.quantity,
        price: Number(row.price)
      });
    }
  });
  return Object.values(ordersMap);
}

function groupAdminOrderRows(results) {
  const ordersMap = {};
  results.forEach((row) => {
    if (!ordersMap[row.order_id]) {
      ordersMap[row.order_id] = {
        id: row.order_id,
        total_amount: Number(row.total_amount),
        status: row.status,
        created_at: row.created_at,
        user_name: row.user_name,
        user_email: row.user_email,
        items: []
      };
    }
    if (row.item_id) {
      ordersMap[row.order_id].items.push({
        id: row.item_id,
        product_id: row.product_id,
        product_name: row.product_name,
        product_category: row.product_category,
        color: row.color,
        quantity: row.quantity,
        price: Number(row.price)
      });
    }
  });
  return Object.values(ordersMap);
}

module.exports = Order;
