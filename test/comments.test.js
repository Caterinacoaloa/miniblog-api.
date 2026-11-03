const assert = require('node:assert/strict');
const test = require('node:test');
const request = require('supertest');
const pool = require('../src/config/database');
const { app } = require('../src/app');

const sampleComment = {
  id: 1,
  post_id: 5,
  author_id: 1,
  content: '¡Muy buen artículo!',
  created_at: '2026-10-30T00:00:00.000Z',
};

function mockQuery(t, implementation) {
  const originalQuery = pool.query;
  pool.query = implementation;
  t.after(() => {
    pool.query = originalQuery;
  });
}

test('GET /posts/:postId/comments lista comentarios con el nombre del autor', async (t) => {
  mockQuery(t, async (sql, values) => {
    assert.match(sql, /JOIN authors/);
    assert.deepEqual(values, [5]);
    return { rows: [{ ...sampleComment, author_name: 'Cate' }] };
  });

  const response = await request(app).get('/posts/5/comments');

  assert.equal(response.status, 200);
  assert.equal(response.body[0].author_name, 'Cate');
});

test('POST /posts/:postId/comments valida y crea un comentario', async (t) => {
  let queryArguments;
  mockQuery(t, async (...args) => {
    queryArguments = args;
    return { rows: [sampleComment] };
  });

  const invalidResponse = await request(app)
    .post('/posts/5/comments')
    .send({ author_id: 1, content: '   ' });
  assert.equal(invalidResponse.status, 400);
  assert.equal(queryArguments, undefined);

  const response = await request(app)
    .post('/posts/5/comments')
    .send({ author_id: 1, content: ' ¡Muy buen artículo! ' });

  assert.equal(response.status, 201);
  assert.deepEqual(queryArguments[1], [5, 1, '¡Muy buen artículo!']);
});

test('POST /posts/:postId/comments responde 400 si falta la publicación o el autor', async (t) => {
  mockQuery(t, async () => {
    const error = new Error('foreign key violation');
    error.code = '23503';
    throw error;
  });

  const response = await request(app)
    .post('/posts/999/comments')
    .send({ author_id: 1, content: 'Comentario de prueba' });

  assert.equal(response.status, 400);
});
