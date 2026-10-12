import { describe, expect, it } from "vitest";
import { buildLocationExportParams } from "./useAdminLocation";
import { unwrapEnvelopeData } from "@/lib/helpers/api-response.helper";

describe("buildLocationExportParams", () => {
  it("retourne un objet vide sans filtre", () => {
    expect(buildLocationExportParams({})).toEqual({});
  });

  it("transmet tous les filtres renseignés", () => {
    expect(
      buildLocationExportParams({ from: "2026-09-01", to: "2026-09-30", role: "PRO", city: "Abidjan", page: 2, limit: 50 })
    ).toEqual({ from: "2026-09-01", to: "2026-09-30", role: "PRO", city: "Abidjan", page: 2, limit: 50 });
  });

  it("omet les valeurs vides et trime la ville", () => {
    expect(buildLocationExportParams({ from: "", to: undefined, city: "   " })).toEqual({});
    expect(buildLocationExportParams({ city: "  Bouaké " })).toEqual({ city: "Bouaké" });
  });

  it("n'envoie pas de rôle quand « Tous » est choisi", () => {
    expect(buildLocationExportParams({ role: undefined, page: 1, limit: 50 })).toEqual({ page: 1, limit: 50 });
  });

  it("conserve page et limit même à des valeurs limites", () => {
    expect(buildLocationExportParams({ page: 1, limit: 500 })).toEqual({ page: 1, limit: 500 });
  });
});

describe("unwrapEnvelopeData", () => {
  const payload = { total: 3, page: 2, limit: 50, items: [] };

  it("déballe `data` une seule fois", () => {
    expect(unwrapEnvelopeData({ data: payload })).toEqual(payload);
  });

  it("ignore les champs de pagination de l'enveloppe", () => {
    const body = { data: payload, currentPage: 1, totalCount: 999, pageSize: 10, hasNext: true };
    expect(unwrapEnvelopeData(body)).toEqual(payload);
  });

  it("rejette une réponse non enveloppée", () => {
    expect(() => unwrapEnvelopeData(payload)).toThrow();
    expect(() => unwrapEnvelopeData({ data: null })).toThrow();
  });
});
