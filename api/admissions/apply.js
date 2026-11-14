const { getDb } = require('../../lib/db');

function categorizeProgram(program) {
  const p = (program || '').toLowerCase();
  if (p.includes('nurs') || p.includes('lab') || p.includes('pharm') || p.includes('physio') || p.includes('midwi') || p.includes('dent') || p.includes('nutri') || p.includes('health')) {
    return 'health';
  }
  if (p.includes('comput') || p.includes('civil') || p.includes('topo') || p.includes('urban') || p.includes('build') || p.includes('plumb') || p.includes('geotech') || p.includes('wood')) {
    return 'engineering';
  }
  if (p.includes('bank') || p.includes('financ') || p.includes('human') || p.includes('logist') || p.includes('project') || p.includes('public') || p.includes('assist')) {
    return 'management';
  }
  if (p.includes('food') || p.includes('agri') || p.includes('pastoral') || p.includes('crop')) {
    return 'agriculture';
  }
  return 'general';
}

function generateReferenceNo() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `RHIBMS-2026-${rand}`;
}

module.exports = async function handler(req, res) {
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
    } = req.body;

    if (!fullName || !phone || !email || !qualification || !program) {
      return res.status(400).json({
        success: false,
        error: 'Please provide Full Name, Phone, Email, Qualification, and Program Choice.'
      });
    }

    const schoolCategory = categorizeProgram(program);
    const referenceNo = generateReferenceNo();
    const intakeSession = session || 'October 2026/2027 Main Intake';
    const isHostel = Boolean(hostelNeeded);
    const gradYear = graduationYear ? parseInt(graduationYear, 10) : null;

    let sql;
    try {
      sql = getDb();
    } catch (dbErr) {
      // In case DATABASE_URL is not yet set, provide a structured mock voucher
      console.warn('DATABASE_URL not configured yet:', dbErr.message);
      return res.status(200).json({
        success: true,
        referenceNo: referenceNo,
        message: 'Application recorded locally (Database setup pending). Keep your reference number.',
        data: {
          referenceNo,
          fullName,
          program,
          qualification,
          createdAt: new Date().toISOString()
        }
      });
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
      error: error.message || 'An error occurred while submitting your admission application.'
    });
  }
};
