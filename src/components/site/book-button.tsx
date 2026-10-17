import { buttonVariants } from "@/components/ui/button";
import { BOOKING_URL } from "@/config/site";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

/** Bouton « Réserver » : ouvre la page de réservation Acuity (lien direct de la prestation si renseigné). */
export function BookButton({
  href, children = "Réserver", className, variant, size, block,
}: VariantProps<typeof buttonVariants> & { href?: string | null; children?: React.ReactNode; className?: string }) {
  return (
    <a href={href || BOOKING_URL} target="_blank" rel="noopener noreferrer"
      className={cn(buttonVariants({ variant, size, block }), className)}>
      {children}<span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
    </a>
  );
}
