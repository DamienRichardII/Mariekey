/** Remplace les jetons {nom} d'un texte (ex. {adresse}) ; un jeton inconnu est laissé tel quel. */
export const fill = (text: string, vars: Record<string, string>) => text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
