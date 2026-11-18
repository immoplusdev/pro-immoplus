import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { getErrorStatus, unwrapEnvelopeData } from "@/lib/helpers/api-response.helper";
import type {
  AdminSignalementItemDto,
  ClientDetailDto,
  ClientKpiFilters,
  ClientKpisDto,
  ClientListFilters,
  ClientListItemDto,
  ClientListSortBy,
  ClientReactivateResultDto,
  ClientRecomputeScoreResultDto,
  ClientStatutChangeResultDto,
  PaginatedResponse,
  SignalementStatut,
  SortDirection,
} from "@/types/clients-statistiques.types";

const CLIENTS_KEY = "clients-statistiques";

export function useClientsKpis(filters: ClientKpiFilters) {
  return useQuery({
    queryKey: [CLIENTS_KEY, "kpis", filters],
    queryFn: async () => {
      const res = await axiosInstance.get<{ data: ClientKpisDto }>(`${API_URL}/v1/statistics/clients/kpis`, {
        params: filters,
      });
      return res.data.data;
    },
  });
}

export interface ClientsListParams extends ClientListFilters {
  page: number;
  perPage: number;
  sortBy?: ClientListSortBy;
  sortDir?: SortDirection;
}

export function useClientsList(params: ClientsListParams) {
  return useQuery({
    queryKey: [CLIENTS_KEY, "list", params],
    queryFn: async () => {
      const res = await axiosInstance.get<PaginatedResponse<ClientListItemDto>>(`${API_URL}/v1/statistics/clients`, {
        params,
      });
      return res.data;
    },
    keepPreviousData: true,
  });
}

/**
 * GET /v1/statistics/clients/:clientId (Admin). 404 si l'id n'est pas un client (role customer) actif.
 * Un client jamais recalculé n'est PAS en 404 : LEFT JOIN client_scores → score 0, badge null, risque normal.
 */
export async function getClientStatistics(clientId: string, signal?: AbortSignal): Promise<ClientDetailDto> {
  const res = await axiosInstance.get<unknown>(
    `${API_URL}/v1/statistics/clients/${encodeURIComponent(clientId)}`,
    { signal }
  );
  return unwrapEnvelopeData<ClientDetailDto>(res.data);
}

/** POST /admin/clients/:clientId/recompute-score (Admin, route sans version : pas de @Version côté back). */
export async function recomputeClientScore(clientId: string): Promise<ClientRecomputeScoreResultDto> {
  const res = await axiosInstance.post<unknown>(
    `${API_URL}/admin/clients/${encodeURIComponent(clientId)}/recompute-score`
  );
  return unwrapEnvelopeData<ClientRecomputeScoreResultDto>(res.data);
}

export function clientDetailQueryKey(clientId: string | null | undefined) {
  return [CLIENTS_KEY, "detail", clientId] as const;
}

export function useClientDetail(clientId: string | null | undefined) {
  return useQuery({
    queryKey: clientDetailQueryKey(clientId),
    queryFn: ({ signal }) => getClientStatistics(clientId as string, signal),
    enabled: !!clientId,
    refetchOnWindowFocus: false,
    // Pas de retry sur 4xx (404 = pas de stats, 401/403 = droits) ; un retry sur erreur réseau/5xx.
    retry: (failureCount, error) => {
      const status = getErrorStatus(error);
      return (status === undefined || status >= 500) && failureCount < 1;
    },
  });
}

export function useRecomputeClientScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recomputeClientScore,
    onSuccess: (_data, clientId) => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY, "detail", clientId] });
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY, "list"] });
    },
  });
}

export function useSuspendClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, raison }: { clientId: string; raison: string }) => {
      const res = await axiosInstance.put<{ data: ClientStatutChangeResultDto }>(
        `${API_URL}/admin/clients/${clientId}/suspendre`,
        { raison }
      );
      return res.data.data;
    },
    onSuccess: (_data, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY, "detail", clientId] });
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY, "list"] });
    },
  });
}

export function useBanClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, raison }: { clientId: string; raison: string }) => {
      const res = await axiosInstance.put<{ data: ClientStatutChangeResultDto }>(
        `${API_URL}/admin/clients/${clientId}/bannir`,
        { raison }
      );
      return res.data.data;
    },
    onSuccess: (_data, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY, "detail", clientId] });
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY, "list"] });
    },
  });
}

export function useReactivateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientId: string) => {
      const res = await axiosInstance.put<{ data: ClientReactivateResultDto }>(
        `${API_URL}/admin/clients/${clientId}/reactiver`
      );
      return res.data.data;
    },
    onSuccess: (_data, clientId) => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY, "detail", clientId] });
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY, "list"] });
    },
  });
}

export interface SignalementsParams {
  statut?: SignalementStatut;
  clientId?: string;
  page: number;
  perPage: number;
}

export function useSignalements(params: SignalementsParams) {
  return useQuery({
    queryKey: [CLIENTS_KEY, "signalements", params],
    queryFn: async () => {
      const res = await axiosInstance.get<PaginatedResponse<AdminSignalementItemDto>>(`${API_URL}/admin/signalements`, {
        params,
      });
      return res.data;
    },
    keepPreviousData: true,
  });
}
