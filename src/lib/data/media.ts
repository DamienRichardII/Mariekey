import "server-only";
import { STATIC_MEDIA } from "@/config/media";
import { createPublicClient } from "@/lib/supabase/public";
import type { Media } from "@/lib/db-types";

/** Sections autorisées : le site ne publie aucune photo de cliente (salon et outils uniquement). */
const ALLOWED = new Set(["salon", "about"]);

export async function getMedia(section: "salon" | "about"): Promise<Media[]> {
  const fallback = STATIC_MEDIA[section] ?? [];
  const db = ALLOWED.has(section) ? createPublicClient() : null;
  if (!db) return fallback;
  const { data } = await db.from("media").select("id, kind, section, path, alt, sort_order")
    .eq("section", section).eq("kind", "photo").eq("is_active", true).order("sort_order");
  return data && data.length > 0 ? (data as Media[]) : fallback;
}
