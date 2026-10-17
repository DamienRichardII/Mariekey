import { MessageCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatPhoneFR, whatsappUrl } from "@/lib/utils";

const DEFAULT_MESSAGE = "Bonjour Mariekey Expert, je souhaite une demande de devis (mariage / événement).";

/** Bouton WhatsApp dédié aux demandes de devis mariage et événements. N'est rendu que si un numéro est configuré. */
export function WhatsAppButton({ number, variant = "primary", className, label = "Devis mariage & événements sur WhatsApp" }: {
  number: string | null | undefined; variant?: "primary" | "outline"; className?: string; label?: string;
}) {
  if (!number) return null;
  return (
    <a href={whatsappUrl(number, DEFAULT_MESSAGE)} target="_blank" rel="noopener noreferrer"
      aria-label={`${label} (nouvel onglet) — ${formatPhoneFR(number)}`}
      className={cn(buttonVariants({ variant, size: "lg" }), "whitespace-normal text-center", className)}>
      <MessageCircle aria-hidden /> {label}
    </a>
  );
}

/** Bandeau d'accueil : mariage & événements. */
export function EventsBand({ number }: { number: string | null | undefined }) {
  if (!number) return null;
  return (
    <section aria-labelledby="events-title" className="bg-ink text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-14 text-center lg:flex-row lg:justify-between lg:gap-10 lg:text-left">
        <div>
          <h2 id="events-title" className="font-serif text-3xl sm:text-4xl">Mariage &amp; événements</h2>
          <p className="mt-2 max-w-xl text-[15px] text-white/75">
            Pour une réservation mariée, une demande de devis ou un événement, contactez-nous directement sur WhatsApp.
          </p>
        </div>
        <WhatsAppButton number={number} variant="outline" label="Demander un devis sur WhatsApp" className="shrink-0 border-white" />
      </div>
    </section>
  );
}
