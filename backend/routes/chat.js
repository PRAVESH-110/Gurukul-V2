const express = require("express");
const { ChatOpenAI } = require("@langchain/openai");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { messages } = req.body;

        const llm = new ChatOpenAI({
            model: "gpt-4o-mini",
            temperature: 0.2,
            apiKey: process.env.OPENAI_API_KEY,
        });

        const systemPrompt = {
            role: "system",
            content: `You are Gurukul's onboarding assistant.Help new users understand:- What Gurukul is
            - How creators can start
            - Platform features
            Keep answers short and beginner-friendly.`
        };

        const response = await llm.invoke([
            systemPrompt,
            ...messages
        ]);

        res.json({ reply: response.content });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI failed" });
    }
});

module.exports = router;