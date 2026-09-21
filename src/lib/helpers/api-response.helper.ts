import type { Paginated } from "@/types/messaging";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPaginated(value: unknown): value is Paginated<unknown> {
  return isRecord(value) && Array.isArray(value.data) && typeof value.currentPage === "number";
}

/**
 * Certains endpoints sont enveloppés dans `{ data: ... }` par un interceptor
 * global du back, d'autres non : on accepte les deux formes.
 */
export function unwrapBody<T>(body: unknown): T {
  if (isRecord(body) && "data" in body && !isPaginated(body) && Object.keys(body).length <= 2) {
    return body.data as T;
  }
  return body as T;
}

export function unwrapPaginated<T>(body: unknown): Paginated<T> {
  if (isPaginated(body)) return body as Paginated<T>;
  if (isRecord(body) && isPaginated(body.data)) return body.data as Paginated<T>;
  throw new Error("Réponse paginée inattendue");
}

/** Code HTTP d'une erreur axios (ou de l'HttpError refine qui l'enveloppe). */
export function getErrorStatus(err: unknown): number | undefined {
  if (!isRecord(err)) return undefined;
  if (typeof err.statusCode === "number") return err.statusCode;
  const response = err.response;
  if (isRecord(response) && typeof response.status === "number") return response.status;
  return undefined;
}

/** Corps de la réponse d'erreur (ex. `{ code: 'CONTACT_INFO_DETECTED' }`). */
export function getErrorBody(err: unknown): Record<string, unknown> | undefined {
  if (!isRecord(err)) return undefined;
  const response = err.response;
  if (isRecord(response) && isRecord(response.data)) return response.data;
  return isRecord(err.data) ? err.data : undefined;
}
