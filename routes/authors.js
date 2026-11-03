const express = require('express');
const authors = require('../services/authors');

const router = express.Router();

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function validateAuthor(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'El cuerpo de la solicitud debe ser un objeto JSON.';
  }

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    return 'El nombre es obligatorio y no puede estar vacío.';
  }

  if (body.name.trim().length > 100) {
    return 'El nombre no puede superar los 100 caracteres.';
  }

  if (typeof body.email !== 'string' || body.email.trim().length === 0) {
    return 'El email es obligatorio.';
  }

  const email = body.email.trim();
  if (
    email.length > 150
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return 'El email no tiene un formato válido.';
  }

  if (body.bio !== undefined && body.bio !== null && typeof body.bio !== 'string') {
    return 'La biografía debe ser texto o null.';
  }

  return null;
}

function authorInput(body) {
  return {
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    bio: body.bio ?? null,
  };
}

router.get('/', async (req, res) => {
  const result = await authors.listAuthors();
  res.status(200).json(result);
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo.' });
  }

  const author = await authors.getAuthorById(id);
  if (!author) {
    return res.status(404).json({ error: 'Autor no encontrado.' });
  }

  return res.status(200).json(author);
});

router.post('/', async (req, res) => {
  const validationError = validateAuthor(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const author = await authors.createAuthor(authorInput(req.body));
  return res.status(201).json(author);
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo.' });
  }

  const validationError = validateAuthor(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const author = await authors.updateAuthor(id, authorInput(req.body));
  if (!author) {
    return res.status(404).json({ error: 'Autor no encontrado.' });
  }

  return res.status(200).json(author);
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo.' });
  }

  const deleted = await authors.deleteAuthor(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Autor no encontrado.' });
  }

  return res.status(204).end();
});

module.exports = router;
