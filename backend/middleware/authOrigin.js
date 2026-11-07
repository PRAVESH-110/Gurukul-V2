const { getAllowedOrigins } = require('../config/cors');

const verifyAuthOrigin = (req, res, next) => {
  const origin = req.get('Origin');
  if (!origin) return next();
  if (getAllowedOrigins().includes(origin)) return next();

  return res.status(403).json({
    success: false,
    error: 'ORIGIN_NOT_ALLOWED',
    message: 'This authentication request came from an untrusted origin.',
  });
};

module.exports = { verifyAuthOrigin };
