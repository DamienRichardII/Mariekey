import { requireAdmin } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { Notice, PageHead } from "../../_ui";
import { ServiceForm } from "../service-form";

export const metadata = { title: "Nouvelle prestation" };

export default async function NewService({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  await requireAdmin();
  const { err } = await searchParams;
  const { data } = await createAdminClient()!.from("service_categories").select("id, name").order("sort_order");
  return (
    <>
      <PageHead title="Nouvelle prestation" />
      <Notice err={err} />
      <ServiceForm categories={data ?? []} />
    </>
  );
}
