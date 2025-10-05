import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type WaitlistRow = { id: string; email: string; created_at: string };

// Minimal typed database schema for our usage
export type Database = {
  public: {
    Tables: {
      card_waitlist: {
        Row: WaitlistRow;
        Insert: { email: string; id?: string; created_at?: string };
        Update: { email?: string; id?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: { [key: string]: never };
    Functions: { [key: string]: never };
    Enums: { [key: string]: string };
    CompositeTypes: { [key: string]: never };
  };
};

let cached: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Supabase not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  }
  cached = createClient<Database>(url, anon, { auth: { persistSession: false } });
  return cached;
}
