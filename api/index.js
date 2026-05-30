const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // 🛡️ HTTP Header security
const rateLimit = require('express-rate-limit'); // 🛡️ DDoS protection
const { Groq } = require('groq-sdk');
require('dotenv').config();

const app = express();

// ==========================================
// 🚨 LAYER 1: INFRASTRUCTURE SECURITY
// ==========================================

// 1. Strip identifiable headers and secure HTTP connections
app.use(helmet()); 
app.use(cors());

// 2. Strict Payload Limits (Prevents buffer overflow / memory exhaustion attacks)
// Nobody needs to send more than 10kb of text for an SOS or chat message.
app.use(express.json({ limit: '10kb' })); 

// ==========================================
// 🚨 LAYER 2: TRAFFIC CONTROL (RATE LIMITING)
// ==========================================

// SOS Endpoint Limiter: Max 3 emergency pings per 15 minutes per IP
const sosLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 3, 
  message: { error: "SYS_ERR: Rate limit triggered. Too many dispatch requests from this origin." },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI Chat Limiter: Max 12 messages per minute per IP to protect Groq quota
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 12, 
  message: { text: "SYS_ERR: AI overload. Please wait 60 seconds before sending more triage data." }
});

// ==========================================
// ⚙️ CORE APPLICATION LOGIC
// ==========================================

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
console.log(`Checking Groq Key: ${process.env.GROQ_API_KEY ? 'FOUND ✅' : 'MISSING ❌'}`);

// Bind SOS router with strict rate limiting attached
const sosRouter = require('./sos');
app.use('/api/sos', sosLimiter, sosRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Bind AI Chat with its own specific rate limit
app.post('/api/chat', chatLimiter, async (req, res) => {
  const { message, language } = req.body;

  // Basic Input Sanitization
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: "Invalid or missing payload" });
  }

  try {
    const systemPrompt = `You are a zero-fluff emergency medical response AI. 
The user is facing a critical situation. 
Output exactly 3 physical, actionable bullet points for trauma stabilization. 
Do not write an introduction. Do not write a conclusion. 
CRITICAL: You must write your entire response completely in ${language === 'hi' ? 'Hindi using Devanagari script' : 'English'}.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message.substring(0, 500) } // Hard-cap input to 500 chars
      ],
      model: 'llama-3.1-8b-instant',
    });

    const reply = chatCompletion.choices[0]?.message?.content || "No stabilization guidelines generated.";
    res.json({ text: reply });

  } catch (error) {
    console.error("💥 Groq API Error:", error);
    res.status(500).json({ error: "Failed to fetch AI stabilization response" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SECURE SERVER BLASTING OFF ON PORT ${PORT}`);
});