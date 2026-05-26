const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

const bucketName = process.env.GCS_BUCKET_NAME;
let storage;
let upload;

// Image file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpg, png, gif, webp) are allowed.'));
};

const limits = { fileSize: 10 * 1024 * 1024 }; // 10 MB max

if (bucketName) {
  // Use Google Cloud Storage
  console.log(`Cloud Storage configured using bucket: ${bucketName}`);
  storage = multer.memoryStorage();
  upload = multer({ storage, fileFilter, limits });
} else {
  // Fallback to local disk storage
  console.log('No GCS_BUCKET_NAME configured. Falling back to local disk storage.');
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `custom-${uniqueSuffix}${ext}`);
    }
  });
  upload = multer({ storage, fileFilter, limits });
}

/**
 * POST /api/uploads/product-image
 * Authenticated. Accepts a single image file field named "image".
 * Returns: { success: true, imageUrl: "/uploads/<filename>" or "https://storage.googleapis.com/<bucket>/<filename>" }
 */
router.post('/product-image', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    if (bucketName) {
      // Stream to Google Cloud Storage
      const gcs = new Storage();
      const bucket = gcs.bucket(bucketName);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(req.file.originalname).toLowerCase();
      const blobName = `custom-${uniqueSuffix}${ext}`;
      const blob = bucket.file(blobName);

      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      blobStream.on('error', (err) => {
        next(err);
      });

      blobStream.on('finish', () => {
        const imageUrl = `https://storage.googleapis.com/${bucketName}/${blobName}`;
        return res.status(201).json({ success: true, imageUrl });
      });

      blobStream.end(req.file.buffer);
    } else {
      // Local file response
      const imageUrl = `/uploads/${req.file.filename}`;
      return res.status(201).json({ success: true, imageUrl });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
