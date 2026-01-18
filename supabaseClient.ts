import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase URL ou Anon Key não encontradas no arquivo .env. Usando modo de simulação (Mock Mode).');
}

// Simple Mock Authentication for Development
let mockSession: any = null;
const listeners: ((event: string, session: any) => void)[] = [];

const mockAuth = {
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    listeners.push(callback);
    // Initial trigger
    setTimeout(() => callback('SIGNED_IN', mockSession), 0);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = listeners.indexOf(callback);
            if (index > -1) listeners.splice(index, 1);
          }
        }
      }
    };
  },
  getSession: async () => ({ data: { session: mockSession }, error: null }),
  getUser: async () => ({ data: { user: mockSession?.user || null }, error: null }),
  signInWithPassword: async ({ email, password }: any) => {
    // Basic simulation: any login works in mock mode
    if (email) {
      mockSession = {
        access_token: 'mock-token',
        user: { id: 'mock-user-id', email, user_metadata: {} }
      };
      listeners.forEach(cb => cb('SIGNED_IN', mockSession));
      return { data: { session: mockSession, user: mockSession.user }, error: null };
    }
    return { data: { session: null, user: null }, error: { message: 'Por favor, insira o e-mail.' } };
  },
  signUp: async ({ email, password }: any) => {
    if (email) {
      return { data: { user: { id: 'mock-user-id', email }, session: null }, error: null };
    }
    return { data: { user: null, session: null }, error: { message: 'Erro ao cadastrar no modo simulado.' } };
  },
  signOut: async () => {
    mockSession = null;
    listeners.forEach(cb => cb('SIGNED_OUT', null));
    return { error: null };
  }
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { auth: mockAuth } as any;

export const IS_MOCK_MODE = !isSupabaseConfigured;
