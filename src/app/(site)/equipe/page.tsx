import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BookButton } from "@/components/site/book-button";
import { Photo } from "@/components/site/photo";
import { StatGrid } from "@/components/site/stat-grid";
import { SectionTitle } from "@/components/site/states";
import { getContent } from "@/lib/data/content";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Notre équipe",
  description: "Marie coiffe depuis 12 ans. Découvrez l’équipe de Mariekey Expert à Gentilly.",
  alternates: { canonical: "/equipe" },
};

export default async function TeamPage() {
  const t = await getContent();
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <SectionTitle eyebrow="Notre équipe">{t["team.title"]}</SectionTitle>
      </div>
      <section className="mx-auto mt-10 grid max-w-5xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="space-y-5 text-[17px] leading-relaxed text-ink-soft">
          <p>{t["team.p1"]}</p>
          <p>{t["team.p2"]}</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-beige shadow-soft">
          <Photo src="/images/salon/salon-miroir.jpg" alt="Poste de coiffure avec grand miroir arrondi et fauteuil noir" sizes="(min-width:1024px) 45vw, 100vw" expected="public/images/salon/salon-miroir.jpg" />
        </div>
      </section>
      <div className="mt-14"><StatGrid items={[{ value: t["stats.years.value"], label: t["stats.years.label"] }]} /></div>
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 py-14 sm:px-6 lg:py-20">
        <BookButton size="lg">Réserver mon rendez-vous</BookButton>
        <Link href="/formation" className="inline-flex min-h-11 items-center gap-2 border-b border-ink pb-0.5 text-[15px] font-medium hover:text-walnut">
          Se former avec Marie <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </>
  );
}
