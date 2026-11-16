import { useCustom } from "@refinedev/core";
import { API_URL } from "@/configs/app.config";

export type CatalogItem = {
  code: string;
  label: string;
  icon?: string;
  /** Pièces et couchages : clé dans `roomCounts`. */
  countKey?: string;
  description?: string;
};

export type CatalogGroup = { key: string; label: string; items: CatalogItem[] };

const STAY_QUERY = { intent: "STAY" };
// Catalogues publics, mis en cache 5 min côté API (Cache-Control) : inutile de les recharger.
const CATALOG_QUERY_OPTIONS = { staleTime: 5 * 60 * 1000 };

/** Catalogues du flow séjour : libellés des types de logement, pièces/couchages et équipements. */
export function useStayCatalogs(enabled: boolean) {
  const propertyTypes = useCustom<{ items: CatalogItem[] }>({
    url: `${API_URL}/properties/catalogs/property-types`,
    method: "get",
    config: { query: STAY_QUERY },
    queryOptions: { enabled, ...CATALOG_QUERY_OPTIONS },
  });
  const roomsAndBeds = useCustom<{ categories: CatalogGroup[] }>({
    url: `${API_URL}/properties/catalogs/rooms-and-beds`,
    method: "get",
    config: { query: STAY_QUERY },
    queryOptions: { enabled, ...CATALOG_QUERY_OPTIONS },
  });
  const amenities = useCustom<{ categories: CatalogGroup[] }>({
    url: `${API_URL}/properties/catalogs/amenities`,
    method: "get",
    config: { query: STAY_QUERY },
    queryOptions: { enabled, ...CATALOG_QUERY_OPTIONS },
  });

  return {
    propertyTypes: propertyTypes.data?.data?.items ?? [],
    roomGroups: roomsAndBeds.data?.data?.categories ?? [],
    amenityGroups: amenities.data?.data?.categories ?? [],
    isLoading: propertyTypes.isLoading || roomsAndBeds.isLoading || amenities.isLoading,
    isError: propertyTypes.isError || roomsAndBeds.isError || amenities.isError,
  };
}
