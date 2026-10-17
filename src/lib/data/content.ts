import "server-only";
import { CONTENT_DEFAULTS, type ContentKey } from "@/config/content";
import { createPublicClient } from "@/lib/supabase/public";

export type SiteContent = Record<ContentKey, string>;

/** Textes du site : valeurs enregistrées dans /admin par-dessus les textes d'origine. Jamais d'erreur côté visiteur. */
export async function getContent(): Promise<SiteContent> {
  const out = { ...CONTENT_DEFAULTS };
  const db = createPublicClient();
  if (!db) return out;
  const { data } = await db.from("site_content").select("key, value");
  for (const r of data ?? []) {
    if (r.key in out && typeof r.value === "string" && r.value.trim()) out[r.key as ContentKey] = r.value;
  }
  return out;
}
