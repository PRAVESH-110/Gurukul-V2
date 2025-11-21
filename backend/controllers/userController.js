const User = require('../models/User');
const Community = require('../models/Community');

// @desc    Get current user's communities
// @route   GET /api/users/me/communities
// @access  Private
exports.getMyCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find({
      'members.user': req.user.id,
      isActive: true
    })
    .select('name description banner membersCount isPrivate')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: communities.length,
      data: communities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's created communities
// @route   GET /api/users/me/created-communities
// @access  Private
exports.getMyCreatedCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find({
      'creator': req.user.id,
      isActive: true
    })
    .select('name description banner membersCount isPrivate')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: communities.length,
      data: communities
    });
  } catch (error) {
    next(error);
  }
};

// //for admin
exports.getMyAdminCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find({
      'admin': req.user.id,
      isActive: true
    })
    .select('name description banner membersCount isPrivate')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: communities.length,
      data: communities
    });
  } catch (error) {
    next(error);
  }
};
