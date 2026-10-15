-- Authentication table for bishopric members who manage the schedule.
-- Passwords are stored as bcrypt hashes, never in plain text.

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL       PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  -- Soft delete: deactivated accounts keep their row (so meeting history and
  -- the unique email stay intact) but can no longer sign in.
  is_active  BOOLEAN      NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Safe to re-run against an existing table.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active  BOOLEAN     NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Demo bishopric account.
-- Email:    bishop@maplehills.test
-- Password: Sacrament2026!
INSERT INTO users (name, email, password)
VALUES ('Bishop Daniel Smith', 'bishop@maplehills.test', '$2b$10$6l3lVc.kxVubwUirre1DgeMwEo9SXxK6kzViPiGuk0P/HRo9vD1ru')
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, name = EXCLUDED.name;
