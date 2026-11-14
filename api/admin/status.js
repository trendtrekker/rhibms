const { getDb } = require('../../lib/db');
const { authenticateAdmin } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    res.setHeader('Allow', ['POST', 'PATCH']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const admin = authenticateAdmin(req);
  if (!admin) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  try {
    const { id, status, adminNotes, tuitionStatus, tuitionAmountPaid } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Admission ID is required.' });
    }

    const sql = getDb();

    // Check current record
    const existing = await sql`SELECT * FROM admissions WHERE id = ${id} LIMIT 1;`;
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Admission record not found.' });
    }

    const current = existing[0];
    const newStatus = status || current.status;
    const newNotes = adminNotes !== undefined ? adminNotes : current.admin_notes;
    const newTuitionStatus = tuitionStatus || current.tuition_status;
    const newTuitionPaid = tuitionAmountPaid !== undefined ? parseFloat(tuitionAmountPaid) : current.tuition_amount_paid;

    const updated = await sql`
      UPDATE admissions
      SET status = ${newStatus},
          admin_notes = ${newNotes},
          tuition_status = ${newTuitionStatus},
          tuition_amount_paid = ${newTuitionPaid},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;

    // Log the change
    if (newStatus !== current.status) {
      await sql`
        INSERT INTO admission_logs (admission_id, admin_username, action, previous_value, new_value)
        VALUES (${id}, ${admin.username}, 'STATUS_CHANGE', ${current.status}, ${newStatus});
      `;
    }

    return res.status(200).json({
      success: true,
      message: 'Admission status updated successfully',
      data: updated[0]
    });

  } catch (error) {
    console.error('Error updating admission status:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update status' });
  }
};
