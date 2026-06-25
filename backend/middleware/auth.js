const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const { JWT_SECRET } = require('../config/constants');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await authService.getUserSession(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
