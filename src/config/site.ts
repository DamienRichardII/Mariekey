/** Configuration statique du site. Les coordonnées, horaires et réseaux viennent de la base (salon_settings). */
export const SITE = {
  name: "Mariekey Expert",
  shortName: "Mariekey",
  locale: "fr-FR",
  /** URL publique canonique (variable d'environnement NEXT_PUBLIC_SITE_URL). */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

/** Unique canal de réservation : Acuity Scheduling (modifiable via NEXT_PUBLIC_BOOKING_URL). */
export const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ?? "https://app.acuityscheduling.com/schedule.php?owner=32171214";

export const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/prestations", label: "Prestations" },
  { href: "/galerie", label: "Galerie" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
] as const;

export const BOTTOM_NAV = [
  { href: "/", label: "Accueil", icon: "home" },
  { href: "/prestations", label: "Prestations", icon: "sparkles" },
  { href: "/galerie", label: "Galerie", icon: "image" },
  { href: "/contact", label: "Contact", icon: "phone" },
] as const;

/** Ordre et libellés des catégories de la maquette (les données réelles viennent de la base). */
export const CATEGORY_SLUGS = ["lissage", "pose-perruque", "tresses", "coloration", "soin-capillaire"] as const;
