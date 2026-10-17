import type { Metadata } from "next";
import { Check } from "lucide-react";
import { BookButton } from "@/components/site/book-button";
import { Photo } from "@/components/site/photo";
import { StatGrid } from "@/components/site/stat-grid";
import { SectionTitle } from "@/components/site/states";
import { WhatsAppButton } from "@/components/site/whatsapp";
import { getServices } from "@/lib/data/catalog";
import { getContent } from "@/lib/data/content";
import { getSalonSettings } from "@/lib/data/salon";
import { formatEUR } from "@/lib/utils";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Formation",
  description: "Formation à l’installation de perruque et au styling avec Marie, qui coiffe depuis 12 ans.",
  alternates: { canonical: "/formation" },
};

export default async function FormationPage() {
  const [services, settings, t] = await Promise.all([getServices("formation"), getSalonSettings(), getContent()]);
  const classes = services.ok ? services.data : [];
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <SectionTitle eyebrow="Formation">Se former avec Marie</SectionTitle>
        <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
          {t["formation.intro"]}
        </p>
      </div>
      <div className="mt-12"><StatGrid items={[{ value: t["stats.years.value"], label: t["stats.years.label"] }]} /></div>

      <section aria-label="Formations" className="mx-auto max-w-5xl space-y-12 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        {classes.map((c) => {
          const lines = (c.description ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
          const intro = lines.find((l) => !l.startsWith("✔") && !l.startsWith("🕘"))?.replace(/^💇\s*/, "");
          const program = lines.filter((l) => l.startsWith("✔")).map((l) => l.replace(/^✔\s*/, ""));
          const hours = lines.find((l) => l.startsWith("🕘"))?.replace(/^🕘\s*/, "");
          return (
            <article key={c.id} className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-beige shadow-soft">
                <Photo src="/images/about/outils.jpg" alt="Outils de coiffure : lisseur, ciseaux, peignes et pinces" sizes="(min-width:1024px) 45vw, 100vw" expected="public/images/about/outils.jpg" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-walnut">Formation</p>
                <h2 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">{c.name}</h2>
                <p className="mt-4 text-[17px] font-medium">{formatEUR(c.price_cents)}{hours && <span className="ml-4 font-normal text-stone">{hours}</span>}</p>
                {intro && <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">{intro}</p>}
                {program.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {program.map((p) => (
                      <li key={p} className="flex gap-3 text-[15px] text-ink-soft"><Check size={18} className="mt-0.5 shrink-0 text-walnut" aria-hidden />{p}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <BookButton href={c.booking_url} size="lg">Réserver cette formation</BookButton>
                  <WhatsAppButton number={settings.whatsapp} variant="outline" label="Poser une question" className="sm:w-auto" />
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
