import { expect, test } from "@playwright/test";

const ACUITY = "https://app.acuityscheduling.com/schedule.php?owner=32171214";
const PAGES = ["/", "/prestations", "/galerie", "/a-propos", "/contact", "/mentions-legales", "/confidentialite", "/conditions-de-reservation"];

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
    expect(await links.count()).toBeGreaterThan(0);
    for (const l of await links.all()) {
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

test("pages légales : champs manquants signalés", async ({ page }) => {
  await page.goto("/mentions-legales");
  await expect(page.getByText(/\[À compléter/).first()).toBeVisible();
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
