const assert = require('node:assert/strict');
const test = require('node:test');
const request = require('supertest');
const pool = require('../db/pool');
const { app } = require('../server');

const sampleAuthor = {
  id: 12,
  name: 'Ana',
  email: 'ana@example.com',
  bio: null,
  created_at: '2026-10-27T00:00:00.000Z',
};

function mockQuery(t, implementation) {
  const originalQuery = pool.query;
  pool.query = implementation;
  t.after(() => {
    pool.query = originalQuery;
  });
}

test('GET /authors devuelve la lista de autores', async (t) => {
  mockQuery(t, async () => ({ rows: [sampleAuthor] }));

  const response = await request(app).get('/authors');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, [sampleAuthor]);
});

test('GET /authors/:id valida el id y responde 404 si no existe', async (t) => {
  let queryCalled = false;
  mockQuery(t, async () => {
    queryCalled = true;
    return { rows: [] };
  });

  const invalidResponse = await request(app).get('/authors/abc');
  assert.equal(invalidResponse.status, 400);
  assert.equal(queryCalled, false);

  const missingResponse = await request(app).get('/authors/999');
  assert.equal(missingResponse.status, 404);
});

test('POST /authors valida y crea un autor', async (t) => {
  let queryArguments;
  mockQuery(t, async (...args) => {
    queryArguments = args;
    return { rows: [sampleAuthor] };
  });

  const invalidResponse = await request(app)
    .post('/authors')
    .send({ name: '   ', email: 'ana@example.com' });
  assert.equal(invalidResponse.status, 400);
  assert.equal(queryArguments, undefined);

  const response = await request(app)
    .post('/authors')
    .send({ name: ' Ana ', email: ' Ana@Example.COM ' });

  assert.equal(response.status, 201);
  assert.deepEqual(queryArguments[1], ['Ana', 'ana@example.com', null]);
});

test('POST /authors responde 409 si el email ya existe', async (t) => {
  mockQuery(t, async () => {
    const error = new Error('duplicate key');
    error.code = '23505';
    throw error;
  });

  const response = await request(app)
    .post('/authors')
    .send({ name: 'Ana', email: 'ana@example.com' });

  assert.equal(response.status, 409);
});

test('PUT /authors/:id actualiza los datos y responde 404 si falta el autor', async (t) => {
  let authorExists = true;
  mockQuery(t, async () => ({ rows: authorExists ? [sampleAuthor] : [] }));

  const updatedResponse = await request(app)
    .put('/authors/12')
    .send({ name: 'Ana', email: 'ana@example.com', bio: 'Autora' });
  assert.equal(updatedResponse.status, 200);

  authorExists = false;
  const missingResponse = await request(app)
    .put('/authors/999')
    .send({ name: 'Ana', email: 'ana@example.com' });
  assert.equal(missingResponse.status, 404);
});

test('DELETE /authors/:id elimina y responde 204 o 404', async (t) => {
  let authorExists = true;
  mockQuery(t, async () => ({ rowCount: authorExists ? 1 : 0 }));

  const deletedResponse = await request(app).delete('/authors/12');
  assert.equal(deletedResponse.status, 204);

  authorExists = false;
  const missingResponse = await request(app).delete('/authors/999');
  assert.equal(missingResponse.status, 404);
});
