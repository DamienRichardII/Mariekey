import type { Metadata } from "next";
import { BookButton } from "@/components/site/book-button";
import { LegalPage } from "@/components/site/legal";

export const metadata: Metadata = { title: "Conditions de réservation", alternates: { canonical: "/conditions-de-reservation" } };

export default function Page() {
  return (
    <LegalPage title="Conditions de réservation">
      <section><h2>Rappel concernant les acomptes</h2>
        <p>Lors de la prise de rendez-vous, il est de votre responsabilité de vérifier attentivement la date et l’horaire sélectionnés avant de valider votre réservation.</p>
        <p>Si une erreur est commise dans le choix de la date et qu’un nouveau rendez-vous doit être pris, un nouvel acompte sera demandé pour la nouvelle réservation.</p>
        <p>Les acomptes versés ne sont ni remboursables ni transférables sur un autre rendez-vous, quelle qu’en soit la raison.</p>
        <p>Merci de votre compréhension et de votre vigilance lors de la réservation.</p>
        <div className="mt-4"><BookButton>Réserver</BookButton></div></section>
    </LegalPage>
  );
}
