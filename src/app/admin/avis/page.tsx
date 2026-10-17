import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { requireAdmin } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteReview, importReviews, saveReview } from "../actions";
import { ConfirmButton } from "../confirm-button";
import { Card, Check, Notice, PageHead } from "../_ui";

export const metadata = { title: "Avis" };

type Row = { id: string; author: string; body: string; rating: number; source: string; is_active: boolean; sort_order: number };

function ReviewFields({ r }: { r?: Row }) {
  const k = r?.id ?? "new";
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {r && <input type="hidden" name="id" value={r.id} />}
      <Field label="Nom (ou prénom + initiale)" htmlFor={`a-${k}`}><Input id={`a-${k}`} name="author" defaultValue={r?.author} required /></Field>
      <Field label="Source" htmlFor={`s-${k}`}><Input id={`s-${k}`} name="source" defaultValue={r?.source ?? "Google"} /></Field>
      <Field label="Texte de l'avis" htmlFor={`b-${k}`} hint="Reprenez le texte exact du client. Une ligne vide ou un retour à la ligne crée un nouveau paragraphe." className="sm:col-span-2">
        <Textarea id={`b-${k}`} name="body" rows={5} defaultValue={r?.body} required />
      </Field>
      <Field label="Note" htmlFor={`r-${k}`}>
        <Select id={`r-${k}`} name="rating" defaultValue={String(r?.rating ?? 5)}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}</Select>
      </Field>
      <Field label="Ordre" htmlFor={`o-${k}`} hint="Petit nombre = affiché en premier."><Input id={`o-${k}`} name="sort_order" type="number" defaultValue={r?.sort_order ?? 0} /></Field>
      <div className="sm:col-span-2"><Check name="is_active" label="Visible sur le site" defaultChecked={r?.is_active ?? true} /></div>
    </div>
  );
}

export default async function AvisPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireAdmin();
  const { ok, err } = await searchParams;
  const { data } = await createAdminClient()!.from("reviews").select("id, author, body, rating, source, is_active, sort_order").order("sort_order").order("created_at");
  const rows = (data ?? []) as Row[];
  return (
    <>
      <PageHead title="Avis clients" hint="Avis affichés sur l'accueil. N'ajoutez que de vrais avis, avec l'accord de leurs auteurs. La note globale (« 5/5 · 2 avis Google ») se change dans « Textes »." />
      <Notice ok={ok} err={err} />
      {rows.length === 0 && (
        <Card title="Reprendre les avis actuels du site" className="mb-6">
          <p className="mb-4 text-sm text-stone">Le site affiche deux avis intégrés. Importez-les une fois pour pouvoir les modifier, les masquer ou en ajouter d&apos;autres.</p>
          <form action={importReviews}><Button type="submit">Importer les avis actuels</Button></form>
        </Card>
      )}
      <Card title="Ajouter un avis" className="mb-6">
        <form action={saveReview} className="space-y-4"><ReviewFields /><Button type="submit">Ajouter l&apos;avis</Button></form>
      </Card>
      <div className="space-y-5">
        {rows.map((r) => (
          <Card key={r.id} title={`${r.author}${r.is_active ? "" : " (masqué)"}`}>
            <form action={saveReview} className="space-y-4"><ReviewFields r={r} /><Button type="submit" size="sm">Enregistrer</Button></form>
            <form action={deleteReview} className="mt-2">
              <input type="hidden" name="id" value={r.id} />
              <ConfirmButton message={`Supprimer l'avis de « ${r.author} » ?`} variant="ghost" size="sm" className="text-danger">Supprimer</ConfirmButton>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}
