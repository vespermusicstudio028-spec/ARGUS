import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
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

// Initialize Supabase (with fallback if not configured)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseKey!) : null;

if (isSupabaseConfigured) {
  console.log("Supabase configured successfully for local development.");
} else {
  console.warn("Supabase not configured. Running local mock/in-memory fallback mode.");
}

// In-memory chat sessions fallback
const chatSessions: Record<string, any> = {};

// Mock memory data fallback
const mockMemories = [
  { id: '1', fact: 'O criador prefere respostas rápidas e diretas.' },
  { id: '2', fact: 'A plataforma ARGUS está sendo desenvolvida na versão 2.0 premium.' },
  { id: '3', fact: 'O banco de dados do sistema está configurado no Supabase.' },
  { id: '4', fact: 'A voz neural selecionada é o modelo Charon.' },
  { id: '5', fact: 'Detecção automática de idioma ativada para PT, EN, ES, FR.' }
];

// Mock profile data fallback
const mockProfile = {
  name: 'Patrick & Família',
  email: 'creator@argus.io',
  avatar_url: '/argus-logo.png',
  plan_name: 'Pro',
  max_messages: 2000,
  used_messages: 482,
  price: 'R$ 49,90/mês'
};

// ----------------------------------------------------
// CHAT ENDPOINT
// ----------------------------------------------------
app.post("/api/chat", async (req, res) => {
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

    let reply = '';
    let success = false;

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Fetch user profile
        let { data: profile, error: profileErr } = await supabase
          .from('argus_profiles')
          .select('*')
          .eq('email', 'creator@argus.io')
          .single();

        if (profileErr && profileErr.code !== 'PGRST116') {
          throw profileErr;
        }

        if (!profile) {
          const { data: newProfile, error: createErr } = await supabase
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
          if (createErr) throw createErr;
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

        // 3. Create session if missing
        let { data: session, error: sessionErr } = await supabase
          .from('argus_sessions')
          .select('id')
          .eq('id', sessionId)
          .single();

        if (sessionErr && sessionErr.code !== 'PGRST116') {
          throw sessionErr;
        }

        if (!session) {
          const { data: newSession, error: createSessionErr } = await supabase
            .from('argus_sessions')
            .insert([{ 
              id: sessionId, 
              profile_id: profile?.id, 
              title: message.substring(0, 30) 
            }])
            .select()
            .single();
          if (createSessionErr) throw createSessionErr;
          session = newSession;
        }

        // 4. Fetch last messages for Gemini history
        const { data: historyMessages, error: historyErr } = await supabase
          .from('argus_messages')
          .select('role, text')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
          .limit(20);

        if (historyErr) throw historyErr;

        const geminiHistory = historyMessages?.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })) || [];

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
        reply = response.text;

        // 5. Save messages
        const { error: insertErr } = await supabase.from('argus_messages').insert([
          { session_id: sessionId, role: 'user', text: message },
          { session_id: sessionId, role: 'ai', text: reply }
        ]);
        if (insertErr) throw insertErr;

        // 6. Increment counter
        if (profile) {
          await supabase
            .from('argus_profiles')
            .update({ used_messages: profile.used_messages + 1 })
            .eq('id', profile.id);
        }

        success = true;
      } catch (dbError) {
        console.error("Supabase operation failed, falling back to in-memory mode:", dbError);
      }
    }

    // Fallback: In-memory
    if (!success) {
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
      reply = response.text;
    }

    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// RESET ENDPOINT
// ----------------------------------------------------
app.post("/api/chat/reset", async (req, res) => {
  const { sessionId = "default" } = req.body;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('argus_messages').delete().eq('session_id', sessionId);
      await supabase.from('argus_sessions').delete().eq('id', sessionId);
    } catch (e: any) {
      console.error("Supabase reset error:", e);
    }
  }

  delete chatSessions[sessionId];
  res.json({ success: true });
});

// ----------------------------------------------------
// PROFILE ENDPOINTS
// ----------------------------------------------------
app.get("/api/profile", async (req, res) => {
  if (isSupabaseConfigured && supabase) {
    try {
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
      return res.json(profile || mockProfile);
    } catch (e) {
      return res.json(mockProfile);
    }
  }
  res.json(mockProfile);
});

app.post("/api/profile", async (req, res) => {
  const { planName, maxMessages } = req.body;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: updatedProfile, error } = await supabase
        .from('argus_profiles')
        .update({ 
          plan_name: planName, 
          max_messages: maxMessages,
          used_messages: 0 // Reset on upgrade for sandbox testing
        })
        .eq('email', 'creator@argus.io')
        .select()
        .single();
      if (error) throw error;
      return res.json(updatedProfile);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
  res.json({ ...mockProfile, plan_name: planName, max_messages: maxMessages });
});

// ----------------------------------------------------
// MEMORY ENDPOINTS
// ----------------------------------------------------
app.get("/api/memory", async (req, res) => {
  if (isSupabaseConfigured && supabase) {
    try {
      let { data: profile } = await supabase
        .from('argus_profiles')
        .select('id')
        .eq('email', 'creator@argus.io')
        .single();

      const { data: memories } = await supabase
        .from('argus_memories')
        .select('id, fact')
        .eq('profile_id', profile?.id)
        .order('created_at', { ascending: false });

      return res.json(memories || []);
    } catch (e) {
      return res.json(mockMemories);
    }
  }
  res.json(mockMemories);
});

app.post("/api/memory", async (req, res) => {
  const { fact } = req.body;
  if (!fact) return res.status(400).json({ error: 'Fact is required' });

  if (isSupabaseConfigured && supabase) {
    try {
      let { data: profile } = await supabase
        .from('argus_profiles')
        .select('id')
        .eq('email', 'creator@argus.io')
        .single();

      const { data: newMemory, error } = await supabase
        .from('argus_memories')
        .insert([{ profile_id: profile?.id, fact }])
        .select('id, fact')
        .single();

      if (error) throw error;
      return res.json(newMemory);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
  res.json({ id: Math.random().toString(), fact });
});

app.delete("/api/memory", async (req, res) => {
  const { id, clearAll } = req.body;

  if (isSupabaseConfigured && supabase) {
    try {
      if (clearAll) {
        let { data: profile } = await supabase
          .from('argus_profiles')
          .select('id')
          .eq('email', 'creator@argus.io')
          .single();

        const { error } = await supabase
          .from('argus_memories')
          .delete()
          .eq('profile_id', profile?.id);
        if (error) throw error;
        return res.json({ success: true });
      }

      if (!id) return res.status(400).json({ error: 'ID is required' });

      const { error } = await supabase
        .from('argus_memories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
  res.json({ success: true });
});

// ----------------------------------------------------
// TTS VOICE GENERATION
// ----------------------------------------------------
app.post("/api/speak", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Charon"
            }
          }
        }
      }
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find((p: any) => p.inlineData);

    if (!audioPart || !audioPart.inlineData) {
      return res.status(500).json({ error: "No audio generated" });
    }

    res.json({
      audio: audioPart.inlineData.data,
      mimeType: audioPart.inlineData.mimeType || "audio/L16;rate=24000"
    });
  } catch (error: any) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// ADMIN STATS ENDPOINT
// ----------------------------------------------------
app.get("/api/admin/stats", async (req, res) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { count: profilesCount } = await supabase
        .from('argus_profiles')
        .select('*', { count: 'exact', head: true });

      const { count: sessionsCount } = await supabase
        .from('argus_sessions')
        .select('*', { count: 'exact', head: true });

      const { count: messagesCount } = await supabase
        .from('argus_messages')
        .select('*', { count: 'exact', head: true });

      const { count: memoriesCount } = await supabase
        .from('argus_memories')
        .select('*', { count: 'exact', head: true });

      return res.json({
        configured: true,
        profiles: profilesCount || 0,
        sessions: sessionsCount || 0,
        messages: messagesCount || 0,
        memories: memoriesCount || 0
      });
    } catch (e: any) {
      return res.json({ 
        configured: true, 
        error: e.message, 
        profiles: 0, 
        sessions: 0, 
        messages: 0, 
        memories: 0 
      });
    }
  }

  return res.json({ 
    configured: false, 
    profiles: 1, 
    sessions: 3, 
    messages: 48, 
    memories: 5 
  });
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
