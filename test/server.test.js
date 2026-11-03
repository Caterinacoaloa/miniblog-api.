const assert = require('node:assert/strict');
const test = require('node:test');
const request = require('supertest');
const { app } = require('../src/app');

test('una ruta inexistente responde 404 en JSON', async () => {
  const response = await request(app).get('/ruta-que-no-existe');

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: 'Ruta no encontrada.' });
});
