import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { unwrapBody, unwrapPaginated } from "@/lib/helpers/api-response.helper";
import type {
  Conversation,
  ConversationDetail,
  ConversationMessage,
  ConversationReport,
  ConversationReportReason,
  ConversationsFilters,
  Paginated,
  SendAdminMessagePayload,
} from "@/types/messaging";

const KEY = "admin-conversations";
const BASE = `${API_URL}/admin/conversations`;
export const MESSAGES_PAGE_SIZE = 30;

/** GET /admin/conversations */
export function useConversations(filters: ConversationsFilters) {
  return useQuery({
    queryKey: [KEY, "list", filters],
    queryFn: async () => {
      const res = await axiosInstance.get<unknown>(BASE, {
        params: {
          ...filters,
          reported: filters.reported === undefined ? undefined : String(filters.reported),
        },
      });
      return unwrapPaginated<Conversation>(res.data);
    },
    keepPreviousData: true,
  });
}

export interface ReportsFilters {
  reason?: ConversationReportReason;
  page?: number;
  perPage?: number;
}

/** GET /admin/conversations/reports */
export function useConversationReports(filters: ReportsFilters) {
  return useQuery({
    queryKey: [KEY, "reports", filters],
    queryFn: async () => {
      const res = await axiosInstance.get<unknown>(`${BASE}/reports`, { params: filters });
      return unwrapPaginated<ConversationReport>(res.data);
    },
    keepPreviousData: true,
  });
}

/** GET /admin/conversations/:id */
export function useConversation(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: async () => {
      const res = await axiosInstance.get<unknown>(`${BASE}/${id}`);
      return unwrapBody<ConversationDetail>(res.data);
    },
    enabled: !!id,
    retry: false,
  });
}

/** GET /admin/conversations/:id/messages — pages du plus récent au plus ancien. */
export function useConversationMessages(id: string | undefined) {
  return useInfiniteQuery<Paginated<ConversationMessage>>({
    queryKey: [KEY, "messages", id],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosInstance.get<unknown>(`${BASE}/${id}/messages`, {
        params: { page: pageParam, perPage: MESSAGES_PAGE_SIZE },
      });
      return unwrapPaginated<ConversationMessage>(res.data);
    },
    getNextPageParam: (last) => (last.hasNext ? last.currentPage + 1 : undefined),
    enabled: !!id,
  });
}

function useInvalidateConversation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [KEY] });
}

/** PATCH /admin/conversations/:id/block */
export function useBlockConversation() {
  const invalidate = useInvalidateConversation();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.patch<unknown>(`${BASE}/${id}/block`);
      return unwrapBody<ConversationDetail>(res.data);
    },
    onSuccess: invalidate,
  });
}

/** PATCH /admin/conversations/:id/unblock */
export function useUnblockConversation() {
  const invalidate = useInvalidateConversation();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.patch<unknown>(`${BASE}/${id}/unblock`);
      return unwrapBody<ConversationDetail>(res.data);
    },
    onSuccess: invalidate,
  });
}

/** POST /admin/conversations/:id/messages — support uniquement. */
export function useSendAdminMessage() {
  const invalidate = useInvalidateConversation();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & SendAdminMessagePayload) => {
      const res = await axiosInstance.post<unknown>(`${BASE}/${id}/messages`, payload);
      return unwrapBody<ConversationMessage>(res.data);
    },
    onSuccess: invalidate,
  });
}
