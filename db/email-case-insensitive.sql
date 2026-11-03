ALTER TABLE authors
  DROP CONSTRAINT IF EXISTS authors_email_key;

CREATE UNIQUE INDEX IF NOT EXISTS authors_email_lower_idx
  ON authors (LOWER(email));
