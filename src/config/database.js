require('dotenv').config();

const { Pool } = require('pg');

const requiredVariables = [
  'PGHOST',
  'PGPORT',
  'PGDATABASE',
  'PGUSER',
  'PGPASSWORD',
];

const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
  throw new Error(`Faltan variables de entorno: ${missingVariables.join(', ')}`);
}

const pool = new Pool();

module.exports = pool;
