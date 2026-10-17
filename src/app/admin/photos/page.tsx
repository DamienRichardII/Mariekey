import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { requireAdmin } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { deletePhoto, savePhoto, uploadPhoto } from "../actions";
import { ConfirmButton } from "../confirm-button";
import { Card, Check, Notice, PageHead } from "../_ui";

export const metadata = { title: "Photos" };

const SECTIONS: Record<string, string> = { salon: "Le salon (accueil et À propos)", about: "À propos (atelier, outils)" };

export default async function Photos({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireAdmin();
  const { ok, err } = await searchParams;
  const { data } = await createAdminClient()!.from("media").select("id, section, path, alt, sort_order, is_active")
    .in("section", Object.keys(SECTIONS)).eq("kind", "photo").order("section").order("sort_order");
  const photos = data ?? [];
  return (
    <>
      <PageHead title="Photos" hint="Photos du salon et des outils. Par choix du salon, aucune photo de cliente n'est publiée." />
      <Notice ok={ok} err={err} />
      <Card title="Ajouter une photo" className="mb-6">
        <form action={uploadPhoto} className="grid gap-4 sm:grid-cols-2">
          <Field label="Où l'afficher ?" htmlFor="section">
            <Select id="section" name="section" defaultValue="salon">{Object.entries(SECTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
          </Field>
          <Field label="Fichier (JPG, PNG, WebP — 10 Mo max)" htmlFor="file">
            <Input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="py-2.5" />
          </Field>
          <Field label="Description de la photo" htmlFor="alt" hint="Ex. « Espace lavage du salon, fauteuil noir ». Lue par les lecteurs d'écran." className="sm:col-span-2">
            <Input id="alt" name="alt" required />
          </Field>
          <div className="sm:col-span-2"><Button type="submit">Envoyer la photo</Button></div>
        </form>
        <p className="mt-4 text-sm text-stone">
          Tant qu&apos;aucune photo n&apos;est ajoutée pour une section, le site affiche ses photos d&apos;origine. Dès qu&apos;une photo y est ajoutée, seules les photos listées ci-dessous sont affichées.
        </p>
      </Card>
      {photos.length === 0 && <Card><p className="text-sm text-stone">Aucune photo ajoutée depuis l&apos;administration pour l&apos;instant.</p></Card>}
      <div className="grid gap-4 sm:grid-cols-2">
        {photos.map((p) => (
          <Card key={p.id}>
            {/* eslint-disable-next-line @next/next/no-img-element -- aperçu admin, URL Storage publique */}
            <img src={p.path} alt={p.alt} className="mb-4 aspect-[4/3] w-full rounded-xl object-cover" />
            <form action={savePhoto} className="space-y-3">
              <input type="hidden" name="id" value={p.id} />
              <p className="text-xs uppercase tracking-wide text-stone">{SECTIONS[p.section]}</p>
              <Input name="alt" defaultValue={p.alt} aria-label="Description" />
              <div className="flex flex-wrap items-center gap-3">
                <Input name="sort_order" type="number" defaultValue={p.sort_order} aria-label="Ordre" className="w-24" />
                <Check name="is_active" label="Visible" defaultChecked={p.is_active} />
                <Button type="submit" size="sm" className="ml-auto">Enregistrer</Button>
              </div>
            </form>
            <form action={deletePhoto} className="mt-2">
              <input type="hidden" name="id" value={p.id} />
              <ConfirmButton message="Supprimer définitivement cette photo ?" variant="ghost" size="sm" className="text-danger">Supprimer la photo</ConfirmButton>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}
