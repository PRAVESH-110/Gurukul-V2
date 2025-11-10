const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { protect, authorize } = require('../middleware/auth');
const Video = require('../models/Video');
const ImageKit = require('imagekit');
const { getCourseVideos } = require('../controllers/videoController');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

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
      .select('title description url thumbnailUrl duration isPublished order section format width height');
      
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
      folder: 'gurukul/videos',
      useUniqueFileName: true,
      tags: ['video', 'gurukul'],
      responseFields: ['url', 'fileId', 'name', 'size', 'thumbnailUrl', 'width', 'height']
    };
    
    // Get authentication parameters for client-side upload
    const authParams = imagekit.getAuthenticationParameters(uploadOptions);
    
    res.status(200).json({
      success: true,
      data: {
        ...authParams,
        fileId,
        url: `${process.env.IMAGEKIT_URL_ENDPOINT}/${fileId}`,
        uploadUrl: `${process.env.IMAGEKIT_UPLOAD_URL || 'https://upload.imagekit.io/api/v1/files/upload'}`
      }
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

// @desc    Handle webhook from ImageKit for upload/encoding completion
// @route   POST /api/videos/webhook
// @access  Public (called by ImageKit)
router.post('/webhook', (req, res) => {
  try {
    const { event, data } = req.body;
    
    if (event === 'video.encoded' || event === 'file.uploaded') {
      // Handle video upload/encoding completion
      const updateData = {
        status: 'ready',
        url: data.url,
        thumbnailUrl: data.thumbnailUrl || '',
        duration: data.duration || 0,
        resolution: {
          width: data.width || 0,
          height: data.height || 0
        },
        mimeType: data.mimeType || 'video/mp4',
        size: data.size || 0
      };
      
      // For uploaded videos, we might need to update by URL since fileId might not be set
      const query = data.fileId ? { fileId: data.fileId } : { url: data.url };
      
      Video.findOneAndUpdate(
        query,
        { $set: updateData },
        { new: true }
      ).then(updatedVideo => {
        if (updatedVideo) {
          console.log(`Video ${data.fileId || data.url} processed successfully`);
        }
      }).catch(error => {
        console.error('Error updating video after processing:', error);
      });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error processing webhook',
      details: error.message 
    });
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

    // Return video details with ImageKit URL
    res.status(200).json({
      success: true,
      data: {
        url: video.videoUrl,
        fileId: video.fileId,
        name: video.title,
        size: video.size || 0,
        duration: video.duration || 0,
        width: video.width || 0,
        height: video.height || 0,
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        mimeType: video.mimeType || 'video/mp4'
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
