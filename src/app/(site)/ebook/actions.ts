"use server";

import { redirect } from "next/navigation";
import { EBOOK } from "@/config/ebook";
import { SITE } from "@/config/site";
import { ebookOnSale, getStripe } from "@/lib/stripe";

/** Crée la session de paiement Stripe (50 €) puis envoie l'acheteuse sur la page de paiement sécurisée. */
export async function startEbookCheckout() {
  const stripe = getStripe();
  if (!stripe || !ebookOnSale()) redirect("/ebook");
  let url: string | null = null;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      line_items: [{
        quantity: 1,
        price_data: { currency: "eur", unit_amount: EBOOK.priceCents, product_data: { name: EBOOK.name } },
      }],
      success_url: `${SITE.url}/ebook/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE.url}/ebook`,
    });
    url = session.url;
  } catch {
    redirect("/ebook?erreur=1");
  }
  redirect(url ?? "/ebook?erreur=1");
}
