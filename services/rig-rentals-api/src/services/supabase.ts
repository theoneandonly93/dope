import { createClient } from '@supabase/supabase-js';

let cached: ReturnType<typeof createClient> | null = null;

export function getClient() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
