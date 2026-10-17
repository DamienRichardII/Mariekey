import type { Media } from "@/lib/db-types";

/**
 * Médias par défaut (fichiers réels de /public). Utilisés quand la base ne renvoie rien
 * (base non initialisée, vide ou indisponible) : le site n'est jamais privé de ses photos.
 * Les lignes `media` de la base prennent le dessus dès qu'elles existent.
 */
const p = (section: string, path: string, alt: string, sort_order: number, kind: Media["kind"] = "photo"): Media =>
  ({ id: `static-${section}-${sort_order}`, kind, section, path, alt, sort_order });

export const STATIC_MEDIA: Record<string, Media[]> = {
  hero: [p("hero", "/images/hero/hero.jpg", "Cliente aux cheveux longs et lisses devant l'enseigne Mariekey Expert", 1)],
  salon: [
    p("salon", "/images/salon/salon-reception.jpg", "Accueil du salon : comptoir noir, canapé beige et enseigne Mariekey Expert", 1),
    p("salon", "/images/salon/salon-miroir.jpg", "Poste de coiffure avec grand miroir arrondi et fauteuil noir", 2),
    p("salon", "/images/salon/salon-lavage.jpg", "Espace lavage du salon : bac, fauteuil noir et enseigne MKy", 3),
    p("salon", "/images/salon/salon-entree.jpg", "Entrée du salon, fauteuil crème et parquet foncé", 4),
  ],
  gallery: [
    p("gallery", "/images/gallery/lisse-noir.jpg", "Lissage brillant, cheveux noirs longs", 1),
    p("gallery", "/images/gallery/blond-ombre.jpg", "Blond ombré et ondulations", 2),
    p("gallery", "/images/gallery/queue-lisse.jpg", "Cheveux lissés, raie centrale, longueur mi-dos", 3),
    p("gallery", "/images/gallery/ondulations-noires.jpg", "Ondulations noires brillantes", 4),
    p("gallery", "/images/gallery/queue-haute-cardigan.jpg", "Queue de cheval haute lissée", 5),
    p("gallery", "/images/gallery/coiffure-bordeaux.jpg", "Coiffure bordeaux plaquée sur le côté", 6),
    p("gallery", "/images/gallery/queue-cote-peignoir.jpg", "Queue de cheval sur le côté, boucles souples", 7),
    p("gallery", "/images/gallery/cliente-lunettes.jpg", "Cheveux longs lissés avec raie sur le côté, de profil", 8),
    p("gallery", "/videos/video-3-lissage-dos-2s.mp4", "Vidéo : cheveux lissés vus de dos", 9, "video"),
    p("gallery", "/videos/video-2-chemise-blanche-12s.mp4", "Vidéo : cliente et queue de cheval haute", 10, "video"),
    p("gallery", "/videos/video-1-cardigan-2s.mp4", "Vidéo : cliente au salon", 11, "video"),
  ],
  about: [p("about", "/images/about/outils.jpg", "Outils de coiffure : lisseur, ciseaux, peignes et pinces", 1)],
};
