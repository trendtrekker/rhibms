const { getDb } = require('../../lib/db');
const { authenticateAdmin } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  const admin = authenticateAdmin(req);
  if (!admin) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Admin session expired or invalid.' });
  }

  try {
    const { status, category, search, limit = 50, offset = 0 } = req.query;
    let sql;
    try {
      sql = getDb();
    } catch (e) {
      return res.status(200).json({
        success: true,
        admissions: [],
        total: 0,
        warning: 'Neon database not connected yet. Please set DATABASE_URL.'
      });
    }

    const conditions = [];

    let queryText = 'SELECT * FROM admissions WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      queryText += ` AND status = $${params.length}`;
    }

    if (category && category !== 'all') {
      params.push(category);
      queryText += ` AND school_category = $${params.length}`;
    }

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term);
      queryText += ` AND (LOWER(full_name) LIKE $${params.length} OR LOWER(reference_no) LIKE $${params.length} OR phone LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
    }

    queryText += ' ORDER BY created_at DESC';

    params.push(parseInt(limit, 10) || 50);
    queryText += ` LIMIT $${params.length}`;

    params.push(parseInt(offset, 10) || 0);
    queryText += ` OFFSET $${params.length}`;

    // Execute raw parameterized query via neon connection
    // We can also query using neon template tags or helper
    const rows = await sql(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM admissions WHERE 1=1';
    const countParams = [];
    if (status && status !== 'all') {
      countParams.push(status);
      countQuery += ` AND status = $${countParams.length}`;
    }
    if (category && category !== 'all') {
      countParams.push(category);
      countQuery += ` AND school_category = $${countParams.length}`;
    }
    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      countParams.push(term);
      countQuery += ` AND (LOWER(full_name) LIKE $${countParams.length} OR LOWER(reference_no) LIKE $${countParams.length} OR phone LIKE $${countParams.length} OR LOWER(email) LIKE $${countParams.length})`;
    }

    const countRes = await sql(countQuery, countParams);
    const totalCount = parseInt(countRes[0]?.count || 0, 10);

    return res.status(200).json({
      success: true,
      admissions: rows,
      total: totalCount
    });

  } catch (error) {
    console.error('Error fetching admissions:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch admissions' });
  }
};
