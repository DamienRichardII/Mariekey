import { Field, Input, Textarea } from "@/components/ui/field";
import { getSalonSettings } from "@/lib/data/salon";
import { requireAdmin } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveSettings } from "../actions";
import { Card, Notice, PageHead, Save } from "../_ui";

export const metadata = { title: "Infos du salon" };

export default async function Salon({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireAdmin();
  const { ok, err } = await searchParams;
  // Lecture directe (sans cache) pour afficher ce qui est réellement enregistré.
  const { data } = await createAdminClient()!.from("salon_settings").select("*").limit(1).maybeSingle();
  const s = data ?? (await getSalonSettings());
  const social = (s.social ?? {}) as Record<string, string | null>;
  const legal = (s.legal ?? {}) as Record<string, string | null>;
  return (
    <>
      <PageHead title="Infos du salon" hint="Coordonnées, réseaux sociaux et mentions légales affichés dans le pied de page et la page Contact." />
      <Notice ok={ok} err={err} />
      <form action={saveSettings} className="space-y-5">
        <Card title="Coordonnées">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Téléphone" htmlFor="phone"><Input id="phone" name="phone" type="tel" defaultValue={s.phone ?? ""} /></Field>
            <Field label="WhatsApp (devis mariage / événements)" htmlFor="whatsapp"><Input id="whatsapp" name="whatsapp" type="tel" defaultValue={s.whatsapp ?? ""} /></Field>
            <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" defaultValue={s.email ?? ""} /></Field>
            <Field label="Adresse" htmlFor="address"><Input id="address" name="address" defaultValue={s.address ?? ""} /></Field>
            <Field label="Note sur les horaires" htmlFor="hours_note" className="sm:col-span-2"><Textarea id="hours_note" name="hours_note" defaultValue={s.hours_note ?? ""} className="min-h-20" /></Field>
          </div>
        </Card>
        <Card title="Réseaux sociaux">
          <p className="mb-4 text-sm text-stone">Une icône n&apos;apparaît sur le site que si le lien est renseigné.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {(["instagram", "tiktok", "snapchat"] as const).map((k) => (
              <Field key={k} label={k[0].toUpperCase() + k.slice(1)} htmlFor={k}><Input id={k} name={k} type="url" placeholder="https://…" defaultValue={social[k] ?? ""} /></Field>
            ))}
          </div>
        </Card>
        <Card title="Mentions légales">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Raison sociale et forme juridique" htmlFor="raison_sociale"><Input id="raison_sociale" name="raison_sociale" defaultValue={legal.raison_sociale ?? ""} /></Field>
            <Field label="SIRET" htmlFor="siret"><Input id="siret" name="siret" defaultValue={legal.siret ?? ""} /></Field>
            <Field label="Code postal" htmlFor="code_postal"><Input id="code_postal" name="code_postal" defaultValue={legal.code_postal ?? ""} /></Field>
            <Field label="Directeur de la publication" htmlFor="directeur_publication"><Input id="directeur_publication" name="directeur_publication" defaultValue={legal.directeur_publication ?? ""} /></Field>
            <Field label="Hébergeur" htmlFor="hebergeur" className="sm:col-span-2"><Input id="hebergeur" name="hebergeur" defaultValue={legal.hebergeur ?? ""} /></Field>
          </div>
        </Card>
        <Save />
      </form>
    </>
  );
}
