const express = require('express');
const rateLimit = require('express-rate-limit');
const { sendChatReply } = require('../controllers/chatController');

const router = express.Router();
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many assistant requests. Please try again later.' },
});

router.post('/', chatLimiter, sendChatReply);

module.exports = router;
