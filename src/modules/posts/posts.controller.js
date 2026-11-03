const posts = require('./posts.service');
const parseId = require('../../utils/parse-id');

function validatePost(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'El cuerpo de la solicitud debe ser un objeto JSON.';
  }

  if (typeof body.title !== 'string' || body.title.trim().length === 0) {
    return 'El título es obligatorio y no puede estar vacío.';
  }

  if (body.title.trim().length > 200) {
    return 'El título no puede superar los 200 caracteres.';
  }

  if (typeof body.content !== 'string' || body.content.trim().length === 0) {
    return 'El contenido es obligatorio y no puede estar vacío.';
  }

  if (!Number.isSafeInteger(body.author_id) || body.author_id < 1) {
    return 'author_id debe ser un entero positivo.';
  }

  if (body.published !== undefined && typeof body.published !== 'boolean') {
    return 'published debe ser true o false.';
  }

  return null;
}

function postInput(body) {
  return {
    title: body.title.trim(),
    content: body.content.trim(),
    author_id: body.author_id,
    published: body.published ?? false,
  };
}

async function list(req, res) {
  const result = await posts.listPosts();
  return res.status(200).json(result);
}

async function getById(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo.' });
  }

  const post = await posts.getPostById(id);
  if (!post) {
    return res.status(404).json({ error: 'Publicación no encontrada.' });
  }

  return res.status(200).json(post);
}

async function listByAuthor(req, res) {
  const authorId = parseId(req.params.authorId);
  if (authorId === null) {
    return res.status(400).json({ error: 'El id del autor debe ser un entero positivo.' });
  }

  const result = await posts.listPostsByAuthor(authorId);
  return res.status(200).json(result);
}

async function create(req, res) {
  const validationError = validatePost(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const post = await posts.createPost(postInput(req.body));
  return res.status(201).json(post);
}

async function update(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo.' });
  }

  const validationError = validatePost(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const post = await posts.updatePost(id, postInput(req.body));
  if (!post) {
    return res.status(404).json({ error: 'Publicación no encontrada.' });
  }

  return res.status(200).json(post);
}

async function remove(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo.' });
  }

  const deleted = await posts.deletePost(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Publicación no encontrada.' });
  }

  return res.status(204).end();
}

module.exports = { list, getById, listByAuthor, create, update, remove };
