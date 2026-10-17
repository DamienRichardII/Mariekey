/** Avis Google publics (texte repris tel quel) affichés tant qu'aucun avis n'est géré depuis /admin/avis. */
export type Review = { id: string; author: string; body: string; rating: number; source: string };

export const STATIC_REVIEWS: Review[] = [
  { id: "s1", author: "Divine D", rating: 5, source: "Google", body: "Si je pouvais mettre 10 étoiles, je l’aurais fait.\nLe salon est incroyable. Dès mon arrivée, j’ai été accueillie avec le sourire, un petit thé et des biscuits.\nLa prestation s’est super bien passée ; ma pose de wig était juste PARFAITE et impeccable !!\nMarieKey maîtrise son art avec passion et professionnalisme. Je repars ravie et impatiente de revenir ! Je recommande à 1000 %. Merci encore." },
  { id: "s2", author: "Gisele Presume", rating: 5, source: "Google", body: "Un grand merci à Marie de m’avoir sublimée ! L’accueil était chaleureux et la prestation tout simplement parfaite et incroyable !\nJ’ai réalisé un tissage ouvert avec un brushing à la perfection, ainsi qu’un magnifique maquillage pour un mariage. Je me suis sentie vraiment belle et magnifique !\nMarie est une véritable professionnelle, douce, à l’écoute et très talentueuse. Elle a su parfaitement répondre à mes attentes et me mettre en valeur pour cette belle occasion.\nJe la recommande les yeux fermés !" },
];
