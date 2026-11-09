/**
 * Async Handler Wrapper
 * Eliminates repetitive try-catch blocks in route handlers / controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
