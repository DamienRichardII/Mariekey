import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-walnut">Erreur 404</p>
      <h1 className="mt-3 font-serif text-5xl">Page introuvable</h1>
      <p className="mt-3 text-stone">La page demandée n&apos;existe pas ou a été déplacée.</p>
      <LinkButton href="/" className="mt-8">Retour à l&apos;accueil</LinkButton>
    </div>
  );
}
