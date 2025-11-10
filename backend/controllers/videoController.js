const Video = require('../models/Video');
const Course = require('../models/Course');
const ImageKit = require('imagekit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// @desc    Upload a video
// @route   POST /api/videos/upload
// @access  Private/Creator
exports.uploadVideo = async (req, res, next) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const { title, description, courseId, sectionId } = req.body;
    const videoFile = req.files.video;
    const maxSize = 100 * 1024 * 1024; // 100MB

    // Validate file size
    if (videoFile.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'Video size exceeds 100MB limit'
      });
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(videoFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only MP4, WebM, and OGG videos are allowed.'
      });
    }

    // Check if course exists and user is the creator
    const course = await Course.findOne({
      _id: courseId,
      creator: req.user.id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you are not authorized'
      });
    }

    // Upload video to ImageKit
    const uploadResult = await new Promise((resolve, reject) => {
      const fileName = `${uuidv4()}${path.extname(videoFile.name)}`;
      
      imagekit.upload({
        file: videoFile.data.toString('base64'),
        fileName: fileName,
        folder: 'gurukul/videos',
        useUniqueFileName: true,
        tags: ['video', 'gurukul'],
        responseFields: ['url', 'fileId', 'name', 'size', 'thumbnailUrl', 'width', 'height']
      }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
    
    if (!uploadResult || !uploadResult.url) {
      throw new Error('Failed to upload video to ImageKit');
    }

    // Create video record
    const video = await Video.create({
      title: title || videoFile.name.replace(/\.[^/.]+$/, ''),
      description: description || '',
      videoUrl: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl || '',
      fileId: uploadResult.fileId,
      duration: 0, // Will be updated by webhook
      width: uploadResult.width || 0,
      height: uploadResult.height || 0,
      course: courseId,
      bytes: videoFile.size || 0,
      creator: req.user.id,
      section: sectionId || 'main',
      status: 'processing',
      resolution: uploadResult.height ? {
        width: uploadResult.width,
        height: uploadResult.height
      } : undefined
    });

    // Add video to course section
    if (sectionId) {
      const section = course.sections.id(sectionId);
      if (section) {
        section.lectures.push(video._id);
      } else {
        // If section doesn't exist, add to main section
        if (!course.sections.some(s => s._id.toString() === 'main')) {
          course.sections.push({
            _id: 'main',
            title: 'Main Section',
            lectures: [video._id]
          });
        } else {
          const mainSection = course.sections.find(s => s._id.toString() === 'main');
          mainSection.lectures.push(video._id);
        }
      }
    } else {
      // Add to main section if no section specified
      if (!course.sections.some(s => s._id.toString() === 'main')) {
        course.sections.push({
          _id: 'main',
          title: 'Main Section',
          lectures: [video._id]
        });
      } else {
        const mainSection = course.sections.find(s => s._id.toString() === 'main');
        mainSection.lectures.push(video._id);
      }
    }

    await course.save();

    res.status(201).json({
      success: true,
      data: video,
      message: 'Video uploaded successfully. Processing will begin shortly.'
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading video',
      error: error.message
    });
  }
};

// @desc    Get video details
// @route   GET /api/videos/:id
// @access  Private
exports.getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('creator', 'name email avatar')
      .populate('course', 'title thumbnail');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user has access to this video
    const hasAccess = await checkVideoAccess(req.user, video);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this video'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        video: {
          ...video.toObject(),
          // Ensure qualities field is included and has fallbacks
          qualities: video.qualities || {
            'auto': video.videoUrl,
            '1080p': video.videoUrl,
            '720p': video.videoUrl,
            '480p': video.videoUrl,
            '360p': video.videoUrl
          },
          // Add videoUrl field for compatibility
          videoUrl: video.videoUrl
        }
      }
    });

  } catch (error) {
    console.error('Error getting video:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting video',
      error: error.message
    });
  }
};


// @desc    Get course videos
// @route   GET /api/videos/course/:courseId
// @access  Private 
exports.getCourseVideos = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Use the correct field name — your DB stores it as "course"
    const videos = await Video.find({ course: courseId })
      .sort({ order: 1 })  // optional: sort by order
      .select('-__v');     // optional: remove __v field

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error("Error fetching course videos:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching course videos"
    });
  }
};
// @desc    Update video details
// @route   PUT /api/videos/:id
// @access  Private/Creator
exports.updateVideo = async (req, res, next) => {
  try {
    const { title, description, sectionId, isPublished } = req.body;
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user is the creator of the video
    if (video.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this video'
      });
    }

    // Update video details
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (isPublished !== undefined) video.isPublished = isPublished;

    // If section is being updated
    if (sectionId && sectionId !== video.section.toString()) {
      const course = await Course.findOne({ _id: video.course, creator: req.user.id });
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found or you are not authorized'
        });
      }

      // Remove from old section
      for (const section of course.sections) {
        const index = section.lectures.indexOf(video._id);
        if (index > -1) {
          section.lectures.splice(index, 1);
          break;
        }
      }

      // Add to new section
      let targetSection = course.sections.id(sectionId);
      if (!targetSection) {
        // Create new section if it doesn't exist
        targetSection = {
          _id: sectionId,
          title: `Section ${course.sections.length + 1}`,
          lectures: []
        };
        course.sections.push(targetSection);
      }
      
      targetSection.lectures.push(video._id);
      video.section = sectionId;
      
      await course.save();
    }

    await video.save();

    res.status(200).json({
      success: true,
      data: video,
      message: 'Video updated successfully'
    });

  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video',
      error: error.message
    });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private/Creator
exports.deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user is the creator of the video
    if (video.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video'
      });
    }

    // Get the course to update sections
    const course = await Course.findOne({ _id: video.course, creator: req.user.id });
    
    if (course) {
      // Remove video from all sections
      for (const section of course.sections) {
        const index = section.lectures.indexOf(video._id);
        if (index > -1) {
          section.lectures.splice(index, 1);
        }
      }
      await course.save();
    }

    // Delete from ImageKit if fileId exists
    if (video.fileId) {
      try {
        await new Promise((resolve, reject) => {
          imagekit.deleteFile(video.fileId, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          });
        });
      } catch (error) {
        console.error('Error deleting video from ImageKit:', error);
        // Continue with deletion even if ImageKit deletion fails
      }
    }

    // Delete the video document
    await Video.findByIdAndDelete(video._id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
      error: error.message
    });
  }
};

// @desc    Create a video record (after file upload)
// @route   POST /api/videos
// @access  Private/Creator
exports.createVideo = async (req, res, next) => {
  try {
    const {
      title,
      description,
      url,
      qualities,
      fileId,
      course: courseId,
      duration,
      order,
      isPreview,
      isPublished,
      allowDownload,
      enableComments,
      objectives,
      resources
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Video title is required'
      });
    }

    if (!url || !fileId) {
      return res.status(400).json({
        success: false,
        message: 'Video URL and fileId are required'
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // Debug logging
    console.log('Creating video with data:', {
      title,
      courseId,
      userId: req.user.id,
      userIdAlt: req.user._id
    });

    // Check if course exists and user is the creator
    const course = await Course.findOne({
      _id: courseId,
      creator: req.user.id || req.user._id
    });

    console.log('Course found:', course ? 'Yes' : 'No');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you are not authorized'
      });
    }

    // Create video record with qualities support
    console.log('Creating video record...');
    const videoQualities = qualities || {
      'auto': url,
      '1080p': url,
      '720p': url,
      '480p': url,
      '360p': url
    };

    const video = await Video.create({
      title,
      description: description || '',
      url,
      qualities: videoQualities,
      fileId,
      course: courseId,
      creator: req.user.id || req.user._id,
      duration: duration || 1,
      order: order || 1,
      isPreview: isPreview || false,
      isPublished: isPublished !== false, // Default to true
      allowDownload: allowDownload || false,
      enableComments: enableComments !== false, // Default to true
      objectives: objectives || '',
      resources: resources || '',
      status: 'ready', // Assuming file is already uploaded and ready
      isActive: true
    });

    await video.populate('creator', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      data: video,
      message: 'Video lesson created successfully'
    });

  } catch (error) {
    console.error('Error creating video:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Error creating video lesson';
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(e => e.message).join(', ');
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid ID format provided';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to check if user has access to a video
async function checkVideoAccess(user, video) {
  // Creator always has access
  if (video.creator.toString() === user.id) {
    return true;
  }

  // Check if user is enrolled in the course
  const course = await Course.findOne({
    _id: video.course,
    'enrolledStudents.user': user.id,
    isPublished: true
  });

  return !!course;
}
