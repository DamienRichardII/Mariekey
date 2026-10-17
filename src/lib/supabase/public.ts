import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, serverEnv } from "@/lib/env";

/** Client anonyme sans cookies : lecture du contenu public (catalogue, horaires…), compatible rendu statique. */
export function createPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createClient(serverEnv.supabaseUrl, serverEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
