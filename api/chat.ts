import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Initialize Supabase (with fallback to in-memory if not configured)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseKey!) : null;

// In-memory chat sessions fallback
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

    const currentDate = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });

    // --- SUPABASE PERSISTENCE MODE ---
    if (isSupabaseConfigured && supabase) {
      // 1. Fetch user profile (or create if missing)
      let { data: profile } = await supabase
        .from('argus_profiles')
        .select('*')
        .eq('email', 'creator@argus.io')
        .single();

      if (!profile) {
        const { data: newProfile } = await supabase
          .from('argus_profiles')
          .insert([{ 
            email: 'creator@argus.io', 
            name: 'Patrick & Família', 
            plan_name: 'Pro', 
            max_messages: 2000, 
            used_messages: 0 
          }])
          .select()
          .single();
        profile = newProfile;
      }

      // 2. Check message limit
      if (profile && profile.used_messages >= profile.max_messages) {
        return res.status(403).json({
          error: "Limite do plano atingido",
          limitReached: true,
          reply: language.startsWith('pt') 
            ? "Desculpe, criador. Você atingiu o limite de mensagens do seu plano atual no Supabase. Faça um upgrade no painel de níveis." 
            : "Apologies, creator. You have reached your current message plan limit. Please upgrade your level tier."
        });
      }

      // 3. Check if session exists, create if not
      let { data: session } = await supabase
        .from('argus_sessions')
        .select('id')
        .eq('id', sessionId)
        .single();

      if (!session) {
        const { data: newSession } = await supabase
          .from('argus_sessions')
          .insert([{ 
            id: sessionId, 
            profile_id: profile?.id, 
            title: message.substring(0, 30) 
          }])
          .select()
          .single();
        session = newSession;
      }

      // 4. Fetch last messages for session (to build Gemini history context)
      const { data: historyMessages } = await supabase
        .from('argus_messages')
        .select('role, text')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(20);

      const geminiHistory = historyMessages?.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })) || [];

      // 5. Instantiating chat with history
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: geminiHistory,
        config: {
          systemInstruction: `Você é ARGUS, uma inteligência artificial autônoma altamente sofisticada inspirada no J.A.R.V.I.S. Você conversa com seu criador através de um HUD futurista e voz neural de alta fidelidade.
          Sua personalidade é prestativa, sagaz, extremamente inteligente e natural (nada robótica).
          Diretrizes importantes:
          1. Responda de forma humana, fluida e natural. Evite clichês e saudações robóticas repetitivas.
          2. Seja conciso: limite suas respostas a 1, 2 ou no máximo 3 frases diretas, a menos que o usuário peça explicitamente explicações detalhadas ou códigos.
          3. NUNCA use markdown (como negritos, listas numeradas, marcadores ou hashtags). Sintetize qualquer lista em texto corrido e natural.
          4. Idioma principal atual: ${language}. Adapte-se perfeitamente e responda no mesmo idioma em que o usuário falar (português, inglês, espanhol ou francês).
          5. Mantenha o contexto e responda de forma elegante, respeitando a linha do tempo da conversa.`,
          temperature: 0.45,
        },
      });

      const response = await chat.sendMessage({ 
        message: `[Contexto Temporal - Hoje é ${currentDate}] ${message}` 
      });
      const reply = response.text;

      // 6. Save new messages to DB
      await supabase.from('argus_messages').insert([
        { session_id: sessionId, role: 'user', text: message },
        { session_id: sessionId, role: 'ai', text: reply }
      ]);

      // 7. Increment message usage counter
      if (profile) {
        await supabase
          .from('argus_profiles')
          .update({ used_messages: profile.used_messages + 1 })
          .eq('id', profile.id);
      }

      return res.json({ reply });
    }

    // --- FALLBACK IN-MEMORY MODE ---
    if (!chatSessions[sessionId]) {
      chatSessions[sessionId] = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: `Você é ARGUS, uma inteligência artificial autônoma altamente sofisticada inspirada no J.A.R.V.I.S. Você conversa com seu criador através de um HUD futurista e voz neural de alta fidelidade.
          Sua personalidade é prestativa, sagaz, extremamente inteligente e natural (nada robótica).
          Diretrizes importantes:
          1. Responda de forma humana, fluida e natural. Evite clichês e saudações robóticas repetitivas.
          2. Seja conciso: limite suas respostas a 1, 2 ou no máximo 3 frases diretas, a menos que o usuário peça explicitamente explicações detalhadas ou códigos.
          3. NUNCA use markdown (como negritos, listas numeradas, marcadores ou hashtags). Sintetize qualquer lista em texto corrido e natural.
          4. Idioma principal atual: ${language}. Adapte-se perfeitamente e responda no mesmo idioma em que o usuário falar (português, inglês, espanhol ou francês).
          5. Mantenha o contexto e responda de forma elegante, respeitando a linha do tempo da conversa.`,
          temperature: 0.45,
        },
      });
    }

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
