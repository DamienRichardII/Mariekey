import "server-only";
import { EBOOK } from "@/config/ebook";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/** Vrai seulement si la session Stripe existe, concerne l'ebook et est payée. */
export async function isPaidSession(sessionId: string | undefined): Promise<boolean> {
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return false;
  const stripe = getStripe();
  if (!stripe) return false;
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    return s.payment_status === "paid" && s.amount_total === EBOOK.priceCents;
  } catch {
    return false;
  }
}

/** Lien de téléchargement temporaire (60 s) du PDF privé, ou null si le PDF n'est pas encore déposé. */
export async function ebookSignedUrl(): Promise<string | null> {
  const db = createAdminClient();
  if (!db) return null;
  const { data, error } = await db.storage.from(EBOOK.bucket).createSignedUrl(EBOOK.file, 60, { download: "Ebook-Mariekey-Expert.pdf" });
  return error ? null : data.signedUrl;
}
