const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'access') return next(new Error('Unauthorized'));
    const user = await User.findById(decoded.id).select('_id isActive passwordChangedAt');

    if (!user || !user.isActive) return next(new Error('Unauthorized'));
    if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
      return next(new Error('Session expired'));
    }

    socket.data.userId = user._id.toString();
    return next();
  } catch (error) {
    return next(new Error('Unauthorized'));
  }
};

module.exports = { authenticateSocket };
