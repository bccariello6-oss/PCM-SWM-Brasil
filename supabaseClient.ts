import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error('CRÍTICO: Supabase URL ou Anon Key não configuradas no ambiente. A aplicação falhará ao comunicar com o banco de dados.');
}

export const supabase = createClient(
  supabaseUrl || 'https://sua-url-projeto.supabase.co',
  supabaseAnonKey || 'sua-anon-key'
);

export const IS_MOCK_MODE = !isSupabaseConfigured;
