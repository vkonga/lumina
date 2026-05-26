const pool = require('../config/db');

const createUser = async (username, email, passwordHash) => {
  const result = await pool.query(
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, is_admin, created_at',
    [username, email, passwordHash]
  );
  return result.rows[0];
};

const findByEmail = async (email) => {
  const result = await pool.query(
    'SELECT id, username, email, password, is_admin FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  return result.rows[0];
};

const findByUsername = async (username) => {
  const result = await pool.query(
    'SELECT id, username, email, is_admin FROM users WHERE LOWER(username) = LOWER($1)',
    [username]
  );
  return result.rows[0];
};

const updatePassword = async (email, passwordHash) => {
  const result = await pool.query(
    'UPDATE users SET password = $1 WHERE LOWER(email) = LOWER($2) RETURNING id, username, email',
    [passwordHash, email]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findByEmail,
  findByUsername,
  updatePassword,
};
