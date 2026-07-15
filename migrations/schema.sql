CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  location TEXT NOT NULL,
  experience INTEGER NOT NULL,
  curriculum TEXT NOT NULL,
  band TEXT NOT NULL,
  salary_low INTEGER NOT NULL,
  salary_high INTEGER NOT NULL,
  verified INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hiring_requests (
  id TEXT PRIMARY KEY,
  user_email TEXT,
  school TEXT,
  role TEXT,
  subject TEXT,
  location TEXT,
  salary_low INTEGER,
  salary_high INTEGER,
  status TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL
);
