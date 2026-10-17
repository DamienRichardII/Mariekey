import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/db-types";
import { Photo } from "./photo";
import { Reveal } from "./reveal";

export function CategoryCards({ categories }: { categories: Category[] }) {
  return (
    <section aria-label="Catégories de prestations" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 sm:scroll-pl-6 lg:scroll-pl-0 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-flow-col lg:auto-cols-fr lg:gap-5 lg:overflow-visible lg:px-0"
        tabIndex={0} aria-label="Faire défiler les catégories">
        {categories.map((c, i) => (
          <li key={c.id} className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-auto">
            <Reveal delay={i * 0.05}>
              <Link href={`/prestations#${c.slug}`} aria-label={`${c.name} — voir les prestations`}
                className="group block overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                  {c.image_path ? (
                    <Photo src={c.image_path} alt="" sizes="(min-width:1024px) 20vw, 44vw" expected={`public/images/categories/${c.slug}.jpg`}
                      className="transition-transform duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <span aria-hidden className="absolute inset-0 grid place-items-center font-serif text-6xl text-walnut/70">{String(i + 1).padStart(2, "0")}</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-3.5">
                  <span className="text-[15px] font-medium">{c.name}</span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-sand text-walnut transition-colors group-hover:bg-ink group-hover:text-white"><ArrowRight size={15} aria-hidden /></span>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
