import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Client service_role (contourne RLS) : réservé aux actions serveur de /admin, après contrôle de session. */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
