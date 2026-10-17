import type { Media } from "@/lib/db-types";

/**
 * Médias par défaut (fichiers réels de /public). Aucune photo de cliente : uniquement le salon et les outils. Utilisés quand la base ne renvoie rien
 * (base non initialisée, vide ou indisponible) : le site n'est jamais privé de ses photos.
 * Les lignes `media` de la base prennent le dessus dès qu'elles existent.
 */
const p = (section: string, path: string, alt: string, sort_order: number, kind: Media["kind"] = "photo"): Media =>
  ({ id: `static-${section}-${sort_order}`, kind, section, path, alt, sort_order });

export const STATIC_MEDIA: Record<string, Media[]> = {
  salon: [
    p("salon", "/images/salon/salon-reception.jpg", "Accueil du salon : comptoir noir, canapé beige et enseigne Mariekey Expert", 1),
    p("salon", "/images/salon/salon-miroir.jpg", "Poste de coiffure avec grand miroir arrondi et fauteuil noir", 2),
    p("salon", "/images/salon/salon-lavage.jpg", "Espace lavage du salon : bac, fauteuil noir et enseigne MKy", 3),
  ],
  about: [p("about", "/images/about/outils.jpg", "Outils de coiffure : lisseur, ciseaux, peignes et pinces", 1)],
};
