import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { getArticles } from "@/lib/data/articles";
import { getServices } from "@/lib/data/catalog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/prestations", "/galerie", "/boutique", "/formation", "/equipe", "/ebook", "/a-propos", "/contact", "/mentions-legales", "/confidentialite", "/conditions-de-reservation"];
  const services = await getServices();
  const detail = services.ok ? services.data.map((s) => `/prestations/${s.slug}`) : [];
  const articles = await getArticles();
  const posts = articles.length ? ["/blog", ...articles.map((a) => `/blog/${a.slug}`)] : [];
  return [...pages, ...detail, ...posts].map((p) => ({ url: `${SITE.url}${p}` }));
}
