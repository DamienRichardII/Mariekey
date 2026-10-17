/** Carte « MKy Le Bar » transmise par le salon (source : assets/references/carte-mky-le-bar.jpg). */
export const BAR_MENU = {
  title: "MKy Le Bar",
  sections: [
    { title: "Boissons chaudes", items: ["Thé à la menthe", "Café au lait", "Expresso", "Chocolat chaud", "Capuccino", "Lait chaud au miel"] },
    { title: "Jus de fruit | Eau", items: ["Jus d'orange", "Jus de pomme", "Capri-Sun"] },
    { title: "Snack", items: ["Madeleine", "Mix de petits chocolats", "Kinder Bueno", "Chips"] },
  ],
  note: "Merci de sélectionner une boisson, chaude ou froide, accompagnée d'un snack.",
} as const;
