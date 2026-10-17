import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, Notice, PageHead } from "../_ui";

export const metadata = { title: "Articles" };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireAdmin();
  const { ok, err } = await searchParams;
  const { data } = await createAdminClient()!.from("articles").select("id, title, slug, is_published, published_at").order("published_at", { ascending: false });
  const rows = data ?? [];
  return (
    <>
      <PageHead title="Articles" hint="Conseils et actualités affichés sur la page Blog. Le lien « Blog » apparaît dans le pied de page dès qu'un article est publié."
        action={<LinkButton href="/admin/articles/nouveau">+ Nouvel article</LinkButton>} />
      <Notice ok={ok} err={err} />
      {rows.length === 0 ? <Card><p className="text-sm text-stone">Aucun article pour l&apos;instant.</p></Card> : (
        <Card>
          <ul className="divide-y divide-line">
            {rows.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                <Link href={`/admin/articles/${a.id}`} className="min-w-0 flex-1 basis-56">
                  <span className="block font-medium text-ink">{a.title}</span>
                  <span className="text-sm text-stone">{new Date(a.published_at).toLocaleDateString("fr-FR")} · {a.is_published ? "Publié" : "Brouillon"}</span>
                </Link>
                {a.is_published && <Link href={`/blog/${a.slug}`} target="_blank" className="text-sm text-walnut underline underline-offset-4">Voir ↗</Link>}
                <LinkButton href={`/admin/articles/${a.id}`} variant="soft" size="sm">Modifier</LinkButton>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
