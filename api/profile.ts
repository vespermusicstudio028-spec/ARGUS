import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseKey!) : null;

// Mock fallback profile data
const mockProfile = {
  name: 'Patrick & Família',
  email: 'creator@argus.io',
  avatar_url: '/argus-logo.png',
  plan_name: 'Pro',
  max_messages: 2000,
  used_messages: 482,
  price: 'R$ 49,90/mês'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    if (isSupabaseConfigured && supabase) {
      try {
        let { data: profile, error } = await supabase
          .from('argus_profiles')
          .select('*')
          .eq('email', 'creator@argus.io')
          .single();

        if (error || !profile) {
          // Attempt to insert default profile
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
      } catch (err: any) {
        console.error("Supabase Profile Fetch Error:", err);
        return res.json(mockProfile);
      }
    } else {
      return res.json(mockProfile);
    }
  }

  // Handle plan update
  if (req.method === 'POST') {
    const { planName, maxMessages, price } = req.body;
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: updatedProfile, error } = await supabase
          .from('argus_profiles')
          .update({ 
            plan_name: planName, 
            max_messages: maxMessages,
            used_messages: 0 // Reset messages used on upgrade for testing
          })
          .eq('email', 'creator@argus.io')
          .select()
          .single();

        if (error) throw error;
        return res.json(updatedProfile);
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    } else {
      // In-memory fallback change is a no-op but returns success
      return res.json({ ...mockProfile, plan_name: planName, max_messages: maxMessages });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
