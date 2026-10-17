/** Champ légal manquant : toujours visible et repérable avant la mise en ligne. */
export function ToFill({ children }: { children: React.ReactNode }) {
  return <mark className="rounded bg-sand/60 px-1.5 py-0.5 text-ink">[À compléter : {children}]</mark>;
}

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-20">
      <h1 className="font-serif text-4xl sm:text-5xl">{title}</h1>
      <span className="mt-5 block h-px w-14 bg-walnut/60" aria-hidden />
      <div className="mt-8 space-y-8 text-[16px] leading-relaxed text-ink-soft [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-ink">{children}</div>
    </div>
  );
}
