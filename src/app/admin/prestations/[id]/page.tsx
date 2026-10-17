import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { Notice, PageHead } from "../../_ui";
import { ServiceForm } from "../service-form";

export const metadata = { title: "Modifier une prestation" };

export default async function EditService({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireAdmin();
  const [{ id }, { ok, err }] = await Promise.all([params, searchParams]);
  const db = createAdminClient()!;
  const [{ data: service }, { data: cats }] = await Promise.all([
    db.from("services").select("*").eq("id", id).maybeSingle(),
    db.from("service_categories").select("id, name").order("sort_order"),
  ]);
  if (!service) notFound();
  return (
    <>
      <PageHead title={service.name} hint="Les modifications sont visibles sur le site dès l'enregistrement." />
      <Notice ok={ok} err={err} />
      <ServiceForm values={service} categories={cats ?? []} />
    </>
  );
}
