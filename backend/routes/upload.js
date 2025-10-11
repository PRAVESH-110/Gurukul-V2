const express = require('express');
const router = express.Router();
const multer = require('multer');
const imagekit = require('../config/imagekit');
const { protect } = require('../middleware/auth');

// Use memory storage to avoid writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 104857600 }, // 100MB
});

/**
 * ImageKit auth endpoint (kept for potential future use)
 * Currently using server-side upload only
 */
// router.get('/imagekit-auth', protect, (req, res) => {
//   try {
//     const result = imagekit.getAuthenticationParameters();
//     const response = {
//       ...result,
//       urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
//       publicKey: process.env.IMAGEKIT_PUBLIC_KEY
//     };
//     res.json(response);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get ImageKit authentication parameters',
//       error: error.message
//     });
//   }
// });

/**
 * (Alternative) Server-side upload: client sends file to this route.
 * Returns the ImageKit URL + fileId.
 */
router.post('/video', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filename = req.file.originalname.replace(/\s+/g, '_');
    const folder = process.env.IMAGEKIT_VIDEO_FOLDER || '/gurukul/videos';

    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: filename,
      folder,
      useUniqueFileName: true,
    });

    return res.status(201).json({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      size: req.file.size,
      thumbnailUrl: result.thumbnailUrl,
      filePath: result.filePath,
      mimeType: req.file.mimetype,
      success: true
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
