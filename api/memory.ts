import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseKey!) : null;

// Mock local memory facts
const mockMemories = [
  { id: '1', fact: 'O criador prefere respostas rápidas e diretas.' },
  { id: '2', fact: 'A plataforma ARGUS está sendo desenvolvida na versão 2.0 premium.' },
  { id: '3', fact: 'O banco de dados do sistema está configurado no Supabase.' },
  { id: '4', fact: 'A voz neural selecionada é o modelo Charon.' },
  { id: '5', fact: 'Detecção automática de idioma ativada para PT, EN, ES, FR.' }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Get creator profile id
      let { data: profile } = await supabase
        .from('argus_profiles')
        .select('id')
        .eq('email', 'creator@argus.io')
        .single();

      if (!profile) {
        const { data: newProfile } = await supabase
          .from('argus_profiles')
          .insert([{ email: 'creator@argus.io', name: 'Patrick & Família' }])
          .select('id')
          .single();
        profile = newProfile;
      }

      const profileId = profile?.id;

      // GET: Fetch memories
      if (req.method === 'GET') {
        const { data: memories, error } = await supabase
          .from('argus_memories')
          .select('id, fact')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return res.json(memories || []);
      }

      // POST: Add fact
      if (req.method === 'POST') {
        const { fact } = req.body;
        if (!fact) return res.status(400).json({ error: 'Fact is required' });

        const { data: newMemory, error } = await supabase
          .from('argus_memories')
          .insert([{ profile_id: profileId, fact }])
          .select('id, fact')
          .single();

        if (error) throw error;
        return res.json(newMemory);
      }

      // DELETE: Delete fact
      if (req.method === 'DELETE') {
        const { id, clearAll } = req.body;
        if (clearAll) {
          const { error } = await supabase
            .from('argus_memories')
            .delete()
            .eq('profile_id', profileId);
          if (error) throw error;
          return res.json({ success: true });
        }

        if (!id) return res.status(400).json({ error: 'ID is required to delete memory' });

        const { error } = await supabase
          .from('argus_memories')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return res.json({ success: true });
      }

    } catch (err: any) {
      console.error("Supabase Memory Route Error:", err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    // FALLBACK MOCK MODE
    if (req.method === 'GET') {
      return res.json(mockMemories);
    }
    if (req.method === 'POST') {
      const { fact } = req.body;
      const newMemory = { id: Math.random().toString(), fact };
      return res.json(newMemory);
    }
    if (req.method === 'DELETE') {
      return res.json({ success: true });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
