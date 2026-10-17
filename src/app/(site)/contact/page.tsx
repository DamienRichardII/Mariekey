import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { BookButton } from "@/components/site/book-button";
import { SocialIcons } from "@/components/site/social-icons";
import { ErrorState, SectionTitle } from "@/components/site/states";
import { WhatsAppButton } from "@/components/site/whatsapp";
import { getOpeningHours, getSalonSettings } from "@/lib/data/salon";
import { formatPhoneFR, mapsUrl } from "@/lib/utils";

export const revalidate = 60;
export const metadata: Metadata = { title: "Contact", description: "Adresse, téléphone, horaires et réservation de Mariekey Expert à Gentilly.", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const [s, hours] = await Promise.all([getSalonSettings(), getOpeningHours()]);
  if (!s) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState reason="error" /></div>;
  const row = "flex gap-4";
  const icon = "mt-1 shrink-0 text-walnut";
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <SectionTitle eyebrow="Contact">Nous trouver</SectionTitle>
      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <address className="space-y-6 not-italic text-[16px]">
          {s.address && (
            <p className={row}><MapPin size={20} className={icon} aria-hidden />
              <span>{s.address}<br /><a href={mapsUrl(s.address)} target="_blank" rel="noopener noreferrer" className="text-walnut underline underline-offset-4">Itinéraire (Google Maps)<span className="sr-only"> — nouvel onglet</span></a></span></p>
          )}
          {s.phone && <p className={row}><Phone size={20} className={icon} aria-hidden /><a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:text-walnut">{formatPhoneFR(s.phone)}</a></p>}
          {s.email && <p className={row}><Mail size={20} className={icon} aria-hidden /><a href={`mailto:${s.email}`} className="break-all hover:text-walnut">{s.email}</a></p>}
          {hours?.some((h) => h.ranges.length) && (
            <div className={row}><Clock size={20} className={icon} aria-hidden />
              <dl className="w-full max-w-xs space-y-1 text-[15px]">
                {hours.map((h) => <div key={h.day} className="flex justify-between gap-4"><dt>{h.day}</dt><dd className="text-stone">{h.ranges.length ? h.ranges.join(" · ") : "Fermé"}</dd></div>)}
                {s.hours_note && <p className="pt-2 text-sm text-stone">{s.hours_note}</p>}
              </dl>
            </div>
          )}
          <SocialIcons social={s.social} className="-ml-3" />
        </address>
        <div className="space-y-5 rounded-2xl bg-cream p-6 sm:p-8">
          <h2 className="font-serif text-2xl">Prendre rendez-vous</h2>
          <p className="text-[15px] text-stone">La réservation se fait en ligne, sur notre page de rendez-vous.</p>
          <BookButton size="lg" block>Réserver en ligne</BookButton>
          {s.whatsapp && (
            <>
              <h2 className="pt-4 font-serif text-2xl">Mariage &amp; événements</h2>
              <p className="text-[15px] text-stone">Demande de devis et réservations mariée : écrivez-nous sur WhatsApp.</p>
              <WhatsAppButton number={s.whatsapp} className="w-full" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
