import { useCustom, useApiUrl } from "@refinedev/core";

// Forme exacte de HomeDynamicSectionItemDto (home-section-config.dto.ts). Au plus
// `locationRowsLimit` entrées de chaque `groupBy`, triées par residenceCount décroissant.
interface HomeDynamicSectionItem {
  sectionKey: string;
  label: string;
  groupBy: "ville" | "commune";
  residenceCount: number;
}

interface HomeFeedSectionsResponse {
  dynamicSections?: HomeDynamicSectionItem[];
}

// GET /admin/home-feed-sections (Admin) expose dynamicSections[] (résidences par ville/commune)
// pour peupler target_section_key sur les placements HOME_FEED_RESIDENCES_PAR_VILLE/_PAR_COMMUNE
// (voir docs/drafts/docss.md §1.1/§1.2/§1.4). Endpoint Admin-only : pour un compte Commercial
// (qui a aussi accès aux campagnes pub), la requête échoue — le champ reste alors utilisable en
// saisie libre (voir AutoComplete dans form.tsx), sans bloquer le formulaire.
export function useDynamicHomeSections(enabled: boolean) {
  const apiUrl = useApiUrl();

  const { data, isLoading, isError } = useCustom<HomeFeedSectionsResponse>({
    url: `${apiUrl}/admin/home-feed-sections`,
    method: "get",
    queryOptions: { enabled, staleTime: 5 * 60 * 1000, retry: false },
  });

  const dynamicSections = data?.data?.dynamicSections ?? [];

  const toOption = (s: HomeDynamicSectionItem) => ({
    label: `${s.label} (${s.residenceCount})`,
    value: s.sectionKey,
  });

  const villeOptions = dynamicSections.filter((s) => s.groupBy === "ville").map(toOption);
  const communeOptions = dynamicSections.filter((s) => s.groupBy === "commune").map(toOption);

  return { villeOptions, communeOptions, isLoading, isError };
}
