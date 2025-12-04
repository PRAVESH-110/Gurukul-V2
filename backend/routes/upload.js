const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const ImageKit = require('imagekit');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Use memory storage to avoid writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 104857600 }, // 100MB
});

/**
 * Server-side video upload endpoint 
 * Handles video uploads to ImageKit
 */
router.post('/video', protect, upload.single('file'), async (req, res, next) => {
  // Increase timeout to 10 minutes for this request
  req.setTimeout(600000);

  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Upload to ImageKit
    const result = await new Promise((resolve, reject) => {
      imagekit.upload({
        file: req.file.buffer.toString('base64'),
        fileName: req.file.originalname,
        folder: 'gurukul/videos',
        useUniqueFileName: true,
        tags: ['video', 'gurukul'],
        responseFields: ['url', 'fileId', 'name', 'size', 'thumbnailUrl']
      }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });

    res.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      size: result.size,
      thumbnailUrl: result.thumbnailUrl || `${result.url}/ik-thumbnail.jpg`
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

/**
 * Get ImageKit authentication parameters for client-side uploads
 */
router.get('/imagekit-auth', protect, (req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json(authParams);
  } catch (error) {
    console.error('ImageKit auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload credentials',
      error: error.message
    });
  }
});

module.exports = router;
