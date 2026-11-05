import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedSupabase: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (cachedSupabase) return cachedSupabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  cachedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return cachedSupabase;
};

// Backward compatibility ke liye proxy ya getter taake page.tsx mein import "supabase" na toote
export const supabase = {
  from: (table: string) => getSupabaseClient().from(table),
  auth: {
    getSession: () => getSupabaseClient().auth.getSession(),
    onAuthStateChange: (cb: any) => getSupabaseClient().auth.onAuthStateChange(cb),
    signInWithPassword: (credentials: any) => getSupabaseClient().auth.signInWithPassword(credentials),
    signOut: () => getSupabaseClient().auth.signOut(),
    signUp: (credentials: any) => getSupabaseClient().auth.signUp(credentials),
  },
} as any;
