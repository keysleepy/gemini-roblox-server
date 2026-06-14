const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 3000;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

const playerHistories = {};

app.post("/ask", async (req, res) => {
    try {
        const { message, playerId } = req.body;

        if (!message) {
            return res.status(400).json({ error: "No message provided" });
        }

        if (!playerHistories[playerId]) {
            playerHistories[playerId] = [];
        }

        playerHistories[playerId].push({
            role: "user",
            content: message
        });

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are a fun NPC in a Roblox game. Keep replies short, friendly, and max 2 sentences."
                },
                ...playerHistories[playerId]
            ],
            max_tokens: 300
        });

        const reply = response.choices[0].message.content;

        playerHistories[playerId].push({
            role: "assistant",
            content: reply
        });

        res.json({ reply });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});