import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
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

export function useClientDetail(clientId: string | null) {
  return useQuery({
    queryKey: [CLIENTS_KEY, "detail", clientId],
    queryFn: async () => {
      const res = await axiosInstance.get<{ data: ClientDetailDto }>(`${API_URL}/v1/statistics/clients/${clientId}`);
      return res.data.data;
    },
    enabled: !!clientId,
    retry: false,
  });
}

export function useRecomputeClientScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientId: string) => {
      const res = await axiosInstance.post<{ data: ClientRecomputeScoreResultDto }>(
        `${API_URL}/admin/clients/${clientId}/recompute-score`
      );
      return res.data.data;
    },
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
