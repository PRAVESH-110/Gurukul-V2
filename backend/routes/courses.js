const express = require('express');
const path = require('path');
const Course = require('../models/Course');
const Video = require('../models/Video');
const User = require('../models/User');
const { protect, authorize, checkCourseEnrollment, optionalProtect } = require('../middleware/auth');
const { validateCourse, validateObjectId } = require('../middleware/validation');
const { upload, handleUploadErrors } = require('../middleware/upload');

const router = express.Router();

console.log('COURSES ROUTES LOADED - Registering routes...');

// @desc    Get all published courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res, next) => {
  try {
    console.log('getCourses called with query params:', req.query);
    const { page = 1, limit = 10, search, category, level, sort = 'createdAt' } = req.query;

    const query = { isPublished: true };
    console.log('Initial query:', query);

    // Add search filter
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    // Add category filter
    if (category && category.trim()) {
      query.category = new RegExp(category.trim(), 'i');
    }

    // Add level filter
    if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
      query.level = level;
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'rating':
        sortOption = { 'rating.average': -1 };
        break;
      case 'price':
        sortOption = { price: 1 };
        break;
      case 'enrollments':
      case 'popular':
        sortOption = { enrollmentCount: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    console.log('Final query before database call:', query);
    console.log('Sort option:', sortOption);

    const courses = await Course.find(query)
      .populate('creator', 'firstName lastName avatar')
      .populate('community', 'name')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      courses
    });
  } catch (error) {
    console.error('getCourses error:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Creator and Admin only)
const createCourse = async (req, res, next) => {
  try {
    console.log('Course creation request body:', req.body);
    console.log('Course creation request file:', req.file);

    const {
      title,
      description,
      thumbnail,
      community,
      price,
      level,
      category,
      tags,
      requirements,
      learningOutcomes,
      language,
      isPublished,
      visibility,
      allowComments
    } = req.body;

    // Validate required fields manually to provide better error messages
    const errors = [];
    if (!title) errors.push({ msg: 'Course title is required', param: 'title' });
    if (!description) errors.push({ msg: 'Course description is required', param: 'description' });
    if (!category) errors.push({ msg: 'Course category is required', param: 'category' });
    if (!level) errors.push({ msg: 'Course level is required', param: 'level' });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Parse arrays if they come as strings (from FormData)
    let parsedTags = [];
    let parsedRequirements = [];
    let parsedLearningOutcomes = [];

    try {
      if (tags) {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }
      if (requirements) {
        parsedRequirements = typeof requirements === 'string' ? JSON.parse(requirements) : requirements;
      }
      if (learningOutcomes) {
        parsedLearningOutcomes = typeof learningOutcomes === 'string' ? JSON.parse(learningOutcomes) : learningOutcomes;
      }
    } catch (parseError) {
      console.error('Error parsing arrays:', parseError);
    }

    // Handle thumbnail from file upload
    let thumbnailUrl = thumbnail;
    if (req.file) {
      console.log('📁 File upload info:', {
        filename: req.file.filename,
        path: req.file.path,
        destination: req.file.destination
      });

      // Extract the type subdirectory from the file path
      const pathParts = req.file.path.split(path.sep);
      const typeDir = pathParts[pathParts.length - 2]; // Get the subdirectory name
      thumbnailUrl = `/uploads/${typeDir}/${req.file.filename}`;

      console.log('🖼️ Thumbnail URL constructed:', thumbnailUrl);
    }

    const courseData = {
      title,
      description,
      thumbnail: thumbnailUrl,
      creator: req.user._id,
      community: community || undefined,
      price: parseFloat(price) || 0,
      level,
      category,
      tags: parsedTags,
      requirements: parsedRequirements,
      learningOutcomes: parsedLearningOutcomes,
      language: language || 'English',
      isPublished: isPublished === 'true' || isPublished === true,
      visibility: visibility || (isPublished === 'true' || isPublished === true ? 'public' : 'private'),
      allowComments: allowComments !== 'false' && allowComments !== false
    };

    console.log('Creating course with data:', courseData);

    const course = await Course.create(courseData);
    await course.populate('creator', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Course creation error:', error);
    next(error);
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('creator', 'firstName lastName avatar bio')
      .populate('community', 'name description')
      .populate('reviews.student', 'firstName lastName avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get course videos (only preview videos for non-enrolled users)
    let videos = [];
    if (req.user && (course.isEnrolled(req.user._id) || course.creator.toString() === req.user._id.toString() || req.user.role === 'admin')) {
      // User is enrolled or is the creator - show all videos
      videos = await Video.find({ course: course._id, isActive: true })
        .sort({ order: 1 })
        .select('title description duration order isPreview thumbnail');
    } else {
      // Show only preview videos
      videos = await Video.find({ course: course._id, isPreview: true, isActive: true })
        .sort({ order: 1 })
        .select('title description duration order isPreview thumbnail');
    }

    res.status(200).json({
      success: true,
      course: {
        ...course.toObject(),
        videos,
        isEnrolled: req.user ? course.isEnrolled(req.user._id) : false
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Creator and Admin only)
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is creator
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      course[key] = req.body[key];
    });

    await course.save();

    // Populate after save
    const updatedCourse = await Course.findById(course._id)
      .populate('creator', 'firstName lastName avatar');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Creator and Admin only)
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is creator
    if (course.creator.toString() !== req.user._id.toString() || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    // Also delete associated videos
    await Video.deleteMany({ course: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
const enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course || !course.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or not published'
      });
    }

    // Check if already enrolled
    if (course.isEnrolled(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Enroll student
    course.enrolledStudents.push({
      user: req.user._id,
      enrolledAt: new Date(),
      completedVideos: [],
      progress: 0
    });
    await course.save();

    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledCourses: course._id }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in the course'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unenroll from course
// @route   DELETE /api/courses/:id/unenroll
// @access  Private
const unenrollFromCourse = async (req, res, next) => {
  console.log('UNENROLL ROUTE HIT!', req.params.id, req.user?._id);
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled
    if (!course.isEnrolled(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Remove student from course
    course.enrolledStudents = course.enrolledStudents.filter(
      student => student.user.toString() !== req.user._id.toString()
    );
    await course.save();

    // Remove course from user's enrolled courses
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { enrolledCourses: course._id }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from the course'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course videos
// @route   GET /api/courses/:id/videos
// @access  Public (Metadata only) / Private (Full access)
const getCourseVideos = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled or is the creator
    let isEnrolled = false;
    let isCreator = false;
    let isAdmin = false;

    if (req.user) {
      isEnrolled = course.isEnrolled(req.user._id || req.user.id);
      isCreator = course.creator.toString() === req.user._id.toString();
      isAdmin = req.user.role === 'admin';
    }

    const videos = await Video.find({ course: course._id, isActive: true })
      .sort({ order: 1 });

    // If user has full access, return everything
    if (isEnrolled || isCreator || isAdmin) {
      const videosWithProgress = videos.map(video => ({
        ...video.toObject(),
        userProgress: 0, // You can implement actual progress tracking later
        hasWatched: false
      }));

      return res.status(200).json({
        success: true,
        videos: videosWithProgress
      });
    }

    // If no full access, return metadata only (exclude sensitive fields)
    const videosMetadata = videos.map(video => {
      const vidObj = video.toObject();

      // If it's a preview video, keep the URL/fileId
      if (vidObj.isPreview) {
        return {
          ...vidObj,
          userProgress: 0,
          hasWatched: false
        };
      }

      // Otherwise, remove sensitive data
      return {
        _id: vidObj._id,
        title: vidObj.title,
        description: vidObj.description,
        duration: vidObj.duration,
        order: vidObj.order,
        isPreview: vidObj.isPreview,
        thumbnail: vidObj.thumbnail,
        // Explicitly set these to null/undefined to be safe
        videoUrl: null,
        fileId: null,
        userProgress: 0,
        hasWatched: false
      };
    });

    res.status(200).json({
      success: true,
      videos: videosMetadata
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrolled students
// @route   GET /api/courses/:id/students
// @access  Private (Creator or Admin only)
const getEnrolledStudents = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents', 'firstName lastName email avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is creator or admin
    if (course.creator.toString() !== req.user._id.toString() || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view students'
      });
    }

    res.status(200).json({
      success: true,
      students: course.enrolledStudents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add course review
// @route   POST /api/courses/:id/review
// @access  Private (Enrolled students only)
const addCourseReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled
    if (!course.isEnrolled(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to review this course'
      });
    }

    // Check if user already reviewed
    const existingReview = course.reviews.find(
      review => review.student.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course'
      });
    }

    // Add review
    course.reviews.push({
      student: req.user._id,
      rating,
      comment,
      createdAt: new Date()
    });

    // Recalculate average rating
    course.calculateAverageRating();
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get creator's courses
// @route   GET /api/courses/creator/me
// @access  Private (Creator or Admin only)
const getCreatorCourses = async (req, res, next) => {
  try {
    console.log('getCreatorCourses called by user:', req.user._id, 'role:', req.user.role);

    // For admins, show all courses; for creators, show only their own
    const courses = await Course.find(
      req.user.role === 'admin' ? {} : { creator: req.user._id }
    )
      .populate('creator', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    console.log('Found courses:', courses.length);

    // Add video count for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const videoCount = await Video.countDocuments({
          course: course._id,
          isActive: true
        });

        const enrollmentCount = course.enrolledStudents?.length || 0;
        const courseRevenue = (course.price || 0) * enrollmentCount;

        return {
          ...course.toObject(),
          videoCount,
          status: course.status, // Keep original status
          visibility: course.visibility || (course.isPublished ? 'public' : 'private'),
          enrollmentCount,
          rating: course.rating?.average || 0,
          ratingCount: course.rating?.count || 0,
          revenue: courseRevenue
        };
      })
    );

    // Calculate overall stats
    const totalCourses = courses.length;
    const totalStudents = courses.reduce((sum, course) => sum + (course.enrolledStudents?.length || 0), 0);
    const totalRevenue = coursesWithStats.reduce((sum, course) => sum + (course.revenue || 0), 0);

    // Calculate average rating across all courses
    const coursesWithRatings = courses.filter(course => course.rating && course.rating.average > 0);
    const averageRating = coursesWithRatings.length > 0
      ? coursesWithRatings.reduce((sum, course) => sum + (course.rating.average || 0), 0) / coursesWithRatings.length
      : 0;

    res.status(200).json({
      success: true,
      count: courses.length,
      data: {
        data: coursesWithStats,
        stats: {
          totalCourses,
          totalStudents,
          totalRevenue,
          averageRating
        }
      }
    });
  } catch (error) {
    console.error('getCreatorCourses error:', error);
    next(error);
  }
};

// Routes
// Configure thumbnail upload
const uploadThumbnail = upload.single('thumbnail');

router.get('/', getCourses);
router.get('/test', (req, res) => {
  console.log('TEST GET ROUTE HIT!');
  res.json({ message: 'GET test works' });
});
router.get('/creator/me', protect, authorize('creator', 'admin'), getCreatorCourses);
router.post('/', protect, authorize('creator'), uploadThumbnail, handleUploadErrors, createCourse);

// Specific routes that come before the generic :id route
router.post('/:id/enroll', protect, validateObjectId('id'), enrollInCourse);
router.delete('/:id/unenroll', protect, validateObjectId('id'), (req, res, next) => {
  console.log('UNENROLL ROUTE MIDDLEWARE HIT!', {
    method: req.method,
    url: req.url,
    params: req.params,
    user: req.user?._id
  });
  unenrollFromCourse(req, res, next);
});

// Test route to verify DELETE is working
router.delete('/:id/test-delete', (req, res) => {
  console.log('TEST DELETE ROUTE HIT!', req.params.id);
  res.json({ message: 'DELETE test works', id: req.params.id });
});

router.get('/:id/videos', optionalProtect, validateObjectId('id'), getCourseVideos);
router.get('/:id/students', protect, validateObjectId('id'), getEnrolledStudents);
router.post('/:id/review', protect, validateObjectId('id'), addCourseReview);

// Generic routes that should come last
router.get('/:id', validateObjectId('id'), getCourse);
router.put('/:id', protect, validateObjectId('id'), updateCourse);
router.delete('/:id', protect, validateObjectId('id'), deleteCourse);

module.exports = router;
