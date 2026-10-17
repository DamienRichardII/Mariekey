import { expect, test } from "@playwright/test";

const ACUITY = "https://app.acuityscheduling.com/schedule.php?owner=32171214";
const PAGES = ["/", "/prestations", "/galerie", "/boutique", "/formation", "/equipe", "/ebook", "/blog", "/a-propos", "/contact", "/mentions-legales", "/confidentialite", "/conditions-de-reservation"];

for (const path of PAGES) {
  test(`${path} : se charge sans débordement horizontal`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1, h2").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("tous les boutons Réserver ouvrent Acuity", async ({ page }) => {
  for (const path of ["/", "/contact", "/galerie", "/a-propos"]) {
    await page.goto(path);
    const links = page.getByRole("link", { name: /^Réserver/ });
    await expect(links.first()).toBeVisible();
    for (const l of await links.all()) {
      // « Réserver un appel gratuit » (mariées) passe par WhatsApp : testé séparément.
      if (/appel gratuit/.test((await l.textContent()) ?? "")) continue;
      await expect(l).toHaveAttribute("href", ACUITY);
      await expect(l).toHaveAttribute("target", "_blank");
      await expect(l).toHaveAttribute("rel", /noopener/);
    }
  }
});

test("aucun parcours natif de réservation, paiement ou compte", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href^="/reserver"], a[href^="/mon-compte"], a[href^="/connexion"]')).toHaveCount(0);
  await expect(page.getByText(/paiement sécurisé|espace client/i)).toHaveCount(0);
});

test("WhatsApp dédié devis mariage / événements", async ({ page }) => {
  await page.goto("/contact");
  const wa = page.locator('a[href^="https://wa.me/"]').first();
  await expect(wa).toHaveAttribute("href", /wa\.me\/33613424089/);
});

test("mentions légales : plus de champs SIRET / hébergeur à compléter", async ({ page }) => {
  await page.goto("/mentions-legales");
  await expect(page.getByText(/SIRET|Hébergeur|Raison sociale|Directeur de la publication/)).toHaveCount(0);
});

test("conditions de réservation : rappel concernant les acomptes", async ({ page }) => {
  await page.goto("/conditions-de-reservation");
  await expect(page.getByText(/ne sont ni remboursables ni transférables/)).toBeVisible();
});

test("la galerie ouvre une photo en modale puis se ferme", async ({ page }) => {
  await page.goto("/galerie");
  await page.getByRole("button", { name: /^Agrandir/ }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("prestations : 20 prestations Acuity en 6 catégories, prix affichés", async ({ page }) => {
  await page.goto("/prestations");
  await expect(page.getByRole("link", { name: "Détails" })).toHaveCount(20);
  await expect(page.locator("main section[id] h2")).toHaveCount(6);
  await expect(page.getByText("275 €").first()).toBeVisible();
});

test("accueil : deux CTA de couverture (Réserver → Acuity, devis → WhatsApp)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main").getByRole("link", { name: /^Réserver/ }).first()).toHaveAttribute("href", ACUITY);
  await expect(page.getByRole("link", { name: /Demander un devis/ }).first()).toHaveAttribute("href", /wa\.me\/33613424089/);
});

test("boutique : bannière « Bientôt disponible », accessible depuis le header", async ({ page }) => {
  await page.goto("/");
  if ((page.viewportSize()?.width ?? 1440) < 1024) await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Boutique" }).first().click();
  await expect(page).toHaveURL(/\/boutique$/);
  await expect(page.getByText("Bientôt disponible").first()).toBeVisible();
});

test("accueil : bloc mariées avec appel gratuit via WhatsApp", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Maquillage & Coiffure Mariée/ })).toBeVisible();
  await expect(page.getByText("+300 mariées sublimées")).toBeVisible();
  await expect(page.getByRole("link", { name: /Réserver un appel gratuit/ })).toHaveAttribute("href", /wa\.me\/33613424089/);
});

test("admin : toutes les pages exigent une connexion", async ({ page }) => {
  for (const path of ["/admin", "/admin/calendrier", "/admin/prestations", "/admin/textes", "/admin/articles", "/admin/avis", "/admin/photos", "/admin/salon"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);
  }
});

test("admin : un mauvais mot de passe est refusé", async ({ page }) => {
  await page.goto("/admin/login");
  // Sans ADMIN_PASSWORD (environnement de test nu), le formulaire n'est pas affiché : rien à tester.
  test.skip((await page.getByLabel(/mot de passe/i).count()) === 0, "administration non configurée");
  await page.getByLabel(/mot de passe/i).fill("pas-le-bon");
  await page.getByRole("button", { name: /connexion|se connecter|entrer/i }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("blog : la page se charge (liste ou état vide)", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: /Conseils/ })).toBeVisible();
});

test("les pages d'administration ne sont pas indexées", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Disallow: \/admin/);
});

test("ebook : sans clé Stripe, pas de bouton d'achat et la page merci renvoie vers /ebook", async ({ page }) => {
  await page.goto("/ebook");
  await expect(page.getByText("Bientôt disponible")).toBeVisible();
  await expect(page.getByRole("button", { name: /Acheter l.ebook/ })).toHaveCount(0);
  await page.goto("/ebook/merci?session_id=cs_test_faux");
  await expect(page).toHaveURL(/\/ebook$/);
  const r = await page.request.get("/ebook/telechargement?session_id=cs_test_faux", { maxRedirects: 0 });
  expect(r.status()).toBe(307);
});
