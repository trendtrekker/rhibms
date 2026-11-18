const { getDb } = require('../../lib/db');
const { authenticateAdmin } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const admin = authenticateAdmin(req);
  if (!admin) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  try {
    const sql = getDb();

    const counts = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'under_review') as under_review,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'enrolled') as enrolled,
        COALESCE(SUM(tuition_amount_paid), 0) as total_tuition,
        COUNT(*) FILTER (WHERE school_category = 'health') as cat_health,
        COUNT(*) FILTER (WHERE school_category = 'engineering') as cat_engineering,
        COUNT(*) FILTER (WHERE school_category = 'management') as cat_management,
        COUNT(*) FILTER (WHERE school_category = 'agriculture') as cat_agriculture,
        COUNT(*) FILTER (WHERE degree_level = 'masters') as level_masters,
        COUNT(*) FILTER (WHERE degree_level = 'bsc') as level_bsc,
        COUNT(*) FILTER (WHERE degree_level = 'hnd' OR degree_level IS NULL) as level_hnd
      FROM admissions;
    `;

    const recent = await sql`
      SELECT id, reference_no, full_name, program, school_category, degree_level, status, created_at
      FROM admissions
      ORDER BY created_at DESC, id DESC
      LIMIT 5;
    `;

    const row = counts[0] || {};

    return res.status(200).json({
      success: true,
      stats: {
        total: parseInt(row.total || 0, 10),
        pending: parseInt(row.pending || 0, 10),
        under_review: parseInt(row.under_review || 0, 10),
        accepted: parseInt(row.accepted || 0, 10),
        rejected: parseInt(row.rejected || 0, 10),
        enrolled: parseInt(row.enrolled || 0, 10),
        totalTuition: parseFloat(row.total_tuition || 0),
        byCategory: {
          health: parseInt(row.cat_health || 0, 10),
          engineering: parseInt(row.cat_engineering || 0, 10),
          management: parseInt(row.cat_management || 0, 10),
          agriculture: parseInt(row.cat_agriculture || 0, 10)
        },
        byLevel: {
          masters: parseInt(row.level_masters || 0, 10),
          bsc: parseInt(row.level_bsc || 0, 10),
          hnd: parseInt(row.level_hnd || 0, 10)
        },
        recent
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch stats' });
  }
};
