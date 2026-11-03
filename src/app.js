const express = require('express');
const pool = require('./config/database');
const authorsRouter = require('./modules/authors/authors.routes');
const postsRouter = require('./modules/posts/posts.routes');
const commentsRouter = require('./modules/comments/comments.routes');
const errorHandler = require('./middlewares/error-handler');

const app = express();

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Error al comprobar la conexión con PostgreSQL:', error.message);
    return res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/authors', authorsRouter);
app.use('/posts', postsRouter);
app.use('/posts/:postId/comments', commentsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.use(errorHandler);

module.exports = { app };
