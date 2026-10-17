import "server-only";
import { STATIC_REVIEWS, type Review } from "@/config/reviews";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Avis affichés sur l'accueil. Tant que la table `reviews` est vide, les avis d'origine sont affichés ;
 * dès qu'elle contient des lignes, seuls les avis « visibles » le sont (tous masqués = section masquée).
 */
export async function getReviews(): Promise<Review[]> {
  const db = createPublicClient();
  if (!db) return STATIC_REVIEWS;
  const { data, error } = await db.from("reviews").select("id, author, body, rating, source, is_active, sort_order").order("sort_order").order("created_at");
  if (error || !data || data.length === 0) return STATIC_REVIEWS;
  return data.filter((r) => r.is_active).map(({ id, author, body, rating, source }) => ({ id, author, body, rating, source }));
}
