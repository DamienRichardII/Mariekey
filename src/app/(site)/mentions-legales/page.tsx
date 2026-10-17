import type { Metadata } from "next";
import { LegalPage, ToFill } from "@/components/site/legal";
import { getSalonSettings } from "@/lib/data/salon";

export const metadata: Metadata = { title: "Mentions légales", alternates: { canonical: "/mentions-legales" } };
export const revalidate = 60;

export default async function Page() {
  const s = await getSalonSettings();
  return (
    <LegalPage title="Mentions légales">
      <section><h2>Éditeur du site</h2>
        <p>Mariekey Expert — salon de coiffure.</p>
        <p>Adresse : {s?.address ?? <ToFill>adresse</ToFill>}</p>
        <p>Contact : {s?.email ?? <ToFill>email</ToFill>} — {s?.phone ?? <ToFill>téléphone</ToFill>}</p>
      </section>
      <section><h2>Propriété intellectuelle</h2><p>Les photographies, vidéos, textes et le logo présentés sur ce site appartiennent à Mariekey Expert ou sont utilisés avec autorisation. Toute reproduction sans accord préalable est interdite.</p></section>
    </LegalPage>
  );
}
