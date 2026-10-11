const crypto = require('crypto');
const { REFRESH_COOKIE, CSRF_COOKIE, createCsrfToken } = require('../services/authToken.service');

const safeEqual = (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const hasValidCsrf = (req) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get('X-XSRF-TOKEN');
  if (!refreshToken || !cookieToken || !headerToken || !safeEqual(cookieToken, headerToken)) return false;

  const [nonce] = cookieToken.split('.');
  if (!nonce) return false;
  const expected = createCsrfToken(refreshToken, nonce);
  return safeEqual(cookieToken, expected);
};

const requireCsrf = (req, res, next) => {
  if (!hasValidCsrf(req)) {
    return res.status(403).json({
      success: false,
      error: 'CSRF_VALIDATION_FAILED',
      message: 'The security token is missing or invalid. Refresh the page and try again.'
    });
  }
  return next();
};

module.exports = { hasValidCsrf, requireCsrf };
