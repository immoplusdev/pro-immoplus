import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { unwrapBody, unwrapPaginated } from "@/lib/helpers/api-response.helper";
import type {
  ImmoRelais,
  ImmoRelaisFilters,
  ImmoRelaisInterest,
  ImmoRelaisInterestsFilters,
  ImmoRelaisMatch,
  ImmoRelaisStats,
  ImmoRelaisStatus,
} from "@/types/immo-relais";

const KEY = "admin-relais";
const ADMIN_BASE = `${API_URL}/admin/relais`;
const PUBLIC_BASE = `${API_URL}/relais`;

/** GET /admin/relais */
export function useRelaisList(filters: ImmoRelaisFilters) {
  return useQuery({
    queryKey: [KEY, "list", filters],
    queryFn: async () => {
      const res = await axiosInstance.get<unknown>(ADMIN_BASE, { params: filters });
      return unwrapPaginated<ImmoRelais>(res.data);
    },
    keepPreviousData: true,
  });
}

/** GET /admin/relais/stats */
export function useRelaisStats() {
  return useQuery({
    queryKey: [KEY, "stats"],
    queryFn: async () => {
      const res = await axiosInstance.get<unknown>(`${ADMIN_BASE}/stats`);
      return unwrapBody<ImmoRelaisStats>(res.data);
    },
  });
}

/** GET /relais/module-status (public) */
export function useRelaisModuleStatus() {
  return useQuery({
    queryKey: [KEY, "module-status"],
    queryFn: async () => {
      const res = await axiosInstance.get<unknown>(`${PUBLIC_BASE}/module-status`);
      return unwrapBody<{ active: boolean }>(res.data);
    },
  });
}

/** GET /admin/relais/interests */
export function useAllRelaisInterests(filters: ImmoRelaisInterestsFilters) {
  return useQuery({
    queryKey: [KEY, "interests", filters],
    queryFn: async () => {
      const res = await axiosInstance.get<unknown>(`${ADMIN_BASE}/interests`, { params: filters });
      return unwrapPaginated<ImmoRelaisInterest>(res.data);
    },
    keepPreviousData: true,
  });
}

/** GET /admin/relais/:id */
export function useRelais(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: async () => {
      const res = await axiosInstance.get<unknown>(`${ADMIN_BASE}/${id}`);
      return unwrapBody<ImmoRelais>(res.data);
    },
    enabled: !!id,
    retry: false,
  });
}

/** GET /admin/relais/:id/interests (non paginé) */
export function useRelaisInterests(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, "relais-interests", id],
    queryFn: async () => {
      const res = await axiosInstance.get<unknown>(`${ADMIN_BASE}/${id}/interests`);
      return unwrapBody<ImmoRelaisInterest[]>(res.data);
    },
    enabled: !!id,
  });
}

/** GET /admin/relais/:id/matches (non paginé) */
export function useRelaisMatches(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, "relais-matches", id],
    queryFn: async () => {
      const res = await axiosInstance.get<unknown>(`${ADMIN_BASE}/${id}/matches`);
      return unwrapBody<ImmoRelaisMatch[]>(res.data);
    },
    enabled: !!id,
  });
}

/** PATCH /admin/relais/:id/status */
export function useUpdateRelaisStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ImmoRelaisStatus }) => {
      const res = await axiosInstance.patch<unknown>(`${ADMIN_BASE}/${id}/status`, { status });
      return unwrapBody<ImmoRelais>(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

/** POST /relais/:id/trigger-matching (hors préfixe admin, réservé Admin) */
export function useTriggerRelaisMatching() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.post<unknown>(`${PUBLIC_BASE}/${id}/trigger-matching`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}
