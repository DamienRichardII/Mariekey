import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { requireAdmin } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveCategory } from "../actions";
import { Card, Check, Notice, PageHead } from "../_ui";

export const metadata = { title: "Catégories" };

export default async function Categories({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireAdmin();
  const { ok, err } = await searchParams;
  const { data } = await createAdminClient()!.from("service_categories").select("id, name, sort_order, is_active").order("sort_order");
  return (
    <>
      <PageHead title="Catégories" hint="Les grandes familles de prestations affichées sur la page d'accueil et la page Prestations." />
      <Notice ok={ok} err={err} />
      {(data ?? []).length === 0 && <Card><p className="text-sm text-stone">Aucune catégorie : importez d&apos;abord le catalogue depuis l&apos;onglet Prestations.</p></Card>}
      <div className="space-y-3">
        {(data ?? []).map((c) => (
          <form key={c.id} action={saveCategory} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft">
            <input type="hidden" name="id" value={c.id} />
            <Input name="name" defaultValue={c.name} aria-label="Nom" required className="basis-64 flex-1" />
            <Input name="sort_order" type="number" defaultValue={c.sort_order} aria-label="Ordre" className="w-24" />
            <Check name="is_active" label="Visible" defaultChecked={c.is_active} />
            <Button type="submit" size="sm">Enregistrer</Button>
          </form>
        ))}
      </div>
    </>
  );
}
