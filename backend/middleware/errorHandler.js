/**
 * Error handling middleware with detailed error responses
 */
const errorHandler = (err, req, res, next) => {
  // Default error object
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    errorCode: err.errorCode || 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      originalError: {
        name: err.name,
        code: err.code,
        keyValue: err.keyValue
      }
    })
  };

  // Log the error with request details
  console.error(`\n[${new Date().toISOString()}] Error in ${req.method} ${req.originalUrl}:`);
  console.error(`- Message: ${error.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(`- Stack: ${err.stack}`);
  }

  // Handle specific error types
  switch (err.name) {
    case 'CastError':
      error.statusCode = 404;
      error.message = `Resource not found: ${err.path}: ${err.value}`;
      error.errorCode = 'RESOURCE_NOT_FOUND';
      break;

    case 'ValidationError':
      error.statusCode = 400;
      error.message = Object.values(err.errors).map(val => val.message).join('; ');
      error.errorCode = 'VALIDATION_ERROR';
      error.details = Object.values(err.errors).map(val => ({
        field: val.path,
        message: val.message,
        value: val.value
      }));
      break;

    case 'JsonWebTokenError':
      error.statusCode = 401;
      error.message = 'Invalid or malformed token';
      error.errorCode = 'INVALID_TOKEN';
      break;

    case 'TokenExpiredError':
      error.statusCode = 401;
      error.message = 'Your session has expired. Please log in again.';
      error.errorCode = 'TOKEN_EXPIRED';
      break;

    case 'MongoError':
      // Handle duplicate key errors
      if (err.code === 11000) {
        error.statusCode = 409;
        error.message = 'Duplicate field value entered';
        error.errorCode = 'DUPLICATE_KEY';
        error.details = {
          field: Object.keys(err.keyPattern || {}).join(', '),
          value: Object.values(err.keyValue || {})[0]
        };
      }
      break;
  }

  // Handle CORS errors
  if (err.message && err.message.includes('CORS')) {
    error.statusCode = 403;
    error.errorCode = 'CORS_ERROR';
    error.message = 'Not allowed by CORS policy';
    if (process.env.NODE_ENV === 'development') {
      error.originalMessage = err.message;
      error.allowedOrigins = process.env.CLIENT_URL;
    }
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: {
      code: error.errorCode,
      message: error.message,
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        originalError: error.originalError
      })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
};

module.exports = errorHandler;
