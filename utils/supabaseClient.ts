import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'supabase-anon-key',
  }
})

let clerkSupabaseClient: SupabaseClient | null = null;
let currentClerkToken: string | null = null;

export const createClerkSupabaseClient = (clerkToken: string) => {
  if (clerkSupabaseClient && currentClerkToken === clerkToken) {
    return clerkSupabaseClient;
  }
  
  clerkSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'supabase-clerk-key-' + Math.random(),
    },
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
  currentClerkToken = clerkToken;
  
  return clerkSupabaseClient;
}
