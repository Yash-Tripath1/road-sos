const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

// Initialize Groq Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key' });

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing user message" });
    }

    // Call Groq Llama 3.1 for ultra-low latency responses
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a highly efficient, zero-fluff emergency first-aid AI. Provide immediate, step-by-step physical instructions (max 3 bullet points) to help stabilize the victim for the medical emergency described. Do not waste time with medical disclaimers; time is of the essence."
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.1-8b-instant", 
      temperature: 0.2,
    });

    res.status(200).json({
      status: "success",
      reply: chatCompletion.choices[0]?.message?.content || "No response generated."
    });

  } catch (error) {
    console.error("💥 Groq AI Error:", error);
    res.status(500).json({ error: "First-Aid AI failed to respond", details: error.message });
  }
});

module.exports = router;