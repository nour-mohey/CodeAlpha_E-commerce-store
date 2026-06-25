const pool = require('../config/database');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ name, email, password }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }

  static async updateRole(id, role) {
    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return result.affectedRows;
  }
}

module.exports = User;
