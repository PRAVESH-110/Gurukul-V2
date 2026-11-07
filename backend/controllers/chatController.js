const { getAssistantReply } = require('../services/chat.service');

const sendChatReply = async (req, res) => {
  try {
    const messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
      return res
        .status(400)
        .json({ success: false, message: 'Provide between 1 and 20 messages.' });
    }

    const safeMessages = messages.map((message) => {
      if (
        !message ||
        !['user', 'assistant'].includes(message.role) ||
        typeof message.content !== 'string'
      ) {
        throw new Error('Invalid chat message');
      }
      const content = message.content.trim();
      if (!content || content.length > 2000) throw new Error('Chat message is empty or too long');
      return { role: message.role, content };
    });

    const reply = await getAssistantReply(safeMessages);
    return res.json({ reply });
  } catch (error) {
    if (
      error.message === 'Invalid chat message' ||
      error.message === 'Chat message is empty or too long'
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: 'AI failed' });
  }
};

module.exports = { sendChatReply };
