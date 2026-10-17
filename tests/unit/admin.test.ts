import { describe, expect, it } from "vitest";
import { CONTENT_DEFAULTS, CONTENT_GROUPS } from "@/config/content";
import { toAppointment } from "@/lib/admin/acuity-parse";
import { dayKey, groupByDay, monthGrid, monthRange, parseMonth, shiftMonth, timeOf, weekOf } from "@/lib/admin/calendar";
import { todayParis } from "@/lib/admin/today";
import { fill } from "@/lib/data/content-fill";

describe("calendrier", () => {
  it("construit la grille d'octobre 2026 (lundi → dimanche)", () => {
    const g = monthGrid(2026, 10);
    expect(g.every((w) => w.length === 7)).toBe(true);
    expect(g[0].indexOf("2026-10-01")).toBe(3); // jeudi
    expect(g.flat().filter(Boolean)).toHaveLength(31);
  });
  it("borne le mois et navigue d'un mois à l'autre", () => {
    expect(monthRange(2026, 2)).toEqual({ min: "2026-02-01", max: "2026-02-28" });
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });
  it("ignore un paramètre de mois invalide", () => {
    const now = new Date("2026-10-17T12:00:00Z");
    expect(parseMonth("2026-13", now)).toEqual({ year: 2026, month: 10 });
    expect(parseMonth("<script>", now)).toEqual({ year: 2026, month: 10 });
    expect(parseMonth("2027-03", now)).toEqual({ year: 2027, month: 3 });
  });
  it("donne la semaine du lundi au dimanche", () => {
    expect(weekOf("2026-10-17")[0]).toBe("2026-10-12");
    expect(weekOf("2026-10-17")[6]).toBe("2026-10-18");
    expect(weekOf("2026-10-12")[0]).toBe("2026-10-12");
  });
  it("calcule le jour à Paris", () => {
    expect(todayParis(new Date("2026-10-17T23:30:00Z"))).toBe("2026-10-18");
  });
});

describe("rendez-vous Acuity", () => {
  const raw = { id: 7, firstName: "Awa", lastName: "D.", phone: "0611223344", email: "a@b.fr", datetime: "2026-10-20T14:30:00+0200", endTime: "4:00pm", type: "Soin", duration: "90", price: "65.00", paid: "yes", notes: "  " };
  it("garde l'heure locale telle quelle (aucun décalage de fuseau)", () => {
    const a = toAppointment(raw)!;
    expect(dayKey(a)).toBe("2026-10-20");
    expect(timeOf(a)).toBe("14:30");
    expect(a.client).toBe("Awa D.");
    expect(a.duration).toBe(90);
    expect(a.paid).toBe(true);
    expect(a.notes).toBeNull();
  });
  it("rejette une ligne sans date ou sans identifiant", () => {
    expect(toAppointment({ ...raw, datetime: undefined })).toBeNull();
    expect(toAppointment({ ...raw, id: "x" })).toBeNull();
  });
  it("regroupe par jour, triés par heure", () => {
    const a = toAppointment(raw)!;
    const b = toAppointment({ ...raw, id: 8, datetime: "2026-10-20T09:00:00+0200" })!;
    const map = groupByDay([a, b]);
    expect(map.get("2026-10-20")!.map((x) => x.id)).toEqual([8, 7]);
  });
});

describe("textes modifiables", () => {
  it("chaque champ a une clé unique et un texte d'origine non vide", () => {
    const keys = CONTENT_GROUPS.flatMap((g) => Object.keys(g.fields));
    expect(new Set(keys).size).toBe(keys.length);
    for (const k of keys) expect(CONTENT_DEFAULTS[k as keyof typeof CONTENT_DEFAULTS].trim().length).toBeGreaterThan(0);
  });
  it("remplace {adresse} et laisse les autres jetons", () => {
    expect(fill("au {adresse}, {inconnu}", { adresse: "27 avenue" })).toBe("au 27 avenue, {inconnu}");
  });
});
