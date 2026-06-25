const pool = require('../config/database');

class Product {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM products');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ id, name, category, price, description, colors, details, stock }) {
    await pool.query(
      'INSERT INTO products (id, name, category, price, description, colors, details, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, category, price, description, colors, details, stock]
    );
  }

  static async update(id, { name, category, price, description, colors, details, stock }) {
    const [result] = await pool.query(
      'UPDATE products SET name = ?, category = ?, price = ?, description = ?, colors = ?, details = ?, stock = ? WHERE id = ?',
      [name, category, price, description, colors, details, stock, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Product;
