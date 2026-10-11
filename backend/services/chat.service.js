const { ChatOpenAI } = require('@langchain/openai');

const createChatClient = () => new ChatOpenAI({
  model: 'gemini-2.5-flash',
  temperature: 0.2,
  apiKey: process.env.GEMINI_API_KEY,
  configuration: { baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/' }
});

const getAssistantReply = async (messages) => {
  const systemPrompt = {
    role: 'system',
    content: `You are Gurukul's onboarding assistant.Help new users understand:- What Gurukul is
            - How creators can start
            - Platform features
            Keep answers short and beginner-friendly.`
  };
  const response = await createChatClient().invoke([systemPrompt, ...messages]);
  return response.content;
};

module.exports = { getAssistantReply };
