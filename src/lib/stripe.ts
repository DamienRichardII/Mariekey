import "server-only";
import Stripe from "stripe";

/** Clé secrète Stripe : variable serveur STRIPE_SECRET_KEY (jamais NEXT_PUBLIC_). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return key ? new Stripe(key) : null;
}

/** La vente n'est ouverte que si la clé existe ET que EBOOK_ON_SALE=true (à activer quand le PDF est prêt). */
export const ebookOnSale = () => Boolean(process.env.STRIPE_SECRET_KEY?.trim()) && process.env.EBOOK_ON_SALE === "true";
