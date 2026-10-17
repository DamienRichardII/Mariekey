import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { CONTENT_GROUPS, type ContentField } from "@/config/content";
import { requireAdmin } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveContentGroup } from "../actions";
import { Card, Notice, PageHead } from "../_ui";

export const metadata = { title: "Textes des pages" };

export default async function TextesPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireAdmin();
  const { ok, err } = await searchParams;
  const { data } = await createAdminClient()!.from("site_content").select("key, value");
  const saved = new Map((data ?? []).map((r) => [r.key as string, r.value as string]));
  return (
    <>
      <PageHead title="Textes des pages" hint="Modifiez les titres et paragraphes du site. Un champ vidé revient au texte d'origine. Les prix et descriptions de prestations se changent dans « Prestations »." />
      <Notice ok={ok} err={err} />
      <div className="space-y-6">
        {CONTENT_GROUPS.map((g) => (
          <Card key={g.id} title={g.title}>
            <form action={saveContentGroup} className="space-y-4">
              <input type="hidden" name="group" value={g.id} />
              {Object.entries(g.fields as Record<string, ContentField>).map(([key, f]) => (
                <Field key={key} label={f.label} htmlFor={key} hint={f.hint}>
                  {f.multiline
                    ? <Textarea id={key} name={key} rows={3} defaultValue={saved.get(key) ?? f.default} maxLength={2000} />
                    : <Input id={key} name={key} defaultValue={saved.get(key) ?? f.default} maxLength={2000} />}
                </Field>
              ))}
              <Button type="submit">Enregistrer</Button>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}
