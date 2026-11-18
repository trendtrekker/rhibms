const bcrypt = require('bcryptjs');
const { getDb } = require('../lib/db');

async function initDatabase() {
  const sql = getDb();

  console.log('Checking and creating tables in Neon PostgreSQL...');

  // 1. Table: admissions
  await sql`
    CREATE TABLE IF NOT EXISTS admissions (
      id SERIAL PRIMARY KEY,
      reference_no VARCHAR(30) UNIQUE NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      email VARCHAR(120) NOT NULL,
      city VARCHAR(100),
      qualification VARCHAR(80) NOT NULL,
      graduation_year INT,
      school_attended VARCHAR(150),
      program VARCHAR(150) NOT NULL,
      degree_level VARCHAR(30) DEFAULT 'hnd',
      school_category VARCHAR(80) NOT NULL,
      intake_session VARCHAR(80) NOT NULL,
      hostel_needed BOOLEAN DEFAULT FALSE,
      status VARCHAR(30) DEFAULT 'pending',
      admin_notes TEXT DEFAULT '',
      tuition_status VARCHAR(30) DEFAULT 'unpaid',
      tuition_amount_paid NUMERIC(12, 2) DEFAULT 0.00,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Indexes & Migrations
  await sql`ALTER TABLE admissions ADD COLUMN IF NOT EXISTS degree_level VARCHAR(30) DEFAULT 'hnd';`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admissions_ref ON admissions(reference_no);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admissions_degree_level ON admissions(degree_level);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admissions_program ON admissions(program);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admissions_created ON admissions(created_at DESC);`;

  // 2. Table: admin_users
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(120) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(30) DEFAULT 'admissions_officer',
      is_active BOOLEAN DEFAULT TRUE,
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // 3. Table: admission_logs
  await sql`
    CREATE TABLE IF NOT EXISTS admission_logs (
      id SERIAL PRIMARY KEY,
      admission_id INT REFERENCES admissions(id) ON DELETE CASCADE,
      admin_username VARCHAR(50) NOT NULL,
      action VARCHAR(50) NOT NULL,
      previous_value TEXT,
      new_value TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email || password) {
    if (!email || !email.includes('@') || !password || password.length < 14 || Buffer.byteLength(password) > 72) {
      throw new Error('Supply ADMIN_EMAIL and a new ADMIN_PASSWORD of at least 14 characters and at most 72 bytes.');
    }
    const hash = await bcrypt.hash(password, 12);
    await sql`
      INSERT INTO admin_users (username, email, password_hash, role)
      VALUES (${'registry-' + require('node:crypto').randomUUID()}, ${email}, ${hash}, 'admissions_officer')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
    `;
    console.log('Admissions administrator credentials saved.');
  }

  console.log('Neon database schema initialized successfully!');
  return { success: true, message: 'Database initialized successfully' };
}

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration error:', err);
      process.exit(1);
    });
}

module.exports = {
  initDatabase
};
