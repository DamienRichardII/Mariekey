import { Star } from "lucide-react";

/** Avis Google publics (texte repris tel quel). Note affichée : 5/5 sur 2 avis Google. */
const REVIEWS = [
  { author: "Divine D", text: "Si je pouvais mettre 10 étoiles, je l’aurais fait.\nLe salon est incroyable. Dès mon arrivée, j’ai été accueillie avec le sourire, un petit thé et des biscuits.\nLa prestation s’est super bien passée ; ma pose de wig était juste PARFAITE et impeccable !!\nMarieKey maîtrise son art avec passion et professionnalisme. Je repars ravie et impatiente de revenir ! Je recommande à 1000 %. Merci encore." },
  { author: "Gisele Presume", text: "Un grand merci à Marie de m’avoir sublimée ! L’accueil était chaleureux et la prestation tout simplement parfaite et incroyable !\nJ’ai réalisé un tissage ouvert avec un brushing à la perfection, ainsi qu’un magnifique maquillage pour un mariage. Je me suis sentie vraiment belle et magnifique !\nMarie est une véritable professionnelle, douce, à l’écoute et très talentueuse. Elle a su parfaitement répondre à mes attentes et me mettre en valeur pour cette belle occasion.\nJe la recommande les yeux fermés !" },
] as const;

export const GOOGLE_REVIEWS_URL = "https://share.google/fOf2GmaNZvhrLAwup";

function Stars() {
  return (
    <span className="flex gap-0.5 text-walnut" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />)}
    </span>
  );
}

export function Reviews() {
  return (
    <section aria-labelledby="avis-title" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-walnut">Avis clientes</p>
        <h2 id="avis-title" className="mt-3 font-serif text-4xl sm:text-5xl">Elles nous recommandent</h2>
        <p className="mt-4 flex items-center justify-center gap-3 text-[15px] text-stone">
          <Stars /> <span><strong className="font-medium text-ink">5/5</strong> · 2 avis Google</span>
        </p>
      </div>
      <ul className="mt-10 grid gap-6 lg:grid-cols-2">
        {REVIEWS.map((r) => (
          <li key={r.author} className="flex flex-col rounded-2xl border border-line bg-cream p-6 sm:p-8">
            <Stars />
            <blockquote className="mt-4 flex-1 space-y-3 text-[16px] leading-relaxed text-ink-soft">
              {r.text.split("\n").map((p) => <p key={p}>{p}</p>)}
            </blockquote>
            <p className="mt-6 text-[15px] font-medium">{r.author} <span className="font-normal text-stone">· Avis Google</span></p>
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
