import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionTitle } from "@/components/site/states";

export const metadata: Metadata = {
  title: "Boutique",
  description: "La boutique Mariekey Expert ouvrira prochainement.",
  alternates: { canonical: "/boutique" },
};

export default function BoutiquePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <SectionTitle eyebrow="Boutique">Notre boutique</SectionTitle>
      <section aria-labelledby="soon-title" className="mt-10 rounded-2xl border border-line bg-cream px-6 py-16 text-center sm:py-24">
        <p className="inline-block rounded-full border border-walnut/40 px-5 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-walnut">Bientôt disponible</p>
        <h2 id="soon-title" className="mt-6 font-serif text-4xl sm:text-5xl">La boutique ouvre bientôt</h2>
        <p className="mx-auto mt-4 max-w-md text-[16px] text-stone">Aucun produit n’est en vente pour le moment. Revenez très vite.</p>
        <Link href="/prestations" className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-ink pb-0.5 text-[15px] font-medium hover:text-walnut">
          Découvrir nos prestations <ArrowRight size={16} aria-hidden />
        </Link>
        <p className="mt-6 text-[15px] text-stone">Un ebook est aussi en préparation : <Link href="/ebook" className="text-walnut underline underline-offset-4">en savoir plus</Link>.</p>
      </section>
    </div>
  );
}
