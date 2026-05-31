const pool = require('../config/db');
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');

/**
 * Get dashboard metrics
 */
const getStats = async (req, res, next) => {
  try {
    // Total orders count
    const ordersCountRes = await pool.query('SELECT COUNT(*) as count FROM orders');
    const totalOrders = parseInt(ordersCountRes.rows[0].count, 10);

    // Total revenue (paid orders)
    const revenueRes = await pool.query("SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid'");
    const totalRevenue = parseFloat(revenueRes.rows[0].total) || 0.00;

    // Pending orders count
    const pendingCountRes = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
    const pendingOrders = parseInt(pendingCountRes.rows[0].count, 10);

    // Total registered users
    const usersCountRes = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersCountRes.rows[0].count, 10);

    // Recent orders (last 5)
    const recentOrders = await orderModel.getAllOrders();
    
    res.status(200).json({
      stats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalUsers
      },
      recentOrders: recentOrders.slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders with optional filter
 */
const getOrders = async (req, res, next) => {
  try {
    const { status, payment_status } = req.query;
    const orders = await orderModel.getAllOrders({ status, payment_status });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order detail
 */
const getOrderById = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status or payment status
 */
const updateOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status, payment_status } = req.body;

    const updatedOrder = await orderModel.updateOrderStatus(orderId, status, payment_status);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found or no update fields provided.' });
    }

    // Return full details including items
    const orderDetail = await orderModel.getOrderById(orderId);
    res.status(200).json({
      message: 'Order updated successfully.',
      order: orderDetail
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all products
 */
const getProducts = async (req, res, next) => {
  try {
    const products = await productModel.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * Update product price, title, description and sizes
 */
const updateProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { title, price, description, category, sizes } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ error: 'Title and base price are required.' });
    }

    const basePrice = parseFloat(price);

    // Update main product details
    const result = await pool.query(
      `UPDATE products 
       SET title = $1, price = $2, description = $3, category = $4 
       WHERE id = $5 
       RETURNING *`,
      [title, basePrice, description || '', category || 'store', productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const updatedProduct = result.rows[0];

    // Update sizes if provided
    if (sizes && Array.isArray(sizes)) {
      // First delete old sizes
      await pool.query('DELETE FROM product_sizes WHERE product_id = $1', [productId]);
      
      // Re-insert sizes
      for (const s of sizes) {
        if (s.size) {
          const mod = parseFloat(s.price_modifier) || 0.00;
          await pool.query(
            'INSERT INTO product_sizes (product_id, size, price_modifier) VALUES ($1, $2, $3)',
            [productId, s.size, mod]
          );
        }
      }
    }

    // Get final product with size relationships
    const allProducts = await productModel.getAllProducts();
    const finalProduct = allProducts.find(p => p.id === productId);

    res.status(200).json({
      message: 'Product updated successfully.',
      product: finalProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all services
 */
const getServices = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, title, img, price, reference_images FROM services ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Update service details
 */
const updateService = async (req, res, next) => {
  try {
    const serviceId = req.params.id;
    const { title, img, price, reference_images } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Service title is required.' });
    }

    const servicePrice = parseFloat(price) || 0.00;

    const result = await pool.query(
      `UPDATE services 
       SET title = $1, img = $2, price = $3, reference_images = $4 
       WHERE id = $5 
       RETURNING *`,
      [title, img || '', servicePrice, reference_images || '', serviceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    res.status(200).json({
      message: 'Service updated successfully.',
      service: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with order counts and spent summary
 */
const getUsers = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.created_at, 
        u.is_admin,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u 
      LEFT JOIN orders o ON u.id = o.user_id 
      GROUP BY u.id 
      ORDER BY u.id DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user detail with order history
 */
const getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    
    const userRes = await pool.query(
      'SELECT id, username, email, created_at, is_admin FROM users WHERE id = $1',
      [userId]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const user = userRes.rows[0];

    const orders = await orderModel.getUserOrders(userId);
    user.orders = orders;

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all portfolio videos
 */
const getPortfolioVideos = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, title, url FROM portfolio_videos ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new portfolio video
 */
const addPortfolioVideo = async (req, res, next) => {
  try {
    const { title, url } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and YouTube URL are required.' });
    }

    const result = await pool.query(
      'INSERT INTO portfolio_videos (title, url) VALUES ($1, $2) RETURNING *',
      [title, url]
    );

    res.status(201).json({
      message: 'Portfolio video added successfully.',
      video: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing portfolio video
 */
const updatePortfolioVideo = async (req, res, next) => {
  try {
    const videoId = parseInt(req.params.id, 10);
    const { title, url } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'Title and YouTube URL are required.' });
    }

    const result = await pool.query(
      'UPDATE portfolio_videos SET title = $1, url = $2 WHERE id = $3 RETURNING *',
      [title, url, videoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio video not found.' });
    }

    res.status(200).json({
      message: 'Portfolio video updated successfully.',
      video: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a portfolio video
 */
const deletePortfolioVideo = async (req, res, next) => {
  try {
    const videoId = parseInt(req.params.id, 10);

    const result = await pool.query(
      'DELETE FROM portfolio_videos WHERE id = $1 RETURNING *',
      [videoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio video not found.' });
    }

    res.status(200).json({
      message: 'Portfolio video deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getOrders,
  getOrderById,
  updateOrder,
  getProducts,
  updateProduct,
  getServices,
  updateService,
  getUsers,
  getUserById,
  getPortfolioVideos,
  addPortfolioVideo,
  updatePortfolioVideo,
  deletePortfolioVideo
};
