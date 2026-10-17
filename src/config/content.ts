/**
 * Textes modifiables depuis /admin/textes. La valeur par défaut est celle affichée tant que rien n'est enregistré :
 * un champ vidé dans l'administration revient à ce texte d'origine.
 * Jetons disponibles dans certains textes : {adresse}.
 */
export type ContentField = { label: string; default: string; multiline?: boolean; hint?: string };
export type ContentGroup = { id: string; title: string; fields: Record<string, ContentField> };

export const CONTENT_GROUPS = [
  {
    id: "accueil",
    title: "Accueil — bienvenue",
    fields: {
      "home.welcome.title": { label: "Titre", default: "Bienvenue chez MarieKey Expert" },
      "home.welcome.p1": { label: "Paragraphe 1", multiline: true, default: "Passionnée par la beauté et la mise en valeur de la féminité, je vous accueille dans mon univers dédié à la coiffure et au maquillage professionnel." },
      "home.welcome.p2": { label: "Paragraphe 2", multiline: true, default: "Spécialisée en coiffure, maquillage et personnalisation de perruques, je vous accompagne également lors de vos plus beaux événements." },
      "home.welcome.tagline": { label: "Signature", default: "MarieKey Expert, votre beauté, notre signature." },
    },
  },
  {
    id: "mariees",
    title: "Accueil — bloc mariées",
    fields: {
      "home.bridal.eyebrow": { label: "Petit titre", default: "Ma signature" },
      "home.bridal.title": { label: "Titre", default: "Maquillage & Coiffure Mariée" },
      "home.bridal.highlight": { label: "Phrase mise en avant", default: "+300 mariées sublimées" },
      "home.bridal.p1": { label: "Paragraphe 1", multiline: true, default: "Le plus beau jour de votre vie mérite un maquillage et une coiffure à la hauteur : un rendu lumineux, sublimé et longue tenue, pensé sur mesure pour votre peau, vos cheveux et votre style." },
      "home.bridal.p2": { label: "Paragraphe 2", multiline: true, default: "Chaque mariée est unique. Réservez un appel gratuit pour échanger sur votre projet et recevoir un devis personnalisé." },
      "home.bridal.button": { label: "Texte du bouton", default: "Réserver un appel gratuit" },
    },
  },
  {
    id: "avis",
    title: "Accueil — titre des avis",
    fields: {
      "home.reviews.title": { label: "Titre", default: "Elles nous recommandent" },
      "home.reviews.summary": { label: "Note affichée", default: "5/5 · 2 avis Google", hint: "Ex. « 5/5 · 2 avis Google ». À mettre à jour quand de nouveaux avis arrivent sur Google." },
    },
  },
  {
    id: "chiffres",
    title: "Chiffre clé (À propos, Équipe, Formation)",
    fields: {
      "stats.years.value": { label: "Chiffre", default: "12 ans" },
      "stats.years.label": { label: "Légende", default: "de coiffure" },
    },
  },
  {
    id: "a-propos",
    title: "Page À propos",
    fields: {
      "about.intro": { label: "Présentation", multiline: true, default: "Marie coiffe depuis 12 ans. Salon de coiffure situé au {adresse}, ouvert uniquement sur rendez-vous.", hint: "{adresse} est remplacé par l'adresse des « Infos du salon »." },
    },
  },
  {
    id: "equipe",
    title: "Page Notre équipe",
    fields: {
      "team.title": { label: "Titre", default: "Bienvenue chez Mariekey Expert" },
      "team.p1": { label: "Paragraphe 1", multiline: true, default: "Marie coiffe depuis 12 ans." },
      "team.p2": { label: "Paragraphe 2", multiline: true, default: "Elle vous reçoit uniquement sur rendez-vous, dans un salon pensé pour votre confort, à Gentilly (94)." },
    },
  },
  {
    id: "formation",
    title: "Page Formation",
    fields: {
      "formation.intro": { label: "Présentation", multiline: true, default: "Marie coiffe depuis 12 ans. Elle transmet ses techniques d’installation de perruque et de styling lors d’une journée de formation au salon." },
    },
  },
  {
    id: "boutique",
    title: "Page Boutique",
    fields: {
      "shop.title": { label: "Titre", default: "La boutique ouvre bientôt" },
      "shop.text": { label: "Message", multiline: true, default: "Aucun produit n’est en vente pour le moment. Revenez très vite." },
    },
  },
  {
    id: "ebook",
    title: "Page Ebook",
    fields: {
      "ebook.title": { label: "Titre", default: "Wig spécialiste" },
      "ebook.text": { label: "Message", multiline: true, default: "Le contenu détaillé et le tarif seront annoncés prochainement." },
    },
  },
] as const satisfies readonly ContentGroup[];

type Fields<G> = G extends { fields: infer F } ? F : never;
type KeysOf<F> = F extends unknown ? keyof F : never;
export type ContentKey = KeysOf<Fields<(typeof CONTENT_GROUPS)[number]>> & string;

export const CONTENT_DEFAULTS = Object.fromEntries(
  CONTENT_GROUPS.flatMap((g) => Object.entries(g.fields as Record<string, ContentField>).map(([k, f]) => [k, f.default])),
) as Record<ContentKey, string>;
