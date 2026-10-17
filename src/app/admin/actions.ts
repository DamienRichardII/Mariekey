"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { STATIC_CATEGORIES, STATIC_SERVICES } from "@/config/catalog";
import { CONTENT_GROUPS, type ContentField } from "@/config/content";
import { STATIC_REVIEWS } from "@/config/reviews";
import { MIN_PASSWORD, cleanEmail, sendRecoveryEmail, setPasswordFromToken, validEmail, verifyEmailLogin } from "@/lib/admin/accounts";
import { endSession, passwordMatches, requireAdmin, startSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const optional = (f: FormData, k: string) => str(f, k) || null;
const bool = (f: FormData, k: string) => f.get(k) === "on";
const int = (f: FormData, k: string, d = 0) => { const n = parseInt(str(f, k), 10); return Number.isFinite(n) ? n : d; };
const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Redirige avec un message (ok ou erreur) affiché en haut de la page. */
function done(path: string, msg: string, error = false): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}${error ? "err" : "ok"}=${encodeURIComponent(msg)}`);
}

function db() {
  const client = createAdminClient();
  if (!client) done("/admin", "La base de données n'est pas connectée (clé Supabase manquante).", true);
  return client;
}

/** Le site public est mis en cache 60 s : on le rafraîchit tout de suite après chaque modification. */
function publish() {
  revalidatePath("/", "layout");
}

// --------------------------------------------------------------------------- session
export async function login(_: unknown, form: FormData) {
  const email = cleanEmail(str(form, "email"));
  const password = String(form.get("password") ?? "");
  const ok = email ? await verifyEmailLogin(email, password) : passwordMatches(password);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 900));
    return { error: email ? "Adresse e-mail ou mot de passe incorrect." : "Mot de passe incorrect." };
  }
  await startSession();
  redirect("/admin");
}

/** « Mot de passe oublié » : réponse identique que l'adresse soit autorisée ou non (pas de fuite d'information). */
export async function requestPasswordReset(_: unknown, form: FormData) {
  const email = cleanEmail(str(form, "email"));
  if (!validEmail(email)) return { error: "Saisissez une adresse e-mail valide." };
  const { rateLimited } = await sendRecoveryEmail(email);
  if (rateLimited) return { error: "Trop de demandes. Réessayez dans une heure." };
  await new Promise((r) => setTimeout(r, 600));
  return { sent: true as const };
}

/** Étape finale du lien reçu par e-mail : crée / remplace le mot de passe puis ouvre la session. */
export async function completePasswordReset(_: unknown, form: FormData) {
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (password.length < MIN_PASSWORD) return { error: `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.` };
  if (password !== confirm) return { error: "Les deux mots de passe ne sont pas identiques." };
  const result = await setPasswordFromToken(str(form, "token"), password);
  if (result === "invalid") return { error: "Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien." };
  if (result === "forbidden") return { error: "Cette adresse n'est pas autorisée à administrer le site." };
  if (result === "error") return { error: "Le mot de passe n'a pas pu être enregistré. Réessayez." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// --------------------------------------------------------------------------- prestations
export async function saveService(form: FormData) {
  await requireAdmin();
  const client = db();
  const id = str(form, "id");
  const name = str(form, "name");
  const euros = parseFloat(str(form, "price").replace(",", "."));
  const back = id ? `/admin/prestations/${id}` : "/admin/prestations/nouvelle";
  if (!name) done(back, "Le nom est obligatoire.", true);
  if (!Number.isFinite(euros) || euros <= 0) done(back, "Le prix doit être un nombre supérieur à 0.", true);
  const category_id = str(form, "category_id");
  if (!category_id) done(back, "Choisissez une catégorie.", true);
  const booking_url = optional(form, "booking_url");
  if (booking_url && !/^https:\/\//.test(booking_url)) done(back, "Le lien de réservation doit commencer par https://", true);
  const duration = int(form, "duration_minutes");
  if (duration < 0 || duration > 720) done(back, "La durée doit être comprise entre 0 et 720 minutes.", true);

  const row = {
    name,
    slug: slugify(str(form, "slug") || name),
    category_id,
    short_description: optional(form, "short_description"),
    description: optional(form, "description"),
    preparation_notes: optional(form, "preparation_notes"),
    duration_minutes: duration > 0 ? duration : null,
    price_cents: Math.round(euros * 100),
    price_is_from: bool(form, "price_is_from"),
    booking_url,
    is_active: bool(form, "is_active"),
    sort_order: int(form, "sort_order"),
  };
  if (!row.slug) done(back, "Nom invalide : impossible de créer l'adresse de la page.", true);

  const { data, error } = id
    ? await client!.from("services").update(row).eq("id", id).select("id").single()
    : await client!.from("services").insert(row).select("id").single();
  if (error) done(back, error.code === "23505" ? "Cette adresse de page (slug) est déjà utilisée." : `Enregistrement impossible : ${error.message}`, true);
  publish();
  done(`/admin/prestations/${data!.id}`, "Prestation enregistrée. Le site est à jour.");
}

export async function setServiceActive(form: FormData) {
  await requireAdmin();
  const { error } = await db()!.from("services").update({ is_active: bool(form, "active") }).eq("id", str(form, "id"));
  if (error) done("/admin/prestations", error.message, true);
  publish();
  done("/admin/prestations", bool(form, "active") ? "Prestation affichée sur le site." : "Prestation masquée du site.");
}

export async function deleteService(form: FormData) {
  await requireAdmin();
  const { error } = await db()!.from("services").delete().eq("id", str(form, "id"));
  if (error) done("/admin/prestations", error.message, true);
  publish();
  done("/admin/prestations", "Prestation supprimée.");
}

/** Copie le catalogue Acuity intégré au site dans la base, pour pouvoir le modifier. Rejouable : met à jour par slug. */
export async function importCatalog() {
  await requireAdmin();
  const client = db()!;
  const { error: e1 } = await client.from("service_categories").upsert(
    STATIC_CATEGORIES.map((c) => ({ slug: c.slug, name: c.name, image_path: c.image_path, sort_order: c.sort_order, is_active: true })),
    { onConflict: "slug" },
  );
  if (e1) done("/admin/prestations", `Import impossible : ${e1.message}`, true);
  const { data: cats } = await client.from("service_categories").select("id, slug");
  const catId = new Map((cats ?? []).map((c) => [c.slug as string, c.id as string]));
  const rows = STATIC_SERVICES.flatMap((s) => {
    const category_id = catId.get(s.service_categories?.slug ?? "");
    if (!category_id) return [];
    return [{
      slug: s.slug, name: s.name, category_id, short_description: s.short_description, description: s.description,
      duration_minutes: s.duration_minutes, price_cents: s.price_cents, price_is_from: s.price_is_from,
      preparation_notes: s.preparation_notes, image_path: s.image_path, booking_url: s.booking_url,
      sort_order: s.sort_order, is_active: true,
    }];
  });
  const { error: e2 } = await client.from("services").upsert(rows, { onConflict: "slug" });
  if (e2) done("/admin/prestations", `Import impossible : ${e2.message}`, true);
  publish();
  done("/admin/prestations", `${rows.length} prestations importées.`);
}

// --------------------------------------------------------------------------- catégories
export async function saveCategory(form: FormData) {
  await requireAdmin();
  const name = str(form, "name");
  if (!name) done("/admin/categories", "Le nom est obligatoire.", true);
  const { error } = await db()!.from("service_categories")
    .update({ name, sort_order: int(form, "sort_order"), is_active: bool(form, "is_active") }).eq("id", str(form, "id"));
  if (error) done("/admin/categories", error.message, true);
  publish();
  done("/admin/categories", "Catégorie enregistrée.");
}

// --------------------------------------------------------------------------- coordonnées du salon
export async function saveSettings(form: FormData) {
  await requireAdmin();
  const social: Record<string, string | null> = {};
  for (const k of ["instagram", "tiktok", "snapchat"]) {
    const v = optional(form, k);
    if (v && !/^https:\/\//.test(v)) done("/admin/salon", `Le lien ${k} doit commencer par https://`, true);
    social[k] = v;
  }
  const legal: Record<string, string | null> = {};
  for (const k of ["raison_sociale", "siret", "code_postal", "directeur_publication", "hebergeur"]) legal[k] = optional(form, k);
  const { error } = await db()!.from("salon_settings").upsert({
    id: true, phone: optional(form, "phone"), email: optional(form, "email"), whatsapp: optional(form, "whatsapp"),
    address: optional(form, "address"), hours_note: optional(form, "hours_note"), social, legal,
  });
  if (error) done("/admin/salon", error.message, true);
  publish();
  done("/admin/salon", "Informations du salon enregistrées.");
}

// --------------------------------------------------------------------------- photos
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadPhoto(form: FormData) {
  await requireAdmin();
  const file = form.get("file");
  const section = str(form, "section");
  if (!["salon", "about"].includes(section)) done("/admin/photos", "Section inconnue.", true);
  if (!(file instanceof File) || file.size === 0) done("/admin/photos", "Choisissez une photo.", true);
  const f = file as File;
  if (!IMAGE_TYPES.includes(f.type)) done("/admin/photos", "Format accepté : JPG, PNG, WebP ou AVIF.", true);
  if (f.size > 10 * 1024 * 1024) done("/admin/photos", "La photo dépasse 10 Mo : réduisez-la avant de l'envoyer.", true);
  const alt = str(form, "alt");
  if (!alt) done("/admin/photos", "Décrivez la photo en quelques mots (texte alternatif, utile à l'accessibilité).", true);

  const client = db()!;
  const ext = f.type.split("/")[1];
  const key = `${section}/${Date.now()}-${slugify(f.name.replace(/\.[^.]+$/, "")) || "photo"}.${ext}`;
  const up = await client.storage.from("site-media").upload(key, f, { contentType: f.type, upsert: false });
  if (up.error) done("/admin/photos", `Envoi impossible : ${up.error.message}`, true);
  const { data: pub } = client.storage.from("site-media").getPublicUrl(key);
  const { data: last } = await client.from("media").select("sort_order").eq("section", section)
    .order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await client.from("media").insert({
    kind: "photo", section, path: pub.publicUrl, alt, sort_order: (last?.sort_order ?? 0) + 1, is_active: true,
  });
  if (error) done("/admin/photos", error.message, true);
  publish();
  done("/admin/photos", "Photo ajoutée.");
}

export async function savePhoto(form: FormData) {
  await requireAdmin();
  const { error } = await db()!.from("media")
    .update({ alt: str(form, "alt"), sort_order: int(form, "sort_order"), is_active: bool(form, "is_active") }).eq("id", str(form, "id"));
  if (error) done("/admin/photos", error.message, true);
  publish();
  done("/admin/photos", "Photo mise à jour.");
}

export async function deletePhoto(form: FormData) {
  await requireAdmin();
  const client = db()!;
  const id = str(form, "id");
  const { data } = await client.from("media").select("path").eq("id", id).maybeSingle();
  const { error } = await client.from("media").delete().eq("id", id);
  if (error) done("/admin/photos", error.message, true);
  const marker = "/object/public/site-media/";
  const at = data?.path?.indexOf(marker) ?? -1;
  if (data && at >= 0) await client.storage.from("site-media").remove([decodeURIComponent(data.path.slice(at + marker.length))]);
  publish();
  done("/admin/photos", "Photo supprimée.");
}

// --------------------------------------------------------------------------- textes des pages
export async function saveContentGroup(form: FormData) {
  await requireAdmin();
  const group = CONTENT_GROUPS.find((g) => g.id === str(form, "group"));
  if (!group) done("/admin/textes", "Groupe de textes inconnu.", true);
  const fields = Object.entries(group!.fields as Record<string, ContentField>);
  const set: { key: string; value: string; updated_at: string }[] = [];
  const reset: string[] = [];
  for (const [key, f] of fields) {
    const value = str(form, key);
    if (value.length > 2000) done("/admin/textes", `« ${f.label} » est trop long (2000 caractères maximum).`, true);
    // Vide ou identique au texte d'origine : on supprime la ligne, le site reprend le texte d'origine.
    if (!value || value === f.default) reset.push(key);
    else set.push({ key, value, updated_at: new Date().toISOString() });
  }
  const client = db()!;
  if (set.length) {
    const { error } = await client.from("site_content").upsert(set, { onConflict: "key" });
    if (error) done("/admin/textes", error.message, true);
  }
  if (reset.length) {
    const { error } = await client.from("site_content").delete().in("key", reset);
    if (error) done("/admin/textes", error.message, true);
  }
  publish();
  done("/admin/textes", `« ${group!.title} » enregistré. Le site est à jour.`);
}

// --------------------------------------------------------------------------- avis
export async function saveReview(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const author = str(form, "author");
  const body = str(form, "body");
  if (!author || !body) done("/admin/avis", "Le nom et le texte de l'avis sont obligatoires.", true);
  const rating = Math.min(5, Math.max(1, int(form, "rating", 5)));
  const row = { author, body, rating, source: str(form, "source") || "Google", is_active: bool(form, "is_active"), sort_order: int(form, "sort_order") };
  const client = db()!;
  const { error } = id ? await client.from("reviews").update(row).eq("id", id) : await client.from("reviews").insert(row);
  if (error) done("/admin/avis", error.message, true);
  publish();
  done("/admin/avis", id ? "Avis enregistré." : "Avis ajouté.");
}

export async function deleteReview(form: FormData) {
  await requireAdmin();
  const { error } = await db()!.from("reviews").delete().eq("id", str(form, "id"));
  if (error) done("/admin/avis", error.message, true);
  publish();
  done("/admin/avis", "Avis supprimé.");
}

/** Copie les avis actuellement affichés sur le site dans la base, pour pouvoir les modifier. */
export async function importReviews() {
  await requireAdmin();
  const client = db()!;
  const { count } = await client.from("reviews").select("id", { count: "exact", head: true });
  if (count) done("/admin/avis", "Des avis existent déjà : import ignoré.", true);
  const { error } = await client.from("reviews").insert(STATIC_REVIEWS.map((r, i) => ({ author: r.author, body: r.body, rating: r.rating, source: r.source, sort_order: i + 1, is_active: true })));
  if (error) done("/admin/avis", error.message, true);
  publish();
  done("/admin/avis", "Avis importés.");
}

// --------------------------------------------------------------------------- articles
export async function saveArticle(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const back = id ? `/admin/articles/${id}` : "/admin/articles/nouveau";
  const title = str(form, "title");
  if (!title) done(back, "Le titre est obligatoire.", true);
  const slug = slugify(str(form, "slug") || title);
  if (!slug) done(back, "Titre invalide : impossible de créer l'adresse de l'article.", true);
  const day = /^\d{4}-\d{2}-\d{2}$/.test(str(form, "published_at")) ? str(form, "published_at") : new Date().toISOString().slice(0, 10);
  const client = db()!;

  const row: Record<string, unknown> = {
    title, slug, excerpt: optional(form, "excerpt"), body: str(form, "body"), image_alt: optional(form, "image_alt"),
    is_published: bool(form, "is_published"), published_at: `${day}T00:00:00Z`, updated_at: new Date().toISOString(),
  };

  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    if (!IMAGE_TYPES.includes(file.type)) done(back, "Format d'image accepté : JPG, PNG, WebP ou AVIF.", true);
    if (file.size > 10 * 1024 * 1024) done(back, "L'image dépasse 10 Mo : réduisez-la avant de l'envoyer.", true);
    const key = `articles/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, "")) || "image"}.${file.type.split("/")[1]}`;
    const up = await client.storage.from("site-media").upload(key, file, { contentType: file.type, upsert: false });
    if (up.error) done(back, `Envoi de l'image impossible : ${up.error.message}`, true);
    row.image_path = client.storage.from("site-media").getPublicUrl(key).data.publicUrl;
  } else if (bool(form, "remove_image")) {
    row.image_path = null;
  }

  const { data, error } = id
    ? await client.from("articles").update(row).eq("id", id).select("id").single()
    : await client.from("articles").insert(row).select("id").single();
  if (error) done(back, error.code === "23505" ? "Cette adresse (slug) est déjà utilisée par un autre article." : `Enregistrement impossible : ${error.message}`, true);
  publish();
  done(`/admin/articles/${data!.id}`, row.is_published ? "Article enregistré et publié sur le site." : "Brouillon enregistré (non visible sur le site).");
}

export async function deleteArticle(form: FormData) {
  await requireAdmin();
  const { error } = await db()!.from("articles").delete().eq("id", str(form, "id"));
  if (error) done("/admin/articles", error.message, true);
  publish();
  done("/admin/articles", "Article supprimé.");
}
