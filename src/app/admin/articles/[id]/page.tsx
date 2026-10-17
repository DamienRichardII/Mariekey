import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteArticle } from "../../actions";
import { ConfirmButton } from "../../confirm-button";
import { Notice, PageHead } from "../../_ui";
import { ArticleForm } from "../article-form";

export const metadata = { title: "Modifier un article" };

export default async function EditArticle({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireAdmin();
  const [{ id }, { ok, err }] = await Promise.all([params, searchParams]);
  const { data } = await createAdminClient()!.from("articles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <PageHead title={data.title} />
      <Notice ok={ok} err={err} />
      <ArticleForm values={data} />
      <form action={deleteArticle} className="mt-6">
        <input type="hidden" name="id" value={data.id} />
        <ConfirmButton message={`Supprimer définitivement « ${data.title} » ?`} variant="ghost" size="sm" className="text-danger">Supprimer l&apos;article</ConfirmButton>
      </form>
    </>
  );
}
