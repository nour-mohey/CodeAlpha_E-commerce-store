const pool = require('../config/database');

class Cart {
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT cart.id, cart.product_id, cart.color, cart.quantity,
              products.name, products.price, products.category
       FROM cart
       JOIN products ON cart.product_id = products.id
       WHERE cart.user_id = ?`,
      [userId]
    );
    return rows;
  }

  static async findItem(userId, productId, color) {
    const [rows] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND color = ?',
      [userId, productId, color]
    );
    return rows[0] || null;
  }

  static async insertItem(userId, productId, color, quantity) {
    const [result] = await pool.query(
      'INSERT INTO cart (user_id, product_id, color, quantity) VALUES (?, ?, ?, ?)',
      [userId, productId, color, quantity]
    );
    return result.insertId;
  }

  static async incrementQuantity(cartId, quantity) {
    await pool.query(
      'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
      [quantity, cartId]
    );
  }

  static async updateQuantity(cartId, userId, quantity) {
    await pool.query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, cartId, userId]
    );
  }

  static async deleteItem(cartId, userId) {
    await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [cartId, userId]);
  }

  static async getCheckoutItems(userId, conn) {
    const db = conn || pool;
    const [rows] = await db.query(
      `SELECT cart.product_id, cart.color, cart.quantity, products.price
       FROM cart JOIN products ON cart.product_id = products.id
       WHERE cart.user_id = ?`,
      [userId]
    );
    return rows;
  }

  static async clearByUserId(userId, conn) {
    const db = conn || pool;
    await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);
  }
}

module.exports = Cart;
