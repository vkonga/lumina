const express = require('express');
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Uploading a video requires authentication
router.post('/upload', authMiddleware, videoController.uploadVideo);

// Retrieving videos is public (for gallery portfolio)
router.get('/', videoController.getVideos);

module.exports = router;
