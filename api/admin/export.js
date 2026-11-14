const { getDb } = require('../../lib/db');
const { authenticateAdmin } = require('../../lib/auth');

function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

module.exports = async function handler(req, res) {
  // Can be authorized via bearer token or token query param for direct download
  const token = req.query.token;
  let admin = null;
  if (token) {
    const { verifyToken } = require('../../lib/auth');
    admin = verifyToken(token);
  } else {
    admin = authenticateAdmin(req);
  }

  if (!admin) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT 
        reference_no,
        full_name,
        phone,
        email,
        city,
        qualification,
        graduation_year,
        school_attended,
        program,
        school_category,
        intake_session,
        hostel_needed,
        status,
        tuition_status,
        tuition_amount_paid,
        admin_notes,
        created_at
      FROM admissions
      ORDER BY created_at DESC;
    `;

    const headers = [
      'Reference No',
      'Full Name',
      'Phone',
      'Email',
      'City',
      'Qualification',
      'Grad Year',
      'School Attended',
      'Program Choice',
      'Faculty/Category',
      'Intake Session',
      'Hostel Needed',
      'Status',
      'Tuition Status',
      'Tuition Paid (FCFA)',
      'Admin Notes',
      'Application Date'
    ];

    let csvContent = headers.join(',') + '\n';

    rows.forEach(r => {
      const line = [
        escapeCsv(r.reference_no),
        escapeCsv(r.full_name),
        escapeCsv(r.phone),
        escapeCsv(r.email),
        escapeCsv(r.city),
        escapeCsv(r.qualification),
        escapeCsv(r.graduation_year),
        escapeCsv(r.school_attended),
        escapeCsv(r.program),
        escapeCsv(r.school_category),
        escapeCsv(r.intake_session),
        escapeCsv(r.hostel_needed ? 'Yes' : 'No'),
        escapeCsv(r.status),
        escapeCsv(r.tuition_status),
        escapeCsv(r.tuition_amount_paid),
        escapeCsv(r.admin_notes),
        escapeCsv(new Date(r.created_at).toISOString())
      ];
      csvContent += line.join(',') + '\n';
    });

    const filename = `rhibms-admissions-registry-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to export registry' });
  }
};
