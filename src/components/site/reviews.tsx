import { Star } from "lucide-react";
import type { Review } from "@/config/reviews";

export const GOOGLE_REVIEWS_URL = "https://share.google/fOf2GmaNZvhrLAwup";

function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="flex gap-0.5 text-walnut" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={16} fill={i < n ? "currentColor" : "none"} strokeWidth={i < n ? 0 : 1.5} />)}
    </span>
  );
}

export function Reviews({ reviews, title, summary }: { reviews: Review[]; title: string; summary: string }) {
  if (reviews.length === 0) return null;
  return (
    <section aria-labelledby="avis-title" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-walnut">Avis clientes</p>
        <h2 id="avis-title" className="mt-3 font-serif text-4xl sm:text-5xl">{title}</h2>
        <p className="mt-4 flex items-center justify-center gap-3 text-[15px] text-stone"><Stars /> <span>{summary}</span></p>
      </div>
      <ul className="mt-10 grid gap-6 lg:grid-cols-2">
        {reviews.map((r) => (
          <li key={r.id} className="flex flex-col rounded-2xl border border-line bg-cream p-6 sm:p-8">
            <Stars n={r.rating} />
            <blockquote className="mt-4 flex-1 space-y-3 text-[16px] leading-relaxed text-ink-soft">
              {r.body.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
            </blockquote>
            <p className="mt-6 text-[15px] font-medium">{r.author} <span className="font-normal text-stone">· Avis {r.source}</span></p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-center">
        <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border-b border-ink pb-0.5 text-[15px] font-medium hover:text-walnut">
          Voir les avis sur Google<span className="sr-only"> (nouvel onglet)</span>
        </a>
      </p>
    </section>
  );
}
