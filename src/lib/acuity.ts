import "server-only";
import type { Appointment } from "@/lib/admin/calendar";
import { toAppointment } from "@/lib/admin/acuity-parse";

/**
 * Lecture seule des rendez-vous Acuity Scheduling (API v1, authentification Basic « User ID : clé API »).
 * Variables serveur : ACUITY_USER_ID, ACUITY_API_KEY (Acuity > Intégrations > API). Jamais exposées au navigateur.
 */
const BASE = process.env.ACUITY_API_BASE ?? "https://acuityscheduling.com/api/v1";

export const acuityConfigured = () => Boolean(process.env.ACUITY_USER_ID && process.env.ACUITY_API_KEY);

type Raw = Record<string, unknown>;

export type AcuityResult = { ok: true; data: Appointment[] } | { ok: false; reason: "not-configured" | "auth" | "error"; message: string };

async function call(auth: string, qs: URLSearchParams): Promise<{ status: number; rows: Raw[] | null }> {
  const res = await fetch(`${BASE}/appointments?${qs}`, { headers: { Authorization: `Basic ${auth}` }, cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!res.ok) return { status: res.status, rows: null };
  const raw = (await res.json()) as unknown;
  return { status: res.status, rows: Array.isArray(raw) ? (raw as Raw[]) : null };
}

/** Rendez-vous entre deux dates (incluses, YYYY-MM-DD). Les annulés (requête séparée côté Acuity) sont ajoutés, marqués. */
export async function fetchAppointments(minDate: string, maxDate: string): Promise<AcuityResult> {
  if (!acuityConfigured()) return { ok: false, reason: "not-configured", message: "Acuity n'est pas encore relié." };
  const auth = Buffer.from(`${process.env.ACUITY_USER_ID}:${process.env.ACUITY_API_KEY}`).toString("base64");
  const base = { minDate, maxDate, max: "500", direction: "ASC" };
  try {
    const active = await call(auth, new URLSearchParams(base));
    if (active.status === 401 || active.status === 403) return { ok: false, reason: "auth", message: "Acuity a refusé l'identifiant ou la clé API." };
    if (!active.rows) return { ok: false, reason: "error", message: `Acuity a répondu une erreur (${active.status}).` };
    const canceled = await call(auth, new URLSearchParams({ ...base, canceled: "true" })).catch(() => ({ status: 0, rows: null }));
    const toList = (rows: Raw[] | null, isCanceled: boolean) =>
      (rows ?? []).flatMap((r) => { const a = toAppointment({ ...r, canceled: isCanceled }); return a ? [a] : []; });
    return { ok: true, data: [...toList(active.rows, false), ...toList(canceled.rows, true)] };
  } catch {
    return { ok: false, reason: "error", message: "Impossible de joindre Acuity pour l'instant." };
  }
}
