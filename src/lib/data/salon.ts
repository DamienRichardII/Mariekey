import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { SalonSettings } from "@/lib/db-types";

export const DEFAULT_SOCIAL = { tiktok: null, snapchat: null, instagram: null };

/** Paramètres du salon. null si la base n'est pas joignable (les pages affichent alors un état d'erreur sobre). */
export async function getSalonSettings(): Promise<SalonSettings | null> {
  const db = createPublicClient();
  if (!db) return null;
  const { data, error } = await db.from("salon_settings").select("*").limit(1).maybeSingle();
  if (error || !data) return null;
  return { ...data, social: { ...DEFAULT_SOCIAL, ...(data.social ?? {}) } } as SalonSettings;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

/** Horaires affichés (table opening_hours, lundi → dimanche). */
export async function getOpeningHours(): Promise<{ day: string; ranges: string[] }[] | null> {
  const db = createPublicClient();
  if (!db) return null;
  const { data } = await db.from("opening_hours").select("weekday, is_open, open_time, close_time").order("weekday");
  if (!data) return null;
  const byDay = new Map(data.map((h) => [h.weekday as number, h]));
  const fmt = (t: string) => t.slice(0, 5).replace(":", "h");
  return DAYS.map((day, i) => {
    const h = byDay.get(i + 1);
    return { day, ranges: h?.is_open && h.open_time && h.close_time ? [`${fmt(h.open_time)} – ${fmt(h.close_time)}`] : [] };
  });
}
