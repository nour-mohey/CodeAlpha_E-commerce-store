const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');

function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function register({ name, email, password }) {
  const hashed = await bcrypt.hash(password, 10);
  const userId = await User.create({ name, email, password: hashed });
  const token = signToken(userId);
  return {
    token,
    user: { id: userId, name, email, role: 'customer' }
  };
}

async function login({ email, password }) {
  const user = await User.findByEmail(email);
  if (!user) return null;

  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  const token = signToken(user.id);
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
}

async function getUserSession(userId) {
  return User.findById(userId);
}

module.exports = { register, login, getUserSession, signToken };
