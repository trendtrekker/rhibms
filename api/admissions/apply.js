const { randomInt } = require('node:crypto');
const { getDb } = require('../../lib/db');

const groups = require('../../assets/js/program-catalog');
const categories = new Map(groups.flatMap(group => group.programs.map(({ name }) => [name, group.category])));

function generateReferenceNo() {
  const rand = randomInt(100000000, 1000000000);
  return `RHIBMS-2026-${rand}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const {
      fullName,
      phone,
      email,
      city,
      qualification,
      graduationYear,
      schoolAttended,
      program,
      session,
      hostelNeeded
    } = req.body || {};

    if (!fullName || !phone || !email || !qualification || !program) {
      return res.status(400).json({
        success: false,
        error: 'Please provide Full Name, Phone, Email, Qualification, and Program Choice.'
      });
    }

    const schoolCategory = categories.get(program);
    if (!schoolCategory) {
      return res.status(400).json({ success: false, error: 'Choose a programme from the current catalogue.' });
    }
    const referenceNo = generateReferenceNo();
    const intakeSession = session || 'October 2026/2027 Main Intake';
    const isHostel = hostelNeeded === true;
    const gradYear = graduationYear ? parseInt(graduationYear, 10) : null;

    let sql;
    try {
      sql = getDb();
    } catch {
      return res.status(503).json({ success: false, error: 'The admissions registry is temporarily unavailable. Please try again later.' });
    }

    const rows = await sql`
      INSERT INTO admissions (
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
        hostel_needed
      ) VALUES (
        ${referenceNo},
        ${fullName},
        ${phone},
        ${email},
        ${city || ''},
        ${qualification},
        ${gradYear},
        ${schoolAttended || ''},
        ${program},
        ${schoolCategory},
        ${intakeSession},
        ${isHostel}
      )
      RETURNING id, reference_no, full_name, program, status, created_at;
    `;

    const saved = rows[0];

    return res.status(201).json({
      success: true,
      referenceNo: saved.reference_no,
      data: {
        id: saved.id,
        referenceNo: saved.reference_no,
        fullName: saved.full_name,
        program: saved.program,
        status: saved.status,
        createdAt: saved.created_at
      }
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({
      success: false,
      error: 'The application could not be saved. Please try again.'
    });
  }
};
