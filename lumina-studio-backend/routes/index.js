const express = require('express');
const homeRoutes = require('./homeRoutes');
const productRoutes = require('./productRoutes');
const authRoutes = require('./authRoutes');
const cartRoutes = require('./cartRoutes');
const videoRoutes = require('./videoRoutes');
const uploadRoutes = require('./uploadRoutes');
const orderRoutes = require('./orderRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/home', homeRoutes);
router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);
router.use('/videos', videoRoutes);
router.use('/uploads', uploadRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
