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
      // Archive session instead of deleting (preserves all history permanently)
      await supabase
        .from('argus_sessions')
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .eq('id', sessionId);

      // Messages remain in database forever - never deleted
      console.log(`Session ${sessionId} archived. All historical messages preserved.`);
    } catch (e: any) {
      console.error("Supabase Reset Error:", e);
      return res.status(500).json({ error: e.message });
    }
  }

  res.json({ success: true, message: 'Session archived. History preserved.' });
}
