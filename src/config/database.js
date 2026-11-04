require('dotenv').config();

const { Pool } = require('pg');

const requiredVariables = [
  'PGHOST',
  'PGPORT',
  'PGDATABASE',
  'PGUSER',
  'PGPASSWORD',
];
const hasPgVariables = requiredVariables.every((name) => Boolean(process.env[name]));
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (!hasPgVariables && !hasDatabaseUrl) {
  throw new Error(`Faltan variables de entorno: ${missingVariables.join(', ')}`);
}

const pool = hasDatabaseUrl && !hasPgVariables
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool();

module.exports = pool;
