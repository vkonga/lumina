const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel');

/**
 * Handle checkout and place order
 */
const checkout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      delivery_name, 
      delivery_phone, 
      delivery_address, 
      delivery_city, 
      delivery_state, 
      delivery_pincode, 
      payment_method,
      notes 
    } = req.body;

    // Validate inputs
    if (!delivery_name || !delivery_phone || !delivery_address || !delivery_city || !delivery_state || !delivery_pincode) {
      return res.status(400).json({ error: 'All delivery address fields are required.' });
    }

    // Retrieve active cart items
    const cartItems = await cartModel.getCartByUserId(userId);
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty. Cannot checkout.' });
    }

    // Calculate total amount
    let total_amount = 0;
    const items = cartItems.map(item => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity, 10) || 1;
      total_amount += price * qty;

      return {
        product_id: item.product_id,
        title: item.title,
        category: item.category,
        image: item.image,
        size: item.selected_size,
        unit_price: price,
        quantity: qty,
        custom_image: item.custom_image,
        custom_color: item.custom_color
      };
    });

    const orderData = {
      total_amount,
      delivery_name,
      delivery_phone,
      delivery_address,
      delivery_city,
      delivery_state,
      delivery_pincode,
      payment_method: payment_method || 'cod',
      notes
    };

    const newOrder = await orderModel.createOrder(userId, orderData, items);

    res.status(201).json({
      message: 'Order placed successfully.',
      order: newOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's order history
 */
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel.getUserOrders(userId);
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  getMyOrders
};
