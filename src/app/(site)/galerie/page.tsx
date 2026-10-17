import type { Metadata } from "next";
import { BookButton } from "@/components/site/book-button";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { EmptyState, SectionTitle } from "@/components/site/states";
import { getMedia } from "@/lib/data/media";

export const revalidate = 60;
export const metadata: Metadata = { title: "Galerie", description: "Le salon Mariekey Expert à Gentilly en images.", alternates: { canonical: "/galerie" } };

export default async function GalleryPage() {
  const [salon, about] = await Promise.all([getMedia("salon"), getMedia("about")]);
  const items = [...salon, ...about];
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <SectionTitle eyebrow="Galerie">Le salon en images</SectionTitle>
      <div className="mt-10">
        {items.length > 0 ? <GalleryGrid items={items} /> : <EmptyState title="Galerie bientôt disponible">Les photos du salon seront présentées ici.</EmptyState>}
      </div>
      <div className="mt-16 flex justify-center"><BookButton size="lg">Réserver mon rendez-vous</BookButton></div>
    </div>
  );
}
