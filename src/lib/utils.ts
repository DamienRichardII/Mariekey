import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEUR(cents: number): string {
  const euros = cents / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(euros) ? 0 : 2,
  }).format(euros);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

/** « 0616225165 » → « 06 16 22 51 65 » (numéros français à 10 chiffres). */
export function formatPhoneFR(raw: string): string {
  const d = raw.replace(/\D/g, "");
  return d.length === 10 ? d.replace(/(\d{2})(?=\d)/g, "$1 ").trim() : raw;
}

/** Lien WhatsApp (wa.me) depuis un numéro français : « 06 13 42 40 89 » → https://wa.me/33613424089 */
export function whatsappUrl(raw: string, message?: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0")) d = "33" + d.slice(1);
  return `https://wa.me/${d}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function formatServicePrice(priceCents: number, isFrom: boolean): string {
  return `${isFrom ? "À partir de " : ""}${formatEUR(priceCents)}`;
}

export function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
