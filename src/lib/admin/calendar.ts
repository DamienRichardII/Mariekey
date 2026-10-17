/** Utilitaires de calendrier purs (sans accès réseau) : testables et utilisables côté serveur. */

export type Appointment = {
  id: number;
  start: string; // « YYYY-MM-DDTHH:mm », heure locale du salon (telle que renvoyée par Acuity)
  end: string | null; // « HH:mm »
  client: string;
  phone: string | null;
  email: string | null;
  service: string;
  duration: number | null; // minutes
  price: string | null;
  paid: boolean;
  canceled: boolean;
  notes: string | null;
};

export const dayKey = (a: Pick<Appointment, "start">) => a.start.slice(0, 10);
export const timeOf = (a: Pick<Appointment, "start">) => a.start.slice(11, 16);

/** « 2026-10 » valide, sinon le mois de `fallback`. */
export function parseMonth(raw: string | undefined, fallback: Date): { year: number; month: number } {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(raw ?? "");
  return m ? { year: Number(m[1]), month: Number(m[2]) } : { year: fallback.getFullYear(), month: fallback.getMonth() + 1 };
}

export const monthParam = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`;
export function shiftMonth(y: number, m: number, delta: number) {
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}
export const monthRange = (y: number, m: number) => ({
  min: `${monthParam(y, m)}-01`,
  max: `${monthParam(y, m)}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`,
});

/** Grille du mois, semaines du lundi au dimanche ; null = case hors du mois. */
export function monthGrid(y: number, m: number): (string | null)[][] {
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${monthParam(y, m)}-${String(i + 1).padStart(2, "0")}`)];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

export function groupByDay(list: Appointment[]): Map<string, Appointment[]> {
  const map = new Map<string, Appointment[]>();
  for (const a of [...list].sort((x, y) => x.start.localeCompare(y.start))) {
    const k = dayKey(a);
    map.set(k, [...(map.get(k) ?? []), a]);
  }
  return map;
}

/** Lundi (YYYY-MM-DD) de la semaine contenant `iso`, et les 6 jours suivants. */
export function weekOf(iso: string): string[] {
  const d = new Date(`${iso}T00:00:00Z`);
  const lead = (d.getUTCDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => new Date(d.getTime() + (i - lead) * 86400000).toISOString().slice(0, 10));
}

export const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export const longDay = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
