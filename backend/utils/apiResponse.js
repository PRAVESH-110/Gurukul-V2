/**
 * Standard API Response Formatter
 * Promotes Single Responsibility Principle (SRP) for HTTP response shaping
 */

const sendSuccess = (
  res,
  {
    statusCode = 200,
    message = 'Success',
    data = null,
    count = undefined,
    pagination = undefined,
  } = {},
) => {
  const response = {
    success: true,
    message,
  };

  if (count !== undefined) response.count = count;
  if (pagination !== undefined) response.pagination = pagination;
  if (data !== null) {
    if (typeof data === 'object' && !Array.isArray(data)) {
      Object.assign(response, data);
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
};

const sendError = (
  res,
  { statusCode = 500, message = 'An error occurred', error = null, errors = undefined } = {},
) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== undefined) response.errors = errors;
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error.message || error;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
