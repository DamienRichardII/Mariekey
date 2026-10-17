import { describe, expect, it } from "vitest";
import { formatDuration, formatEUR, formatPhoneFR, formatServicePrice, mapsUrl, whatsappUrl } from "@/lib/utils";

describe("utils", () => {
  it("formate les numéros français", () => {
    expect(formatPhoneFR("0616225165")).toBe("06 16 22 51 65");
    expect(formatPhoneFR("+33 6 16")).toBe("+33 6 16");
  });
  it("construit le lien WhatsApp international", () => {
    expect(whatsappUrl("06 13 42 40 89")).toBe("https://wa.me/33613424089");
    expect(whatsappUrl("0613424089", "Bonjour é")).toBe("https://wa.me/33613424089?text=Bonjour%20%C3%A9");
  });
  it("formate durées et prix", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(120)).toBe("2 h");
    expect(formatDuration(150)).toBe("2 h 30");
    expect(formatEUR(8000).replace(/\s/g, " ")).toBe("80 €");
    expect(formatServicePrice(6050, true).replace(/\s/g, " ")).toBe("À partir de 60,50 €");
  });
  it("encode l'adresse pour Google Maps", () => {
    expect(mapsUrl("27 avenue Jean Jaurès, Gentilly")).toContain("query=27%20avenue%20Jean%20Jaur%C3%A8s%2C%20Gentilly");
  });
});
