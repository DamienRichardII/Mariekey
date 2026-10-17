import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionTitle } from "@/components/site/states";
import { getContent } from "@/lib/data/content";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Ebook",
  description: "L’ebook Mariekey Expert, Wig spécialiste : bientôt disponible.",
  alternates: { canonical: "/ebook" },
};

export default async function EbookPage() {
  const t = await getContent();
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <SectionTitle eyebrow="Produit digital">Notre ebook</SectionTitle>
      <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,2fr)_3fr] lg:gap-16">
        <Image src="/images/ebook/cover.jpg" alt="Couverture de l’ebook Mariekey Expert, Wig spécialiste" width={900} height={1164} priority
          sizes="(min-width:1024px) 380px, 80vw" className="mx-auto h-auto w-full max-w-sm rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]" />
        <div>
          <p className="inline-block rounded-full border border-walnut/40 px-5 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-walnut">Bientôt disponible</p>
          <h2 className="mt-6 font-serif text-4xl sm:text-5xl">{t["ebook.title"]}</h2>
          <p className="mt-6 text-[15px] text-stone">{t["ebook.text"]}</p>
          <Link href="/formation" className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-ink pb-0.5 text-[15px] font-medium hover:text-walnut">
            Découvrir notre formation <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
