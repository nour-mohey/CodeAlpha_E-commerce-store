const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bags_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

pool.getConnection()
  .then((conn) => {
    console.log('✅ Connected to MySQL — bags_db');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.code, err.message);
    console.error('   Start MySQL (e.g. XAMPP) and run backend/schema.sql if bags_db does not exist.');
  });

module.exports = pool;