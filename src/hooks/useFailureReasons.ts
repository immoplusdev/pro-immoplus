import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { getErrorStatus, unwrapEnvelopeData } from "@/lib/helpers/api-response.helper";
import { ExportTooLargeError, fetchAllPages, type FetchAllPagesOptions } from "@/lib/helpers/csv.helper";
import type { FailureReasonItem, FailureReasonsFilters, FailureReasonsResponse } from "@/types/failure-reasons.types";

const KEY = "admin-failure-reasons";
const BASE = `${API_URL}/reservations/motifs-echec`;

/** Maximum accepté par le back. */
export const FAILURE_REASONS_MAX_PAGE_SIZE = 500;
/** Plafond des statistiques (agrégées côté front) : 10 appels au plus. */
export const FAILURE_REASONS_STATS_MAX_ROWS = 5_000;
/** Plafond de l'export CSV : 20 appels au plus. */
export const FAILURE_REASONS_CSV_MAX_ROWS = 10_000;

export type FailureReasonsQueryFilters = Omit<FailureReasonsFilters, "page" | "limit">;

/** Pas de retry sur 4xx (400 date invalide, 403 droits) ni sur le plafond de lignes : rejouer ne changerait rien. */
const retryOnlyTransient = (failureCount: number, error: unknown) => {
  if (error instanceof ExportTooLargeError) return false;
  const status = getErrorStatus(error);
  return (status === undefined || status >= 500) && failureCount < 2;
};

type QueryParams = Record<string, string | number>;

/** Query params : valeurs vides omises (pas de `reasonCode=""`, pas d'`actor` pour "Tous"). */
export function buildFailureReasonParams(filters: FailureReasonsFilters): QueryParams {
  const params: QueryParams = {};
  if (filters.actor) params.actor = filters.actor;
  if (filters.status) params.status = filters.status;
  const reasonCode = filters.reasonCode?.trim();
  if (reasonCode) params.reasonCode = reasonCode;
  if (filters.dateDebut) params.dateDebut = filters.dateDebut;
  if (filters.dateFin) params.dateFin = filters.dateFin;
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;
  return params;
}

/** GET /reservations/motifs-echec (Admin + Reservations/Read). */
export async function getFailureReasons(
  filters: FailureReasonsFilters,
  signal?: AbortSignal
): Promise<FailureReasonsResponse> {
  const res = await axiosInstance.get<unknown>(BASE, { params: buildFailureReasonParams(filters), signal });
  return unwrapEnvelopeData<FailureReasonsResponse>(res.data);
}

/** Toutes les réponses pour ces filtres (limit=500), plafonné par `maxRows`. */
export function getAllFailureReasons(
  filters: FailureReasonsQueryFilters,
  options: Omit<FetchAllPagesOptions, "pageSize">
): Promise<FailureReasonItem[]> {
  return fetchAllPages((page, limit, signal) => getFailureReasons({ ...filters, page, limit }, signal), {
    ...options,
    pageSize: FAILURE_REASONS_MAX_PAGE_SIZE,
  });
}

export function useFailureReasons(filters: FailureReasonsFilters, enabled = true) {
  return useQuery({
    queryKey: [KEY, "list", filters],
    queryFn: ({ signal }) => getFailureReasons(filters, signal),
    enabled,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: retryOnlyTransient,
  });
}

/** Jeu complet pour l'onglet Statistiques ; lève `ExportTooLargeError` au-delà de 5 000 lignes. */
export function useFailureReasonsForStats(filters: FailureReasonsQueryFilters, enabled: boolean) {
  return useQuery({
    queryKey: [KEY, "stats", filters],
    queryFn: ({ signal }) => getAllFailureReasons(filters, { maxRows: FAILURE_REASONS_STATS_MAX_ROWS, signal }),
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: retryOnlyTransient,
  });
}
