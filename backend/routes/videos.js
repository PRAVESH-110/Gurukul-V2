const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const Video = require('../models/Video');

// Configure video upload (using Cloudinary)
const uploadVideo = upload.single('video');

// Routes for video management
router.route('/')
  // @desc    Create a new video record
  // @access  Private/Creator
  .post(protect, authorize('creator', 'admin'), videoController.createVideo);

router.route('/:id')
  // @desc    Get video details
  // @access  Private
  .get(protect, videoController.getVideo)
  // @desc    Update video details
  // @access  Private/Creator
  .put(protect, authorize('creator', 'admin'), videoController.updateVideo)
  // @desc    Delete a video
  // @access  Private/Creator
  .delete(protect, authorize('creator', 'admin'), videoController.deleteVideo);

// @desc    Get videos by course
// @route   GET /api/videos/course/:courseId
// @access  Private
router.get('/course/:courseId', protect, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { section } = req.query;
    
    const query = { course: courseId };
    if (section) {
      query.section = section;
    }
    
    const videos = await Video.find(query)
      .sort('order')
      .select('title description videoUrl thumbnailUrl duration isPublished order section format width height');
      
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get video upload URL (for client-side upload)
// @route   GET /api/videos/upload-url
// @access  Private/Creator
router.get('/upload-url', protect, authorize('creator', 'admin'), (req, res) => {
  try {
    const { filename, mimeType } = req.query;
    
    if (!filename || !mimeType) {
      return res.status(400).json({
        success: false,
        message: 'Filename and mimeType are required'
      });
    }
    
    const fileId = `videos/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const uploadOptions = {
      fileId,
      fileName: filename,
      mimeType,
      folder: 'videos',
      isPrivateFile: false,
      tags: ['video-upload']
    };
    
    imagekit.getAuthenticationParameters(uploadOptions, (error, result) => {
      if (error) {
        console.error('Error generating upload URL:', error);
        return res.status(500).json({
          success: false,
          message: 'Error generating upload URL',
          error: error.message
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          ...result,
          fileId
        }
      });
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating upload URL',
      error: error.message
    });
  }
});

// @desc    Handle webhook from ImageKit for upload completion
// @route   POST /api/videos/webhook
// @access  Public (called by ImageKit)
router.post('/webhook', (req, res) => {
  try {
    const { event, data } = req.body;
    
    if (event === 'video.encoded') {
      // Handle video encoding completion
      // Update video status and metadata in the database
      Video.findOneAndUpdate(
        { fileId: data.fileId },
        {
          $set: {
            'status': 'ready',
            'url': data.url,
            'thumbnailUrl': data.thumbnailUrl,
            'duration': data.duration,
            'resolution': {
              width: data.width,
              height: data.height
            },
            'mimeType': data.mimeType
          }
        },
        { new: true }
      ).then(updatedVideo => {
        if (updatedVideo) {
          console.log(`Video ${data.fileId} processed successfully`);
        }
      }).catch(error => {
        console.error('Error updating video after encoding:', error);
      });
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
});

// @desc    Get video analytics
// @route   GET /api/videos/:id/analytics
// @access  Private/Creator
router.get('/:id/analytics', protect, authorize('creator', 'admin'), async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    // Check if user is the creator of the video
    if (video.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this video'
      });
    }
    
    // Get analytics data (this is a simplified example)
    const analytics = {
      views: video.views,
      watchTime: video.watchTime || 0,
      completionRate: video.completionRate || 0,
      engagement: video.engagement || [],
      topSegments: video.topSegments || []
    };
    
    res.status(200).json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    next(error);
  }
});

// @desc    Get video stream URL
// @route   GET /api/videos/stream/:id
// @access  Private
router.get('/stream/:id', protect, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user has access to this video
    if (!videoController.checkVideoAccess(req.user, video)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video'
      });
    }

    // Return video details with Cloudinary URL
    res.status(200).json({
      success: true,
      data: {
        url: video.videoUrl,
        publicId: video.publicId,
        format: video.format,
        duration: video.duration,
        width: video.width,
        height: video.height,
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl
      }
    });
  } catch (error) {
    console.error('Error getting video stream:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting video stream',
      error: error.message
    });
  }
});

module.exports = router;
