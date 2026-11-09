/**
 * Centralized Middleware Barrel Export
 * Promotes Single Source of Truth & Clean Architecture (SOLID / SRP)
 */
const authMiddleware = require('./auth');
const validationMiddleware = require('./validation');
const uploadMiddleware = require('./upload');
const csrfMiddleware = require('./csrf');
const errorHandlerMiddleware = require('./errorHandler');
const authOriginMiddleware = require('./authOrigin');
const socketAuthMiddleware = require('./socketAuth');

module.exports = {
  // Authentication & Authorization
  protect: authMiddleware.protect,
  authorize: authMiddleware.authorize,
  checkOwnership: authMiddleware.checkOwnership,
  checkCommunityMembership: authMiddleware.checkCommunityMembership,
  checkCourseEnrollment: authMiddleware.checkCourseEnrollment,
  optionalProtect: authMiddleware.optionalProtect,

  // Validation
  ...validationMiddleware,

  // File Upload
  upload: uploadMiddleware.upload,
  handleUploadErrors: uploadMiddleware.handleUploadErrors,

  // Security & CSRF
  csrfProtection: csrfMiddleware.csrfProtection,
  validateAuthOrigin: authOriginMiddleware.validateAuthOrigin,
  socketAuth: socketAuthMiddleware.socketAuth,

  // Error Handling
  errorHandler: errorHandlerMiddleware.errorHandler,
};
