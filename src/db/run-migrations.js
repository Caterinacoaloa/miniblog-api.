const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/database');

const migrationsDirectory = path.join(__dirname, '..', '..', 'database', 'migrations');

async function runMigrations() {
  const migrationFiles = (await fs.readdir(migrationsDirectory))
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const fileName of migrationFiles) {
    const { rowCount } = await pool.query(
      'SELECT 1 FROM schema_migrations WHERE name = $1',
      [fileName]
    );

    if (rowCount > 0) {
      continue;
    }

    const migrationPath = path.join(migrationsDirectory, fileName);
    const migrationSql = await fs.readFile(migrationPath, 'utf8');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(migrationSql);
      await client.query(
        'INSERT INTO schema_migrations (name) VALUES ($1)',
        [fileName]
      );
      await client.query('COMMIT');
      console.log(`Migración aplicada: ${fileName}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Falló la migración ${fileName}: ${error.message}`, { cause: error });
    } finally {
      client.release();
    }
  }
}

if (require.main === module) {
  runMigrations()
    .catch((error) => {
      console.error('No se pudieron aplicar las migraciones:', error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = runMigrations;
