import { ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { BookButton } from "./book-button";
import { Logo } from "./logo";
import { Photo } from "./photo";

export function Hero({ photo }: { photo: { path: string; alt: string } | null }) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-cream">
      <div className="grid lg:min-h-[660px] lg:grid-cols-2">
        {/* Photo : en haut sur mobile, à droite sur desktop */}
        <div className="relative order-1 h-[58svh] min-h-[360px] lg:order-2 lg:h-auto">
          <Photo src={photo?.path} alt={photo?.alt ?? "Cliente aux cheveux longs et lisses"} sizes="(min-width:1024px) 50vw, 100vw"
            priority position="50% 18%" expected="public/images/hero/hero.jpg" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cream to-transparent lg:hidden" />
        </div>
        {/* Logo dominant + CTA */}
        <div className="relative z-10 order-2 flex w-full flex-col justify-center px-6 pb-14 pt-2 sm:px-10 lg:order-1 lg:max-w-[42rem] lg:justify-self-end lg:px-12 lg:py-20">
          <h1 id="hero-title" className="-mt-10 lg:mt-0">
            <span className="sr-only">Mariekey Expert — salon de coiffure</span>
            <Logo size="xl" />
          </h1>
          <div className="mt-10 flex max-w-sm flex-col gap-3 lg:mt-12">
            <BookButton size="lg" block>Réserver maintenant <ArrowRight aria-hidden /></BookButton>
            <LinkButton href="/prestations" variant="outline" size="lg" block>Nos prestations</LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
