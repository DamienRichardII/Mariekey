import Link from "next/link";
import { Button, LinkButton } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteService, importCatalog, setServiceActive } from "./actions";
import { ConfirmButton } from "./confirm-button";
import { Card, Notice, PageHead } from "./_ui";

type Row = { id: string; name: string; price_cents: number; price_is_from: boolean; duration_minutes: number | null; is_active: boolean; category_id: string };

const euros = (c: number) => `${(c / 100).toLocaleString("fr-FR", { minimumFractionDigits: c % 100 ? 2 : 0 })} €`;

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireAdmin();
  const { ok, err } = await searchParams;
  const db = createAdminClient();
  if (!db) {
    return <Card><p role="alert" className="text-danger">Base de données non connectée : ajoutez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sur Vercel.</p></Card>;
  }

  const [{ data: cats }, { data: services, error }] = await Promise.all([
    db.from("service_categories").select("id, name, sort_order").order("sort_order"),
    db.from("services").select("id, name, price_cents, price_is_from, duration_minutes, is_active, category_id").order("sort_order").order("name"),
  ]);
  const rows = (services ?? []) as Row[];

  return (
    <>
      <PageHead
        title="Prestations"
        hint="Prix, durées, descriptions : toute modification apparaît sur le site immédiatement. Les rendez-vous et paiements restent gérés dans Acuity."
        action={<LinkButton href="/admin/prestations/nouvelle">+ Nouvelle prestation</LinkButton>}
      />
      <Notice ok={ok} err={err ?? (error ? `Lecture impossible : ${error.message}` : undefined)} />

      {rows.length === 0 && !error && (
        <Card title="Reprendre le catalogue actuel du site" className="mb-6">
          <p className="mb-4 text-sm text-stone">
            Le site affiche pour l&apos;instant le catalogue Acuity intégré. Importez-le ici une fois pour pouvoir le modifier prestation par prestation.
          </p>
          <form action={importCatalog}><Button type="submit">Importer les prestations actuelles</Button></form>
        </Card>
      )}

      {(cats ?? []).map((c) => {
        const list = rows.filter((r) => r.category_id === c.id);
        if (list.length === 0) return null;
        return (
          <Card key={c.id} title={c.name} className="mb-5">
            <ul className="divide-y divide-line">
              {list.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                  <Link href={`/admin/prestations/${s.id}`} className="min-w-0 flex-1 basis-56">
                    <span className={`block font-medium ${s.is_active ? "text-ink" : "text-stone line-through"}`}>{s.name}</span>
                    <span className="text-sm text-stone">
                      {s.price_is_from ? "à partir de " : ""}{euros(s.price_cents)}{s.duration_minutes ? ` · ${s.duration_minutes} min` : ""}
                      {!s.is_active && " · masquée"}
                    </span>
                  </Link>
                  <LinkButton href={`/admin/prestations/${s.id}`} variant="soft" size="sm">Modifier</LinkButton>
                  <form action={setServiceActive}>
                    <input type="hidden" name="id" value={s.id} />
                    {!s.is_active && <input type="hidden" name="active" value="on" />}
                    <Button type="submit" variant="outline" size="sm">{s.is_active ? "Masquer" : "Afficher"}</Button>
                  </form>
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmButton message={`Supprimer définitivement « ${s.name} » ? (Pour la retirer temporairement, utilisez « Masquer ».)`} variant="ghost" size="sm" className="text-danger">Supprimer</ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </>
  );
}
