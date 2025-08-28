import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());

// Init Google AI SDK
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// ================== ZERO SHOT PROMPTING ==================
app.post("/zero-shot", async (req, res) => {
  try {
    const { userIdea } = req.body;

    if (!userIdea) {
      return res.status(400).json({ error: "Please provide userIdea" });
    }

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Zero-shot = no examples, just an instruction
    const prompt = `Validate this startup idea in detail. 
    Cover feasibility, potential competitors, and a basic execution roadmap.
    Startup Idea: ${userIdea}`;

    // Call Gemini API
    const result = await model.generateContent(prompt);

    // Return response
    res.json({
      idea: userIdea,
      zero_shot_response: result.response.text(),
    });

  } catch (err) {
    console.error("Error in Zero Shot:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Innopilot running on port ${PORT}`));
