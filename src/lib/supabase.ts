import { createClient } from '@supabase/supabase-js';

export const isSupabaseConfigured = (): boolean => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

export const testConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
};

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export default supabase;
