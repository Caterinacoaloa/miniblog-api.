const comments = require('./comments.service');
const parseId = require('../../utils/parse-id');

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

async function listByPost(req, res) {
  const postId = parseId(req.params.postId);
  if (postId === null) {
    return res.status(400).json({ error: 'El id de la publicación debe ser un entero positivo.' });
  }

  const result = await comments.listCommentsByPost(postId);
  return res.status(200).json(result);
}

async function create(req, res) {
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
}

module.exports = { listByPost, create };
