import "server-only";

/** Variables d'environnement serveur. Les secrets ne quittent jamais le serveur. */
export const serverEnv = {
  get supabaseUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""; },
  get supabaseAnonKey() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""; },
  get siteUrl() { return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"; },
};

export function isSupabaseConfigured() {
  return Boolean(serverEnv.supabaseUrl && serverEnv.supabaseAnonKey);
}
