// server.js — Satchel & Co. backend
// All routes live here in one file (no controllers/routes split, per project preference)

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./src/config/db');
require('dotenv').config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'satchel_dev_secret';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// =========================================
// FRIENDLY HTML ROUTES
// =========================================
const HTML_DIR = path.join(__dirname, 'public', 'html');
const HTML_PAGES = ['index', 'login', 'register', 'cart', 'product', 'orders', 'admin'];

app.get('/', (req, res) => {
  res.sendFile(path.join(HTML_DIR, 'index.html'));
});

HTML_PAGES.forEach((page) => {
  const filePath = path.join(HTML_DIR, `${page}.html`);
  if (page !== 'index') {
    app.get(`/${page}`, (req, res) => res.sendFile(filePath));
  }
  app.get(`/${page}.html`, (req, res) => res.sendFile(filePath));
});

// =========================================
// AUTH MIDDLEWARE
// =========================================
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// helper: turn raw DB row into a frontend-shaped product
function shapeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    description: row.description,
    colors: row.colors.split(','),
    details: row.details.split('|'),
    stock: row.stock
  };
}

// =========================================
// AUTH ROUTES
// =========================================
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: err.message });
        }
        const token = jwt.sign({ id: result.insertId }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: 'Account created', token, user: { id: result.insertId, name, email, role: 'customer' } });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});

// =========================================
// PRODUCT ROUTES
// =========================================
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.map(shapeProduct));
  });
});

app.get('/api/products/:id', (req, res) => {
  db.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(shapeProduct(results[0]));
  });
});

// =========================================
// CART ROUTES (require login)
// =========================================
app.get('/api/cart', requireAuth, (req, res) => {
  db.query(
    `SELECT cart.id, cart.product_id, cart.color, cart.quantity,
            products.name, products.price, products.category
     FROM cart
     JOIN products ON cart.product_id = products.id
     WHERE cart.user_id = ?`,
    [req.userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

app.post('/api/cart', requireAuth, (req, res) => {
  const { product_id, color, quantity } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id is required' });

  db.query(
    'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND color = ?',
    [req.userId, product_id, color],
    (err, existing) => {
      if (err) return res.status(500).json({ error: err.message });

      if (existing.length > 0) {
        db.query(
          'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
          [quantity || 1, existing[0].id],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Cart updated' });
          }
        );
      } else {
        db.query(
          'INSERT INTO cart (user_id, product_id, color, quantity) VALUES (?, ?, ?, ?)',
          [req.userId, product_id, color, quantity || 1],
          (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Added to cart', id: result.insertId });
          }
        );
      }
    }
  );
});

app.put('/api/cart/:id', requireAuth, (req, res) => {
  const { quantity } = req.body;
  db.query(
    'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
    [quantity, req.params.id, req.userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Quantity updated' });
    }
  );
});

app.delete('/api/cart/:id', requireAuth, (req, res) => {
  db.query(
    'DELETE FROM cart WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Item removed' });
    }
  );
});

// =========================================
// ORDER ROUTES (require login)
// =========================================
app.post('/api/orders', requireAuth, (req, res) => {
  db.query(
    `SELECT cart.product_id, cart.color, cart.quantity, products.price
     FROM cart JOIN products ON cart.product_id = products.id
     WHERE cart.user_id = ?`,
    [req.userId],
    (err, items) => {
      if (err) return res.status(500).json({ error: err.message });
      if (items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0) + 8; // + flat shipping

      db.query(
        'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
        [req.userId, total],
        (err, orderResult) => {
          if (err) return res.status(500).json({ error: err.message });
          const orderId = orderResult.insertId;

          items.forEach(item => {
            db.query(
              'INSERT INTO order_items (order_id, product_id, color, quantity, price) VALUES (?, ?, ?, ?, ?)',
              [orderId, item.product_id, item.color, item.quantity, item.price]
            );
          });

          db.query('DELETE FROM cart WHERE user_id = ?', [req.userId]);

          res.status(201).json({ message: 'Order placed', orderId, total });
        }
      );
    }
  );
});

app.get('/api/orders', requireAuth, (req, res) => {
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
  db.query(query, [req.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Group results by order_id
    const ordersMap = {};
    results.forEach(row => {
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
    
    res.json(Object.values(ordersMap));
  });
});

// =========================================
// ADMIN MIDDLEWARE & ROUTES
// =========================================
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    db.query('SELECT role FROM users WHERE id = ?', [req.userId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0 || results[0].role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
      }
      next();
    });
  });
}

// Admin: Get all users
app.get('/api/admin/users', requireAdmin, (req, res) => {
  db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Admin: Update user role
app.put('/api/admin/users/:id/role', requireAdmin, (req, res) => {
  const { role } = req.body;
  if (role !== 'customer' && role !== 'admin') {
    return res.status(400).json({ error: 'Invalid role' });
  }
  db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User role updated successfully' });
  });
});

// Admin: Create product
app.post('/api/admin/products', requireAdmin, (req, res) => {
  const { id, name, category, price, description, colors, details, stock } = req.body;
  if (!id || !name || !category || price === undefined) {
    return res.status(400).json({ error: 'ID, name, category, and price are required' });
  }
  db.query(
    'INSERT INTO products (id, name, category, price, description, colors, details, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, category, price, description || '', colors || '', details || '', stock !== undefined ? stock : 50],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Product created successfully', id });
    }
  );
});

// Admin: Update product
app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const { name, category, price, description, colors, details, stock } = req.body;
  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: 'Name, category, and price are required' });
  }
  db.query(
    'UPDATE products SET name = ?, category = ?, price = ?, description = ?, colors = ?, details = ?, stock = ? WHERE id = ?',
    [name, category, price, description || '', colors || '', details || '', stock !== undefined ? stock : 50, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
      res.json({ message: 'Product updated successfully' });
    }
  );
});

// Admin: Delete product
app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  db.query('DELETE FROM products WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  });
});

// Admin: Get all orders in the system
app.get('/api/admin/orders', requireAdmin, (req, res) => {
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
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const ordersMap = {};
    results.forEach(row => {
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

    res.json(Object.values(ordersMap));
  });
});

// Admin: Update order status
app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order status updated successfully' });
  });
});

// =========================================
// START SERVER
// =========================================
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🛍  Satchel & Co. server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Stop the other process or set a different PORT in .env`);
  } else {
    console.error('❌ Server failed to start:', err.message);
  }
  process.exit(1);
});
