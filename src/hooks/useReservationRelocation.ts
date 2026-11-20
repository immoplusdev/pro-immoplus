import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { getErrorStatus } from "@/lib/helpers/api-response.helper";
import type {
  RelocationPreview,
  RelocationRequestBody,
  RelocationResult,
  ResidenceChangeHistoryItem,
  ResidenceSuggestionItem,
  SuggestionsParams,
} from "@/types/reservation-relocation.types";

const KEY = "reservation-relocation";
const ADMIN_BASE = `${API_URL}/admin/reservations`;

export const relocationQueryKeys = {
  all: [KEY] as const,
  suggestions: (reservationId: string, params: SuggestionsParams) =>
    [KEY, "suggestions", reservationId, params] as const,
  history: (reservationId: string) => [KEY, "history", reservationId] as const,
};

/** Pas de retry sur 4xx (403 rôle, 404…) : rejouer ne changerait rien. */
const retryOnlyTransient = (failureCount: number, error: unknown) => {
  const status = getErrorStatus(error);
  return (status === undefined || status >= 500) && failureCount < 2;
};

const id = (reservationId: string) => encodeURIComponent(reservationId);

/** `{ data: T }` : enveloppe des endpoints de relogement et des suggestions. */
function unwrapData<T>(body: unknown): T {
  if (typeof body === "object" && body !== null && "data" in body) return (body as { data: T }).data;
  throw new Error("Réponse API inattendue : enveloppe `data` absente");
}

/** GET /reservations/:id/suggestions — `limit` plafonné à 20 côté API. */
export async function getRelocationSuggestions(
  reservationId: string,
  { mode, rayonKm, limit = 6 }: SuggestionsParams,
  signal?: AbortSignal,
): Promise<ResidenceSuggestionItem[]> {
  const params: Record<string, string | number> = { mode, limit: Math.min(Math.max(limit, 1), 20) };
  if (mode === "proches" && rayonKm) params.rayonKm = rayonKm;
  const res = await axiosInstance.get<unknown>(`${API_URL}/reservations/${id(reservationId)}/suggestions`, {
    params,
    signal,
  });
  const data = unwrapData<ResidenceSuggestionItem[]>(res.data);
  return Array.isArray(data) ? data : [];
}

/** POST /admin/reservations/:id/changement-residence/apercu — aucune écriture côté serveur. */
export async function previewRelocation(
  reservationId: string,
  body: RelocationRequestBody,
  signal?: AbortSignal,
): Promise<RelocationPreview> {
  const res = await axiosInstance.post<unknown>(`${ADMIN_BASE}/${id(reservationId)}/changement-residence/apercu`, body, {
    signal,
  });
  return unwrapData<RelocationPreview>(res.data);
}

/** POST /admin/reservations/:id/changement-residence — `Idempotency-Key` obligatoire. */
export async function relocateReservation(
  reservationId: string,
  body: RelocationRequestBody,
  idempotencyKey: string,
): Promise<RelocationResult> {
  const res = await axiosInstance.post<unknown>(`${ADMIN_BASE}/${id(reservationId)}/changement-residence`, body, {
    idempotencyKey,
  });
  return unwrapData<RelocationResult>(res.data);
}

/** GET /admin/reservations/:id/changements-residence — du plus récent au plus ancien. */
export async function getResidenceChangeHistory(
  reservationId: string,
  signal?: AbortSignal,
): Promise<ResidenceChangeHistoryItem[]> {
  const res = await axiosInstance.get<unknown>(`${ADMIN_BASE}/${id(reservationId)}/changements-residence`, { signal });
  const data = unwrapData<ResidenceChangeHistoryItem[]>(res.data);
  return Array.isArray(data) ? data : [];
}

export function useRelocationSuggestions(
  reservationId: string | undefined,
  params: SuggestionsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: relocationQueryKeys.suggestions(reservationId ?? "", params),
    queryFn: ({ signal }) => getRelocationSuggestions(reservationId as string, params, signal),
    enabled: enabled && !!reservationId,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: retryOnlyTransient,
  });
}

export function useResidenceChangeHistory(reservationId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: relocationQueryKeys.history(reservationId ?? ""),
    queryFn: ({ signal }) => getResidenceChangeHistory(reservationId as string, signal),
    enabled: enabled && !!reservationId,
    refetchOnWindowFocus: false,
    retry: retryOnlyTransient,
  });
}
