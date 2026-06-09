const express = require('express');
const authMiddleware = require('../middlewares/auth');
const listingController = require('../controllers/userListingController');

const router = express.Router();

// All listing routes require the user to be authenticated (not admin-only)
router.use(authMiddleware);

// ── Services ────────────────────────────────────────────────
router.get('/services', listingController.getUserServices);
router.post('/services', listingController.createUserService);
router.delete('/services/:id', listingController.deleteUserService);

// ── Products ─────────────────────────────────────────────────
router.get('/products', listingController.getUserProducts);
router.post('/products', listingController.createUserProduct);
router.delete('/products/:id', listingController.deleteUserProduct);

module.exports = router;
