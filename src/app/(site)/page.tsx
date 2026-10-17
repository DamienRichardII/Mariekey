import { Bridal } from "@/components/site/bridal";
import { Hero } from "@/components/site/hero";
import { Reassurance } from "@/components/site/reassurance";
import { Reviews } from "@/components/site/reviews";
import { EventsBand } from "@/components/site/whatsapp";
import { SalonShowcase } from "@/components/site/salon-showcase";
import { getContent } from "@/lib/data/content";
import { getReviews } from "@/lib/data/reviews";
import { getMedia } from "@/lib/data/media";
import { getSalonSettings } from "@/lib/data/salon";
import { SITE } from "@/config/site";

export default async function HomePage() {
  const [salon, settings, t, reviews] = await Promise.all([getMedia("salon"), getSalonSettings(), getContent(), getReviews()]);
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
        <h2 id="bienvenue-title" className="font-serif text-4xl sm:text-5xl">{t["home.welcome.title"]}</h2>
        <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-ink-soft">
          <p>{t["home.welcome.p1"]}</p>
          <p>{t["home.welcome.p2"]}</p>
          <p className="font-serif text-2xl text-ink">{t["home.welcome.tagline"]}</p>
        </div>
      </section>
      <Bridal whatsapp={settings?.whatsapp} t={t} />
      {salon.length > 0 && (
        <section aria-label="Notre salon" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <SalonShowcase items={salon} />
        </section>
      )}
      <Reassurance />
      <EventsBand number={settings?.whatsapp} />
      <Reviews reviews={reviews} title={t["home.reviews.title"]} summary={t["home.reviews.summary"]} />
    </>
  );
}
