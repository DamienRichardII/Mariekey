import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { saveArticle } from "../actions";
import { Card, Check } from "../_ui";

export type ArticleValues = {
  id?: string; title?: string; slug?: string; excerpt?: string | null; body?: string; image_path?: string | null;
  image_alt?: string | null; is_published?: boolean; published_at?: string;
};

export function ArticleForm({ values = {} }: { values?: ArticleValues }) {
  const day = (values.published_at ?? new Date().toISOString()).slice(0, 10);
  return (
    <form action={saveArticle} className="space-y-5">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <Card title="Contenu">
        <div className="grid gap-4">
          <Field label="Titre" htmlFor="title"><Input id="title" name="title" defaultValue={values.title} required /></Field>
          <Field label="Résumé" htmlFor="excerpt" hint="Une ou deux phrases, affichées dans la liste des articles et dans Google."><Textarea id="excerpt" name="excerpt" rows={2} defaultValue={values.excerpt ?? ""} /></Field>
          <Field label="Texte de l'article" htmlFor="body" hint="Séparez les paragraphes par une ligne vide. Commencez une ligne par « ## » pour un intertitre.">
            <Textarea id="body" name="body" rows={16} defaultValue={values.body ?? ""} />
          </Field>
        </div>
      </Card>
      <Card title="Image">
        {values.image_path && (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu admin, URL Storage publique
          <img src={values.image_path} alt={values.image_alt ?? ""} className="mb-4 aspect-[16/10] w-full max-w-sm rounded-xl object-cover" />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={values.image_path ? "Remplacer l'image" : "Image (JPG, PNG, WebP — 10 Mo max)"} htmlFor="image">
            <Input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="py-2.5" />
          </Field>
          <Field label="Description de l'image" htmlFor="image_alt" hint="Lue par les lecteurs d'écran.">
            <Input id="image_alt" name="image_alt" defaultValue={values.image_alt ?? ""} />
          </Field>
          {values.image_path && <Check name="remove_image" label="Retirer l'image" />}
        </div>
        <p className="mt-3 text-sm text-stone">Par choix du salon, aucune photo de cliente ne doit être publiée.</p>
      </Card>
      <Card title="Publication">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date de publication" htmlFor="published_at"><Input id="published_at" name="published_at" type="date" defaultValue={day} /></Field>
          <Field label="Adresse de la page (facultatif)" htmlFor="slug" hint="Laissez vide : elle est créée à partir du titre."><Input id="slug" name="slug" defaultValue={values.slug} /></Field>
          <div className="sm:col-span-2"><Check name="is_published" label="Publié sur le site (décoché = brouillon)" defaultChecked={values.is_published ?? false} /></div>
        </div>
      </Card>
      <Button type="submit">Enregistrer</Button>
    </form>
  );
}
