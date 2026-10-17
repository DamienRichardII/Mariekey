import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { saveService } from "../actions";
import { Card, Check } from "../_ui";

export type ServiceValues = {
  id?: string; name?: string; slug?: string; category_id?: string; short_description?: string | null; description?: string | null;
  preparation_notes?: string | null; duration_minutes?: number | null; price_cents?: number; price_is_from?: boolean;
  booking_url?: string | null; is_active?: boolean; sort_order?: number;
};

export function ServiceForm({ values = {}, categories }: { values?: ServiceValues; categories: { id: string; name: string }[] }) {
  return (
    <form action={saveService} className="space-y-5">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <Card title="L'essentiel">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom de la prestation" htmlFor="name" className="sm:col-span-2">
            <Input id="name" name="name" defaultValue={values.name} required />
          </Field>
          <Field label="Catégorie" htmlFor="category_id">
            <Select id="category_id" name="category_id" defaultValue={values.category_id ?? ""} required>
              <option value="" disabled>Choisir…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Ordre d'affichage" htmlFor="sort_order" hint="Petit nombre = affichée en premier.">
            <Input id="sort_order" name="sort_order" type="number" defaultValue={values.sort_order ?? 0} />
          </Field>
          <Field label="Prix (€)" htmlFor="price">
            <Input id="price" name="price" inputMode="decimal" defaultValue={values.price_cents ? String(values.price_cents / 100).replace(".", ",") : ""} required />
          </Field>
          <Field label="Durée (minutes)" htmlFor="duration_minutes" hint="Laisser vide pour ne pas afficher de durée.">
            <Input id="duration_minutes" name="duration_minutes" type="number" min={0} max={720} defaultValue={values.duration_minutes ?? ""} />
          </Field>
          <Check name="price_is_from" label="Afficher « à partir de » devant le prix" defaultChecked={values.price_is_from} />
          <Check name="is_active" label="Visible sur le site" defaultChecked={values.is_active ?? true} />
        </div>
      </Card>
      <Card title="Textes">
        <div className="space-y-4">
          <Field label="Résumé (carte de la liste)" htmlFor="short_description"><Textarea id="short_description" name="short_description" defaultValue={values.short_description ?? ""} className="min-h-20" /></Field>
          <Field label="Description complète" htmlFor="description"><Textarea id="description" name="description" defaultValue={values.description ?? ""} /></Field>
          <Field label="Avant le rendez-vous (préparation)" htmlFor="preparation_notes"><Textarea id="preparation_notes" name="preparation_notes" defaultValue={values.preparation_notes ?? ""} className="min-h-20" /></Field>
        </div>
      </Card>
      <Card title="Réservation et adresse de la page">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lien Acuity direct (facultatif)" htmlFor="booking_url" hint="Lien du rendez-vous dans Acuity ; sinon le lien général du salon est utilisé.">
            <Input id="booking_url" name="booking_url" type="url" placeholder="https://…" defaultValue={values.booking_url ?? ""} />
          </Field>
          <Field label="Adresse de la page (facultatif)" htmlFor="slug" hint="Générée depuis le nom si vide. À ne pas changer une fois la prestation partagée.">
            <Input id="slug" name="slug" defaultValue={values.slug} />
          </Field>
        </div>
      </Card>
      <div className="sticky bottom-0 -mx-4 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur">
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  );
}
