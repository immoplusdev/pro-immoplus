import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { getErrorStatus } from "@/lib/helpers/api-response.helper";
import type {
  LocationDateRange,
  LocationExportFilters,
  LocationExportResponse,
  UserLocationHistory,
} from "@/types/location.types";

const KEY = "admin-location";

/**
 * Positions GPS = données sensibles, chaque appel est journalisé côté back :
 * - pas de cache conservé après démontage (cacheTime 0), pas de refetch au focus ;
 * - pas de retry sur 4xx (un 403 rejoué 3 fois = 3 lignes d'audit pour rien).
 */
const SENSITIVE_QUERY_OPTIONS = {
  cacheTime: 0,
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: unknown) => {
    const status = getErrorStatus(error);
    return (status === undefined || status >= 500) && failureCount < 2;
  },
} as const;

type QueryParams = Record<string, string | number>;

/**
 * Les deux endpoints renvoient un `WrapperResponseDto` : le contenu utile est dans `body.data`.
 * `axiosInstance` ne déballe rien (intercepteur d'erreurs uniquement) : on déballe ici, une seule fois.
 * Pas de `unwrapBody` générique : son heuristique (≤ 2 clés) renverrait l'enveloppe entière dès que
 * currentPage/totalCount… sont présents. La pagination de l'enveloppe est ignorée (non fiable ici).
 */
export function unwrapEnvelopeData<T>(body: unknown): T {
  if (typeof body === "object" && body !== null && "data" in body) {
    const { data } = body as { data: unknown };
    if (typeof data === "object" && data !== null) return data as T;
  }
  throw new Error("Réponse API inattendue : enveloppe `data` absente");
}

/**
 * Query params de l'export : valeurs vides omises (pas de `city=""`, pas de `role` pour "Tous"),
 * ville trimée (le back filtre à égalité exacte).
 */
export function buildLocationExportParams(filters: LocationExportFilters): QueryParams {
  const params: QueryParams = {};
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  if (filters.role) params.role = filters.role;
  const city = filters.city?.trim();
  if (city) params.city = city;
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;
  return params;
}

/** GET /admin/users/:id/location/history?from=&to= — items déjà triés par capturedAt croissant. */
export async function getUserLocationHistory(
  userId: string,
  range: LocationDateRange,
  signal?: AbortSignal
): Promise<UserLocationHistory> {
  const res = await axiosInstance.get<unknown>(
    `${API_URL}/admin/users/${encodeURIComponent(userId)}/location/history`,
    { params: { from: range.from, to: range.to }, signal }
  );
  return unwrapEnvelopeData<UserLocationHistory>(res.data);
}

/** GET /admin/location/export?from=&to=&role=&city=&page=&limit= */
export async function getLocationExport(
  filters: LocationExportFilters,
  signal?: AbortSignal
): Promise<LocationExportResponse> {
  const res = await axiosInstance.get<unknown>(`${API_URL}/admin/location/export`, {
    params: buildLocationExportParams(filters),
    signal,
  });
  return unwrapEnvelopeData<LocationExportResponse>(res.data);
}

/** Historique d'un utilisateur — aucun appel tant qu'aucune période n'est choisie. */
export function useUserLocationHistory(userId: string | undefined, range: LocationDateRange | null) {
  return useQuery({
    queryKey: [KEY, "history", userId, range],
    queryFn: ({ signal }) => getUserLocationHistory(userId as string, range as LocationDateRange, signal),
    enabled: !!userId && !!range,
    ...SENSITIVE_QUERY_OPTIONS,
  });
}

/** Export paginé des positions liées aux actions métier. */
export function useLocationExport(filters: LocationExportFilters, enabled = true) {
  return useQuery({
    queryKey: [KEY, "export", filters],
    queryFn: ({ signal }) => getLocationExport(filters, signal),
    enabled,
    keepPreviousData: true,
    ...SENSITIVE_QUERY_OPTIONS,
  });
}
