const jwt = require('jsonwebtoken');

function signingSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || ['rhibms-admissions-secure-secret-2026', 'rhibms-admissions-super-secure-key-2026'].includes(secret)) {
    throw new Error('Configure a unique JWT_SECRET of at least 32 characters.');
  }
  return secret;
}

function signToken(payload) {
  return jwt.sign(payload, signingSecret(), { expiresIn: '7d', algorithm: 'HS256' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, signingSecret(), { algorithms: ['HS256'] });
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
