const pool = require('../../config/database');

async function listCommentsByPost(postId) {
  const { rows } = await pool.query(
    `SELECT
       comments.id,
       comments.post_id,
       comments.author_id,
       comments.content,
       comments.created_at,
       authors.name AS author_name
     FROM comments
     JOIN authors ON authors.id = comments.author_id
     WHERE comments.post_id = $1
     ORDER BY comments.id`,
    [postId]
  );
  return rows;
}

async function createComment({ post_id, author_id, content }) {
  const { rows } = await pool.query(
    `INSERT INTO comments (post_id, author_id, content)
     VALUES ($1, $2, $3)
     RETURNING id, post_id, author_id, content, created_at`,
    [post_id, author_id, content]
  );
  return rows[0];
}

module.exports = { listCommentsByPost, createComment };
