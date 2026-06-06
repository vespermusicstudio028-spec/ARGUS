import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseKey!) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.body;

  if (isSupabaseConfigured && supabase && sessionId) {
    try {
      // Deleting messages triggers cascades or we delete them explicitly
      await supabase
        .from('argus_messages')
        .delete()
        .eq('session_id', sessionId);

      await supabase
        .from('argus_sessions')
        .delete()
        .eq('id', sessionId);
    } catch (e: any) {
      console.error("Supabase Reset Error:", e);
      return res.status(500).json({ error: e.message });
    }
  }

  res.json({ success: true });
}
