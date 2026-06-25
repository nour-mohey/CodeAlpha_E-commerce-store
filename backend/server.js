const path = require('path');
const express = require('express');
const cors = require('cors');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();
const FRONTEND_DIR = path.join(__dirname, '../frontend');
const PAGES_DIR = path.join(FRONTEND_DIR, 'pages');
const HTML_PAGES = ['login', 'register', 'cart', 'product', 'orders', 'admin'];

app.use(cors());
app.use(express.json());

// Redirect legacy /pages/* URLs to root-level routes
app.get('/pages/:page', (req, res) => {
  res.redirect(301, `/${req.params.page}`);
});
app.get('/pages/:page.html', (req, res) => {
  res.redirect(301, `/${req.params.page}.html`);
});

app.use(express.static(FRONTEND_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

HTML_PAGES.forEach((page) => {
  const filePath = path.join(PAGES_DIR, `${page}.html`);
  app.get(`/${page}`, (req, res) => res.sendFile(filePath));
  app.get(`/${page}.html`, (req, res) => res.sendFile(filePath));
});

app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api', orderRoutes);
app.use('/api/admin', adminRoutes);

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

module.exports = app;
