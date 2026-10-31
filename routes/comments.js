const express = require('express');
const comments = require('../services/comments');

const router = express.Router({ mergeParams: true });

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function validateComment(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'El cuerpo de la solicitud debe ser un objeto JSON.';
  }

  if (!Number.isSafeInteger(body.author_id) || body.author_id < 1) {
    return 'author_id debe ser un entero positivo.';
  }

  if (typeof body.content !== 'string' || body.content.trim().length === 0) {
    return 'El contenido es obligatorio y no puede estar vacío.';
  }

  return null;
}

router.get('/', async (req, res) => {
  const postId = parseId(req.params.postId);
  if (postId === null) {
    return res.status(400).json({ error: 'El id de la publicación debe ser un entero positivo.' });
  }

  const result = await comments.listCommentsByPost(postId);
  return res.status(200).json(result);
});

router.post('/', async (req, res) => {
  const postId = parseId(req.params.postId);
  if (postId === null) {
    return res.status(400).json({ error: 'El id de la publicación debe ser un entero positivo.' });
  }

  const validationError = validateComment(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const comment = await comments.createComment({
    post_id: postId,
    author_id: req.body.author_id,
    content: req.body.content.trim(),
  });
  return res.status(201).json(comment);
});

module.exports = router;
