const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const userCoursesController = require('../controllers/userCoursesController');

// @desc    Get user's enrolled courses
// @route   GET /api/courses/me/enrolled
// @access  Private (Self or Admin)
router.get('/me/enrolled', protect, userCoursesController.getEnrolledCourses);

// @desc    Get user's created courses (for instructors)
// @route   GET /api/courses/me/created
// @access  Private (Instructor)
router.get('/me/created', protect, authorize('creator', 'admin'), userCoursesController.getCreatedCourses);

module.exports = router;
