import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EmptyState, SectionTitle } from "@/components/site/states";
import { getArticles } from "@/lib/data/articles";

export const revalidate = 60;
export const metadata: Metadata = { title: "Blog", description: "Conseils et actualités du salon Mariekey Expert à Gentilly.", alternates: { canonical: "/blog" } };

const date = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function BlogPage() {
  const articles = await getArticles();
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <SectionTitle eyebrow="Blog">Conseils &amp; actualités</SectionTitle>
      <div className="mt-10">
        {articles.length === 0 ? (
          <EmptyState title="Articles bientôt disponibles">Les premiers articles arrivent prochainement.</EmptyState>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2">
            {articles.map((a) => (
              <li key={a.id}>
                <Link href={`/blog/${a.slug}`} className="group block">
                  {a.image_path && (
                    <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl bg-beige">
                      <Image src={a.image_path} alt={a.image_alt ?? ""} fill sizes="(min-width:640px) 45vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    </div>
                  )}
                  <p className="text-xs uppercase tracking-[0.2em] text-stone">{date(a.published_at)}</p>
                  <h2 className="mt-1 font-serif text-2xl group-hover:text-walnut">{a.title}</h2>
                  {a.excerpt && <p className="mt-2 text-[15px] text-ink-soft">{a.excerpt}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
