export type HomeSectionKey =
  | "near_you"
  | "available_now"
  | "top_rated"
  | "new_this_week"
  | "residences_by_ville"
  | "residences_by_commune"
  | "biens_a_louer_par_ville"
  | "biens_a_louer_par_commune"
  | "biens_a_acheter_par_ville"
  | "biens_a_acheter_par_commune"
  | "terrain_a_louer"
  | "terrain_a_acheter";

export interface HomeFeedSectionConfig {
  sectionKey: HomeSectionKey;
  label: string;
  position: number;
  itemsLimit: number | null;
  enabled: boolean;
}

export interface HomeFeedConfig {
  defaultSectionsPageSize: number;
  defaultItemsPerSection: number;
  locationRowsLimit: number;
  nearYouRadiusKm: number;
  maxAdsPerSection: number;
  sections: HomeFeedSectionConfig[];
}

export type HomeFeedGlobals = Pick<
  HomeFeedConfig,
  "defaultSectionsPageSize" | "defaultItemsPerSection" | "locationRowsLimit" | "nearYouRadiusKm" | "maxAdsPerSection"
>;
