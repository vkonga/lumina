const express = require('express');
const authMiddleware = require('../middlewares/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Apply auth middleware to all order routes
router.use(authMiddleware);

router.post('/checkout', orderController.checkout);
router.get('/my-orders', orderController.getMyOrders);

module.exports = router;
