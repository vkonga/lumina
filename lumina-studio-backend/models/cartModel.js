const pool = require('../config/db');

const getCartByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT 
       ci.id AS cart_item_id,
       ci.quantity,
       ci.selected_size,
       ci.custom_image,
       ci.custom_color,
       p.id AS product_id,
       p.title,
       (p.price + COALESCE(ps.price_modifier, 0)) AS price,
       p.category,
       p.description,
       p.image
     FROM cart_items ci
     INNER JOIN products p ON ci.product_id = p.id
     LEFT JOIN product_sizes ps ON ci.product_id = ps.product_id AND ci.selected_size = ps.size
     WHERE ci.user_id = $1
     ORDER BY ci.id ASC`,
    [userId]
  );
  return result.rows;
};

const addToCart = async (userId, productId, quantity, selectedSize = '', customImage = null, customColor = null) => {
  const size = selectedSize || '';
  // When a custom image or color is provided, always insert a new row (don't upsert)
  // so each custom item is unique. Otherwise use the standard upsert.
  if (customImage || customColor) {
    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity, selected_size, custom_image, custom_color)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, productId, quantity, size, customImage, customColor]
    );
    return result.rows[0];
  }

  const result = await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity, selected_size, custom_image, custom_color)
     VALUES ($1, $2, $3, $4, NULL, NULL)
     ON CONFLICT (user_id, product_id, selected_size)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING *`,
    [userId, productId, quantity, size]
  );
  return result.rows[0];
};

const updateCartItemQuantity = async (userId, productId, quantity, selectedSize = '') => {
  const size = selectedSize || '';
  const result = await pool.query(
    `UPDATE cart_items
     SET quantity = $3
     WHERE user_id = $1 AND product_id = $2 AND selected_size = $4
     RETURNING *`,
    [userId, productId, quantity, size]
  );
  return result.rows[0];
};

const removeFromCart = async (userId, productId, selectedSize = '') => {
  const size = selectedSize || '';
  const result = await pool.query(
    `DELETE FROM cart_items
     WHERE user_id = $1 AND product_id = $2 AND selected_size = $3
     RETURNING *`,
    [userId, productId, size]
  );
  return result.rows[0];
};

const clearCart = async (userId) => {
  const result = await pool.query(
    `DELETE FROM cart_items
     WHERE user_id = $1
     RETURNING *`,
    [userId]
  );
  return result.rows;
};

module.exports = {
  getCartByUserId,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
};
