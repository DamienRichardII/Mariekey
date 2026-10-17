import Link from "next/link";
import { NAV } from "@/config/site";
import { formatPhoneFR } from "@/lib/utils";
import type { SalonSettings } from "@/lib/db-types";
import { Logo } from "./logo";
import { WhatsAppButton } from "./whatsapp";
import { SocialIcons } from "./social-icons";

type Hours = { day: string; ranges: string[] }[] | null;

export function Footer({ settings, hours }: { settings: SalonSettings | null; hours: Hours }) {
  const hasContact = settings && (settings.phone || settings.email || settings.address || settings.whatsapp);
  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-5">
          <Logo size="md" />
          <SocialIcons social={settings?.social ?? null} className="-ml-3" />
        </div>
        <nav aria-label="Pied de page">
          <h2 className="mb-3 font-serif text-xl">Navigation</h2>
          <ul className="space-y-1 text-[15px] text-ink-soft">
            {NAV.map((i) => (<li key={i.href}><Link href={i.href} className="inline-block py-1.5 hover:text-ink">{i.label}</Link></li>))}
          </ul>
        </nav>
        <div>
          <h2 className="mb-3 font-serif text-xl">Coordonnées</h2>
          {hasContact ? (
            <address className="space-y-1.5 text-[15px] not-italic text-ink-soft">
              {settings.address && <p>{settings.address}</p>}
              {settings.phone && <p><a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-ink">{formatPhoneFR(settings.phone)}</a></p>}
              {settings.email && <p><a href={`mailto:${settings.email}`} className="hover:text-ink">{settings.email}</a></p>}
              {settings.whatsapp && <p className="pt-2"><WhatsAppButton number={settings.whatsapp} variant="outline" label="Devis mariage & événements" className="min-h-11 px-5 text-sm" /></p>}
            </address>
          ) : (
            <p className="text-[15px] text-stone">Coordonnées à venir.</p>
          )}
        </div>
        <div>
          <h2 className="mb-3 font-serif text-xl">Horaires</h2>
          {hours && hours.some((h) => h.ranges.length) ? (
            <dl className="space-y-1 text-[15px] text-ink-soft">
              {hours.map((h) => (
                <div key={h.day} className="flex justify-between gap-4"><dt>{h.day}</dt><dd className="text-right">{h.ranges.length ? h.ranges.join(" · ") : "Fermé"}</dd></div>
              ))}
            </dl>
          ) : (
            <p className="text-[15px] text-stone">Horaires à venir.</p>
          )}
          {settings?.hours_note && <p className="mt-2 text-sm text-stone">{settings.hours_note}</p>}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-stone sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Mariekey Expert</p>
          <ul className="flex flex-wrap gap-x-5">
            <li><Link href="/mentions-legales" className="inline-block py-1.5 hover:text-ink">Mentions légales</Link></li>
            <li><Link href="/confidentialite" className="inline-block py-1.5 hover:text-ink">Confidentialité</Link></li>
            <li><Link href="/conditions-de-reservation" className="inline-block py-1.5 hover:text-ink">Conditions de réservation</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
