import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// In-memory chat sessions (note: these reset on cold starts in serverless)
const chatSessions: Record<string, any> = {};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
