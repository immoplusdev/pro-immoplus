import type {
  LocationExportFilters,
  LocationExportItem,
  LocationExportResponse,
} from "@/types/location.types";

export const LOCATION_CSV_COLUMNS = [
  "userId",
  "role",
  "action",
  "entityId",
  "latitude",
  "longitude",
  "city",
  "capturedAt",
] as const;
/** Maximum accepté par le back. */
export const LOCATION_CSV_PAGE_SIZE = 500;
/** Plafond d'export : 10 000 lignes, soit 20 appels au plus. */
export const LOCATION_CSV_MAX_ROWS = 10_000;

const UTF8_BOM = "\uFEFF";

/** Échappe une cellule CSV (RFC 4180) et neutralise l'injection de formules pour les textes. */
function escapeCsvCell(value: string | number | null): string {
  if (value === null) return "";
  if (typeof value === "number") return String(value);
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** CSV UTF-8 avec BOM (ouverture correcte dans Excel), séparateur virgule, fins de ligne CRLF ; `null` → cellule vide. */
export function buildLocationCsv(items: readonly LocationExportItem[]): string {
  const lines = [
    LOCATION_CSV_COLUMNS.join(","),
    ...items.map((item) => LOCATION_CSV_COLUMNS.map((col) => escapeCsvCell(item[col])).join(",")),
  ];
  return UTF8_BOM + lines.join("\r\n") + "\r\n";
}

export class LocationExportTooLargeError extends Error {
  constructor(public readonly total: number) {
    super(`Export limité à ${LOCATION_CSV_MAX_ROWS} lignes (${total} résultats).`);
    this.name = "LocationExportTooLargeError";
  }
}

interface FetchAllOptions {
  fetchPage: (filters: LocationExportFilters, signal?: AbortSignal) => Promise<LocationExportResponse>;
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
}

/**
 * Parcourt l'export page par page (limit=500) jusqu'à `total`.
 * Lève `LocationExportTooLargeError` dès la 1re page si `total` dépasse le plafond.
 */
export async function fetchAllLocationExportItems(
  filters: Omit<LocationExportFilters, "page" | "limit">,
  { fetchPage, onProgress, signal }: FetchAllOptions
): Promise<LocationExportItem[]> {
  const items: LocationExportItem[] = [];
  let page = 1;
  let total = 0;

  do {
    const res = await fetchPage({ ...filters, page, limit: LOCATION_CSV_PAGE_SIZE }, signal);
    total = res.total;
    if (total > LOCATION_CSV_MAX_ROWS) throw new LocationExportTooLargeError(total);
    items.push(...res.items);
    onProgress?.(items.length, total);
    // Page vide : on s'arrête même si `total` n'est pas atteint (données modifiées entre deux pages).
    if (res.items.length === 0) break;
    page += 1;
  } while (items.length < total);

  return items;
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
