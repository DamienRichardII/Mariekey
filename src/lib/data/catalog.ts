import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { STATIC_CATEGORIES } from "@/config/media";
import type { Category, Service } from "@/lib/db-types";

export type CatalogResult<T> = { ok: true; data: T } | { ok: false; reason: "not_configured" | "error" };

export async function getCategories(): Promise<CatalogResult<Category[]>> {
  const db = createPublicClient();
  if (!db) return { ok: true, data: STATIC_CATEGORIES };
  const { data, error } = await db.from("service_categories").select("id, slug, name, image_path, sort_order")
    .eq("is_active", true).order("sort_order").order("name");
  if (error || !data || data.length === 0) return { ok: true, data: STATIC_CATEGORIES };
  // Visuel par défaut pour une catégorie dont l'image n'est pas renseignée en base.
  return { ok: true, data: (data as Category[]).map((c) => ({ ...c, image_path: c.image_path ?? STATIC_CATEGORIES.find((s) => s.slug === c.slug)?.image_path ?? null })) };
}

const SERVICE_COLS =
  "id, category_id, slug, name, short_description, description, duration_minutes, booking_url, price_cents, price_is_from, preparation_notes, image_path, sort_order, service_categories(slug, name), service_options(id, service_id, name, description, price_delta_cents, duration_delta_minutes, sort_order, is_active)";

type RawService = Omit<Service, "service_options"> & {
  service_options?: (NonNullable<Service["service_options"]>[number] & { is_active?: boolean })[];
};

function cleanOptions(s: RawService): Service {
  const options = (s.service_options ?? [])
    .filter((o) => o.is_active !== false)
    .map((o) => ({ id: o.id, service_id: o.service_id, name: o.name, description: o.description, price_delta_cents: o.price_delta_cents, duration_delta_minutes: o.duration_delta_minutes, sort_order: o.sort_order }))
    .sort((a, b) => a.sort_order - b.sort_order);
  return { ...s, service_options: options };
}

export async function getServices(categorySlug?: string): Promise<CatalogResult<Service[]>> {
  const db = createPublicClient();
  if (!db) return { ok: false, reason: "not_configured" };
  let q = db.from("services").select(SERVICE_COLS).eq("is_active", true).order("sort_order").order("name");
  if (categorySlug) {
    const { data: cat } = await db.from("service_categories").select("id").eq("slug", categorySlug).eq("is_active", true).maybeSingle();
    if (!cat) return { ok: true, data: [] };
    q = q.eq("category_id", cat.id);
  }
  const { data, error } = await q;
  if (error) return { ok: false, reason: "error" };
  return { ok: true, data: (data as unknown as RawService[]).map(cleanOptions) };
}

export async function getService(slug: string): Promise<CatalogResult<Service | null>> {
  const db = createPublicClient();
  if (!db) return { ok: false, reason: "not_configured" };
  const { data, error } = await db.from("services").select(SERVICE_COLS).eq("slug", slug).eq("is_active", true).maybeSingle();
  if (error) return { ok: false, reason: "error" };
  return { ok: true, data: data ? cleanOptions(data as unknown as RawService) : null };
}
