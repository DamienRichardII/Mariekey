import { MessageCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn, whatsappUrl } from "@/lib/utils";
import { BookButton } from "./book-button";
import { Photo } from "./photo";

const QUOTE_MESSAGE = "Bonjour Mariekey Expert, je souhaite une demande de devis.";

/**
 * Couverture : façade du salon. Mobile : photo (enseigne centrée) puis les deux CTA sur fond crème.
 * Desktop : photo plein écran, CTA centrés en bas (Réserver → Acuity, Demander un devis → WhatsApp).
 */
export function Hero({ whatsapp }: { whatsapp: string | null | undefined }) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate bg-cream">
      <h1 id="hero-title" className="sr-only">Mariekey Expert — salon de coiffure à Gentilly</h1>
      <div className="relative h-[42svh] min-h-[260px] lg:h-[calc(100svh-72px)] lg:max-h-[820px]">
        <Photo src="/images/hero/cover.jpg" alt="Façade du salon Mariekey Expert, enseigne lumineuse et vitrine aux rideaux clairs"
          sizes="100vw" priority className="object-[50%_20%] lg:object-[50%_0%]" expected="public/images/hero/cover.jpg" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 hidden h-2/5 bg-gradient-to-t from-black/45 to-transparent lg:block" />
      </div>
      <div className="flex flex-col items-center gap-3 px-6 py-8 sm:flex-row sm:justify-center sm:gap-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:pb-14 lg:pt-0">
        <BookButton size="lg" className="w-full max-w-xs ring-1 ring-white/70 sm:w-auto sm:min-w-52">Réserver</BookButton>
        {whatsapp && (
          <a href={whatsappUrl(whatsapp, QUOTE_MESSAGE)} target="_blank" rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full max-w-xs sm:w-auto sm:min-w-52")}>
            <MessageCircle aria-hidden /> Demander un devis<span className="sr-only"> sur WhatsApp (nouvel onglet)</span>
          </a>
        )}
      </div>
    </section>
  );
}
