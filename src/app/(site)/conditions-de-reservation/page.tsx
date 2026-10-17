import type { Metadata } from "next";
import { BookButton } from "@/components/site/book-button";
import { LegalPage, ToFill } from "@/components/site/legal";

export const metadata: Metadata = { title: "Conditions de réservation", alternates: { canonical: "/conditions-de-reservation" } };

export default function Page() {
  return (
    <LegalPage title="Conditions de réservation">
      <section><h2>Réservation</h2>
        <p>Le salon reçoit uniquement sur rendez-vous. Les rendez-vous se réservent en ligne via Acuity Scheduling.</p>
        <div className="mt-4"><BookButton>Réserver</BookButton></div></section>
      <section><h2>Paiement et acompte</h2><p><ToFill>modalités de paiement et éventuel acompte</ToFill></p></section>
      <section><h2>Annulation et déplacement</h2><p><ToFill>délai d’annulation / de déplacement</ToFill></p></section>
      <section><h2>Retard</h2><p><ToFill>politique en cas de retard</ToFill></p></section>
    </LegalPage>
  );
}
