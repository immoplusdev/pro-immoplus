import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import queryString from "query-string";
import { serializeWhereParameterToQueryFiltersString } from "@/lib/helpers";
import type {
  ProCertification,
  ProUserWithCertification,
  ProUsersListResponse,
  RecalculateResponse,
  SuspendResponse,
  RetirerResponse,
  ReactiverResponse,
} from "@/types/pro-certification.types";

export interface ProListParams {
  page: number;
  pageSize: number;
  search?: string;
  statuses?: string[];
  scoreRange?: [number, number];
}

export function useProUsersList(params: ProListParams) {
  return useQuery<ProUsersListResponse>(
    ["pro-certification", "list", params],
    async () => {
      const { page, pageSize, search } = params;

      const roleFilters = serializeWhereParameterToQueryFiltersString([
        { _field: "role", _op: "in", _val: ["pro_entreprise", "pro_particulier"]},
      ]);
      const baseQuery = queryString.stringify({
        _page: page,
        _pageSize: pageSize,
        ...(search ? { _search: search } : {}),
      });
      const res = await axiosInstance.get(`${API_URL}/users?${baseQuery}&${roleFilters}`);

      const users: ProUserWithCertification[] = res.data.data ?? [];
      const total: number = res.data.totalCount ?? users.length;

      const certResults = await Promise.allSettled(
        users.map((u) =>
          axiosInstance
            .get(`${API_URL}/pro/${u.id}/certification`)
            .then((r) => r.data as ProCertification)
        )
      );

      const enriched: ProUserWithCertification[] = users.map((u, i) => ({
        ...u,
        certification:
          certResults[i].status === "fulfilled"
            ? (certResults[i] as PromiseFulfilledResult<ProCertification>).value
            : undefined,
      }));

      return { data: enriched, total };
    },
    { keepPreviousData: true }
  );
}

export function useProCertificationDetail(userId: string) {
  return useQuery<ProCertification>(
    ["pro-certification", "detail", userId],
    async () => {
      const res = await axiosInstance.get(`${API_URL}/pro/${userId}/certification`);
      return res.data as ProCertification;
    },
    { enabled: Boolean(userId) }
  );
}

export function useProUser(userId: string) {
  return useQuery<ProUserWithCertification>(
    ["pro-certification", "user", userId],
    async () => {
      const res = await axiosInstance.get(`${API_URL}/users/${userId}`);
      return (res.data.data ?? res.data) as ProUserWithCertification;
    },
    { enabled: Boolean(userId) }
  );
}

export function useRecalculate() {
  const queryClient = useQueryClient();
  return useMutation<RecalculateResponse, unknown, string>(
    async (userId) => {
      const res = await axiosInstance.post(
        `${API_URL}/admin/pro-certification/${userId}/recalculate`
      );
      return res.data.data as RecalculateResponse;
    },
    {
      onSuccess: (_data, userId) => {
        queryClient.invalidateQueries(["pro-certification", "detail", userId]);
        queryClient.invalidateQueries(["pro-certification", "list"]);
      },
    }
  );
}

export function useSuspend() {
  const queryClient = useQueryClient();
  return useMutation<SuspendResponse, unknown, { userId: string; motif: string }>(
    async ({ userId, motif }) => {
      const res = await axiosInstance.post(
        `${API_URL}/admin/pro-certification/${userId}/suspend`,
        { motif }
      );
      return res.data.data as SuspendResponse;
    },
    {
      onSuccess: (_data, { userId }) => {
        queryClient.invalidateQueries(["pro-certification", "detail", userId]);
        queryClient.invalidateQueries(["pro-certification", "list"]);
      },
    }
  );
}

export function useRetirer() {
  const queryClient = useQueryClient();
  return useMutation<RetirerResponse, unknown, { userId: string; motif: string }>(
    async ({ userId, motif }) => {
      const res = await axiosInstance.post(
        `${API_URL}/admin/pro-certification/${userId}/retirer`,
        { motif }
      );
      return res.data.data as RetirerResponse;
    },
    {
      onSuccess: (_data, { userId }) => {
        queryClient.invalidateQueries(["pro-certification", "detail", userId]);
        queryClient.invalidateQueries(["pro-certification", "list"]);
      },
    }
  );
}

export function useReactiver() {
  const queryClient = useQueryClient();
  return useMutation<ReactiverResponse, unknown, string>(
    async (userId) => {
      const res = await axiosInstance.post(
        `${API_URL}/admin/pro-certification/${userId}/reactiver`
      );
      return res.data.data as ReactiverResponse;
    },
    {
      onSuccess: (_data, userId) => {
        queryClient.invalidateQueries(["pro-certification", "detail", userId]);
        queryClient.invalidateQueries(["pro-certification", "list"]);
      },
    }
  );
}
