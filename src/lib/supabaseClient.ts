import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hslhdgmwicezfuieffll.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY não está definida. Configure o arquivo .env com as variáveis do Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || '');
