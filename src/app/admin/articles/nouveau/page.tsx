import { requireAdmin } from "@/lib/admin/session";
import { Notice, PageHead } from "../../_ui";
import { ArticleForm } from "../article-form";

export const metadata = { title: "Nouvel article" };

export default async function NewArticle({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  await requireAdmin();
  const { err } = await searchParams;
  return (<><PageHead title="Nouvel article" /><Notice err={err} /><ArticleForm /></>);
}
