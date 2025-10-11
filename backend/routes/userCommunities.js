const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const Post = require('../models/Post');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get user's communities (for students - joined communities)
// @route   GET /api/communities/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const { search, status = 'all', sort = 'newest' } = req.query;
    
    // For creators, get communities they created
    if (req.user.role === 'creator') {
      let query = { creator: req.user._id };
      
      // Add status filter
      if (status !== 'all') {
        if (status === 'active') query.isActive = true;
        if (status === 'inactive') query.isActive = false;
      }
      
      // Add search filter
      if (search) {
        query.$text = { $search: search };
      }
      
      // Sort options
      let sortOption = {};
      switch (sort) {
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'name':
          sortOption = { name: 1 };
          break;
        case 'members':
          sortOption = { memberCount: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
      
      const communities = await Community.find(query)
        .populate('creator', 'firstName lastName avatar')
        .sort(sortOption);
      
      // Get stats for each community
      const communitiesWithStats = await Promise.all(
        communities.map(async (community) => {
          const memberCount = community.members ? community.members.length : 0;
          const postCount = await Post.countDocuments({ 
            community: community._id, 
            isActive: true 
          });
          const eventCount = await Event.countDocuments({ 
            community: community._id, 
            isActive: true 
          });
          
          return {
            ...community.toObject(),
            memberCount,
            postCount,
            eventCount
          };
        })
      );
      
      // Calculate overall stats
      const stats = {
        totalCommunities: communities.length,
        totalMembers: communities.reduce((sum, c) => sum + (c.members ? c.members.length : 0), 0),
        totalPosts: await Post.countDocuments({ 
          community: { $in: communities.map(c => c._id) }, 
          isActive: true 
        }),
        totalEvents: await Event.countDocuments({ 
          community: { $in: communities.map(c => c._id) }, 
          isActive: true 
        })
      };
      
      return res.status(200).json({
        success: true,
        data: {
          communities: communitiesWithStats,
          stats
        }
      });
    } else {
      // For students, get communities they joined
      const communities = await Community.find({
        'members.user': req.user._id,
        isActive: true
      })
      .populate('creator', 'firstName lastName avatar')
      .select('name description coverImage memberCount type')
      .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: communities.length,
        data: communities
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
