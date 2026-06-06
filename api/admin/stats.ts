import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseKey!) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
