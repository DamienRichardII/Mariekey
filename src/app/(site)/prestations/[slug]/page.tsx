import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Info } from "lucide-react";
import { BookButton } from "@/components/site/book-button";
import { Photo } from "@/components/site/photo";
import { ErrorState } from "@/components/site/states";
import { getCategories, getService } from "@/lib/data/catalog";
import { formatDuration, formatEUR, formatServicePrice } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await getService(slug);
  if (!r.ok || !r.data) return { title: "Prestation" };
  return { title: r.data.name, description: r.data.short_description ?? undefined, alternates: { canonical: `/prestations/${slug}` } };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [r, cats] = await Promise.all([getService(slug), getCategories()]);
  if (!r.ok) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState reason={r.reason} /></div>;
  if (!r.data) notFound();
  const s = r.data;
  const catImage = cats.ok ? cats.data.find((c) => c.id === s.category_id)?.image_path : null;

  return (
    <article className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-beige shadow-soft">
        <Photo src={s.image_path ?? catImage} alt={s.name} sizes="(min-width:1024px) 45vw, 100vw" priority expected={`photo de « ${s.name} »`} />
      </div>
      <div>
        {s.service_categories?.name && <p className="text-xs uppercase tracking-[0.25em] text-walnut">{s.service_categories.name}</p>}
        <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">{s.name}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[17px]">
          <span className="font-medium">{formatServicePrice(s.price_cents, s.price_is_from)}</span>
          <span className="inline-flex items-center gap-1.5 text-stone"><Clock size={17} aria-hidden />{formatDuration(s.duration_minutes)}</span>
        </div>
        {(s.description || s.short_description) && <p className="mt-6 whitespace-pre-line text-[16px] leading-relaxed text-ink-soft">{s.description ?? s.short_description}</p>}

        {s.preparation_notes && (
          <div className="mt-8 flex gap-3 rounded-2xl bg-cream p-5">
            <Info size={20} className="mt-0.5 shrink-0 text-walnut" aria-hidden />
            <div><h2 className="font-medium">Avant votre rendez-vous</h2><p className="mt-1 whitespace-pre-line text-[15px] text-stone">{s.preparation_notes}</p></div>
          </div>
        )}

        {s.service_options && s.service_options.length > 0 && (
          <section className="mt-8" aria-labelledby="options-title">
            <h2 id="options-title" className="font-serif text-2xl">Options</h2>
            <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
              {s.service_options.map((o) => (
                <li key={o.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div><p className="font-medium">{o.name}</p>{o.description && <p className="mt-0.5 text-sm text-stone">{o.description}</p>}</div>
                  <p className="shrink-0 text-right text-sm text-ink-soft">
                    {o.price_delta_cents !== 0 && <span className="block">{o.price_delta_cents > 0 ? "+" : "−"}{formatEUR(Math.abs(o.price_delta_cents))}</span>}
                    {o.duration_delta_minutes !== 0 && <span className="block text-stone">{o.duration_delta_minutes > 0 ? "+" : "−"}{formatDuration(Math.abs(o.duration_delta_minutes))}</span>}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="mt-10"><BookButton href={s.booking_url} size="lg" block className="sm:w-auto">Réserver cette prestation</BookButton></div>
      </div>
    </article>
  );
}
