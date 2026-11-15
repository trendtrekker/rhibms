const { getDb } = require('../../lib/db');
const { authenticateAdmin } = require('../../lib/auth');

const statuses = new Set(['pending', 'under_review', 'accepted', 'rejected', 'enrolled']);
const paymentStatuses = new Set(['unpaid', 'partially_paid', 'fully_paid']);

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    res.setHeader('Allow', ['POST', 'PATCH']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const admin = authenticateAdmin(req);
  if (!admin) return res.status(401).json({ success: false, error: 'Unauthorized.' });

  const { id, status, adminNotes, tuitionStatus, tuitionAmountPaid } = req.body || {};
  const amount = tuitionAmountPaid == null ? null : Number(tuitionAmountPaid);
  if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0 ||
      (status != null && !statuses.has(status)) ||
      (adminNotes != null && typeof adminNotes !== 'string') ||
      (tuitionStatus != null && !paymentStatuses.has(tuitionStatus)) ||
      (amount != null && (!Number.isFinite(amount) || amount < 0 || amount >= 10000000000))) {
    return res.status(400).json({ success: false, error: 'Check the application status and payment details.' });
  }

  try {
    const sql = getDb();
    const [updated] = await sql`
      WITH previous AS (
        SELECT id, status FROM admissions WHERE id = ${Number(id)} FOR UPDATE
      ), changed AS (
        UPDATE admissions AS admission
        SET status = COALESCE(${status ?? null}, admission.status),
            admin_notes = COALESCE(${adminNotes ?? null}, admission.admin_notes),
            tuition_status = COALESCE(${tuitionStatus ?? null}, admission.tuition_status),
            tuition_amount_paid = COALESCE(${amount}, admission.tuition_amount_paid),
            updated_at = NOW()
        FROM previous
        WHERE admission.id = previous.id
        RETURNING admission.*, previous.status AS previous_status
      ), audit AS (
        INSERT INTO admission_logs (admission_id, admin_username, action, previous_value, new_value)
        SELECT id, ${admin.username}, 'STATUS_CHANGE', previous_status, status
        FROM changed WHERE previous_status IS DISTINCT FROM status
      )
      SELECT * FROM changed;
    `;

    if (!updated) return res.status(404).json({ success: false, error: 'Admission record not found.' });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating admission status:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to save admission changes.' });
  }
};
