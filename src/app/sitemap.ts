import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { getServices } from "@/lib/data/catalog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/prestations", "/galerie", "/a-propos", "/contact", "/mentions-legales", "/confidentialite", "/conditions-de-reservation"];
  const services = await getServices();
  const detail = services.ok ? services.data.map((s) => `/prestations/${s.slug}`) : [];
  return [...pages, ...detail].map((p) => ({ url: `${SITE.url}${p}` }));
}
