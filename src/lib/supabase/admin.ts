import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  "";

export const isSupabaseAdminConfigured = Boolean(supabaseUrl && supabaseSecretKey);

export function createSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseSecretKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
