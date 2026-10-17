import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

export type Article = {
  id: string; slug: string; title: string; excerpt: string | null; body: string;
  image_path: string | null; image_alt: string | null; published_at: string;
};

const COLS = "id, slug, title, excerpt, body, image_path, image_alt, published_at";

/** Articles publiés (RLS ne laisse passer que les articles publiés dont la date est atteinte). */
export async function getArticles(): Promise<Article[]> {
  const db = createPublicClient();
  if (!db) return [];
  const { data } = await db.from("articles").select(COLS).eq("is_published", true).order("published_at", { ascending: false });
  return (data ?? []) as Article[];
}

export async function getArticle(slug: string): Promise<Article | null> {
  const db = createPublicClient();
  if (!db) return null;
  const { data } = await db.from("articles").select(COLS).eq("slug", slug).eq("is_published", true).maybeSingle();
  return (data as Article | null) ?? null;
}
