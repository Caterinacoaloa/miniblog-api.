const express = require('express');
const pool = require('./db/pool');
const authorsRouter = require('./routes/authors');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');

const app = express();

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Error al comprobar la conexión con PostgreSQL:', error.message);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/authors', authorsRouter);
app.use('/posts', postsRouter);
app.use('/posts/:postId/comments', commentsRouter);

app.use((error, req, res, next) => {
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Ya existe un autor con ese email.' });
  }

  if (error.status === 400) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no es JSON válido.' });
  }

  if (error.code === '23503') {
    return res.status(400).json({ error: 'El autor o la publicación indicada no existe.' });
  }

  console.error('Error interno de la API:', error.message);
  return res.status(500).json({ error: 'Error interno del servidor.' });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });
}

module.exports = { app };
