/** Chiffres clés (style éditorial) : grand chiffre serif, légende en petites capitales. Uniquement des faits confirmés. */
export function StatGrid({ items }: { items: { value: string; label: string }[] }) {
  return (
    <dl className="grid divide-x divide-line border-y border-line bg-cream" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((i) => (
        <div key={i.label} className="flex flex-col-reverse px-4 py-10 text-center sm:py-14">
          <dt className="mt-3 text-[11px] font-medium uppercase tracking-[0.25em] text-stone sm:text-xs">{i.label}</dt>
          <dd className="font-serif text-5xl leading-none sm:text-6xl">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}
