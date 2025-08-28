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

    if (!userIdea) return res.status(400).json({ error: "Please provide userIdea" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Validate this startup idea in detail. 
    Cover feasibility, potential competitors, and a basic execution roadmap.
    Startup Idea: ${userIdea}`;

    const result = await model.generateContent(prompt);

    res.json({ idea: userIdea, zero_shot_response: result.response.text() });
  } catch (err) {
    console.error("Error in Zero Shot:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================== ONE SHOT PROMPTING ==================
app.post("/one-shot", async (req, res) => {
  try {
    const { userIdea } = req.body;

    if (!userIdea) return res.status(400).json({ error: "Please provide userIdea" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
Example:
Input: "AI-powered fitness tracker for pets"
Output:
Validation: Feasible, growing demand in pet tech
Competitors: FitBark, Whistle
Roadmap: Build MVP collar device → Launch beta → Partner with vets

Now analyze the following startup idea in the same format:
Input: "${userIdea}"
Output:
    `;

    const result = await model.generateContent(prompt);

    res.json({ idea: userIdea, one_shot_response: result.response.text() });
  } catch (err) {
    console.error("Error in One Shot:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================== MULTI SHOT PROMPTING ==================
app.post("/multi-shot", async (req, res) => {
  try {
    const { userIdea } = req.body;

    if (!userIdea) return res.status(400).json({ error: "Please provide userIdea" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
Example 1:
Input: "AI-powered fitness tracker for pets"
Output:
Validation: Feasible, growing demand in pet tech
Competitors: FitBark, Whistle
Roadmap: Build MVP collar device → Launch beta → Partner with vets

Example 2:
Input: "Blockchain-based land registry system"
Output:
Validation: Strong potential in transparency & fraud prevention
Competitors: Bitland, Ubitquity
Roadmap: Build pilot with local govt → Test with small community → Scale nationwide

Example 3:
Input: "Virtual reality museum tours"
Output:
Validation: Feasible with increasing VR adoption
Competitors: The Louvre VR, Google Arts & Culture
Roadmap: Partner with museums → Build VR content → Launch paid global access

Now analyze the following startup idea in the same format:
Input: "${userIdea}"
Output:
    `;

    const result = await model.generateContent(prompt);

    res.json({ idea: userIdea, multi_shot_response: result.response.text() });
  } catch (err) {
    console.error("Error in Multi Shot:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================== CHAIN OF THOUGHT PROMPTING ==================
app.post("/cot-prompt", async (req, res) => {
  try {
    const { userIdea } = req.body;

    if (!userIdea) return res.status(400).json({ error: "Please provide userIdea" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
You are a startup mentor.  
Analyze this idea step by step (reasoning), then provide the final summary.

Startup Idea: "${userIdea}"

Format:
Reasoning: [Detailed thought process step by step]
Final Answer: [Validation, Competitors, Roadmap]
    `;

    const result = await model.generateContent(prompt);

    res.json({ idea: userIdea, cot_response: result.response.text() });
  } catch (err) {
    console.error("Error in COT Prompting:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================== DYNAMIC PROMPTING ==================
app.post("/dynamic-prompt", async (req, res) => {
  try {
    const { userIdea, category, detailLevel } = req.body;

    if (!userIdea) return res.status(400).json({ error: "Please provide userIdea" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = `Analyze this startup idea: "${userIdea}".`;
    if (category) prompt += `\nCategory: ${category}.`;
    if (detailLevel === "detailed") {
      prompt += `\nGive a very detailed validation, competitor analysis, and step-by-step roadmap.`;
    } else {
      prompt += `\nGive a short summary validation and roadmap.`;
    }

    const result = await model.generateContent(prompt);

    res.json({
      idea: userIdea,
      category: category || "Not provided",
      detailLevel: detailLevel || "summary",
      dynamic_prompt_response: result.response.text(),
    });
  } catch (err) {
    console.error("Error in Dynamic Prompt:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================== SYSTEM & USER PROMPT ==================
app.post("/system-user-prompt", async (req, res) => {
  try {
    const { userIdea } = req.body;

    if (!userIdea) return res.status(400).json({ error: "Please provide userIdea" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
You are InnoPilot – an AI startup mentor.
Always provide structured, clear, and professional guidance.
Use the RTFC framework (Role, Task, Format, Context).
- Role: Mentor for startup founders
- Task: Validate startup ideas
- Format: Validation, Competitors, Roadmap
- Context: Help student/entrepreneur understand feasibility
    `;

    const userPrompt = `Validate the following startup idea:
Startup Idea: ${userIdea}`;

    // Gemini SDK format
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] }
      ]
    });

    res.json({
      idea: userIdea,
      system_user_prompt_response: result.response.text(),
    });
  } catch (err) {
    console.error("Error in System & User Prompt:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Innopilot running on port ${PORT}`));
