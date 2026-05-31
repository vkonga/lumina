const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummykeysecret123456789'
});

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

    if (payment_method === 'razorpay') {
      try {
        const options = {
          amount: Math.round(total_amount * 100), // Razorpay requires paise
          currency: 'INR',
          receipt: `receipt_order_${newOrder.id}`
        };
        const rzpOrder = await razorpay.orders.create(options);
        await orderModel.updateOrderPaymentDetails(newOrder.id, {
          razorpay_order_id: rzpOrder.id
        });
        newOrder.razorpay_order_id = rzpOrder.id; // update local object to return
        
        return res.status(201).json({
          message: 'Order placed, initiating Razorpay payment.',
          order: newOrder,
          razorpay: {
            id: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency
          }
        });
      } catch (err) {
        console.error("Razorpay order creation failed:", err);
        // Mark payment as failed locally
        await orderModel.updateOrderPaymentDetails(newOrder.id, { payment_status: 'failed' });
        newOrder.payment_status = 'failed';
        return res.status(500).json({ error: 'Razorpay payment creation failed: ' + err.message, order: newOrder });
      }
    }

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

const verifyPayment = async (req, res, next) => {
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing signature verification arguments.' });
    }

    // 1. Verify signature using crypto hmac sha256
    const crypto = require('crypto');
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'dummykeysecret123456789';
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    const isSignatureValid = generated_signature === razorpay_signature;

    if (!isSignatureValid) {
      console.warn("Invalid signature verification attempt.");
      await orderModel.updateOrderPaymentDetails(order_id, {
        payment_status: 'failed'
      });
      return res.status(400).json({ error: 'Payment verification failed: Invalid signature.' });
    }

    // 2. Fetch payment details from Razorpay to get the payment type/method (UPI, card, wallet)
    let paymentType = 'online';
    try {
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      if (paymentDetails && paymentDetails.method) {
        paymentType = paymentDetails.method; // 'card', 'upi', 'netbanking', 'wallet', etc.
      }
    } catch (err) {
      console.error("Failed to fetch payment details from Razorpay:", err.message);
    }

    // 3. Update database order status to paid and confirmed
    const updatedOrder = await orderModel.updateOrderPaymentDetails(order_id, {
      payment_status: 'paid',
      status: 'confirmed',
      razorpay_payment_id,
      razorpay_signature,
      payment_type: paymentType
    });

    res.status(200).json({
      message: 'Payment verified and order confirmed successfully.',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

const failPayment = async (req, res, next) => {
  try {
    const { order_id } = req.body;
    if (!order_id) {
      return res.status(400).json({ error: 'order_id is required.' });
    }

    const updatedOrder = await orderModel.updateOrderPaymentDetails(order_id, {
      payment_status: 'failed'
    });

    res.status(200).json({
      message: 'Order payment marked as failed.',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  getMyOrders,
  verifyPayment,
  failPayment
};
