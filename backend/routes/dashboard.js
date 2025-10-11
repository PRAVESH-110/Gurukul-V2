const express = require('express');
const User = require('../models/User');
const Community = require('../models/Community');
const Course = require('../models/Course');
const Video = require('../models/Video');
const Event = require('../models/Event');
const Post = require('../models/Post');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get student dashboard data
// @route   GET /api/dashboard/student
// @access  Private (Student only)
const getStudentDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get user's enrolled courses with progress
    const enrolledCourses = await Course.find({ 
      'enrolledStudents.user': userId,
      isPublished: true 
    })
      .populate('creator', 'firstName lastName avatar')
      .select('title description thumbnail creator enrollmentCount rating videoCount duration');

    // Calculate progress for each course
    const coursesWithProgress = await Promise.all(
      enrolledCourses.map(async (course) => {
        const totalVideos = await Video.countDocuments({ 
          course: course._id, 
          isActive: true 
        });
        
        const watchedVideos = await Video.countDocuments({
          course: course._id,
          isActive: true,
          'watchedBy.student': userId,
          'watchedBy.completed': true
        });

        const progress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

        return {
          ...course.toObject(),
          progress,
          totalVideos,
          watchedVideos
        };
      })
    );

    // Get user's joined communities
    const joinedCommunities = await Community.find({
      'members.user': userId,
      isActive: true
    })
      .populate('creator', 'firstName lastName avatar')
      .select('name description type coverImage creator memberCount');

    // Get upcoming events from joined communities
    const communityIds = joinedCommunities.map(c => c._id);
    const upcomingEvents = await Event.find({
      community: { $in: communityIds },
      startDate: { $gte: new Date() },
      isActive: true
    })
      .populate('community', 'name')
      .populate('creator', 'firstName lastName avatar')
      .sort({ startDate: 1 })
      .limit(5);

    // Get recent posts from joined communities
    const recentPosts = await Post.find({
      community: { $in: communityIds },
      isActive: true
    })
      .populate('author', 'firstName lastName avatar')
      .populate('community', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get learning statistics
    const totalCoursesEnrolled = enrolledCourses.length;
    const completedCourses = coursesWithProgress.filter(c => c.progress === 100).length;
    const totalCommunitiesJoined = joinedCommunities.length;
    const totalVideosWatched = await Video.countDocuments({
      'watchedBy.student': userId,
      'watchedBy.completed': true
    });

    res.status(200).json({
      success: true,
      dashboard: {
        user: {
          _id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          avatar: req.user.avatar,
          role: req.user.role
        },
        stats: {
          totalCoursesEnrolled,
          completedCourses,
          totalCommunitiesJoined,
          totalVideosWatched
        },
        enrolledCourses: coursesWithProgress,
        joinedCommunities,
        upcomingEvents,
        recentPosts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get creator dashboard data
// @route   GET /api/dashboard/creator
// @access  Private (Creator only)
const getCreatorDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get creator's courses
    const createdCourses = await Course.find({ creator: userId })
      .populate('community', 'name')
      .sort({ createdAt: -1 });

    // Get creator's communities with member counts
    const createdCommunities = await Community.find({ creator: userId, isActive: true })
      .sort({ createdAt: -1 });
      
    // Calculate member counts
    const communitiesWithCounts = createdCommunities.map(community => ({
      ...community.toObject(),
      memberCount: community.members ? community.members.length : 0
    }));

    // Get total enrollments across all courses
    const totalEnrollments = createdCourses.reduce((sum, course) => sum + course.enrollmentCount, 0);

    // Get total community members
    const totalCommunityMembers = communitiesWithCounts.reduce((sum, community) => sum + (community.memberCount || 0), 0);

    // Get recent enrollments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEnrollments = await Course.aggregate([
      { $match: { creator: userId } },
      { $unwind: '$enrolledStudents' },
      {
        $lookup: {
          from: 'users',
          localField: 'enrolledStudents',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          courseTitle: '$title',
          studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
          studentAvatar: '$student.avatar',
          enrolledAt: '$updatedAt'
        }
      },
      { $sort: { enrolledAt: -1 } },
      { $limit: 10 }
    ]);

    // Get upcoming events from creator's communities
    const communityIds = communitiesWithCounts.map(c => c._id);
    const upcomingEvents = await Event.find({
      creator: userId,
      startDate: { $gte: new Date() },
      isActive: true
    })
      .populate('community', 'name')
      .sort({ startDate: 1 })
      .limit(5);

    // Get recent posts from creator's communities
    const recentPosts = await Post.find({
      community: { $in: communityIds },
      isActive: true
    })
      .populate('author', 'firstName lastName avatar')
      .populate('community', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate revenue (if courses have prices)
    const totalRevenue = createdCourses.reduce((sum, course) => {
      return sum + (course.price * course.enrollmentCount);
    }, 0);

    // Calculate average rating across all courses
    const coursesWithRatings = createdCourses.filter(course => course.rating && course.rating.average > 0);
    const averageRating = coursesWithRatings.length > 0 
      ? coursesWithRatings.reduce((sum, course) => sum + (course.rating.average || 0), 0) / coursesWithRatings.length 
      : 0;

    // Get course analytics
    const courseAnalytics = await Promise.all(
      createdCourses.map(async (course) => {
        const totalVideos = await Video.countDocuments({ 
          course: course._id, 
          isActive: true 
        });

        const totalWatches = await Video.aggregate([
          { $match: { course: course._id, isActive: true } },
          { $unwind: '$watchedBy' },
          { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        return {
          courseId: course._id,
          title: course.title,
          enrollments: course.enrollmentCount,
          totalVideos,
          totalWatches: totalWatches[0]?.count || 0,
          revenue: course.price * course.enrollmentCount,
          rating: course.rating.average || 0
        };
      })
    );

    res.status(200).json({
      success: true,
      dashboard: {
        user: {
          _id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          avatar: req.user.avatar,
          role: req.user.role
        },
        stats: {
          totalCourses: createdCourses.length,
          totalCommunities: communitiesWithCounts.length,
          totalEnrollments,
          totalCommunityMembers,
          totalRevenue,
          averageRating
        },
        createdCourses: createdCourses.map(course => ({
          ...course.toObject(),
          rating: course.rating.average || 0
        })),
        createdCommunities: communitiesWithCounts,
        recentEnrollments,
        upcomingEvents,
        recentPosts,
        courseAnalytics
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics data
// @route   GET /api/dashboard/analytics
// @access  Private (Creator only)
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query; // days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get enrollment trends
    const enrollmentTrends = await Course.aggregate([
      { $match: { creator: userId } },
      { $unwind: '$enrolledStudents' },
      {
        $lookup: {
          from: 'users',
          localField: 'enrolledStudents',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' }
          },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get video watch analytics
    const videoWatchAnalytics = await Video.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      { $unwind: '$courseInfo' },
      { $match: { 'courseInfo.creator': userId } },
      { $unwind: '$watchedBy' },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$watchedBy.watchedAt' }
          },
          watches: { $sum: 1 },
          completions: {
            $sum: { $cond: ['$watchedBy.completed', 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top performing courses
    const topCourses = await Course.find({ creator: userId })
      .sort({ enrollmentCount: -1, 'rating.average': -1 })
      .limit(5)
      .select('title enrollmentCount rating');

    // Get community growth
    const communityGrowth = await Community.aggregate([
      { $match: { creator: userId, isActive: true } },
      { $unwind: '$members' },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$members.joinedAt' }
          },
          newMembers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        period: parseInt(period),
        enrollmentTrends,
        videoWatchAnalytics,
        topCourses,
        communityGrowth
      }
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.get('/student', protect, authorize('student'), getStudentDashboard);
router.get('/creator', protect, authorize('creator'), getCreatorDashboard);
router.get('/analytics', protect, authorize('creator'), getAnalytics);

module.exports = router;
