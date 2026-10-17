import { CategoryCards } from "@/components/site/category-cards";
import { Hero } from "@/components/site/hero";
import { Reassurance } from "@/components/site/reassurance";
import { EventsBand } from "@/components/site/whatsapp";
import { SalonShowcase } from "@/components/site/salon-showcase";
import { ErrorState } from "@/components/site/states";
import { getCategories } from "@/lib/data/catalog";
import { getMedia } from "@/lib/data/media";
import { getSalonSettings } from "@/lib/data/salon";
import { SITE } from "@/config/site";

export default async function HomePage() {
  const [categories, salon, settings] = await Promise.all([
    getCategories(), getMedia("salon"), getSalonSettings(),
  ]);
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
      <Reassurance />
      <EventsBand number={settings?.whatsapp} />
    </>
  );
}
