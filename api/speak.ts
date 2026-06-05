import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, language = 'pt-BR' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Use Gemini's neural TTS - Charon is a deep, calm, professional male voice
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Charon'
            }
          }
        }
      }
    });

    // Extract audio data from response
    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find((p: any) => p.inlineData);

    if (!audioPart || !audioPart.inlineData) {
      return res.status(500).json({ error: 'No audio generated' });
    }

    // Return base64 audio data
    res.json({
      audio: audioPart.inlineData.data,
      mimeType: audioPart.inlineData.mimeType || 'audio/L16;rate=24000'
    });

  } catch (error: any) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: error.message });
  }
}
