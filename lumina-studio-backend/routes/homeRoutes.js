const express = require('express');
const homeController = require('../controllers/homeController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/', homeController.getHomeData);
router.post('/reviews', authMiddleware, homeController.addReview);

module.exports = router;
