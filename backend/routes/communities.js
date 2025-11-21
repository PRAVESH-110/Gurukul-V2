const express = require('express');
const Community = require('../models/Community');
const User = require('../models/User');
const Post = require('../models/Post');
const Event = require('../models/Event');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const { validateCommunity, validateObjectId } = require('../middleware/validation');
const { upload, handleUploadErrors } = require('../middleware/upload');

// Configure banner upload
const uploadBanner = upload.single('banner');

const router = express.Router();

// @desc    Get all public communities
// @route   GET /api/communities
// @access  Public
const getCommunities = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, type } = req.query;
    
    const query = { isActive: true };
    
    // Add search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    // Add type filter
    if (type && ['public', 'private'].includes(type)) {
      query.type = type;
    } else {
      query.type = 'public'; // Only show public communities by default
    }

    const communities = await Community.find(query)
      .populate('creator', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Community.countDocuments(query);

    res.status(200).json({
      success: true,
      count: communities.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      communities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new community
// @route   POST /api/communities
// @access  Private (Creator only)
const createCommunity = async (req, res, next) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Get data from request body
    const { name, description, type, tags } = req.body;
    
    // Validate required fields
    const errors = [];
    if (!name) {
      errors.push({ msg: 'Community name is required', param: 'name' });
    }
    if (!description) {
      errors.push({ msg: 'Description is required', param: 'description' });
    }
    if (!type || !['public', 'private'].includes(type)) {
      errors.push({ 
        msg: 'Type must be either public or private', 
        param: 'type' 
      });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    // Handle file upload if present
    let coverImage;
    if (req.file) {
      // Store as string URL to match schema (coverImage: String)
      // Extract the type subdirectory from the file path
      const path = require('path');
      const pathParts = req.file.path.split(path.sep);
      const typeDir = pathParts[pathParts.length - 2]; // Get the subdirectory name
      coverImage = `/uploads/${typeDir}/${req.file.filename}`;
    }

    // Parse tags if they exist
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : [];
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }

    // Create the community
    const community = new Community({
      name,
      description,
      type,
      coverImage,
      tags: parsedTags,
      creator: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin', 
        joinedAt: new Date()
      }]
    });

    // Save the community to the database
    await community.save();
    
    // Add community to user's joined communities
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedCommunities: community._id }
    });

    // Populate creator info for the response
    await community.populate('creator', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      community
    });
  } catch (error) {
    console.error('Error creating community:', error);
    next(error);
  }
};

// @desc    Get community by ID
// @route   GET /api/communities/:id
// @access  Private (Public communities, Private communities for members/creators/admins)
const getCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creator', 'firstName lastName avatar')
      .populate('members.user', 'firstName lastName avatar');

    if (!community || !community.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if private community and user is not a member
    if (community.type === 'private' && req.user) {
      const isMember = community.members.some(member => 
        member.user && member.user.toString() === req.user._id.toString()
      );
      const isCreator = community.creator._id.toString() === req.user._id.toString() || req.user.role === 'admin';
      
      if (!isMember && !isCreator) {
        return res.status(403).json({
          success: false,
          message: 'This is a private community'
        });
      }
    }

    res.status(200).json({
      success: true,
      community
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update community
// @route   PUT /api/communities/:id
// @access  Private (Creator only)
const updateCommunity = async (req, res, next) => {
  try {
    const { name, description, type, coverImage, tags, rules } = req.body;

    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is creator
    if (community.creator.toString() !== req.user._id.toString() || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this community'
      });
    }

    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id,
      {
        name: name || community.name,
        description: description || community.description,
        type: type || community.type,
        coverImage: coverImage || community.coverImage,
        tags: tags || community.tags,
        rules: rules !== undefined ? rules : community.rules
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('creator', 'firstName lastName avatar');

    res.status(200).json({
      success: true,
      message: 'Community updated successfully',
      community: updatedCommunity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete community
// @route   DELETE /api/communities/:id
// @access  Private (Creator only)
const deleteCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is creator
    if (community.creator.toString() !== req.user._id.toString() || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this community'
      });
    }

    // Soft delete
    community.isActive = false;
    await community.save();

    res.status(200).json({
      success: true,
      message: 'Community deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join community
// @route   POST /api/communities/:id/join
// @access  Private
const joinCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community || !community.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if already a member
    const isMember = community.members.some(member => 
      member.user && member.user.toString() === req.user._id.toString()
    );
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this community'
      });
    }

    // For private communities, only creator can add members directly
    if (community.type === 'private') {
      return res.status(403).json({
        success: false,
        message: 'This is a private community. Contact the admin to join.'
      });
    }

    // Add user to community
    community.addMember(req.user._id);
    await community.save();

    // Add community to user's joined communities
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedCommunities: community._id }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully joined the community'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave community
// @route   POST /api/communities/:id/leave
// @access  Private
const leaveCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is a member
    const isMember = community.members.some(member => 
      member.user && member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this community'
      });
    }

    // Creator cannot leave their own community
    if (community.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Creator cannot leave their own community'
      });
    }

    // Remove user from community
    community.removeMember(req.user._id);
    await community.save();

    // Remove community from user's joined communities
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedCommunities: community._id }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully left the community'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get community members
// @route   GET /api/communities/:id/members
// @access  Private (Members only)
const getCommunityMembers = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members.user', 'firstName lastName avatar email');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is a member or creator
    const isMember = community.members.some(member => 
      member.user && member.user.toString() === req.user._id.toString()
    );
    const isCreator = community.creator.toString() === req.user._id.toString();
    const isAdmin=  req.user.role === 'admin';

    if (!isMember && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to view members'
      });
    }

    res.status(200).json({
      success: true,
      members: community.members
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's communities (joined for students, created for creators)
// @route   GET /api/communities/me
// @access  Private
const getUserCommunities = async (req, res, next) => {
  try {
    if (req.user.role === 'creator' ) {
      return getCreatorCommunities(req, res, next);
    }
    else if(req.user.role === 'admin'){
      return getAdminCommunities(req, res, next);
    }
    else {
      return getStudentCommunities(req, res, next);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's joined communities
// @route   GET /api/communities/me
// @access  Private (Student only)
const getStudentCommunities = async (req, res, next) => {
  try {
    console.log('getStudentCommunities called by user:', req.user._id);
    
    const communities = await Community.find({ 
      'members.user': req.user._id,
      isActive: true 
    })
      .populate('creator', 'firstName lastName avatar')
      .sort({ 'members.joinedAt': -1 });

    console.log('Found joined communities:', communities.length);
    
    // Add stats for each community
    const communitiesWithStats = communities.map(community => ({
      ...community.toObject(),
      memberCount: community.members?.length || 0,
      postCount: 0, // Can add actual count if needed
      eventCount: 0  // Can add actual count if needed
    }));
    
    res.status(200).json({
      success: true,
      count: communities.length,
      data: {
        data: communitiesWithStats,
        stats: {
          totalCommunities: communities.length,
          totalMembers: 0, // Not relevant for students
          totalPosts: 0,
          totalEvents: 0
        }
      }
    });
  } catch (error) {
    console.error('getStudentCommunities error:', error);
    next(error);
  }
};

// @desc    Get creator's communities
// @route   GET /api/communities/me
// @access  Private (Creator only)
const getCreatorCommunities = async (req, res, next) => {
  try {
    console.log('getCreatorCommunities called by user:', req.user._id);

    const communities = await Community.find({ creator: req.user._id })
      .populate('creator', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    console.log('Found communities:', communities.length);

    // Get additional stats from other collections
    const communityIds = communities.map(c => c._id);

    // Get post counts for these communities
    const postCounts = await Post.aggregate([
      { $match: { community: { $in: communityIds }, isActive: true } },
      { $group: { _id: '$community', count: { $sum: 1 } } }
    ]);

    console.log('Post counts aggregation result:', postCounts);

    // Get event counts for these communities
    const eventCounts = await Event.aggregate([
      { $match: { community: { $in: communityIds }, isActive: true } },
      { $group: { _id: '$community', count: { $sum: 1 } } }
    ]);

    console.log('Event counts aggregation result:', eventCounts);

    // Create lookup maps
    const postCountMap = {};
    const eventCountMap = {};
    
    postCounts.forEach(item => {
      postCountMap[item._id.toString()] = item.count;
    });
    
    eventCounts.forEach(item => {
      eventCountMap[item._id.toString()] = item.count;
    });
    
    // Add stats for each community
    const communitiesWithStats = communities.map(community => ({
      ...community.toObject(),
      memberCount: community.members?.length || 0,
      postCount: postCountMap[community._id.toString()] || 0,
      eventCount: eventCountMap[community._id.toString()] || 0
    }));
    
    // Calculate overall stats
    const totalCommunities = communities.length;
    const totalMembers = communities.reduce((sum, community) => sum + (community.members?.length || 0), 0);
    const totalPosts = Object.values(postCountMap).reduce((sum, count) => sum + count, 0);
    const totalEvents = Object.values(eventCountMap).reduce((sum, count) => sum + count, 0);
    
    res.status(200).json({
      success: true,
      count: communities.length,
      data: {
        data: communitiesWithStats,
        stats: {
          totalCommunities,
          totalMembers,
          totalPosts,
          totalEvents
        }
      }
    });
  } catch (error) {
    console.error('getCreatorCommunities error:', error);
    next(error);
  }
};

// @desc    Get admin's communities (all communities)
// @route   GET /api/communities/me
// @access  Private (Admin only)
const getAdminCommunities = async (req, res, next) => {
  try {
    console.log('getAdminCommunities called by user:', req.user._id);
    
    const communities = await Community.find({ isActive: true })
      .populate('creator', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    console.log('Found communities:', communities.length);
    
    // Get additional stats from other collections
    const communityIds = communities.map(c => c._id);

    // Get post counts for these communities
    const postCounts = await Post.aggregate([
      { $match: { community: { $in: communityIds }, isActive: true } },
      { $group: { _id: '$community', count: { $sum: 1 } } }
    ]);

    // Get event counts for these communities
    const eventCounts = await Event.aggregate([
      { $match: { community: { $in: communityIds }, isActive: true } },
      { $group: { _id: '$community', count: { $sum: 1 } } }
    ]);
    
    // Create lookup maps
    const postCountMap = {};
    const eventCountMap = {};
    
    postCounts.forEach(item => {
      postCountMap[item._id.toString()] = item.count;
    });
    
    eventCounts.forEach(item => {
      eventCountMap[item._id.toString()] = item.count;
    });
    
    // Add stats for each community
    const communitiesWithStats = communities.map(community => ({
      ...community.toObject(),
      memberCount: community.members?.length || 0,
      postCount: postCountMap[community._id.toString()] || 0,
      eventCount: eventCountMap[community._id.toString()] || 0
    }));
    
    // Calculate overall stats
    const totalCommunities = communities.length;
    const totalMembers = communities.reduce((sum, community) => sum + (community.members?.length || 0), 0);
    const totalPosts = Object.values(postCountMap).reduce((sum, count) => sum + count, 0);
    const totalEvents = Object.values(eventCountMap).reduce((sum, count) => sum + count, 0);
    
    res.status(200).json({
      success: true,
      count: communities.length,
      data: {
        data: communitiesWithStats,
        stats: {
          totalCommunities,
          totalMembers,
          totalPosts,
          totalEvents
        }
      }
    });
  } catch (error) {
    console.error('getCreatorCommunities error:', error);
    next(error);
  }
};

// Routes
router.get('/', getCommunities);
router.get('/me', protect, getUserCommunities);
router.post(
  '/',
  protect,
  uploadBanner,
  handleUploadErrors,
  validateCommunity,
  createCommunity
);
router.get('/:id', protect, validateObjectId('id'), getCommunity);
router.put(
  '/:id',
  protect,
  authorize('creator', 'admin'),
  validateObjectId('id'),
  uploadBanner,
  handleUploadErrors,
  validateCommunity,
  updateCommunity
);
router.delete('/:id', protect, authorize('creator', 'admin'), validateObjectId('id'), deleteCommunity);
router.post('/:id/join', protect, validateObjectId('id'), joinCommunity);
router.post('/:id/leave', protect, validateObjectId('id'), leaveCommunity);
router.get('/:id/members', protect, validateObjectId('id'), getCommunityMembers);

// Mount events router for community events
router.use('/:communityId/events', require('./events'));

module.exports = router;
