/**
 * Centralized Utilities Barrel Export
 * Single source of truth for backend helper functions
 */
const { uploadToImageKit, deleteFromImageKit } = require('./imagekit');
const sendEmail = require('./sendEmail');
const { sendSuccess, sendError } = require('./apiResponse');
const asyncHandler = require('./asyncHandler');

module.exports = {
  // Image & File CDN
  uploadToImageKit,
  deleteFromImageKit,

  // Mailer
  sendEmail,

  // HTTP Helpers
  sendSuccess,
  sendError,
  asyncHandler,
};
