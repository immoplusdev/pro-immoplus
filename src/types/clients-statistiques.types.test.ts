import { describe, expect, it } from "vitest";
import { formatDateFr, formatFcfa, formatFrequence, formatNote, formatPercent } from "./clients-statistiques.types";

// Intl fr-FR utilise des espaces insécables (U+202F / U+00A0) : on normalise pour comparer.
const norm = (s: string) => s.replace(/[  ]/g, " ");

describe("formatters clients-statistiques", () => {
  it("affiche les ratios 0–1 en pourcentage", () => {
    expect(norm(formatPercent(0.12))).toBe("12 %");
    expect(norm(formatPercent(0.9))).toBe("90 %");
    expect(norm(formatPercent(0))).toBe("0 %");
    expect(formatPercent(null)).toBe("—");
  });

  it("formate les montants FCFA avec séparateur de milliers", () => {
    expect(norm(formatFcfa(1250000))).toBe("1 250 000 FCFA");
  });

  it("formate dates, notes et fréquences, avec — pour null", () => {
    expect(formatDateFr("2026-03-05")).toBe("05/03/2026");
    expect(formatDateFr("2026-03-05T10:00:00.000Z")).toBe("05/03/2026");
    expect(formatDateFr(null)).toBe("—");
    expect(formatNote(4.5)).toBe("4,5/5");
    expect(formatNote(null)).toBe("—");
    expect(formatFrequence(30)).toBe("tous les 30 jours");
    expect(formatFrequence(null)).toBe("—");
  });
});
