const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const ImageKit = require('imagekit');
const { uploadToImageKit } = require('../utils/imagekit');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Use memory storage to avoid writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 104857600 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (!['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'].includes(file.mimetype)) {
      return cb(new Error('Only video files are allowed'));
    }
    return cb(null, true);
  },
});
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'));
    }
    return cb(null, true);
  },
});

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    const folder =
      typeof req.body.folder === 'string' && req.body.folder.trim()
        ? req.body.folder.trim().replace(/[^a-zA-Z0-9/_-]/g, '')
        : 'gurukul/images';
    const result = await uploadToImageKit({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder,
    });
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

router.post('/image', protect, imageUpload.single('image'), uploadImage);
router.post('/avatar', protect, imageUpload.single('avatar'), async (req, res, next) => {
  req.body.folder = 'gurukul/avatars';
  return uploadImage(req, res, next);
});

/**
 * Server-side video upload endpoint
 * Handles video uploads to ImageKit
 */
router.post(
  '/video',
  protect,
  authorize('creator', 'admin'),
  upload.single('file'),
  async (req, res) => {
    // Increase timeout to 10 minutes for this request
    req.setTimeout(600000);

    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

      // Upload to ImageKit
      const result = await new Promise((resolve, reject) => {
        imagekit.upload(
          {
            file: req.file.buffer.toString('base64'),
            fileName: req.file.originalname,
            folder: 'gurukul/videos',
            useUniqueFileName: true,
            tags: ['video', 'gurukul'],
            responseFields: ['url', 'fileId', 'name', 'size', 'thumbnailUrl'],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
      });

      res.json({
        success: true,
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        size: result.size,
        thumbnailUrl: result.thumbnailUrl || `${result.url}/ik-thumbnail.jpg`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: error.message,
      });
    }
  },
);

/**
 * Get ImageKit authentication parameters for client-side uploads
 */
router.get('/imagekit-auth', protect, authorize('creator', 'admin'), (req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json(authParams);
  } catch (error) {
    console.error('ImageKit auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload credentials',
      error: error.message,
    });
  }
});

module.exports = router;
