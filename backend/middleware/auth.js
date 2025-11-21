const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiting for authentication endpoints
const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // per 60 seconds per IP
});

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers, cookies, or query params
    if (
      req.headers.authorization && 
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Get token from cookie
      token = req.cookies.token;
    } else if (req.query && req.query.token) {
      // Get token from query parameter (for email verification, etc.)
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_REQUIRED',
        message: 'Authentication required. Please log in.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is blacklisted (for logout functionality)
      // This requires a TokenBlacklist model or Redis cache
      
      // Get user from token
      const user = await User.findById(decoded.id)
        .select('-password -__v -resetPasswordToken -resetPasswordExpire');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'The user belonging to this token no longer exists.'
        });
      }

      // Check if user account is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: 'ACCOUNT_DEACTIVATED',
          message: 'Your account has been deactivated. Please contact support.'
        });
      }

      // Check if user needs to change password
      if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
        return res.status(401).json({
          success: false,
          error: 'PASSWORD_CHANGED',
          message: 'Your password was recently changed. Please log in again.'
        });
      }

      // Add user to request object
      req.user = user;
      res.locals.user = user;
      
      // Continue to next middleware/route handler
      next();
    } catch (error) {
      let errorMessage = 'Invalid or expired token';
      let statusCode = 401;
      let errorCode = 'INVALID_TOKEN';

      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Your session has expired. Please log in again.';
        errorCode = 'TOKEN_EXPIRED';
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid authentication token';
        errorCode = 'INVALID_TOKEN';
      } else if (error.name === 'NotBeforeError') {
        errorMessage = 'Token not yet valid';
        errorCode = 'TOKEN_NOT_VALID_YET';
      }

      return res.status(statusCode).json({
        success: false,
        error: errorCode,
        message: errorMessage
      });
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is creator or admin of resource
const checkOwnership = (Model, resourceParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params[resourceParam]);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user is the creator/owner
      if (resource.creator && resource.creator.toString() !== req.user._id.toString() || req.user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Check community membership
const checkCommunityMembership = async (req, res, next) => {
  try {
    const Community = require('../models/Community');
    const communityId = req.params.communityId || req.params.id;
    
    const community = await Community.findById(communityId);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is a member or creator
    const isMember = community.members.includes(req.user._id);
    const isCreator = community.creator.toString() === req.user._id.toString();
    const isAdmin=  req.user.role === 'admin';
    
    if (!isMember && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to access this community'
      });
    }

    req.community = community;
    next();
  } catch (error) {
    next(error);
  }
};

// Check course enrollment
const checkCourseEnrollment = async (req, res, next) => {
  try {
    const Course = require('../models/Course');
    const courseId = req.params.courseId || req.params.id;
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled or is the creator
    const isEnrolled = course.isEnrolled(req.user._id);
    const isCreator = course.creator.toString() === req.user._id.toString();
    const isAdmin=  req.user.role === 'admin';    
    if (!isEnrolled && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to access this course'
      });
    }

    req.course = course;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  authorize,
  checkOwnership,
  checkCommunityMembership,
  checkCourseEnrollment
};
