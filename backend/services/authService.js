const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');

function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function register({ name, email, password }) {
  const normalizedName = name?.trim();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedName || !normalizedEmail || !password) {
    const err = new Error('Name, email, and password are required');
    err.code = 'INVALID_INPUT';
    throw err;
  }

  const existing = await User.findByEmail(normalizedEmail);
  if (existing) {
    const err = new Error('Email already registered');
    err.code = 'ER_DUP_ENTRY';
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  const userId = await User.create({ name: normalizedName, email: normalizedEmail, password: hashed });
  const token = signToken(userId);
  return {
    token,
    user: { id: userId, name: normalizedName, email: normalizedEmail, role: 'customer' }
  };
}

async function login({ email, password }) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !password) return null;

  const user = await User.findByEmail(normalizedEmail);
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
