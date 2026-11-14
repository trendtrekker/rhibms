const { neon } = require('@neondatabase/serverless');

let sql = null;

function getDb() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not defined. Please set it in your Neon or Vercel dashboard.');
  }

  if (!sql) {
    sql = neon(databaseUrl);
  }
  return sql;
}

module.exports = {
  getDb
};
