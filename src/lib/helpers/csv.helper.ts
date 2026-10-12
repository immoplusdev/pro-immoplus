/**
 * Utilitaires CSV partagés par les exports admin (Localisation, Motifs d'échec…).
 * CSV UTF-8 avec BOM (ouverture correcte dans Excel), séparateur virgule, fins de ligne CRLF.
 */

export type CsvCell = string | number | null | undefined;

const UTF8_BOM = "﻿";

/**
 * Échappe une cellule (RFC 4180) : guillemets doublés, cellule entre guillemets si elle contient
 * un séparateur (virgule ou point-virgule, selon la locale Excel), un guillemet ou un retour à la ligne.
 * Neutralise l'injection de formule pour les textes (=, +, -, @ en tête). `null`/`undefined` → vide.
 */
export function escapeCsvCell(value: CsvCell): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",;\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function buildCsv(headers: readonly string[], rows: readonly (readonly CsvCell[])[]): string {
  const lines = [headers.map(escapeCsvCell).join(","), ...rows.map((row) => row.map(escapeCsvCell).join(","))];
  return UTF8_BOM + lines.join("\r\n") + "\r\n";
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

export class ExportTooLargeError extends Error {
  constructor(public readonly total: number, public readonly max: number) {
    super(`Limité à ${max} lignes (${total} résultats).`);
    this.name = "ExportTooLargeError";
  }
}

export interface PageResult<T> {
  total: number;
  items: T[];
}

export interface FetchAllPagesOptions {
  pageSize: number;
  maxRows: number;
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
}

/**
 * Parcourt un endpoint paginé (page 1..n, `limit = pageSize`) jusqu'à `total`.
 * Lève `ExportTooLargeError` dès la 1re page si `total` dépasse `maxRows`.
 * S'arrête sur une page vide même si `total` n'est pas atteint (données modifiées entre deux pages).
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number, signal?: AbortSignal) => Promise<PageResult<T>>,
  { pageSize, maxRows, onProgress, signal }: FetchAllPagesOptions
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let total = 0;

  do {
    const res = await fetchPage(page, pageSize, signal);
    total = res.total;
    if (total > maxRows) throw new ExportTooLargeError(total, maxRows);
    items.push(...res.items);
    onProgress?.(items.length, total);
    if (res.items.length === 0) break;
    page += 1;
  } while (items.length < total);

  return items;
}
