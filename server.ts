import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// We'll keep the chat sessions in memory for simplicity
// In a production app, use a database and tie it to a reliable session ID
const chatSessions: Record<string, any> = {};

app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId = "default", language = "pt-BR" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!chatSessions[sessionId]) {
      chatSessions[sessionId] = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: `You are ARGUS, a sophisticated autonomous AI inspired by J.A.R.V.I.S. You are communicating via high-fidelity voice synthesis. Keep all responses brief (maximum 2-3 sentences). Current primary language: ${language}. Adapt your language perfectly to the user's input (Portuguese, English, Spanish, or French). Maintain a professional, witty, and helpful 'Digital Butler' persona. Do not use markdown like lists or bolding. Focus on efficiency and elegance. Always remember the context of the conversation. You are aware of the exact current date and time which is provided in the header of each message.`,
          temperature: 0.3,
        },
      });
    }

    const currentDate = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });

    const chat = chatSessions[sessionId];
    const response = await chat.sendMessage({ 
      message: `[Contexto Temporal - Hoje é ${currentDate}] ${message}` 
    });
    
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat/reset", (req, res) => {
  const { sessionId = "default" } = req.body;
  delete chatSessions[sessionId];
  res.json({ success: true });
});

async function startServer() {
  if (!process.env.VERCEL) {
    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
