const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database')
require('dotenv').config();

const app = express();

// Trust first proxy (important if behind a reverse proxy like nginx)
// This helps with rate limiting behind proxies
app.set('trust proxy', 1);

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const communityRoutes = require('./routes/communities');
const userCommunityRoutes = require('./routes/userCommunities');
const postRoutes = require('./routes/posts');
const courseRoutes = require('./routes/courses');
const userCourseRoutes = require('./routes/userCourses');
const videoRoutes = require('./routes/videos');
const eventRoutes = require('./routes/events');
const dashboardRoutes = require('./routes/dashboard');
const uploadRoutes = require('./routes/upload');
const searchRoutes = require('./routes/search');
const chatRoutes = require('./routes/chat');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - temporarily disabled for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: JSON.stringify({
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  })
});

// Apply rate limiting to all routes except auth
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') && !req.path.startsWith('/api/auth')) {
    return limiter(req, res, next);
  }
  next();
});

// More permissive rate limiting for auth routes during development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased limit for development
  message: JSON.stringify({
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  })
});
app.use('/api/auth', authLimiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL2
].filter(Boolean);

// Create CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In production, only allow specified origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const msg = `CORS policy does not allow access from ${origin}`;
    console.error(msg);
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'X-XSRF-TOKEN',
    'X-Requested-With',
    'Access-Control-Allow-Headers',
    'Origin',
    'Cache-Control',
    'Pragma',
    'Expires',
    'X-Auth-Token'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Total-Count',
    'Set-Cookie',
    'X-XSRF-TOKEN',
    'X-Auth-Token'
  ],
  maxAge: 3600, // 1 hour
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware first
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Add CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (process.env.NODE_ENV === 'development' || (origin && allowedOrigins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-XSRF-TOKEN');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the uploads directory
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// // Database connection
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected successfully'))
//   .catch(err => console.error('MongoDB connection error:', err));

// Mount routes - order matters!
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes); // Mount courses BEFORE posts to avoid conflicts
app.use('/api/courses', userCourseRoutes); // User-specific course routes
app.use('/api/videos', videoRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/communities', userCommunityRoutes); // User-specific community routes
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes); // Upload routes with CORS
app.use('/api/search', searchRoutes);
app.use('/api/posts', postRoutes); // Mount posts routes for /posts/:id
app.use('/api', postRoutes); // Mount for community posts routes (/communities/:communityId/posts) - LAST to avoid conflicts
app.use('/api/communities/:communityId/events', require('./routes/events'));

//for ai agent 
app.use("/api/chat", chatRoutes);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    console.log("connected to mongodb");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log('Allowed origins:', allowedOrigins);
    });
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
})();

