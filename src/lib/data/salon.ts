import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { SalonSettings } from "@/lib/db-types";

export const DEFAULT_SOCIAL = { tiktok: null, snapchat: null, instagram: null };

/** Coordonnées confirmées par le salon : valeurs par défaut si la base est vide ou indisponible. */
const DEFAULT_SETTINGS: SalonSettings = {
  name: "Mariekey Expert",
  phone: "06 16 22 51 65",
  email: "mariekeytouch@gmail.com",
  whatsapp: "06 13 42 40 89",
  address: "27 avenue Jean Jaurès, Gentilly (94)",
  social: DEFAULT_SOCIAL,
  hours_note: "Uniquement sur rendez-vous.",
  legal: {},
};

/** Paramètres du salon (base, sinon valeurs confirmées par défaut ; une valeur vide en base est complétée). */
export async function getSalonSettings(): Promise<SalonSettings> {
  const db = createPublicClient();
  if (!db) return DEFAULT_SETTINGS;
  const { data, error } = await db.from("salon_settings").select("*").limit(1).maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  const row = data as SalonSettings;
  return {
    ...DEFAULT_SETTINGS, ...row,
    phone: row.phone ?? DEFAULT_SETTINGS.phone, email: row.email ?? DEFAULT_SETTINGS.email,
    whatsapp: row.whatsapp ?? DEFAULT_SETTINGS.whatsapp, address: row.address ?? DEFAULT_SETTINGS.address,
    hours_note: row.hours_note ?? DEFAULT_SETTINGS.hours_note,
    social: { ...DEFAULT_SOCIAL, ...(row.social ?? {}) }, legal: row.legal ?? {},
  };
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

/** Horaires affichés (table opening_hours, lundi → dimanche). */
export async function getOpeningHours(): Promise<{ day: string; ranges: string[] }[]> {
  const fallback = DAYS.map((day, i) => ({ day, ranges: i >= 1 && i <= 5 ? ["10h00 – 19h00"] : [] })); // mardi → samedi
  const db = createPublicClient();
  if (!db) return fallback;
  const { data } = await db.from("opening_hours").select("weekday, is_open, open_time, close_time").order("weekday");
  if (!data || !data.some((h) => h.is_open)) return fallback;
  const byDay = new Map(data.map((h) => [h.weekday as number, h]));
  const fmt = (t: string) => t.slice(0, 5).replace(":", "h");
  return DAYS.map((day, i) => {
    const h = byDay.get(i + 1);
    return { day, ranges: h?.is_open && h.open_time && h.close_time ? [`${fmt(h.open_time)} – ${fmt(h.close_time)}`] : [] };
  });
}
