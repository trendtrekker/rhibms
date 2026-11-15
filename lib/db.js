const { neon } = require('@neondatabase/serverless');

let sql = null;

function getDb() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) {
    throw new Error('The admissions database connection is not configured.');
  }

  if (!sql) {
    sql = neon(databaseUrl);
  }
  return sql;
}

module.exports = {
  getDb
};
