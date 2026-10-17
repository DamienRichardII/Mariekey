import { Bridal } from "@/components/site/bridal";
import { Hero } from "@/components/site/hero";
import { Reassurance } from "@/components/site/reassurance";
import { Reviews } from "@/components/site/reviews";
import { EventsBand } from "@/components/site/whatsapp";
import { SalonShowcase } from "@/components/site/salon-showcase";
import { getMedia } from "@/lib/data/media";
import { getSalonSettings } from "@/lib/data/salon";
import { SITE } from "@/config/site";

export default async function HomePage() {
  const [salon, settings] = await Promise.all([getMedia("salon"), getSalonSettings()]);
  // Données structurées : uniquement des informations confirmées par le salon.
  const jsonLd = {
    "@context": "https://schema.org", "@type": "HairSalon", name: SITE.name, url: SITE.url,
    ...(settings?.phone && { telephone: settings.phone }),
    ...(settings?.address && { address: { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "FR" } }),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero whatsapp={settings.whatsapp} />
      <section aria-labelledby="bienvenue-title" className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:py-20">
        <h2 id="bienvenue-title" className="font-serif text-4xl sm:text-5xl">Bienvenue chez MarieKey Expert</h2>
        <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-ink-soft">
          <p>Passionnée par la beauté et la mise en valeur de la féminité, je vous accueille dans mon univers dédié à la coiffure et au maquillage professionnel.</p>
          <p>Spécialisée en coiffure, maquillage et personnalisation de perruques, je vous accompagne également lors de vos plus beaux événements.</p>
          <p className="font-serif text-2xl text-ink">MarieKey Expert, votre beauté, notre signature.</p>
        </div>
      </section>
      <Bridal whatsapp={settings?.whatsapp} />
      {salon.length > 0 && (
        <section aria-label="Notre salon" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <SalonShowcase items={salon} />
        </section>
      )}
      <Reassurance />
      <EventsBand number={settings?.whatsapp} />
      <Reviews />
    </>
  );
}
