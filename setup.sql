CREATE TABLE authors (

 id SERIAL PRIMARY KEY,

 name VARCHAR(100) NOT NULL,

 email VARCHAR(150) UNIQUE NOT NULL,

 bio TEXT,

 created_at TIMESTAMPTZ DEFAULT NOW()

);
CREATE TABLE posts (

 id SERIAL PRIMARY KEY,

 title VARCHAR(200) NOT NULL,

 content TEXT NOT NULL,

 author_id INTEGER NOT NULL,

 published BOOLEAN DEFAULT FALSE,

 created_at TIMESTAMPTZ DEFAULT NOW(),

 FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE

);

CREATE TABLE comments (

 id SERIAL PRIMARY KEY,

 post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

 author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE CASCADE,

 content TEXT NOT NULL CHECK (LENGTH(TRIM(content)) > 0),

 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX posts_author_id_idx ON posts (author_id);
CREATE INDEX comments_post_id_idx ON comments (post_id);
CREATE INDEX comments_author_id_idx ON comments (author_id);