import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "mky_admin";
const MAX_AGE = 60 * 60 * 12; // 12 h

const secret = () =>
  process.env.ADMIN_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";
const sign = (exp: string) => createHmac("sha256", secret()).update(`admin.${exp}`).digest("hex");

/** Adresses e-mail autorisées à administrer le site (variable ADMIN_EMAILS, séparées par des virgules). */
export const allowedEmails = () =>
  (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
export const isAllowedEmail = (email: string) => allowedEmails().includes(email.trim().toLowerCase());

export const adminConfigured = () => Boolean((process.env.ADMIN_PASSWORD || allowedEmails().length) && secret());

export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function startSession() {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin", maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

/** TEMPORAIRE : ADMIN_OPEN=true ouvre /admin sans mot de passe. À retirer dès que ADMIN_PASSWORD est défini. */
const adminOpen = () => process.env.ADMIN_OPEN?.trim() === "true";

export async function isAdmin(): Promise<boolean> {
  if (adminOpen()) return true;
  if (!adminConfigured()) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [exp, mac] = raw.split(".");
  if (!exp || !mac || Number(exp) < Date.now() / 1000) return false;
  const good = Buffer.from(sign(exp));
  const given = Buffer.from(mac);
  return good.length === given.length && timingSafeEqual(good, given);
}

/** À appeler en tête de chaque page et de chaque action d'administration. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
