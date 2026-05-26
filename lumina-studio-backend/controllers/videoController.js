const path = require('path');
const fs = require('fs');
const multer = require('multer');
const videoModel = require('../models/videoModel');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name: timestamp + random + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'video-' + uniqueSuffix + ext);
  }
});

// File Type Validation Filter (Videos only)
const videoFilter = (req, file, cb) => {
  const allowedTypes = [
    'video/mp4',
    'video/mpeg',
    'video/ogg',
    'video/quicktime', // .mov
    'video/webm',
    'video/x-msvideo', // .avi
    'video/x-flv',
    'video/x-matroska' // .mkv
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files (MP4, MOV, WEBM, AVI, etc.) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max limit
  }
}).single('video'); // Expecting form-data field name 'video'

const uploadVideo = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Max limit is 100MB.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { title } = req.body;
      const file = req.file;
      const userId = req.user.id;

      if (!file) {
        return res.status(400).json({ error: 'No video file provided.' });
      }

      if (!title) {
        // Clean up uploaded file if validation fails
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: 'Video title is required.' });
      }

      // Generate accessible web path (e.g. /uploads/video-filename.mp4)
      const webPath = `/uploads/${file.filename}`;

      // Save to database
      const newVideo = await videoModel.createVideo(
        title,
        file.filename,
        webPath,
        file.size,
        file.mimetype,
        userId
      );

      res.status(201).json({
        message: 'Video uploaded successfully.',
        video: newVideo
      });
    } catch (error) {
      // Clean up file if DB save fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  });
};

const getVideos = async (req, res, next) => {
  try {
    const videos = await videoModel.getAllVideos();
    res.status(200).json(videos);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadVideo,
  getVideos,
};
