const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get user's enrolled courses
// @route   GET /api/courses/me/enrolled
// @access  Private (Self or Admin)
router.get('/me/enrolled', protect, async (req, res, next) => {
  try {
    // Allow admins to specify a userId to view other users' enrolled courses
    const userId = req.user.role === 'admin' && req.query.userId 
      ? req.query.userId 
      : req.user.id;
    
    const courses = await Course.find({
      'students.user': userId,
      isPublished: true
    })
    .select('title description thumbnail price instructor studentsCount')
    .populate('instructor', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's created courses (for instructors)
// @route   GET /api/courses/me/created
// @access  Private (Instructor)
router.get('/me/created', protect, authorize('creator', 'admin'), async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .select('title description thumbnail price isPublished studentsCount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
