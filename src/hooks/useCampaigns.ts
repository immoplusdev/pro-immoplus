import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import type {
  Campaign,
  CampaignStatus,
  CampaignTag,
  CampaignTagDetail,
  CampaignTagPayload,
  CampaignTemplate,
  CampaignPreviewItem,
  CampaignCanal,
  CampaignCible,
  CreateCampaignPayload,
  PreviewCampaignPayload,
  SendCampaignPayload,
  SyncResult,
} from "@/types/campaigns.types";
import { CampaignStatut } from "@/types/campaigns.types";

const CAMPAIGNS_KEY = "campaigns";
const TEMPLATES_BASE = `${API_URL}/admin/campaign-templates`;
const CAMPAIGNS_BASE = `${API_URL}/admin/campaigns`;
const TAGS_BASE = `${API_URL}/admin/campaign-tags`;

/* ================================================================== */
/* Templates — /admin/campaign-templates                              */
/* ================================================================== */

/** POST /admin/campaign-templates/sync-now */
export function useSyncTemplates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post<{ data: SyncResult }>(`${TEMPLATES_BASE}/sync-now`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY, "templates"] });
    },
  });
}

export interface CampaignTemplatesParams {
  canal?: CampaignCanal;
  cible?: CampaignCible;
}

/** GET /admin/campaign-templates?canal=&cible= */
export function useCampaignTemplates(params: CampaignTemplatesParams, enabled = true) {
  return useQuery({
    queryKey: [CAMPAIGNS_KEY, "templates", params],
    queryFn: async () => {
      const res = await axiosInstance.get<{ data: { templates: CampaignTemplate[] } }>(TEMPLATES_BASE, {
        params,
      });
      return res.data.data.templates;
    },
    enabled,
    keepPreviousData: true,
  });
}

/** GET /admin/campaign-templates/tags?cible= — lecture (peuplement du mapping). */
export function useCampaignTemplateTags(cible: CampaignCible | undefined) {
  return useQuery({
    queryKey: [CAMPAIGNS_KEY, "template-tags", cible],
    queryFn: async () => {
      const res = await axiosInstance.get<{ data: { tags: CampaignTag[] } }>(`${TEMPLATES_BASE}/tags`, {
        params: { cible },
      });
      return res.data.data.tags;
    },
    enabled: !!cible,
  });
}

/* ================================================================== */
/* Campagnes — /admin/campaigns                                       */
/* ================================================================== */

/** POST /admin/campaigns */
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCampaignPayload) => {
      const res = await axiosInstance.post<{ data: Campaign }>(CAMPAIGNS_BASE, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY, "list"] });
    },
  });
}

/** POST /admin/campaigns/:campagneId/send */
export function useSendCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campagneId,
      variablesFixes,
    }: { campagneId: string } & SendCampaignPayload) => {
      const res = await axiosInstance.post<{
        data: { campagneId: string; statut: CampaignStatut; audience: number };
      }>(`${CAMPAIGNS_BASE}/${campagneId}/send`, variablesFixes ? { variablesFixes } : {});
      return res.data.data;
    },
    onSuccess: (_data, { campagneId }) => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY, "status", campagneId] });
    },
  });
}

/** POST /admin/campaigns/:campagneId/preview */
export function usePreviewCampaign() {
  return useMutation({
    mutationFn: async ({
      campagneId,
      variablesFixes,
    }: { campagneId: string } & PreviewCampaignPayload) => {
      const res = await axiosInstance.post<{ data: { echantillon: CampaignPreviewItem[] } }>(
        `${CAMPAIGNS_BASE}/${campagneId}/preview`,
        variablesFixes ? { variablesFixes } : {}
      );
      return res.data.data.echantillon;
    },
  });
}

/**
 * GET /admin/campaigns/:campagneId — statut / progression.
 * Poll automatiquement tant que statut === "en_cours".
 */
export function useCampaignStatus(campagneId: string | undefined, poll = true) {
  return useQuery({
    queryKey: [CAMPAIGNS_KEY, "status", campagneId],
    queryFn: async () => {
      const res = await axiosInstance.get<{ data: CampaignStatus }>(`${CAMPAIGNS_BASE}/${campagneId}`);
      return res.data.data;
    },
    enabled: !!campagneId,
    retry: false,
    refetchInterval: (data) =>
      poll && data?.statut === CampaignStatut.EnCours ? 4000 : false,
  });
}

/* ================================================================== */
/* Gestion des tags — /admin/campaign-tags                            */
/* ================================================================== */

/** GET /admin/campaign-tags?cible= */
export function useCampaignTags(cible?: CampaignCible) {
  return useQuery({
    queryKey: [CAMPAIGNS_KEY, "tags", cible ?? "all"],
    queryFn: async () => {
      const res = await axiosInstance.get<{ data: { tags: CampaignTagDetail[] } }>(TAGS_BASE, {
        params: cible ? { cible } : undefined,
      });
      return res.data.data.tags;
    },
    keepPreviousData: true,
  });
}

/** POST /admin/campaign-tags */
export function useCreateCampaignTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CampaignTagPayload) => {
      const res = await axiosInstance.post<{ data: CampaignTagDetail }>(TAGS_BASE, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY, "tags"] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY, "template-tags"] });
    },
  });
}

/** PUT /admin/campaign-tags/:tagId */
export function useUpdateCampaignTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tagId, ...payload }: { tagId: string } & CampaignTagPayload) => {
      const res = await axiosInstance.put<{ data: CampaignTagDetail }>(`${TAGS_BASE}/${tagId}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY, "tags"] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY, "template-tags"] });
    },
  });
}

/** DELETE /admin/campaign-tags/:tagId */
export function useDeleteCampaignTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tagId: string) => {
      await axiosInstance.delete(`${TAGS_BASE}/${tagId}`);
      return tagId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY, "tags"] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY, "template-tags"] });
    },
  });
}
