import Link from "next/link";
import { Clock } from "lucide-react";
import type { Service } from "@/lib/db-types";
import { formatDuration, formatServicePrice } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";
import { BookButton } from "./book-button";
import { Photo } from "./photo";

export function ServiceCard({ service, fallbackImage }: { service: Service; fallbackImage?: string | null }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift">
      <Link href={`/prestations/${service.slug}`} className="relative block aspect-[4/3] overflow-hidden" aria-label={`Détail : ${service.name}`}>
        <Photo src={service.image_path ?? fallbackImage} alt="" sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          expected={`photo de « ${service.name} »`} className="transition-transform duration-700 group-hover:scale-[1.03]" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {service.service_categories?.name && <p className="text-xs uppercase tracking-[0.2em] text-walnut">{service.service_categories.name}</p>}
        <h3 className="mt-1.5 font-serif text-2xl leading-snug"><Link href={`/prestations/${service.slug}`} className="hover:text-walnut">{service.name}</Link></h3>
        {service.short_description && <p className="mt-2 text-[15px] text-stone">{service.short_description}</p>}
        <div className="mt-4 flex items-center justify-between gap-3 text-[15px]">
          <span className="inline-flex items-center gap-1.5 text-stone"><Clock size={16} aria-hidden />{formatDuration(service.duration_minutes)}</span>
          <span className="font-medium">{formatServicePrice(service.price_cents, service.price_is_from)}</span>
        </div>
        <div className="mt-5 flex gap-3 pt-1">
          <BookButton href={service.booking_url} size="sm" className="flex-1" />
          <LinkButton href={`/prestations/${service.slug}`} variant="outline" size="sm" className="flex-1">Détails</LinkButton>
        </div>
      </div>
    </article>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-line bg-white" aria-hidden>
      <div className="aspect-[4/3] bg-beige/60" />
      <div className="space-y-3 p-5"><div className="h-3 w-1/3 rounded bg-beige" /><div className="h-6 w-2/3 rounded bg-beige" /><div className="h-4 w-full rounded bg-beige/70" /></div>
    </div>
  );
}
