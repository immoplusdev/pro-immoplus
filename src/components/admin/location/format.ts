import dayjs from "dayjs";
import type { LngLatBoundsLike } from "react-map-gl/maplibre";
import type { LocationPoint } from "@/types/location.types";

export const API_DATE_FORMAT = "YYYY-MM-DD";

/** Date/heure dans le fuseau local du navigateur (dayjs convertit l'ISO UTC). */
export function formatCapturedAt(iso: string): string {
  const d = dayjs(iso);
  return d.isValid() ? d.format("DD/MM/YYYY HH:mm") : iso;
}

export function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

export function googleMapsUrl(point: Pick<LocationPoint, "latitude" | "longitude">): string {
  return `https://www.google.com/maps?q=${point.latitude},${point.longitude}`;
}

/** Fiche utilisateur, directement sur l'onglet Localisation. */
export function userLocationTabPath(userId: string): string {
  return `/users/edit/${encodeURIComponent(userId)}?tab=localisation`;
}

/**
 * Détail de l'entité liée à l'action : réservation (création / acceptation) ou demande de retrait
 * wallet (retrait coffre). `null` pour une action inconnue du front → id affiché en texte copiable.
 */
export function locationEntityPath(action: string, entityId: string): string | null {
  const id = encodeURIComponent(entityId);
  switch (action) {
    case "CREATION_RESERVATION":
    case "ACCEPTATION_RESERVATION":
      return `/reservations/edit/${id}`;
    case "RETRAIT_COFFRE":
      return `/withdrawal-requests/show/${id}`;
    default:
      return null;
  }
}

/** Emprise [[minLng, minLat], [maxLng, maxLat]] ; `null` si aucun point. */
export function computeBounds(points: readonly Pick<LocationPoint, "latitude" | "longitude">[]): LngLatBoundsLike | null {
  if (points.length === 0) return null;
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  points.forEach(({ latitude, longitude }) => {
    minLng = Math.min(minLng, longitude);
    minLat = Math.min(minLat, latitude);
    maxLng = Math.max(maxLng, longitude);
    maxLat = Math.max(maxLat, latitude);
  });
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export const FIT_BOUNDS_OPTIONS = { padding: 48, maxZoom: 16, duration: 0 } as const;
