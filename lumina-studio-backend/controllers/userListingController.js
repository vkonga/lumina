const pool = require('../config/db');

// ─── SERVICES ───────────────────────────────────────────────────────────────

/**
 * GET /api/listings/services
 * Returns services created by the authenticated user.
 */
const getUserServices = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, title, img, price, reference_images, created_at FROM services WHERE user_id = $1 ORDER BY id DESC',
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/listings/services
 * Create a new service belonging to the authenticated user.
 */
const createUserService = async (req, res, next) => {
  try {
    const { title, img, price, reference_images } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Service title is required.' });
    }

    const servicePrice = parseFloat(price) || 0.0;

    const result = await pool.query(
      `INSERT INTO services (title, img, price, reference_images, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, img, price, reference_images, created_at`,
      [title.trim(), img || '', servicePrice, reference_images || '', req.user.id]
    );

    res.status(201).json({
      message: 'Service added successfully.',
      service: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/listings/services/:id
 * Delete a service — only if it belongs to the requesting user.
 */
const deleteUserService = async (req, res, next) => {
  try {
    const serviceId = parseInt(req.params.id, 10);

    // Verify ownership first
    const check = await pool.query(
      'SELECT id, user_id FROM services WHERE id = $1',
      [serviceId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    if (check.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorised to delete this service.' });
    }

    await pool.query('DELETE FROM services WHERE id = $1', [serviceId]);

    res.status(200).json({ message: 'Service deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

/**
 * GET /api/listings/products
 * Returns store products created by the authenticated user.
 */
const getUserProducts = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.price, p.category, p.description, p.image, p.created_at,
              COALESCE(
                json_agg(
                  json_build_object('size', ps.size, 'price_modifier', ps.price_modifier)
                ) FILTER (WHERE ps.id IS NOT NULL),
                '[]'
              ) AS sizes
       FROM products p
       LEFT JOIN product_sizes ps ON ps.product_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.id DESC`,
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/listings/products
 * Create a new store product belonging to the authenticated user.
 */
const createUserProduct = async (req, res, next) => {
  try {
    const { title, price, description, category, image, sizes } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Product title is required.' });
    }
    if (price === undefined || price === null || price === '') {
      return res.status(400).json({ error: 'Product price is required.' });
    }

    const basePrice = parseFloat(price);
    if (isNaN(basePrice) || basePrice < 0) {
      return res.status(400).json({ error: 'Invalid product price.' });
    }

    const result = await pool.query(
      `INSERT INTO products (title, price, description, category, image, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, price, description, category, image, created_at`,
      [
        title.trim(),
        basePrice,
        description || '',
        category || 'store',
        image || '',
        req.user.id,
      ]
    );

    const newProduct = result.rows[0];

    // Insert sizes if provided
    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      for (const s of sizes) {
        if (s.size) {
          const mod = parseFloat(s.price_modifier) || 0.0;
          await pool.query(
            'INSERT INTO product_sizes (product_id, size, price_modifier) VALUES ($1, $2, $3)',
            [newProduct.id, s.size, mod]
          );
        }
      }
    }

    // Return with sizes attached
    const sizesResult = await pool.query(
      'SELECT size, price_modifier FROM product_sizes WHERE product_id = $1 ORDER BY id ASC',
      [newProduct.id]
    );

    res.status(201).json({
      message: 'Product added to store successfully.',
      product: { ...newProduct, sizes: sizesResult.rows },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/listings/products/:id
 * Delete a product — only if it belongs to the requesting user.
 */
const deleteUserProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);

    const check = await pool.query(
      'SELECT id, user_id FROM products WHERE id = $1',
      [productId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (check.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorised to delete this product.' });
    }

    // Cascade: delete product sizes first
    await pool.query('DELETE FROM product_sizes WHERE product_id = $1', [productId]);
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);

    res.status(200).json({ message: 'Product deleted from store successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserServices,
  createUserService,
  deleteUserService,
  getUserProducts,
  createUserProduct,
  deleteUserProduct,
};
