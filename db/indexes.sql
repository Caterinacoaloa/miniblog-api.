CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts (author_id);
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments (post_id);
CREATE INDEX IF NOT EXISTS comments_author_id_idx ON comments (author_id);
