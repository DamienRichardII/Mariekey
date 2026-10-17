/** Date du jour (YYYY-MM-DD) à Paris, quel que soit le fuseau du serveur. */
export const todayParis = (now: Date = new Date()) => now.toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
