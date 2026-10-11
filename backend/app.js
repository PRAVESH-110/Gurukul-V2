require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { getAllowedOrigins, createCorsOptions } = require('./config/cors');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const allowedOrigins = getAllowedOrigins();
const corsOptions = createCorsOptions(allowedOrigins);

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: JSON.stringify({
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  })
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/') && !req.path.startsWith('/api/auth')) {
    return apiLimiter(req, res, next);
  }
  return next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: JSON.stringify({
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  })
});
app.use('/api/auth', authLimiter);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Keep the legacy CORS headers while clients migrate to the configured CORS middleware.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (process.env.NODE_ENV === 'development' || (origin && allowedOrigins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-XSRF-TOKEN');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  return next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const [key, ...valueParts] = cookie.split('=');
      if (key) req.cookies[key.trim()] = decodeURIComponent(valueParts.join('=') || '');
    });
  }
  return next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api', apiRoutes);

app.get('/health', (req, res) => res.status(200).json({ ok: true }));
app.get('/api/health', (req, res) => res.status(200).json({
  success: true,
  message: 'Server is running',
  timestamp: new Date().toISOString()
}));

app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

module.exports = { app, allowedOrigins };
