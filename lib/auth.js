const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rhibms-admissions-secure-secret-2026';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function authenticateAdmin(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  return verifyToken(token);
}

module.exports = {
  signToken,
  verifyToken,
  authenticateAdmin
};
