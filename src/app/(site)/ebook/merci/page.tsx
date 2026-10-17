import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { isPaidSession } from "@/lib/ebook-access";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Merci", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Merci({ searchParams }: { searchParams: Promise<{ session_id?: string; pdf?: string }> }) {
  const { session_id, pdf } = await searchParams;
  if (!(await isPaidSession(session_id))) redirect("/ebook");
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-walnut">Paiement confirmé</p>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">Merci pour votre achat</h1>
      <p className="mt-6 text-[15px] text-stone">Votre ebook est prêt. Un reçu vous a été envoyé par e-mail par notre prestataire de paiement.</p>
      {pdf === "0" && <p role="status" className="mt-4 text-sm text-danger">Le téléchargement n’est pas disponible pour le moment. Écrivez-nous sur WhatsApp, nous vous l’envoyons rapidement.</p>}
      <a href={`/ebook/telechargement?session_id=${session_id}`} className={cn(buttonVariants({ size: "lg" }), "mt-8")}>Télécharger mon ebook</a>
      <p className="mt-6"><Link href="/" className="text-sm text-walnut underline underline-offset-4">Retour à l’accueil</Link></p>
    </div>
  );
}
