import type { Metadata } from "next";
import { LegalPage, ToFill } from "@/components/site/legal";
import { getSalonSettings } from "@/lib/data/salon";

export const metadata: Metadata = { title: "Politique de confidentialité", alternates: { canonical: "/confidentialite" } };
export const revalidate = 60;

export default async function Page() {
  const s = await getSalonSettings();
  return (
    <LegalPage title="Politique de confidentialité">
      <section><h2>Données collectées</h2>
        <p>Ce site vitrine ne comporte ni compte client ni formulaire. La prise de rendez-vous est assurée par Acuity Scheduling (service tiers) : les informations saisies lors de la réservation sont traitées par ce prestataire selon sa propre politique de confidentialité.</p></section>
      <section><h2>Responsable du traitement</h2>
        <p>Mariekey Expert — {s?.email ?? <ToFill>email de contact</ToFill>}</p></section>
      <section><h2>Cookies et mesure d’audience</h2>
        <p>Ce site n’utilise pas de cookie publicitaire. <ToFill>à confirmer si un outil de mesure d’audience est ajouté</ToFill></p></section>
      <section><h2>Vos droits</h2>
        <p>Vous pouvez demander l’accès, la rectification ou la suppression de vos données en écrivant à l’adresse ci-dessus. <ToFill>durée de conservation et mentions complémentaires à valider</ToFill></p></section>
    </LegalPage>
  );
}
