const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadVideo } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// Use memory storage to avoid writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 104857600 }, // 100MB
});

/**
 * Server-side video upload endpoint
 * Handles video uploads to Cloudinary
 */
router.post('/video', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await uploadVideo(
      req.file.buffer,
      req.file.originalname,
      process.env.CLOUDINARY_VIDEO_FOLDER
    );

    // The result contains all the information about the uploaded video
    const videoInfo = {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      duration: result.duration,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      thumbnailUrl: result.eager && result.eager[0] ? result.eager[0].secure_url : null
    };

    res.json({
      success: true,
      ...videoInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

module.exports = router;
