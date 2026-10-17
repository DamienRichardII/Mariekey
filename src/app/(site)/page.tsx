import { BeforeAfter } from "@/components/site/before-after";
import { CategoryCards } from "@/components/site/category-cards";
import { Hero } from "@/components/site/hero";
import { Reassurance } from "@/components/site/reassurance";
import { EventsBand } from "@/components/site/whatsapp";
import { SalonShowcase } from "@/components/site/salon-showcase";
import { ErrorState, SectionTitle } from "@/components/site/states";
import { getCategories } from "@/lib/data/catalog";
import { getBeforeAfterPairs, getMedia } from "@/lib/data/media";
import { getOpeningHours, getSalonSettings } from "@/lib/data/salon";
import { SITE } from "@/config/site";

export default async function HomePage() {
  const [categories, hero, salon, pairs, settings, hours] = await Promise.all([
    getCategories(), getMedia("hero"), getMedia("salon"), getBeforeAfterPairs(), getSalonSettings(), getOpeningHours(),
  ]);
  // Données structurées : uniquement des informations confirmées par le salon.
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const jsonLd = {
    "@context": "https://schema.org", "@type": "HairSalon", name: SITE.name, url: SITE.url,
    ...(settings?.phone && { telephone: settings.phone }),
    ...(settings?.address && { address: { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "FR" } }),
    openingHoursSpecification: (hours ?? []).flatMap((h, i) => {
      const m = h.ranges[0]?.match(/(\d+)h(\d+) – (\d+)h(\d+)/);
      return m ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: days[i], opens: `${m[1]}:${m[2]}`, closes: `${m[3]}:${m[4]}` }] : [];
    }),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero photo={hero[0] ? { path: hero[0].path, alt: hero[0].alt } : null} />
      {categories.ok ? (
        categories.data.length > 0 && <CategoryCards categories={categories.data} />
      ) : (
        <div className="mx-auto max-w-3xl px-4 py-12"><ErrorState reason={categories.reason} /></div>
      )}
      {salon.length > 0 && (
        <section aria-label="Notre salon" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <SalonShowcase items={salon} />
        </section>
      )}
      {pairs.length > 0 && (
        <section aria-labelledby="ba-title" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <SectionTitle><span id="ba-title">Avant / Après</span></SectionTitle>
          <div className="mt-10"><BeforeAfter pairs={pairs.slice(0, 3)} /></div>
        </section>
      )}
      <Reassurance />
      <EventsBand number={settings?.whatsapp} />
    </>
  );
}
