export type AdPlacement =
  | "HOME_TOP"
  | "HOME_AFTER_SEARCH"
  | "HOME_AFTER_SECTION"
  | "HOME_BOTTOM"
  | "PROPERTY_LIST_TOP"
  | "PROPERTY_LIST_AFTER"
  | "PROPERTY_DETAILS_HEADER"
  | "PROPERTY_DETAILS_GALLERY"
  | "PROPERTY_DETAILS_DESCRIPTION"
  | "PROPERTY_DETAILS_BOTTOM"
  | "HOTEL_LIST_TOP"
  | "HOTEL_DETAILS_HEADER"
  | "RESIDENCE_LIST"
  | "RESIDENCE_LIST_ALL"
  | "RESIDENCE_LIST_NEAR"
  | "RESIDENCE_LIST_BEST_RATED"
  | "RESIDENCE_LIST_ABIDJAN"
  | "RESIDENCE_LIST_ABOISSO"
  | "RESIDENCE_LIST_GRAND_BASSAM"
  | "RESIDENCE_LIST_YAMOUSSOUKRO"
  | "RESIDENCE_LIST_SAN_PEDRO"
  | "RESIDENCE_LIST_COCODY"
  | "RESIDENCE_LIST_YOPOUGON"
  | "RESIDENCE_LIST_PLATEAU"
  | "RESIDENCE_DETAILS"
  | "LOCATION_LIST"
  | "PAYMENT_TOP"
  | "PAYMENT_BOTTOM"
  | "MAP_TOP"
  | "MAP_BOTTOM"
  | "CALENDAR_TOP"
  | "CALENDAR_BOTTOM"
  | "ACCOUNT_TOP"
  | "ACCOUNT_BOTTOM"
  | "IMATCH_TOP"
  | "IMATCH_BOTTOM";

export type AdAction =
  | "OPEN_URL"
  | "OPEN_PROPERTY"
  | "OPEN_RESIDENCE"
  | "OPEN_HOTEL"
  | "OPEN_LOCATION"
  | "OPEN_CATEGORY"
  | "OPEN_PROFILE"
  | "OPEN_IMATCH"
  | "OPEN_EVENT"
  | "OPEN_EXTERNAL"
  | "OPEN_INTERNAL_PAGE"
  | "OPEN_PAYMENT"
  | "NONE";

export type AdCampaignCategory =
  | "PROMOTION"
  | "NEW_FEATURE"
  | "NEW_PROGRAM"
  | "POLICY_UPDATE"
  | "GENERAL";

export type AdStatus = "DRAFT" | "ACTIVE" | "SUSPENDED" | "EXPIRED";
export type AdType = "IMAGE" | "VIDEO" | "CAROUSEL" | "VIDEO_CAROUSEL";
export type AdEventType = "IMPRESSION" | "CLICK";

export interface AdContent {
  title: string;
  subtitle?: string;
  badge?: string;
  cta_label?: string;
}

export interface AdMedia {
  images: string[];
  videos: string[];
}

export interface AdScope {
  entity_id: string | null;
  entity_ids: string[];
  filters: Record<string, unknown>;
}

export interface AdCampaign {
  id: number;
  placement: AdPlacement;
  campaign_category: AdCampaignCategory;
  type: AdType;
  content: AdContent;
  media: AdMedia;
  action: AdAction;
  scope: AdScope;
  url: string | null;
  priority: number;
  start_date: string;
  end_date: string;
  status: AdStatus;
  created_at: string;
  updated_at: string;
}

export const AD_PLACEMENTS: AdPlacement[] = [
  "HOME_TOP",
  "HOME_AFTER_SEARCH",
  "HOME_AFTER_SECTION",
  "HOME_BOTTOM",
  "PROPERTY_LIST_TOP",
  "PROPERTY_LIST_AFTER",
  "PROPERTY_DETAILS_HEADER",
  "PROPERTY_DETAILS_GALLERY",
  "PROPERTY_DETAILS_DESCRIPTION",
  "PROPERTY_DETAILS_BOTTOM",
  "HOTEL_LIST_TOP",
  "HOTEL_DETAILS_HEADER",
  "RESIDENCE_LIST",
  "RESIDENCE_LIST_ALL",
  "RESIDENCE_LIST_NEAR",
  "RESIDENCE_LIST_BEST_RATED",
  "RESIDENCE_LIST_ABIDJAN",
  "RESIDENCE_LIST_ABOISSO",
  "RESIDENCE_LIST_GRAND_BASSAM",
  "RESIDENCE_LIST_YAMOUSSOUKRO",
  "RESIDENCE_LIST_SAN_PEDRO",
  "RESIDENCE_LIST_COCODY",
  "RESIDENCE_LIST_YOPOUGON",
  "RESIDENCE_LIST_PLATEAU",
  "RESIDENCE_DETAILS",
  "LOCATION_LIST",
  "PAYMENT_TOP",
  "PAYMENT_BOTTOM",
  "MAP_TOP",
  "MAP_BOTTOM",
  "CALENDAR_TOP",
  "CALENDAR_BOTTOM",
  "ACCOUNT_TOP",
  "ACCOUNT_BOTTOM",
  "IMATCH_TOP",
  "IMATCH_BOTTOM",
];

export const AD_ACTIONS: AdAction[] = [
  "OPEN_URL",
  "OPEN_PROPERTY",
  "OPEN_RESIDENCE",
  "OPEN_HOTEL",
  "OPEN_LOCATION",
  "OPEN_CATEGORY",
  "OPEN_PROFILE",
  "OPEN_IMATCH",
  "OPEN_EVENT",
  "OPEN_EXTERNAL",
  "OPEN_INTERNAL_PAGE",
  "OPEN_PAYMENT",
  "NONE",
];

export const AD_CATEGORIES: AdCampaignCategory[] = [
  "PROMOTION",
  "NEW_FEATURE",
  "NEW_PROGRAM",
  "POLICY_UPDATE",
  "GENERAL",
];

export const AD_STATUSES: AdStatus[] = ["DRAFT", "ACTIVE", "SUSPENDED", "EXPIRED"];
export const AD_TYPES: AdType[] = ["IMAGE", "VIDEO", "CAROUSEL", "VIDEO_CAROUSEL"];
export const AD_EVENT_TYPES: AdEventType[] = ["IMPRESSION", "CLICK"];

export const STATUS_COLORS: Record<AdStatus, string> = {
  DRAFT: "default",
  ACTIVE: "green",
  SUSPENDED: "orange",
  EXPIRED: "red",
};

export const ENTITY_ID_ACTIONS: AdAction[] = [
  "OPEN_PROPERTY",
  "OPEN_RESIDENCE",
  "OPEN_HOTEL",
  "OPEN_PROFILE",
  "OPEN_EVENT",
];

export const FILTERS_ACTIONS: AdAction[] = [
  "OPEN_EXTERNAL",
  "OPEN_INTERNAL_PAGE",
  "OPEN_PAYMENT",
];
