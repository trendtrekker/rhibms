const { initDatabase } = require('../../scripts/init-db');

module.exports = async function handler(req, res) {
  // Allow GET or POST
  try {
    const result = await initDatabase();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Database initialization error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to initialize database. Make sure DATABASE_URL is set.'
    });
  }
};
