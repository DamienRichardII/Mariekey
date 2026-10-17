import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import { TZDate } from "@date-fns/tz";

/** URL d'un PostgreSQL jetable (superutilisateur). Les tests DB sont ignorés si absente. */
export const ADMIN_URL = process.env.TEST_PG_ADMIN_URL ?? "";
export const DB_NAME = "mk_vitest";
export const TZ = "Europe/Paris";

export const PRO = "00000000-0000-4000-8000-000000000001";
export const root = path.resolve(__dirname, "../..");

export function dbUrl() {
  const u = new URL(ADMIN_URL);
  u.pathname = `/${DB_NAME}`;
  return u.toString();
}

export async function resetDatabase() {
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();
  await admin.query(`drop database if exists ${DB_NAME} with (force)`);
  await admin.query(`create database ${DB_NAME}`);
  await admin.end();

  const c = new pg.Client({ connectionString: dbUrl() });
  await c.connect();
  await c.query(readFileSync(path.join(root, "supabase/tests/00_supabase_shim.sql"), "utf8"));
  const dir = path.join(root, "supabase/migrations");
  for (const f of readdirSync(dir).sort()) await c.query(readFileSync(path.join(dir, f), "utf8"));
  await c.query(readFileSync(path.join(root, "supabase/seed.content.sql"), "utf8"));
  await c.query(readFileSync(path.join(root, "supabase/seed.demo.sql"), "utf8"));
  // Les tests exercent aussi la logique de pause : horaires scindés 10-13 / 14-19 (le seed réel est 10h-19h continu).
  await c.query("delete from business_hours");
  await c.query(`insert into business_hours (professional_id, weekday, start_time, end_time)
    select '${PRO}', d, t.s::time, t.e::time from generate_series(2,6) d, (values ('10:00','13:00'),('14:00','19:00')) t(s,e)`);
  await c.end();
}

export function pool(max = 12) {
  return new pg.Pool({ connectionString: dbUrl(), max });
}

/** Jour de semaine ISO (1 = lundi) le plus proche à au moins `minDays` jours, à l'heure locale HH:mm (Paris). */
export function localSlot(isoWeekday: number, hhmm: string, minDays = 4): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const base = new TZDate(Date.now() + minDays * 86_400_000, TZ);
  for (let i = 0; i < 8; i++) {
    const d = new TZDate(base.getFullYear(), base.getMonth(), base.getDate() + i, h, m, 0, TZ);
    const iso = d.getDay() === 0 ? 7 : d.getDay();
    if (iso === isoWeekday) return new Date(d.getTime());
  }
  throw new Error("no slot");
}


export async function serviceId(p: pg.Pool, slug: string) {
  const r = await p.query("select id from services where slug=$1", [slug]);
  return r.rows[0].id as string;
}

export async function book(
  p: pg.Pool | pg.PoolClient,
  o: {
    service: string;
    options?: string[];
    pro?: string | null;
    start: Date;
    client?: string | null;
    email?: string;
    source?: "online" | "admin";
  },
) {
  return p.query(
    `select * from create_booking($1,$2::uuid[],$3,$4,$5,'Test','Cliente',$6,'0600000000',$7,null)`,
    [o.service, o.options ?? [], o.pro === undefined ? PRO : o.pro, o.start.toISOString(), o.client ?? null,
     o.email ?? "t@example.com", o.source ?? "online"],
  );
}

export async function errCode(promise: Promise<unknown>): Promise<string | null> {
  try {
    await promise;
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}
