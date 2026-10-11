require('dotenv').config();

const http = require('http');
const { app, allowedOrigins } = require('./app');
const { connectDB } = require('./config/database');
const { attachSocketServer } = require('./sockets');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const server = http.createServer(app);
    const io = attachSocketServer(server, allowedOrigins);
    // Routes can access Socket.IO through req.app.get('io').
    app.set('io', io);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log('Allowed origins:', allowedOrigins);
    });
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

if (require.main === module) startServer();

module.exports = { startServer };
