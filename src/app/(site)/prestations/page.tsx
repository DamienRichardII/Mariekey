import type { Metadata } from "next";
import { EmptyState, ErrorState, SectionTitle } from "@/components/site/states";
import { ServiceCard } from "@/components/site/service-card";
import { getCategories, getServices } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Prestations",
  description: "Pose et customisation de perruque, confection, coloration, soins, makeup : découvrez les prestations de Mariekey Expert et réservez en ligne.",
  alternates: { canonical: "/prestations" },
};

export default async function PrestationsPage() {
  const [cats, services] = await Promise.all([getCategories(), getServices()]);
  if (!cats.ok || !services.ok) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState reason={!cats.ok ? cats.reason : (services as { reason: "not_configured" | "error" }).reason} /></div>;

  const groups = cats.data
    .map((c) => ({ category: c, items: services.data.filter((s) => s.category_id === c.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <SectionTitle eyebrow="Prestations"><span>Nos prestations</span></SectionTitle>
      {groups.length === 0 ? (
        <EmptyState title="Les prestations arrivent bientôt" className="mt-10">Le catalogue est en cours de préparation.</EmptyState>
      ) : (
        <>
          <nav aria-label="Catégories" className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {groups.map((g) => (
              <a key={g.category.id} href={`#${g.category.slug}`} className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-sand px-5 text-[15px] hover:bg-cream">{g.category.name}</a>
            ))}
          </nav>
          <div className="mt-12 space-y-16">
            {groups.map((g) => (
              <section key={g.category.id} id={g.category.slug} aria-labelledby={`h-${g.category.slug}`} className="scroll-mt-28">
                <h2 id={`h-${g.category.slug}`} className="font-serif text-3xl sm:text-4xl">{g.category.name}</h2>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {g.items.map((s) => (<li key={s.id}><ServiceCard service={s} /></li>))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
