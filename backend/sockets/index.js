const { Server } = require('socket.io');
const { authenticateSocket } = require('../middleware/socketAuth');

const attachSocketServer = (server, allowedOrigins) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log('User connected to WebSocket:', socket.id);
    const { userId } = socket.data;
    socket.join('authenticated');
    socket.join(userId);
    console.log(`Authenticated user ${userId} connected to notifications.`);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = { attachSocketServer };
