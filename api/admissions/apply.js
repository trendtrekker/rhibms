const { randomInt } = require('node:crypto');
const { getDb } = require('../../lib/db');

const groups = require('../../assets/js/program-catalog');
const categories = new Map(groups.flatMap(group => group.programs.map(({ name }) => [name, group.category])));
const degreeLevels = new Map(groups.flatMap(group => group.programs.map(({ name, level }) => [name, level || group.level || 'hnd'])));

let columnEnsured = false;
async function ensureDegreeLevelColumn(sql) {
  if (columnEnsured) return;
  try {
    await sql`ALTER TABLE admissions ADD COLUMN IF NOT EXISTS degree_level VARCHAR(30) DEFAULT 'hnd';`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admissions_degree_level ON admissions(degree_level);`;
    await sql`UPDATE admissions SET degree_level = 'masters' WHERE (degree_level IS NULL OR degree_level = 'hnd') AND (program ILIKE '%msc%' OR program ILIKE '%master%' OR program ILIKE '%mba%' OR program ILIKE '%post graduate%');`;
    await sql`UPDATE admissions SET degree_level = 'bsc' WHERE (degree_level IS NULL OR degree_level = 'hnd') AND (program ILIKE '%bsc%' OR program ILIKE '%btech%' OR program ILIKE '%bed%' OR program ILIKE '%direct%');`;
    columnEnsured = true;
  } catch (e) {
    console.warn('Degree level migration note:', e.message);
  }
}

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
    const degreeLevel = degreeLevels.get(program) || 'hnd';
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

    await ensureDegreeLevelColumn(sql);

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
        degree_level,
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
        ${degreeLevel},
        ${schoolCategory},
        ${intakeSession},
        ${isHostel}
      )
      RETURNING id, reference_no, full_name, program, degree_level, status, created_at;
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
        degreeLevel: saved.degree_level,
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
