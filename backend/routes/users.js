const express = require('express');
const User = require('../models/User');
const Community = require('../models/Community');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');
const userController = require('../controllers/userController');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query = { isActive: true };
    
    // Add role filter
    if (role && ['student', 'creator'].includes(role)) {
      query.role = role;
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('joinedCommunities', 'name type coverImage memberCount')
      .populate('enrolledCourses', 'title thumbnail creator rating');

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If viewing another user's profile, limit information
    if (req.user._id.toString() !== user._id.toString()) {
      const publicProfile = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt
      };

      // Add public communities and courses for creators
      if (user.role === 'creator') {
        const publicCommunities = await Community.find({
          creator: user._id,
          type: 'public',
          isActive: true
        }).select('name description coverImage memberCount');

        const publicCourses = await Course.find({
          creator: user._id,
          isPublished: true
        }).select('title description thumbnail rating enrollmentCount');

        publicProfile.createdCommunities = publicCommunities;
        publicProfile.createdCourses = publicCourses;
      }

      return res.status(200).json({
        success: true,
        user: publicProfile
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Self or Admin)
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is updating their own profile or is admin
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const { firstName, lastName, bio, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        bio: bio !== undefined ? bio : user.bio,
        avatar: avatar || user.avatar
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's communities
// @route   GET /api/users/:id/communities
// @access  Private
const getUserCommunities = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let communities;

    // If viewing own profile, show all communities
    if (req.user._id.toString() === user._id.toString()) {
      communities = await Community.find({
        'members.user': user._id,
        isActive: true
      })
        .populate('creator', 'firstName lastName avatar')
        .sort({ 'members.joinedAt': -1 });
    } else {
      // If viewing another user's profile, show only public communities
      communities = await Community.find({
        'members.user': user._id,
        type: 'public',
        isActive: true
      })
        .populate('creator', 'firstName lastName avatar')
        .sort({ 'members.joinedAt': -1 });
    }

    res.status(200).json({
      success: true,
      communities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's enrolled courses
// @route   GET /api/users/:id/courses
// @access  Private (Self only)
const getUserCourses = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only allow users to view their own enrolled courses
    if (req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view enrolled courses'
      });
    }

    const courses = await Course.find({
      'enrolledStudents.user': user._id,
      isPublished: true
    })
      .populate('creator', 'firstName lastName avatar')
      .sort({ updatedAt: -1 });

    // Extract user-specific enrollment data for each course
    const coursesWithProgress = await Promise.all(courses.map(async (course) => {
      const enrollment = course.enrolledStudents.find(
        s => s.user && s.user.toString() === user._id.toString()
      );

      // Dynamically count videos for accuracy
      const Video = require('../models/Video');
      const videoCount = await Video.countDocuments({ 
        course: course._id, 
        isActive: true 
      });

      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        creator: course.creator,
        category: course.category,
        level: course.level,
        rating: course.rating,
        enrollmentCount: course.enrollmentCount,
        totalVideos: videoCount,
        duration: course.duration,
        progress: enrollment ? enrollment.progress : 0,
        completedVideos: enrollment ? enrollment.completedVideos.length : 0,
        enrolledAt: enrollment ? enrollment.enrolledAt : null
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        courses: coursesWithProgress
      }
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, validateObjectId('id'), getUser);
router.put('/:id', protect, validateObjectId('id'), updateUser);
router.delete('/:id', protect, authorize('admin'), validateObjectId('id'), deleteUser);
router.get('/:id/communities', protect, validateObjectId('id'), getUserCommunities);
router.get('/:id/courses', protect, validateObjectId('id'), getUserCourses);

// User's own communities
router.get('/me/communities', protect, userController.getMyCommunities);
router.get('/me/created-communities', protect, userController.getMyCreatedCommunities);

module.exports = router;
