const assert = require('node:assert/strict');
const test = require('node:test');
const request = require('supertest');
const pool = require('../src/config/database');
const { app } = require('../src/app');

const samplePost = {
  id: 21,
  author_id: 1,
  title: 'Mi publicación',
  content: 'Contenido de prueba',
  published: false,
  created_at: '2026-10-27T00:00:00.000Z',
};

function mockQuery(t, implementation) {
  const originalQuery = pool.query;
  pool.query = implementation;
  t.after(() => {
    pool.query = originalQuery;
  });
}

test('GET /posts devuelve publicaciones', async (t) => {
  mockQuery(t, async () => ({ rows: [samplePost] }));

  const response = await request(app).get('/posts');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, [samplePost]);
});

test('GET /posts/:id responde 400 para ids inválidos y 404 si no existe', async (t) => {
  mockQuery(t, async () => ({ rows: [] }));

  const invalidResponse = await request(app).get('/posts/abc');
  assert.equal(invalidResponse.status, 400);

  const missingResponse = await request(app).get('/posts/999');
  assert.equal(missingResponse.status, 404);
});

test('GET /posts/author/:authorId devuelve publicaciones con datos del autor', async (t) => {
  mockQuery(t, async (sql, values) => {
    assert.match(sql, /JOIN authors/);
    assert.deepEqual(values, [1]);
    return { rows: [{ ...samplePost, author_name: 'Cate' }] };
  });

  const response = await request(app).get('/posts/author/1');

  assert.equal(response.status, 200);
  assert.equal(response.body[0].author_name, 'Cate');
});

test('POST /posts valida los campos y crea una publicación', async (t) => {
  let queryArguments;
  mockQuery(t, async (...args) => {
    queryArguments = args;
    return { rows: [samplePost] };
  });

  const invalidResponse = await request(app)
    .post('/posts')
    .send({ title: '   ', content: 'Contenido', author_id: 1 });
  assert.equal(invalidResponse.status, 400);
  assert.equal(queryArguments, undefined);

  const response = await request(app)
    .post('/posts')
    .send({
      title: ' Mi publicación ',
      content: ' Contenido de prueba ',
      author_id: 1,
    });

  assert.equal(response.status, 201);
  assert.deepEqual(queryArguments[1], [
    'Mi publicación',
    'Contenido de prueba',
    1,
    false,
  ]);
});

test('POST /posts responde 400 si el autor referenciado no existe', async (t) => {
  mockQuery(t, async () => {
    const error = new Error('foreign key violation');
    error.code = '23503';
    throw error;
  });

  const response = await request(app)
    .post('/posts')
    .send({ title: 'Prueba', content: 'Contenido', author_id: 999 });

  assert.equal(response.status, 400);
});

test('PUT /posts/:id actualiza y responde 404 cuando no encuentra la publicación', async (t) => {
  let postExists = true;
  mockQuery(t, async () => ({ rows: postExists ? [samplePost] : [] }));

  const updatedResponse = await request(app)
    .put('/posts/21')
    .send({
      title: 'Editado',
      content: 'Contenido editado',
      author_id: 1,
      published: true,
    });
  assert.equal(updatedResponse.status, 200);

  postExists = false;
  const missingResponse = await request(app)
    .put('/posts/999')
    .send({ title: 'Editado', content: 'Contenido', author_id: 1 });
  assert.equal(missingResponse.status, 404);
});

test('DELETE /posts/:id responde 204 o 404', async (t) => {
  let postExists = true;
  mockQuery(t, async () => ({ rowCount: postExists ? 1 : 0 }));

  const deletedResponse = await request(app).delete('/posts/21');
  assert.equal(deletedResponse.status, 204);

  postExists = false;
  const missingResponse = await request(app).delete('/posts/999');
  assert.equal(missingResponse.status, 404);
});
