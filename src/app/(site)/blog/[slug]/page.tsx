import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookButton } from "@/components/site/book-button";
import { RichText } from "@/components/site/rich-text";
import { SITE } from "@/config/site";
import { getArticle } from "@/lib/data/articles";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArticle((await params).slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.excerpt ?? undefined,
    alternates: { canonical: `/blog/${a.slug}` },
    openGraph: { type: "article", title: a.title, description: a.excerpt ?? undefined, publishedTime: a.published_at, ...(a.image_path && { images: [a.image_path] }) },
  };
}

export default async function ArticlePage({ params }: Props) {
  const a = await getArticle((await params).slug);
  if (!a) notFound();
  const jsonLd = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: a.title, datePublished: a.published_at,
    ...(a.image_path && { image: a.image_path }), author: { "@type": "Organization", name: SITE.name }, mainEntityOfPage: `${SITE.url}/blog/${a.slug}`,
  };
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 text-[15px] text-stone hover:text-ink"><ArrowLeft size={16} aria-hidden /> Tous les articles</Link>
      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-stone">{new Date(a.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">{a.title}</h1>
      {a.image_path && (
        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl bg-beige">
          <Image src={a.image_path} alt={a.image_alt ?? ""} fill priority sizes="(min-width:768px) 720px, 100vw" className="object-cover" />
        </div>
      )}
      <div className="mt-8"><RichText text={a.body} /></div>
      <div className="mt-12 flex justify-center"><BookButton size="lg">Réserver mon rendez-vous</BookButton></div>
    </article>
  );
}
