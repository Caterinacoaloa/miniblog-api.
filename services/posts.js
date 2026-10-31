const pool = require('../db/pool');

async function listPosts() {
  const { rows } = await pool.query(
    `SELECT id, author_id, title, content, published, created_at
     FROM posts
     ORDER BY id`
  );
  return rows;
}

async function getPostById(id) {
  const { rows } = await pool.query(
    `SELECT id, author_id, title, content, published, created_at
     FROM posts
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function listPostsByAuthor(authorId) {
  const { rows } = await pool.query(
    `SELECT
       posts.id,
       posts.author_id,
       posts.title,
       posts.content,
       posts.published,
       posts.created_at,
       authors.name AS author_name,
       authors.email AS author_email,
       authors.bio AS author_bio
     FROM posts
     JOIN authors ON authors.id = posts.author_id
     WHERE posts.author_id = $1
     ORDER BY posts.id`,
    [authorId]
  );
  return rows;
}

async function createPost({ title, content, author_id, published }) {
  const { rows } = await pool.query(
    `INSERT INTO posts (title, content, author_id, published)
     VALUES ($1, $2, $3, $4)
     RETURNING id, author_id, title, content, published, created_at`,
    [title, content, author_id, published]
  );
  return rows[0];
}

async function updatePost(id, { title, content, author_id, published }) {
  const { rows } = await pool.query(
    `UPDATE posts
     SET title = $1, content = $2, author_id = $3, published = $4
     WHERE id = $5
     RETURNING id, author_id, title, content, published, created_at`,
    [title, content, author_id, published, id]
  );
  return rows[0] || null;
}

async function deletePost(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM posts WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

module.exports = {
  listPosts,
  getPostById,
  listPostsByAuthor,
  createPost,
  updatePost,
  deletePost,
};
