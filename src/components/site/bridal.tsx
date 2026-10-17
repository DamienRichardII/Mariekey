import { buttonVariants } from "@/components/ui/button";
import { cn, whatsappUrl } from "@/lib/utils";

const CALL_MESSAGE = "Bonjour Mariekey Expert, je souhaite réserver un appel gratuit pour mon mariage (maquillage / coiffure mariée).";

/** Mise en avant du maquillage et de la coiffure mariée. Le bouton mène à WhatsApp (devis mariage) ; masqué sans numéro. */
export function Bridal({ whatsapp }: { whatsapp: string | null | undefined }) {
  return (
    <section aria-labelledby="mariee-title" className="mx-auto max-w-4xl px-4 pb-14 sm:px-6 lg:pb-20">
      <div className="border border-line bg-white px-6 py-12 sm:px-12 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone">Ma signature</p>
        <h2 id="mariee-title" className="mt-4 font-serif text-4xl sm:text-5xl">Maquillage &amp; Coiffure Mariée</h2>
        <p className="mt-4 font-serif text-2xl italic sm:text-3xl">+300 mariées sublimées</p>
        <div className="mt-6 max-w-2xl space-y-4 text-[16px] leading-relaxed text-stone">
          <p>Le plus beau jour de votre vie mérite un maquillage et une coiffure à la hauteur : un rendu lumineux, sublimé et longue tenue, pensé sur mesure pour votre peau, vos cheveux et votre style.</p>
          <p>Chaque mariée est unique. Réservez un appel gratuit pour échanger sur votre projet et recevoir un devis personnalisé.</p>
        </div>
        {whatsapp && (
          <a href={whatsappUrl(whatsapp, CALL_MESSAGE)} target="_blank" rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "mt-8 whitespace-normal text-center")}>
            Réserver un appel gratuit<span className="sr-only"> sur WhatsApp (nouvel onglet)</span>
          </a>
        )}
      </div>
    </section>
  );
}
