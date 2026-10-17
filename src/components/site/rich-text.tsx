/**
 * Texte d'article saisi dans /admin : paragraphes séparés par une ligne vide, « ## » en début de ligne = intertitre.
 * Rendu en éléments React (jamais de HTML brut) : aucune injection possible.
 */
export function RichText({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-5 text-[17px] leading-relaxed text-ink-soft">
      {blocks.map((b, i) =>
        b.startsWith("## ") ? (
          <h2 key={i} className="pt-4 font-serif text-3xl text-ink">{b.slice(3)}</h2>
        ) : (
          <p key={i}>{b.split("\n").map((l, j, a) => <span key={j}>{l}{j < a.length - 1 && <br />}</span>)}</p>
        ),
      )}
    </div>
  );
}
