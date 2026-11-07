const Course = require('../models/Course');

const listEnrolledCourses = (userId) =>
  Course.find({ 'enrolledStudents.user': userId, isPublished: true })
    .select('title description thumbnail price creator enrollmentCount')
    .populate('creator', 'firstName lastName')
    .sort({ createdAt: -1 });

const listCreatedCourses = (userId) =>
  Course.find({ creator: userId })
    .select('title description thumbnail price isPublished enrollmentCount')
    .sort({ createdAt: -1 });

module.exports = { listEnrolledCourses, listCreatedCourses };
