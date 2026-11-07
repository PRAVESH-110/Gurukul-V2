const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { protect, authorize, optionalProtect } = require('../middleware/auth');
const Video = require('../models/Video');
const Course = require('../models/Course');
const ImageKit = require('imagekit');
const { validateObjectId } = require('../middleware/validation');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const getVideoUploadUrl = (req, res) => {
  try {
    const { filename, mimeType } = req.query;
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

    if (!filename || !mimeType || !allowedTypes.includes(mimeType)) {
      return res.status(400).json({
        success: false,
        message: 'A valid video filename and mimeType are required',
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
      responseFields: ['url', 'fileId', 'name', 'size', 'thumbnailUrl', 'width', 'height'],
    };
    const authParams = imagekit.getAuthenticationParameters(uploadOptions);

    return res.status(200).json({
      success: true,
      data: {
        ...authParams,
        fileId,
        url: `${process.env.IMAGEKIT_URL_ENDPOINT}/${fileId}`,
        uploadUrl: `${process.env.IMAGEKIT_UPLOAD_URL || 'https://upload.imagekit.io/api/v1/files/upload'}`,
      },
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ success: false, message: 'Error generating upload URL' });
  }
};

// This route must be registered before /:id, otherwise "upload-url" is
// interpreted as a video identifier.
router.get('/upload-url', protect, authorize('creator', 'admin'), getVideoUploadUrl);

// Routes for video management
router
  .route('/')
  // @desc    Create a new video record
  // @access  Private/Creator
  .post(protect, authorize('creator', 'admin'), videoController.createVideo);

// Record a learner's watch position and completion state.
router.post('/:id/watch', protect, validateObjectId('id'), async (req, res, next) => {
  try {
    const progress = Number(req.body?.progress);
    const watchTime = Number(req.body?.watchTime || 0);
    const position = Number(req.body?.position || 0);
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      return res
        .status(400)
        .json({ success: false, message: 'Progress must be between 0 and 100' });
    }

    const video = await Video.findById(req.params.id);
    if (!video || !video.isActive)
      return res.status(404).json({ success: false, message: 'Video not found' });

    const course = await Course.findById(video.course);
    if (!course || !course.isPublished)
      return res.status(404).json({ success: false, message: 'Course not found' });

    const enrollment = course.enrolledStudents.find(
      (entry) => entry.user && entry.user.toString() === req.user._id.toString(),
    );
    const hasAccess = Boolean(
      enrollment ||
      course.creator.toString() === req.user._id.toString() ||
      req.user.role === 'admin',
    );
    if (!hasAccess)
      return res
        .status(403)
        .json({ success: false, message: 'You must be enrolled to track progress' });

    const completed = progress >= 90;
    video.markAsWatched(req.user._id, completed, Math.max(0, watchTime), Math.max(0, position));
    await video.save();

    if (enrollment) {
      if (
        completed &&
        !enrollment.completedVideos.some((id) => id.toString() === video._id.toString())
      ) {
        enrollment.completedVideos.push(video._id);
      }
      const activeVideoCount = await Video.countDocuments({ course: course._id, isActive: true });
      enrollment.progress = activeVideoCount
        ? Math.min(100, Math.round((enrollment.completedVideos.length / activeVideoCount) * 100))
        : 0;
      await course.save();
    }

    return res.status(200).json({
      success: true,
      progress,
      completed,
      lastPosition: position,
      courseProgress: enrollment?.progress || 0,
    });
  } catch (error) {
    return next(error);
  }
});

router
  .route('/:id')
  // @desc    Get video details
  // @access  Private
  .get(protect, validateObjectId('id'), videoController.getVideo)
  // @desc    Update video details
  // @access  Private/Creator
  .put(protect, validateObjectId('id'), authorize('creator', 'admin'), videoController.updateVideo)
  // @desc    Delete a video
  // @access  Private/Creator
  .delete(
    protect,
    validateObjectId('id'),
    authorize('creator', 'admin'),
    videoController.deleteVideo,
  );

// @desc    Get videos by course
// @route   GET /api/videos/course/:courseId
// @access  Public (Metadata only) / Private (Full access)
router.get('/course/:courseId', optionalProtect, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { section } = req.query;

    // Convert courseId to ObjectId if it's a valid ObjectId string
    let courseObjectId;
    try {
      courseObjectId = mongoose.Types.ObjectId.isValid(courseId)
        ? new mongoose.Types.ObjectId(courseId)
        : courseId;
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
      });
    }

    console.log('Fetching videos for courseId:', courseId);

    // Check if user has access to this course
    const course = await Course.findById(courseObjectId);

    if (!course || !course.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or not published',
      });
    }

    // Check if user is enrolled, creator, or admin
    let isEnrolled = false;
    let isCreator = false;
    let isAdmin = false;

    if (req.user) {
      isEnrolled = course.enrolledStudents.some(
        (student) => student.user && student.user.toString() === req.user._id.toString(),
      );
      isCreator = course.creator.toString() === req.user._id.toString();
      isAdmin = req.user.role === 'admin';
    }

    const query = { course: courseObjectId, isActive: true };
    if (!isCreator && !isAdmin) query.isPublished = true;
    if (section) {
      query.section = section;
    }

    // Find all active videos for this course
    const videos = await Video.find(query)
      .sort('order')
      .select(
        '_id title description videoUrl url thumbnailUrl duration isPublished order section format width height size status isPreview isActive watchedBy createdAt updatedAt',
      );

    // If user has full access, return everything
    if (isEnrolled || isCreator || isAdmin) {
      const mappedVideos = videos.map((video) => {
        const videoData = video.toObject();
        const watch = video.getWatchProgress(req.user._id);
        delete videoData.watchedBy;
        return {
          ...videoData,
          url: video.videoUrl || video.url,
          thumbnailUrl: video.thumbnailUrl || '',
          userProgress:
            watch?.watchTime && video.duration
              ? Math.round((watch.watchTime / video.duration) * 100)
              : 0,
          hasWatched: Boolean(watch?.completed),
        };
      });

      return res.status(200).json({
        success: true,
        count: mappedVideos.length,
        data: mappedVideos,
      });
    }

    // If no full access, return metadata only
    const mappedVideos = videos.map((video) => {
      const vidObj = video.toObject();
      const isPreview = vidObj.isPreview;

      if (isPreview) {
        return {
          ...vidObj,
          url: vidObj.videoUrl || vidObj.url,
          thumbnailUrl: vidObj.thumbnailUrl || '',
        };
      }

      return {
        _id: vidObj._id,
        title: vidObj.title,
        description: vidObj.description,
        duration: vidObj.duration,
        order: vidObj.order,
        section: vidObj.section,
        isPreview: vidObj.isPreview,
        thumbnailUrl: vidObj.thumbnailUrl || '',
        // Explicitly nullify sensitive fields
        videoUrl: null,
        url: null,
        fileId: null,
      };
    });

    res.status(200).json({
      success: true,
      count: mappedVideos.length,
      data: mappedVideos,
    });
  } catch (error) {
    console.error('Error fetching course videos:', error);
    next(error);
  }
});

// @desc    Handle webhook from ImageKit for upload/encoding completion
// @route   POST /api/videos/webhook
// @access  Public (called by ImageKit)
router.post('/webhook', (req, res) => {
  try {
    const configuredSecret = process.env.IMAGEKIT_WEBHOOK_SECRET;
    const suppliedSecret = req.get('X-ImageKit-Webhook-Secret');
    if (!configuredSecret || !suppliedSecret) {
      return res
        .status(503)
        .json({ success: false, message: 'Webhook verification is not configured' });
    }
    const expected = Buffer.from(configuredSecret);
    const actual = Buffer.from(suppliedSecret);
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    const { event, data } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
    }

    if (event === 'video.encoded' || event === 'file.uploaded') {
      // Handle video upload/encoding completion
      const updateData = {
        status: 'ready',
        url: data.url,
        thumbnailUrl: data.thumbnailUrl || '',
        duration: data.duration || 0,
        resolution: {
          width: data.width || 0,
          height: data.height || 0,
        },
        mimeType: data.mimeType || 'video/mp4',
        size: data.size || 0,
      };

      // For uploaded videos, we might need to update by URL since fileId might not be set
      const query = data.fileId ? { fileId: data.fileId } : { url: data.url };

      Video.findOneAndUpdate(query, { $set: updateData }, { new: true })
        .then((updatedVideo) => {
          if (updatedVideo) {
            console.log(`Video ${data.fileId || data.url} processed successfully`);
          }
        })
        .catch((error) => {
          console.error('Error updating video after processing:', error);
        });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing webhook',
      details: error.message,
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
        message: 'Video not found',
      });
    }

    // Check if user is the creator of the video
    if (video.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this video',
      });
    }

    // Get analytics data (this is a simplified example)
    const analytics = {
      views: video.views,
      watchTime: video.watchTime || 0,
      completionRate: video.completionRate || 0,
      engagement: video.engagement || [],
      topSegments: video.topSegments || [],
    };

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get video stream URL
// @route   GET /api/videos/stream/:id
// @access  Private
router.get('/stream/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    const creatorId = video.creator?._id || video.creator;
    const canViewUnpublished =
      req.user.role === 'admin' || creatorId.toString() === req.user._id.toString();
    if (!video.isPublished && !canViewUnpublished) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Check if user has access to this video
    if (!(await videoController.checkVideoAccess(req.user, video))) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video',
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
        mimeType: video.mimeType || 'video/mp4',
      },
    });
  } catch (error) {
    console.error('Error getting video stream:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting video stream',
      error: error.message,
    });
  }
});

module.exports = router;
