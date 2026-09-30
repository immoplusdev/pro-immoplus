import type {
  LocationExportFilters,
  LocationExportItem,
  LocationExportResponse,
} from "@/types/location.types";
import { buildCsv, fetchAllPages } from "./csv.helper";

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

/** CSV des positions ; `city` null → cellule vide. */
export function buildLocationCsv(items: readonly LocationExportItem[]): string {
  return buildCsv(
    LOCATION_CSV_COLUMNS,
    items.map((item) => LOCATION_CSV_COLUMNS.map((col) => item[col]))
  );
}

interface FetchAllOptions {
  fetchPage: (filters: LocationExportFilters, signal?: AbortSignal) => Promise<LocationExportResponse>;
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
}

/** Parcourt l'export (limit=500) jusqu'à `total` ; `ExportTooLargeError` au-delà de 10 000 lignes. */
export function fetchAllLocationExportItems(
  filters: Omit<LocationExportFilters, "page" | "limit">,
  { fetchPage, onProgress, signal }: FetchAllOptions
): Promise<LocationExportItem[]> {
  return fetchAllPages((page, limit, s) => fetchPage({ ...filters, page, limit }, s), {
    pageSize: LOCATION_CSV_PAGE_SIZE,
    maxRows: LOCATION_CSV_MAX_ROWS,
    onProgress,
    signal,
  });
}
