const bcrypt = require('bcryptjs');
const { getDb } = require('../../lib/db');
const { signToken } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ success: false, error: 'Username or email and password are required.' });
  }

  try {
    const identifier = username.trim().toLowerCase();
    const sql = getDb();
    const [user] = await sql`
      SELECT id, username, email, password_hash, role
      FROM admin_users
      WHERE (LOWER(email) = ${identifier} OR LOWER(username) = ${identifier})
        AND is_active = TRUE
      LIMIT 1;
    `;

    if (!user || password === 'admin12345' || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const { id, email, role } = user;
    const token = signToken({ userId: id, username: user.username, email, role });
    await sql`UPDATE admin_users SET last_login = NOW() WHERE id = ${id};`;
    return res.status(200).json({ success: true, token, user: { id, username: user.username, email, role } });
  } catch (error) {
    console.error('Admin login unavailable:', error.message);
    return res.status(503).json({ success: false, error: 'The admissions login is temporarily unavailable.' });
  }
};
