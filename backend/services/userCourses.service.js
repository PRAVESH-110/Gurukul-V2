const Course = require('../models/Course');

const listEnrolledCourses = (userId) => Course.find({ 'students.user': userId, isPublished: true })
  .select('title description thumbnail price instructor studentsCount')
  .populate('instructor', 'firstName lastName')
  .sort({ createdAt: -1 });

const listCreatedCourses = (userId) => Course.find({ instructor: userId })
  .select('title description thumbnail price isPublished studentsCount')
  .sort({ createdAt: -1 });

module.exports = { listEnrolledCourses, listCreatedCourses };
