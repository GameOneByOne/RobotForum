import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase/env";

export function createPublicClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}
