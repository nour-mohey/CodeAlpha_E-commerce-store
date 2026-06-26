const authService = require('../services/authService');
const { isValidEmail, isValidPassword } = require('../utils/validation');

async function register(req, res) {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters and include uppercase, lowercase, and a symbol'
    });
  }

  try {
    const result = await authService.register({ name, email, password });
    res.status(201).json({ message: 'Account created', ...result });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      return res.status(503).json({ error: 'Database unavailable. Make sure MySQL is running.' });
    }
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
}

async function login(req, res) {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  try {
    const result = await authService.login({ email, password });
    if (!result) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ message: 'Login successful', ...result });
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      return res.status(503).json({ error: 'Database unavailable. Make sure MySQL is running.' });
    }
    res.status(500).json({ error: err.message || 'Login failed' });
  }
}

module.exports = { register, login };
