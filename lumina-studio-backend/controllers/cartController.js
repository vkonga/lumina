const cartModel = require('../models/cartModel');

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await cartModel.getCartByUserId(userId);
    res.status(200).json(cart);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, selectedSize, customImage, customColor } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const qty = parseInt(quantity, 10) || 1;
    if (qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer.' });
    }

    const addedItem = await cartModel.addToCart(
      userId, productId, qty, selectedSize,
      customImage || null, customColor || null
    );
    res.status(201).json({
      message: 'Product added to cart successfully.',
      item: addedItem
    });
  } catch (error) {
    // PostgreSQL FK violation = user account no longer exists → force re-login
    if (error.code === '23503') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, selectedSize } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity are required.' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty)) {
      return res.status(400).json({ error: 'Quantity must be an integer.' });
    }

    if (qty <= 0) {
      // Remove item if quantity is set to 0 or less
      await cartModel.removeFromCart(userId, productId, selectedSize);
      return res.status(200).json({ message: 'Product removed from cart.' });
    }

    const updatedItem = await cartModel.updateCartItemQuantity(userId, productId, qty, selectedSize);
    if (!updatedItem) {
      return res.status(404).json({ error: 'Product not found in cart.' });
    }

    res.status(200).json({
      message: 'Cart item quantity updated successfully.',
      item: updatedItem
    });
  } catch (error) {
    next(error);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { selectedSize } = req.query;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const removed = await cartModel.removeFromCart(userId, parseInt(productId, 10), selectedSize || '');
    if (!removed) {
      return res.status(404).json({ error: 'Product not found in cart.' });
    }

    res.status(200).json({ message: 'Product removed from cart.' });
  } catch (error) {
    next(error);
  }
};

const clear = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await cartModel.clearCart(userId);
    res.status(200).json({ message: 'Shopping cart cleared successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clear,
};
