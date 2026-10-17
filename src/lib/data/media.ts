import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { BeforeAfterPair, Media } from "@/lib/db-types";

export async function getMedia(section: string): Promise<Media[]> {
  const db = createPublicClient();
  if (!db) return [];
  const { data } = await db.from("media").select("id, kind, section, path, alt, sort_order")
    .eq("section", section).eq("is_active", true).order("sort_order");
  return (data ?? []) as Media[];
}

/** Paires avant/après : uniquement celles dont les deux visuels sont identifiés et actifs. */
export async function getBeforeAfterPairs(): Promise<BeforeAfterPair[]> {
  const db = createPublicClient();
  if (!db) return [];
  const { data } = await db.from("before_after_pairs")
    .select("id, title, sort_order, before:media!before_media_id(id, kind, section, path, alt, sort_order, is_active), after:media!after_media_id(id, kind, section, path, alt, sort_order, is_active)")
    .eq("is_active", true).order("sort_order");
  type Row = { id: string; title: string | null; sort_order: number; before: (Media & { is_active: boolean }) | null; after: (Media & { is_active: boolean }) | null };
  return ((data ?? []) as unknown as Row[])
    .filter((r) => r.before?.is_active && r.after?.is_active)
    .map((r) => ({ id: r.id, title: r.title, sort_order: r.sort_order, before: r.before!, after: r.after! }));
}
