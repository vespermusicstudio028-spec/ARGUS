import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const createMockClient = () => {
  const chain = {
    select: () => chain,
    insert: () => chain,
    delete: () => chain,
    update: () => chain,
    eq: () => chain,
    order: () => chain,
    single: () => chain,
    then: (resolve: any) => resolve({ data: null, error: null }),
  };
  
  return {
    from: () => chain,
  } as any;
};

let supabaseClient;

try {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn(
      'Supabase credentials missing or invalid! Running frontend in fallback mock mode.'
    );
    supabaseClient = createMockClient();
  }
} catch (e) {
  console.error('Supabase initialization failed, falling back to mock:', e);
  supabaseClient = createMockClient();
}

export const supabase = supabaseClient;
