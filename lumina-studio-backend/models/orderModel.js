const pool = require('../config/db');

/**
 * Create a new order with its items in a single transaction
 */
const createOrder = async (userId, orderData, items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert order
    const orderQuery = `
      INSERT INTO orders (
        user_id, total_amount, delivery_name, delivery_phone, 
        delivery_address, delivery_city, delivery_state, delivery_pincode, 
        payment_method, payment_status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const orderValues = [
      userId,
      orderData.total_amount,
      orderData.delivery_name,
      orderData.delivery_phone,
      orderData.delivery_address,
      orderData.delivery_city,
      orderData.delivery_state,
      orderData.delivery_pincode,
      orderData.payment_method || 'cod',
      orderData.payment_method === 'cod' ? 'pending' : 'pending', // default pending
      orderData.notes || ''
    ];
    const orderResult = await client.query(orderQuery, orderValues);
    const order = orderResult.rows[0];

    // 2. Insert order items
    const itemQuery = `
      INSERT INTO order_items (
        order_id, product_id, title, category, image, 
        size, unit_price, quantity, custom_image, custom_color
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    for (const item of items) {
      await client.query(itemQuery, [
        order.id,
        item.product_id,
        item.title,
        item.category,
        item.image,
        item.size || '',
        item.unit_price,
        item.quantity,
        item.custom_image || null,
        item.custom_color || null
      ]);
    }

    // 3. Clear cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get order by ID including its items and user details
 */
const getOrderById = async (orderId) => {
  const orderResult = await pool.query(
    `SELECT o.*, u.username, u.email 
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     WHERE o.id = $1`,
    [orderId]
  );
  if (orderResult.rows.length === 0) return null;

  const order = orderResult.rows[0];

  const itemsResult = await pool.query(
    'SELECT * FROM order_items WHERE order_id = $1',
    [orderId]
  );
  order.items = itemsResult.rows;

  return order;
};

/**
 * Get order history for a specific user
 */
const getUserOrders = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  
  const orders = result.rows;
  for (const order of orders) {
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );
    order.items = itemsResult.rows;
  }
  return orders;
};

/**
 * Get all orders (for admin) with optional filtering
 */
const getAllOrders = async (filters = {}) => {
  let query = `
    SELECT o.*, u.username, u.email 
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id
  `;
  const conditions = [];
  const values = [];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`o.status = $${values.length}`);
  }

  if (filters.payment_status) {
    values.push(filters.payment_status);
    conditions.push(`o.payment_status = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY o.created_at DESC';

  const result = await pool.query(query, values);
  const orders = result.rows;

  for (const order of orders) {
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );
    order.items = itemsResult.rows;
  }

  return orders;
};

/**
 * Update order status or payment status
 */
const updateOrderStatus = async (orderId, status, paymentStatus) => {
  const fields = [];
  const values = [];

  if (status) {
    values.push(status);
    fields.push(`status = $${values.length}`);
  }

  if (paymentStatus) {
    values.push(paymentStatus);
    fields.push(`payment_status = $${values.length}`);
  }

  if (fields.length === 0) return null;

  values.push(orderId);
  const query = `
    UPDATE orders 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $${values.length} 
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update Razorpay payment details for a specific order
 */
const updateOrderPaymentDetails = async (orderId, details) => {
  const fields = [];
  const values = [];

  if (details.payment_status) {
    values.push(details.payment_status);
    fields.push(`payment_status = $${values.length}`);
  }
  if (details.status) {
    values.push(details.status);
    fields.push(`status = $${values.length}`);
  }
  if (details.razorpay_order_id !== undefined) {
    values.push(details.razorpay_order_id);
    fields.push(`razorpay_order_id = $${values.length}`);
  }
  if (details.razorpay_payment_id !== undefined) {
    values.push(details.razorpay_payment_id);
    fields.push(`razorpay_payment_id = $${values.length}`);
  }
  if (details.razorpay_signature !== undefined) {
    values.push(details.razorpay_signature);
    fields.push(`razorpay_signature = $${values.length}`);
  }
  if (details.payment_type !== undefined) {
    values.push(details.payment_type);
    fields.push(`payment_type = $${values.length}`);
  }

  if (fields.length === 0) return null;

  values.push(orderId);
  const query = `
    UPDATE orders 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $${values.length} 
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderPaymentDetails
};
