import type { Metadata } from "next";
import { BeforeAfter } from "@/components/site/before-after";
import { BookButton } from "@/components/site/book-button";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { EmptyState, SectionTitle } from "@/components/site/states";
import { getBeforeAfterPairs, getMedia } from "@/lib/data/media";

export const revalidate = 60;
export const metadata: Metadata = { title: "Galerie", description: "Réalisations de Mariekey Expert : lissages, colorations, coiffures.", alternates: { canonical: "/galerie" } };

export default async function GalleryPage() {
  const [items, pairs] = await Promise.all([getMedia("gallery"), getBeforeAfterPairs()]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <SectionTitle eyebrow="Galerie">Nos réalisations</SectionTitle>
      <div className="mt-10">
        {items.length > 0 ? <GalleryGrid items={items} /> : <EmptyState title="Galerie bientôt disponible">Nos réalisations seront présentées ici.</EmptyState>}
      </div>
      {pairs.length > 0 && (
        <section aria-labelledby="ba-title" className="mt-20">
          <SectionTitle><span id="ba-title">Avant / Après</span></SectionTitle>
          <div className="mt-10"><BeforeAfter pairs={pairs} /></div>
        </section>
      )}
      <div className="mt-16 flex justify-center"><BookButton size="lg">Réserver mon rendez-vous</BookButton></div>
    </div>
  );
}
