import type { Appointment } from "./calendar";

type Raw = Record<string, unknown>;
const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

export function toAppointment(r: Raw): Appointment | null {
  const dt = text(r.datetime);
  if (!dt || typeof r.id !== "number") return null;
  const first = text(r.firstName) ?? "";
  const last = text(r.lastName) ?? "";
  const dur = Number(r.duration);
  const price = Number(r.price);
  return {
    id: r.id,
    start: dt.slice(0, 16),
    end: text(r.endTime) ? String(r.endTime).trim() : null,
    client: `${first} ${last}`.trim() || "Client·e",
    phone: text(r.phone),
    email: text(r.email),
    service: text(r.type) ?? "Rendez-vous",
    duration: Number.isFinite(dur) && dur > 0 ? dur : null,
    price: Number.isFinite(price) && price > 0 ? `${price.toLocaleString("fr-FR")} €` : null,
    paid: String(r.paid) === "yes" || r.paid === true,
    canceled: r.canceled === true,
    notes: text(r.notes),
  };
}

