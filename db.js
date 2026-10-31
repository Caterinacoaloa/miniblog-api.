const pool = require('./db/pool');

async function checkDatabaseConnection() {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    console.log('Conexión a PostgreSQL correcta:', rows[0].now);
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

checkDatabaseConnection();
