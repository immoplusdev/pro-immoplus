/**
 * Types du module admin "Localisation".
 *
 * API (admin uniquement, Bearer JWT géré globalement par `axiosInstance`, appels journalisés côté back) :
 *  - GET /admin/users/:id/location/history?from=YYYY-MM-DD&to=YYYY-MM-DD (bornes incluses, tri capturedAt ASC)
 *  - GET /admin/location/export?from=&to=&role=CLIENT|PRO&city=&page=&limit= (limit 50 par défaut, 500 max ;
 *    city à égalité exacte ; tri capturedAt DESC)
 * Réponses enveloppées : contenu utile dans `body.data` (la pagination de l'enveloppe n'est pas fiable ici).
 * Rôle strict Admin : Financier/Commercial reçoivent 403 INSUFFICIENT_PERMISSIONS.
 *
 * Données sensibles : ne jamais les persister (pas de localStorage, pas de persistance React Query).
 */
import type { TagStyle } from "@/types/messaging";

export const LOCATION_ACTIONS = ["CREATION_RESERVATION", "ACCEPTATION_RESERVATION", "RETRAIT_COFFRE"] as const;
/** Union exacte du contrat API. Le front garde un libellé de repli pour toute valeur inattendue. */
export type LocationAction = (typeof LOCATION_ACTIONS)[number];

export const LOCATION_ROLES = ["CLIENT", "PRO"] as const;
export type LocationRole = (typeof LOCATION_ROLES)[number];

export interface LocationPoint {
  latitude: number;
  longitude: number;
  /** ISO 8601 (UTC). */
  capturedAt: string;
}

export interface UserLocationHistory {
  userId: string;
  items: LocationPoint[];
}

export interface LocationExportItem extends LocationPoint {
  userId: string;
  role: LocationRole;
  action: LocationAction;
  /** Réservation (création / acceptation) ou demande de retrait wallet (retrait coffre). */
  entityId: string;
  /** Géocodage inverse, peut être null. */
  city: string | null;
}

export interface LocationExportResponse {
  total: number;
  page: number;
  limit: number;
  items: LocationExportItem[];
}

/** Période au format YYYY-MM-DD. */
export interface LocationDateRange {
  from: string;
  to: string;
}

export interface LocationExportFilters {
  from?: string;
  to?: string;
  role?: LocationRole;
  city?: string;
  page?: number;
  limit?: number;
}

/** Garanti par l'API : le rôle découle de l'action. */
export const LOCATION_ROLE_BY_ACTION: Record<LocationAction, LocationRole> = {
  CREATION_RESERVATION: "CLIENT",
  ACCEPTATION_RESERVATION: "PRO",
  RETRAIT_COFFRE: "PRO",
};

export const locationActionMap: Record<LocationAction, TagStyle> = {
  CREATION_RESERVATION: { label: "Création réservation", color: "blue" },
  ACCEPTATION_RESERVATION: { label: "Acceptation réservation", color: "green" },
  RETRAIT_COFFRE: { label: "Retrait coffre", color: "orange" },
};

/** Couleurs hexa équivalentes aux tags, pour les marqueurs de carte. */
export const locationActionHexColor: Record<LocationAction, string> = {
  CREATION_RESERVATION: "#1677ff",
  ACCEPTATION_RESERVATION: "#52c41a",
  RETRAIT_COFFRE: "#fa8c16",
};
export const UNKNOWN_ACTION_HEX_COLOR = "#8c8c8c";

export const locationRoleMap: Record<LocationRole, TagStyle> = {
  CLIENT: { label: "Client", color: "geekblue" },
  PRO: { label: "Pro", color: "purple" },
};

export function isKnownLocationAction(value: string): value is LocationAction {
  return (LOCATION_ACTIONS as readonly string[]).includes(value);
}

export function isLocationRole(value: string | undefined): value is LocationRole {
  return !!value && (LOCATION_ROLES as readonly string[]).includes(value);
}

/**
 * Libellé FR d'une action, avec repli sur la valeur brute : protège l'affichage si le back
 * ajoute une action avant le front (la valeur reçue n'est alors pas dans l'union).
 */
export function getLocationActionStyle(action: string): TagStyle {
  return isKnownLocationAction(action) ? locationActionMap[action] : { label: action || "Action inconnue", color: "default" };
}

export function getLocationActionHexColor(action: string): string {
  return isKnownLocationAction(action) ? locationActionHexColor[action] : UNKNOWN_ACTION_HEX_COLOR;
}
