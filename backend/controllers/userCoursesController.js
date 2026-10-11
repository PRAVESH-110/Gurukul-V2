const userCoursesService = require('../services/userCourses.service');

const getEnrolledCourses = async (req, res, next) => {
  try {
    const userId = req.user.role === 'admin' && req.query.userId ? req.query.userId : req.user.id;
    const courses = await userCoursesService.listEnrolledCourses(userId);
    return res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) { return next(error); }
};

const getCreatedCourses = async (req, res, next) => {
  try {
    const courses = await userCoursesService.listCreatedCourses(req.user.id);
    return res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) { return next(error); }
};

module.exports = { getEnrolledCourses, getCreatedCourses };
