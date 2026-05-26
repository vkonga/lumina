const pool = require('../config/db');

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Access denied. Please sign in first.' });
    }

    const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user || !user.is_admin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server authentication error.' });
  }
};

module.exports = adminMiddleware;
