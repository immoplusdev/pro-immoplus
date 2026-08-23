import { useCustom, useApiUrl } from "@refinedev/core";
import { AD_PLACEMENTS, AD_CATEGORIES, AdPlacement, AdCampaignCategory } from "./types";

interface AdCampaignMetadataResponse {
  placements: AdPlacement[];
  campaign_categories: AdCampaignCategory[];
  types: string[];
  actions: string[];
  statuses: string[];
}

// GET /ads/campaigns/metadata renvoie Object.values(...) des enums backend —
// donc toujours à jour, contrairement à des listes recopiées à la main ici.
// AD_PLACEMENTS / AD_CATEGORIES ne servent plus que de repli (chargement / échec réseau).
export function useAdCampaignMetadata() {
  const apiUrl = useApiUrl();

  const { data, isLoading, isError } = useCustom<AdCampaignMetadataResponse>({
    url: `${apiUrl}/ads/campaigns/metadata`,
    method: "get",
    queryOptions: { staleTime: 5 * 60 * 1000 },
  });

  const metadata = data?.data;

  return {
    placements: metadata?.placements ?? AD_PLACEMENTS,
    campaignCategories: metadata?.campaign_categories ?? AD_CATEGORIES,
    isLoading,
    isError,
  };
}
