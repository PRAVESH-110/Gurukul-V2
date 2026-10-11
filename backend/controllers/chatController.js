const { getAssistantReply } = require('../services/chat.service');

const sendChatReply = async (req, res) => {
  try {
    const reply = await getAssistantReply(req.body.messages);
    return res.json({ reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'AI failed' });
  }
};

module.exports = { sendChatReply };
