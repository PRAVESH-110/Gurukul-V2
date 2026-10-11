const getAllowedOrigins = () => [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL2
].filter(Boolean);

const createCorsOptions = (allowedOrigins) => ({
  origin(origin, callback) {
    if (process.env.NODE_ENV === 'development' || !origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy does not allow access from ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-XSRF-TOKEN',
    'Access-Control-Allow-Headers', 'Origin', 'Cache-Control', 'Pragma', 'Expires', 'X-Auth-Token'
  ],
  exposedHeaders: [
    'Content-Range', 'X-Content-Range', 'X-Total-Count', 'Set-Cookie', 'X-XSRF-TOKEN', 'X-Auth-Token'
  ],
  maxAge: 3600,
  preflightContinue: false,
  optionsSuccessStatus: 204
});

module.exports = { getAllowedOrigins, createCorsOptions };
