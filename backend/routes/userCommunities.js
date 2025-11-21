const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const Post = require('../models/Post');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get user's communities (for creators - created communities, for students - joined communities, for admins - all communities)
// @route   GET /api/communities/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const { search, status = 'all', sort = 'newest' } = req.query;
    
    // For creators, get communities they created
    if (req.user.role === 'creator' || req.user.role === 'admin') {
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
        .sort(sortOption)
        .select('name description coverImage memberCount type isActive createdAt updatedAt');
      
      // Add member stats for each community
      const communitiesWithStats = await Promise.all(
        communities.map(async (community) => {
          const totalMembers = community.members ? community.members.length : 0;
          const activeMembers = community.members ? 
            community.members.filter(member => member.isActive !== false).length : 0;
          
          return {
            ...community.toObject(),
            stats: {
              totalMembers,
              activeMembers,
              inactiveMembers: totalMembers - activeMembers
            }
          };
        })
      );
      
      const stats = {
        totalCommunities: communities.length,
        activeCommunities: communities.filter(c => c.isActive).length,
        inactiveCommunities: communities.filter(c => !c.isActive).length
      };
      
      res.status(200).json({
        success: true,
        count: communities.length,
        data: {
          communities: communitiesWithStats,
          stats
        }
      });
    } else if (req.user.role === 'admin') {
      // For admins, get all communities
      let query = {};
      
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
        .sort(sortOption)
        .select('name description coverImage memberCount type isActive createdAt updatedAt');
      
      // Add member stats for each community
      const communitiesWithStats = await Promise.all(
        communities.map(async (community) => {
          const totalMembers = community.members ? community.members.length : 0;
          const activeMembers = community.members ? 
            community.members.filter(member => member.isActive !== false).length : 0;
          
          return {
            ...community.toObject(),
            stats: {
              totalMembers,
              activeMembers,
              inactiveMembers: totalMembers - activeMembers
            }
          };
        })
      );
      
      const stats = {
        totalCommunities: communities.length,
        activeCommunities: communities.filter(c => c.isActive).length,
        inactiveCommunities: communities.filter(c => !c.isActive).length
      };
      
      res.status(200).json({
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
