import { describe, expect, it, vi } from "vitest";
import {
  buildLocationCsv,
  fetchAllLocationExportItems,
  LOCATION_CSV_MAX_ROWS,
  LOCATION_CSV_PAGE_SIZE,
  LocationExportTooLargeError,
} from "./location-csv.helper";
import type { LocationExportFilters, LocationExportItem, LocationExportResponse } from "@/types/location.types";

const item = (overrides: Partial<LocationExportItem> = {}): LocationExportItem => ({
  userId: "11111111-2222-3333-4444-555555555555",
  role: "PRO",
  action: "ACCEPTATION_RESERVATION",
  entityId: "res-42",
  latitude: 5.359951,
  longitude: -4.008256,
  city: "Abidjan",
  capturedAt: "2026-09-23T10:00:00.000Z",
  ...overrides,
});

describe("buildLocationCsv", () => {
  it("commence par le BOM UTF-8 et l'en-tête attendu", () => {
    const csv = buildLocationCsv([]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.slice(1)).toBe("userId,role,action,entityId,latitude,longitude,city,capturedAt\r\n");
  });

  it("écrit une ligne par item, coordonnées négatives non altérées", () => {
    const lines = buildLocationCsv([item()]).slice(1).split("\r\n");
    expect(lines[1]).toBe(
      "11111111-2222-3333-4444-555555555555,PRO,ACCEPTATION_RESERVATION,res-42,5.359951,-4.008256,Abidjan,2026-09-23T10:00:00.000Z"
    );
    expect(lines).toHaveLength(3); // en-tête + 1 ligne + fin de fichier
  });

  it("laisse la ville vide quand elle vaut null", () => {
    const lines = buildLocationCsv([item({ city: null })]).slice(1).split("\r\n");
    expect(lines[1]).toContain(",-4.008256,,2026-09-23");
  });

  it("échappe virgules et guillemets", () => {
    const lines = buildLocationCsv([item({ city: 'Grand-Bassam, "Sud"' })]).slice(1).split("\r\n");
    expect(lines[1]).toContain(',"Grand-Bassam, ""Sud""",');
  });

  it("neutralise l'injection de formule dans les champs texte", () => {
    const lines = buildLocationCsv([item({ city: "=HYPERLINK(1)" })]).slice(1).split("\r\n");
    expect(lines[1]).toContain(",'=HYPERLINK(1),");
  });
});

describe("fetchAllLocationExportItems", () => {
  const pageOf = (filters: LocationExportFilters, total: number): LocationExportResponse => {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const count = Math.max(0, Math.min(limit, total - (page - 1) * limit));
    return { total, page, limit, items: Array.from({ length: count }, () => item()) };
  };

  it("pagine avec limit=500 jusqu'à total et conserve les filtres", async () => {
    const fetchPage = vi.fn(async (f: LocationExportFilters) => pageOf(f, 1250));
    const onProgress = vi.fn();

    const items = await fetchAllLocationExportItems({ role: "CLIENT", city: "Abidjan" }, { fetchPage, onProgress });

    expect(LOCATION_CSV_PAGE_SIZE).toBe(500);
    expect(items).toHaveLength(1250);
    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(fetchPage.mock.calls.map(([f]) => f)).toEqual([1, 2, 3].map((page) => ({
      role: "CLIENT",
      city: "Abidjan",
      page,
      limit: LOCATION_CSV_PAGE_SIZE,
    })));
    expect(onProgress).toHaveBeenLastCalledWith(1250, 1250);
  });

  it("s'arrête sur une page vide même si total n'est pas atteint", async () => {
    const fetchPage = vi.fn(async (f: LocationExportFilters) =>
      (f.page ?? 1) === 1 ? pageOf(f, 1200) : { total: 1200, page: f.page ?? 1, limit: 500, items: [] }
    );
    const items = await fetchAllLocationExportItems({}, { fetchPage });
    expect(items).toHaveLength(500);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("bloque au-delà du plafond dès la première page", async () => {
    const fetchPage = vi.fn(async (f: LocationExportFilters) => pageOf(f, LOCATION_CSV_MAX_ROWS + 1));
    await expect(fetchAllLocationExportItems({}, { fetchPage })).rejects.toBeInstanceOf(LocationExportTooLargeError);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("accepte exactement le plafond en 20 appels au plus", async () => {
    const fetchPage = vi.fn(async (f: LocationExportFilters) => pageOf(f, LOCATION_CSV_MAX_ROWS));
    const items = await fetchAllLocationExportItems({}, { fetchPage });
    expect(items).toHaveLength(LOCATION_CSV_MAX_ROWS);
    expect(fetchPage).toHaveBeenCalledTimes(20);
  });
});
