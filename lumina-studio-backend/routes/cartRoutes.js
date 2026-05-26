const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// All shopping cart routes require authentication
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/', cartController.addItem);
router.put('/', cartController.updateItem);
router.delete('/:productId', cartController.removeItem);
router.delete('/', cartController.clear);

module.exports = router;
