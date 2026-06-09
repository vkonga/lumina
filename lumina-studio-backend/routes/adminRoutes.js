const express = require('express');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminAuth');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Apply auth AND admin authorization check to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', adminController.getStats);

router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderById);
router.patch('/orders/:id', adminController.updateOrder);

router.get('/products', adminController.getProducts);
router.patch('/products/:id', adminController.updateProduct);

router.get('/services', adminController.getServices);
router.patch('/services/:id', adminController.updateService);

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.delete('/users/:id', adminController.deleteUser);

router.get('/portfolio-videos', adminController.getPortfolioVideos);
router.post('/portfolio-videos', adminController.addPortfolioVideo);
router.patch('/portfolio-videos/:id', adminController.updatePortfolioVideo);
router.delete('/portfolio-videos/:id', adminController.deletePortfolioVideo);

router.get('/offers', adminController.getOffers);
router.post('/offers', adminController.addOffer);
router.patch('/offers/:id', adminController.updateOffer);
router.delete('/offers/:id', adminController.deleteOffer);

module.exports = router;
