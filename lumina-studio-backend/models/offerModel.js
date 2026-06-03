const pool = require('../config/db');

const getAllOffers = async () => {
  const result = await pool.query('SELECT * FROM offers ORDER BY id DESC');
  return result.rows;
};

const getActiveOffers = async () => {
  const result = await pool.query('SELECT id, title, description, image_url, discount_code, is_active FROM offers WHERE is_active = true ORDER BY id DESC');
  return result.rows;
};

const getOfferById = async (id) => {
  const result = await pool.query('SELECT * FROM offers WHERE id = $1', [id]);
  return result.rows[0];
};

const createOffer = async (data) => {
  const { title, description, image_url, discount_code, is_active } = data;
  const activeStatus = is_active !== undefined ? is_active : true;
  const result = await pool.query(
    `INSERT INTO offers (title, description, image_url, discount_code, is_active) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [title, description, image_url || null, discount_code || null, activeStatus]
  );
  return result.rows[0];
};

const updateOffer = async (id, data) => {
  const { title, description, image_url, discount_code, is_active } = data;
  const result = await pool.query(
    `UPDATE offers 
     SET title = $1, description = $2, image_url = $3, discount_code = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
     WHERE id = $6 
     RETURNING *`,
    [title, description, image_url || null, discount_code || null, is_active, id]
  );
  return result.rows[0];
};

const deleteOffer = async (id) => {
  const result = await pool.query('DELETE FROM offers WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = {
  getAllOffers,
  getActiveOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
};
