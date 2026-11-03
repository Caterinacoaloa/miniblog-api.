const { app } = require('./app');
const pool = require('./config/database');
const runMigrations = require('./db/run-migrations');

async function startServer() {
  await runMigrations();

  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    });
  }
}

if (require.main === module) {
  startServer().catch(async (error) => {
    console.error('No se pudo iniciar la aplicación:', error.message);
    await pool.end();
    process.exitCode = 1;
  });
}

module.exports = { startServer };
