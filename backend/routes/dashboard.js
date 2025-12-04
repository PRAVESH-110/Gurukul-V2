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
// @access  Private (Student or Admin only)
const getStudentDashboard = async (req, res, next) => {
  try {
    // Allow admin to view any student's dashboard or their own
    const userId = req.query.userId ? req.query.userId : req.user._id;

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
// @access  Private (Creator or Admin only)
const getCreatorDashboard = async (req, res, next) => {
  try {
    // Allow admin to view any creator's dashboard or their own
    const userId = req.user.role === 'admin' && req.query.userId ? req.query.userId : req.user._id;

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
// @access  Private (Creator or Admin only)
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.role === 'admin' && req.query.userId ? req.query.userId : req.user._id;
    const { timeRange = '30d' } = req.query;

    // Calculate date ranges
    const now = new Date();
    const startDate = new Date();
    const prevStartDate = new Date();

    let days = 30;
    if (timeRange === '7d') days = 7;
    if (timeRange === '90d') days = 90;
    if (timeRange === '1y') days = 365;

    startDate.setDate(now.getDate() - days);
    prevStartDate.setDate(now.getDate() - (days * 2));

    // Get all courses by creator
    const courses = await Course.find({ creator: userId })
      .select('title category thumbnail price enrollmentCount rating stats enrolledStudents reviews isPublished');

    // 1. Revenue Metrics
    let totalRevenue = 0;
    let currentPeriodRevenue = 0;
    let prevPeriodRevenue = 0;

    // 2. Student Metrics
    const allStudentIds = new Set();
    const newStudentIds = new Set();

    // 3. Course Performance List
    const coursePerformance = [];

    courses.forEach(course => {
      // Revenue
      const courseRevenue = (course.price || 0) * (course.enrollmentCount || 0);
      totalRevenue += courseRevenue;

      // Process enrollments for growth and student counts
      if (course.enrolledStudents) {
        course.enrolledStudents.forEach(enrollment => {
          const enrollDate = new Date(enrollment.enrolledAt);
          const studentId = enrollment.user ? enrollment.user.toString() : null;

          if (studentId) allStudentIds.add(studentId);

          // Current Period
          if (enrollDate >= startDate && enrollDate <= now) {
            currentPeriodRevenue += (course.price || 0);
            if (studentId) newStudentIds.add(studentId);
          }

          // Previous Period
          if (enrollDate >= prevStartDate && enrollDate < startDate) {
            prevPeriodRevenue += (course.price || 0);
          }
        });
      }

      coursePerformance.push({
        _id: course._id,
        title: course.title,
        category: course.category,
        thumbnail: course.thumbnail,
        enrollmentCount: course.enrollmentCount || 0,
        revenue: courseRevenue,
        rating: course.rating?.average || 0,
        completionRate: course.stats?.completionRate || 0
      });
    });

    // Revenue Growth
    const revenueGrowth = prevPeriodRevenue > 0
      ? Math.round(((currentPeriodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100)
      : 100;

    // 4. Views Metrics
    // Get all videos for these courses
    const courseIds = courses.map(c => c._id);
    const videos = await Video.find({ course: { $in: courseIds } }).select('views watchedBy title');

    const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
    const avgViewsPerCourse = courses.length > 0 ? Math.round(totalViews / courses.length) : 0;

    // 5. Rating Metrics
    const totalRatingSum = courses.reduce((sum, c) => sum + (c.rating?.average || 0), 0);
    const avgRating = courses.length > 0 ? (totalRatingSum / courses.length) : 0;
    const totalReviews = courses.reduce((sum, c) => sum + (c.rating?.count || 0), 0);

    // 6. Top Content (Videos by views)
    const topContent = videos
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(v => ({
        title: v.title,
        views: v.views
      }));

    // 7. Engagement (Mocked or calculated)
    // Calculate avg watch time from video stats
    let totalWatchTimeSeconds = 0;
    let totalWatches = 0;

    videos.forEach(video => {
      if (video.watchedBy) {
        video.watchedBy.forEach(watch => {
          totalWatchTimeSeconds += (watch.watchTime || 0);
          totalWatches++;
        });
      }
    });

    const avgWatchTimeMinutes = totalWatches > 0 ? Math.round((totalWatchTimeSeconds / totalWatches) / 60) : 0;

    // Get posts count
    const discussionPosts = await Post.countDocuments({
      // Assuming posts are linked to communities which are linked to creator
      // For now, simple query if posts have creator field or we need to find communities first
      // Let's try finding posts by author (creator) or in their communities
      // Simplified: just return 0 or implement properly if Community model is linked
    });

    // We need communities to get posts
    const communities = await Community.find({ creator: userId }).select('_id');
    const communityIds = communities.map(c => c._id);
    const totalPosts = await Post.countDocuments({ community: { $in: communityIds } });


    res.status(200).json({
      success: true,
      analytics: {
        revenue: {
          total: totalRevenue,
          growth: revenueGrowth
        },
        students: {
          total: allStudentIds.size,
          new: newStudentIds.size
        },
        views: {
          total: totalViews,
          avgPerCourse: avgViewsPerCourse
        },
        rating: {
          average: avgRating,
          totalReviews: totalReviews
        },
        courses: coursePerformance,
        topContent: topContent,
        engagement: {
          avgWatchTime: `${avgWatchTimeMinutes}m`,
          discussionPosts: totalPosts,
          questions: 0 // Placeholder
        },
        revenueBreakdown: {
          courses: totalRevenue,
          subscriptions: 0,
          other: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.get('/student', protect, authorize('student', 'admin'), getStudentDashboard);
router.get('/creator', protect, authorize('creator', 'admin'), getCreatorDashboard);
router.get('/analytics', protect, authorize('creator', 'admin'), getAnalytics);

module.exports = router;
