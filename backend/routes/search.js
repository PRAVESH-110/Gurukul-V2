const express = require('express');
const Community = require('../models/Community');
const Course = require('../models/Course');
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Search communities
// @route   GET /api/search/communities
// @access  Public
const searchCommunities = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const trimmedQuery = q.trim();
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    // Use MongoDB Text Search index on (name, description)
    const query = {
      isActive: true,
      type: 'public',
      $text: { $search: trimmedQuery },
    };

    const communities = await Community.find(query)
      .select('-members')
      .populate('creator', 'firstName lastName avatar')
      .sort({ memberCount: -1, createdAt: -1 })
      .limit(safeLimit)
      .skip((safePage - 1) * safeLimit)
      .lean();

    const total = await Community.countDocuments(query);

    res.status(200).json({
      success: true,
      count: communities.length,
      total,
      pagination: {
        page: safePage,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit),
      },
      communities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search courses
// @route   GET /api/search/courses
// @access  Public
const searchCourses = async (req, res, next) => {
  try {
    const { q, category, level, page = 1, limit = 10 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const trimmedQuery = q.trim();
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    // Use MongoDB Text Search index on (title, subtitle, description, tags)
    const query = {
      isPublished: true,
      $text: { $search: trimmedQuery },
    };

    // Add category filter
    if (category && category.trim()) {
      query.category = new RegExp(category.trim(), 'i');
    }

    // Add level filter
    if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
      query.level = level;
    }

    const courses = await Course.find(query)
      .select('-enrolledStudents -reviews -sections -resources -requirements -learningOutcomes')
      .populate('creator', 'firstName lastName avatar')
      .populate('community', 'name')
      .sort({ enrollmentCount: -1, 'rating.average': -1 })
      .limit(safeLimit)
      .skip((safePage - 1) * safeLimit)
      .lean();

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      pagination: {
        page: safePage,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit),
      },
      courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/search/users
// @access  Private
const searchUsers = async (req, res, next) => {
  try {
    const { q, role, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const query = {
      $and: [
        { isActive: true },
        {
          $or: [
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
          ],
        },
      ],
    };

    // Add role filter
    if (role && ['student', 'creator'].includes(role)) {
      query.$and.push({ role });
    }

    const users = await User.find(query)
      .select('firstName lastName avatar role bio')
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
        pages: Math.ceil(total / limit),
      },
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search posts
// @route   GET /api/search/posts
// @access  Private
const searchPosts = async (req, res, next) => {
  try {
    const { q, communityId, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const query = {
      $and: [
        { isActive: true },
        {
          $or: [{ title: { $regex: q, $options: 'i' } }, { content: { $regex: q, $options: 'i' } }],
        },
      ],
    };

    // Add community filter
    if (communityId) {
      query.$and.push({ community: communityId });
    }

    // Get user's joined communities to filter posts (unless admin)
    let joinedCommunityIds;
    if (req.user.role === 'admin') {
      // Admins can see all posts, so don't filter by community
      joinedCommunityIds = null;
    } else {
      const user = await User.findById(req.user._id).populate('joinedCommunities');
      joinedCommunityIds = user.joinedCommunities.map((c) => c._id);
    }

    // Only show posts from communities user is a member of (unless admin)
    if (joinedCommunityIds) {
      query.$and.push({ community: { $in: joinedCommunityIds } });
    }

    const posts = await Post.find(query)
      .populate('author', 'firstName lastName avatar')
      .populate('community', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Global search (all content types)
// @route   GET /api/search/global
// @access  Private
const globalSearch = async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const searchLimit = Math.ceil(limit / 4); // Divide results among content types

    // Search communities
    const communities = await Community.find({
      $and: [
        { isActive: true },
        { type: 'public' },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
          ],
        },
      ],
    })
      .populate('creator', 'firstName lastName avatar')
      .limit(searchLimit);

    // Search courses
    const courses = await Course.find({
      $and: [
        { isPublished: true },
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } },
          ],
        },
      ],
    })
      .populate('creator', 'firstName lastName avatar')
      .limit(searchLimit);

    // Search users
    const users = await User.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
          ],
        },
      ],
    })
      .select('firstName lastName avatar role')
      .limit(searchLimit);

    // Search posts (only from user's communities, unless admin)
    let joinedCommunityIds;
    if (req.user.role === 'admin') {
      // Admins can see all posts, so don't filter by community
      joinedCommunityIds = null;
    } else {
      const user = await User.findById(req.user._id).populate('joinedCommunities');
      joinedCommunityIds = user.joinedCommunities.map((c) => c._id);
    }

    const postQuery = {
      $and: [
        { isActive: true },
        {
          $or: [{ title: { $regex: q, $options: 'i' } }, { content: { $regex: q, $options: 'i' } }],
        },
      ],
    };

    // Only filter by community if not admin
    if (joinedCommunityIds) {
      postQuery.$and.push({ community: { $in: joinedCommunityIds } });
    }

    const posts = await Post.find(postQuery)
      .populate('author', 'firstName lastName avatar')
      .populate('community', 'name')
      .limit(searchLimit);

    res.status(200).json({
      success: true,
      results: {
        communities: communities.map((c) => ({ ...c.toObject(), type: 'community' })),
        courses: courses.map((c) => ({ ...c.toObject(), type: 'course' })),
        users: users.map((u) => ({ ...u.toObject(), type: 'user' })),
        posts: posts.map((p) => ({ ...p.toObject(), type: 'post' })),
      },
      totalResults: communities.length + courses.length + users.length + posts.length,
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.get('/communities', searchCommunities);
router.get('/courses', searchCourses);
router.get('/users', protect, searchUsers);
router.get('/posts', protect, searchPosts);
router.get('/global', protect, globalSearch);

module.exports = router;
