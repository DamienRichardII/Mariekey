import type { Metadata } from "next";
import { LegalPage, ToFill } from "@/components/site/legal";
import { getSalonSettings } from "@/lib/data/salon";

export const metadata: Metadata = { title: "Mentions légales", alternates: { canonical: "/mentions-legales" } };
export const revalidate = 60;

export default async function Page() {
  const s = await getSalonSettings();
  const L = s?.legal ?? {};
  const v = (k: string, label: string) => L[k] ?? <ToFill>{label}</ToFill>;
  return (
    <LegalPage title="Mentions légales">
      <section><h2>Éditeur du site</h2>
        <p>Mariekey Expert — salon de coiffure.</p>
        <p>Raison sociale / forme juridique : {v("raison_sociale", "raison sociale et forme juridique")}</p>
        <p>SIRET : {v("siret", "numéro SIRET")}</p>
        <p>Adresse : {s?.address ?? <ToFill>adresse</ToFill>} — code postal : {v("code_postal", "code postal")}</p>
        <p>Directeur de la publication : {v("directeur_publication", "nom")}</p>
        <p>Contact : {s?.email ?? <ToFill>email</ToFill>} — {s?.phone ?? <ToFill>téléphone</ToFill>}</p>
      </section>
      <section><h2>Hébergement</h2><p>Hébergeur : {v("hebergeur", "nom, adresse et contact de l’hébergeur")}</p></section>
      <section><h2>Propriété intellectuelle</h2><p>Les photographies, vidéos, textes et le logo présentés sur ce site appartiennent à Mariekey Expert ou sont utilisés avec autorisation. Toute reproduction sans accord préalable est interdite.</p></section>
    </LegalPage>
  );
}
