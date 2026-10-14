-- Authentication table for bishopric members who manage the schedule.
-- Passwords are stored as bcrypt hashes, never in plain text.

CREATE TABLE IF NOT EXISTS users (
  id       SERIAL       PRIMARY KEY,
  name     VARCHAR(255) NOT NULL,
  email    VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Demo bishopric account.
-- Email:    bishop@maplehills.test
-- Password: Sacrament2026!
INSERT INTO users (name, email, password)
VALUES ('Bishop Daniel Smith', 'bishop@maplehills.test', '$2b$10$6l3lVc.kxVubwUirre1DgeMwEo9SXxK6kzViPiGuk0P/HRo9vD1ru')
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, name = EXCLUDED.name;
