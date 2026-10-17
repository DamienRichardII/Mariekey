import type { Metadata } from "next";
import { BookButton } from "@/components/site/book-button";
import { Photo } from "@/components/site/photo";
import { SalonShowcase } from "@/components/site/salon-showcase";
import { SectionTitle } from "@/components/site/states";
import { BAR_MENU } from "@/config/bar-menu";
import { getMedia } from "@/lib/data/media";
import { getSalonSettings } from "@/lib/data/salon";

export const revalidate = 60;
export const metadata: Metadata = { title: "À propos", description: "Le salon Mariekey Expert à Gentilly : cadre, accueil et MKy Le Bar.", alternates: { canonical: "/a-propos" } };

export default async function AboutPage() {
  const [salon, about, settings] = await Promise.all([getMedia("salon"), getMedia("about"), getSalonSettings()]);
  const tools = about[0];
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <SectionTitle eyebrow="À propos">Mariekey Expert</SectionTitle>
      <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
        Salon de coiffure situé{settings?.address ? ` au ${settings.address}` : " à Gentilly (94)"}, ouvert uniquement sur rendez-vous.
      </p>

      {salon.length > 0 && <section aria-label="Le salon" className="mt-14"><SalonShowcase items={salon} /></section>}

      <section aria-labelledby="bar-title" className="mt-20 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionTitle eyebrow="Pendant votre visite"><span id="bar-title">{BAR_MENU.title}</span></SectionTitle>
          <div className="mt-8 grid gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {BAR_MENU.sections.map((s) => (
              <div key={s.title}>
                <h3 className="font-serif text-xl">{s.title}</h3>
                <ul className="mt-2 space-y-1 text-[15px] text-ink-soft">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-stone">{BAR_MENU.note}</p>
        </div>
        {tools && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-beige shadow-soft">
            <Photo src={tools.path} alt={tools.alt} sizes="(min-width:1024px) 45vw, 100vw" expected="public/images/about/outils.jpg" />
          </div>
        )}
      </section>

      <section aria-labelledby="shop-title" className="mt-20 rounded-2xl bg-cream px-6 py-12 text-center">
        <h2 id="shop-title" className="font-serif text-3xl">Boutique</h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-stone">Bientôt disponible.</p>
      </section>

      <div className="mt-14 flex justify-center"><BookButton size="lg">Réserver mon rendez-vous</BookButton></div>
    </div>
  );
}
