import "server-only";
import { SITE } from "@/config/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAllowedEmail } from "@/lib/admin/session";

export const MIN_PASSWORD = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const cleanEmail = (v: string) => v.trim().toLowerCase();
export const validEmail = (v: string) => EMAIL_RE.test(v);

/** Envoi via Resend (API HTTP). Actif seulement si RESEND_API_KEY et RESEND_FROM sont définis. */
const resendReady = () => Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM?.trim());

async function sendWithResend(to: string, link: string): Promise<boolean> {
  const html = `<div style="font-family:Georgia,serif;max-width:480px;margin:auto;padding:24px;color:#12100e;line-height:1.6">
<h2 style="font-weight:normal;color:#3f2c20">Mariekey Expert — Administration</h2>
<p>Bonjour,</p>
<p>Cliquez sur le bouton ci-dessous pour créer ou changer votre mot de passe. Ce lien est valable une heure et ne fonctionne qu'une fois.</p>
<p style="margin:28px 0"><a href="${link}" style="background:#12100e;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none">Choisir mon mot de passe</a></p>
<p style="font-size:13px;color:#756e66">Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p></div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.RESEND_FROM!.trim(), to, subject: "Votre mot de passe — administration Mariekey Expert", html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * « Mot de passe oublié » : si l'adresse est autorisée (ADMIN_EMAILS), le compte est créé au besoin
 * puis le lien est envoyé (Resend si configuré, sinon e-mail par défaut de Supabase).
 * L'appelant répond toujours pareil, que l'adresse soit autorisée ou non.
 */
export async function sendRecoveryEmail(email: string): Promise<{ rateLimited: boolean }> {
  if (!isAllowedEmail(email)) return { rateLimited: false };
  const svc = createAdminClient();
  if (!svc) return { rateLimited: false };
  await svc.auth.admin.createUser({ email, email_confirm: true }); // erreur « déjà inscrit » ignorée
  const redirectTo = `${SITE.url}/admin/nouveau-mot-de-passe`;
  if (resendReady()) {
    const { data } = await svc.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo } });
    const link = data?.properties?.action_link;
    if (link && (await sendWithResend(email, link))) return { rateLimited: false };
  }
  const { error } = await svc.auth.resetPasswordForEmail(email, { redirectTo });
  if (error && error.status !== 429) console.error("[admin] envoi du lien de mot de passe impossible :", error.status, error.message);
  return { rateLimited: error?.status === 429 };
}

/** Connexion par e-mail + mot de passe (adresse autorisée uniquement). */
export async function verifyEmailLogin(email: string, password: string): Promise<boolean> {
  if (!isAllowedEmail(email)) return false;
  const svc = createAdminClient(); // clé serveur : ne dépend pas de la clé publique (anon)
  if (!svc) return false;
  const { data, error } = await svc.auth.signInWithPassword({ email, password });
  return !error && Boolean(data.user);
}

/** Valide le jeton du lien reçu par e-mail puis enregistre le nouveau mot de passe. */
export async function setPasswordFromToken(token: string, password: string): Promise<"ok" | "invalid" | "forbidden" | "error"> {
  const svc = createAdminClient();
  if (!svc || !token) return "invalid";
  const { data, error } = await svc.auth.getUser(token);
  if (error || !data.user?.email) return "invalid";
  if (!isAllowedEmail(data.user.email)) return "forbidden";
  const res = await svc.auth.admin.updateUserById(data.user.id, { password });
  return res.error ? "error" : "ok";
}
