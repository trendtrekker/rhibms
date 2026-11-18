const { getDb } = require('../../lib/db');
const { authenticateAdmin } = require('../../lib/auth');

const LEVEL_SQL = `CASE 
  WHEN program ILIKE '%msc%' OR program ILIKE '%master%' OR program ILIKE '%mba%' OR program ILIKE '%post graduate%' THEN 'masters'
  WHEN program ILIKE '%bsc%' OR program ILIKE '%btech%' OR program ILIKE '%bed%' OR program ILIKE '%direct%' OR program ILIKE '%conversion%' OR program ILIKE '%top-up%' THEN 'bsc'
  ELSE 'hnd'
END`;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const admin = authenticateAdmin(req);
  if (!admin) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Admin session expired or invalid.' });
  }

  try {
    const { status, category, degree_level, search, limit = 50, offset = 0 } = req.query;
    const sql = getDb();

    let queryText = `SELECT *, ${LEVEL_SQL} AS degree_level FROM admissions WHERE 1=1`;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      queryText += ` AND status = $${params.length}`;
    }

    if (category && category !== 'all') {
      params.push(category);
      queryText += ` AND school_category = $${params.length}`;
    }

    if (degree_level && degree_level !== 'all') {
      params.push(degree_level);
      queryText += ` AND (${LEVEL_SQL}) = $${params.length}`;
    }

    if (typeof search === 'string' && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term);
      queryText += ` AND (LOWER(full_name) LIKE $${params.length} OR LOWER(reference_no) LIKE $${params.length} OR phone LIKE $${params.length} OR LOWER(program) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
    }

    queryText += ' ORDER BY created_at DESC, id DESC';

    params.push(Math.min(100, Math.max(1, parseInt(limit, 10) || 50)));
    queryText += ` LIMIT $${params.length}`;

    params.push(Math.max(0, parseInt(offset, 10) || 0));
    queryText += ` OFFSET $${params.length}`;

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
    if (degree_level && degree_level !== 'all') {
      countParams.push(degree_level);
      countQuery += ` AND (${LEVEL_SQL}) = $${countParams.length}`;
    }
    if (typeof search === 'string' && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      countParams.push(term);
      countQuery += ` AND (LOWER(full_name) LIKE $${countParams.length} OR LOWER(reference_no) LIKE $${countParams.length} OR phone LIKE $${countParams.length} OR LOWER(program) LIKE $${countParams.length} OR LOWER(email) LIKE $${countParams.length})`;
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
