import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";

const FEED_ADMIN_KEY = "feed-admin";
const FEED_BASE = `${API_URL}/feed`;

export type FeedAdminStatus = "all" | "ready" | "processing" | "failed" | "deleted";
export type FeedQuality = "standard" | "high";

export interface FeedAdminVideo {
  id: string;
  status: Exclude<FeedAdminStatus, "all">;
  thumbnailUrl?: string | null;
  videoUrl?: string;
  shortCode?: string;
  content?: { title?: string; description?: string; category?: string; price?: string; location?: string };
  author?: { id?: string; name?: string; avatar?: string | null };
  relatedTo?: { entity?: string; id?: string };
  stats?: { likes?: number; views?: number };
  createdAt?: string;
}

export interface FeedAdminSummary {
  total: number;
  byStatus: Record<Exclude<FeedAdminStatus, "all">, number>;
}

interface FeedAdminPage {
  data: FeedAdminVideo[];
  summary: FeedAdminSummary;
  cursor: string | null;
  has_more: boolean;
  count: number;
}

export interface RetryBulkResult {
  quality: FeedQuality;
  queued: string[];
  skipped: { id: string; reason: string }[];
  failed: { id: string; reason: string }[];
  summary: { queued: number; skipped: number; failed: number };
}

export interface MigrationStatus {
  queue: { waiting: number; active: number; failed: number; delayed: number };
  pendingLegacyItems: number;
  isIdle: boolean;
}

/** GET /feed/admin/videos — pagination par curseur ("Charger plus"). */
export function useAdminFeedVideos(status: FeedAdminStatus, limit = 20) {
  return useInfiniteQuery({
    queryKey: [FEED_ADMIN_KEY, "videos", status, limit],
    queryFn: async ({ pageParam }) => {
      const res = await axiosInstance.get<FeedAdminPage>(`${FEED_BASE}/admin/videos`, {
        params: { status, limit, cursor: pageParam },
      });
      return res.data;
    },
    getNextPageParam: (last) => (last.has_more && last.cursor ? last.cursor : undefined),
  });
}

/** GET /feed/admin/migration/status — poll toutes les 8 s tant que la file n'est pas vide. */
export function useFeedMigrationStatus(enabled = true) {
  return useQuery({
    queryKey: [FEED_ADMIN_KEY, "migration-status"],
    queryFn: async () => {
      const res = await axiosInstance.get<{ data: MigrationStatus }>(`${FEED_BASE}/admin/migration/status`);
      return res.data.data;
    },
    enabled,
    refetchInterval: (data) => (data && data.isIdle ? false : 8000),
    refetchOnWindowFocus: true,
  });
}

/** POST /feed/admin/videos/:id/reprocess */
export function useReprocessVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quality }: { id: string; quality: FeedQuality }) => {
      const res = await axiosInstance.post<{ data: { id: string; status: string } }>(
        `${FEED_BASE}/admin/videos/${id}/reprocess`,
        { quality }
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FEED_ADMIN_KEY] });
    },
  });
}

/** POST /feed/admin/videos/retry-bulk — `ids` omis = les `limit` plus anciens échecs. */
export function useRetryBulk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { ids?: string[]; limit?: number; quality: FeedQuality }) => {
      const res = await axiosInstance.post<{ data: RetryBulkResult }>(
        `${FEED_BASE}/admin/videos/retry-bulk`,
        payload
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FEED_ADMIN_KEY] });
    },
  });
}
