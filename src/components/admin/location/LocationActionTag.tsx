import { Tag } from "antd";
import { getLocationActionStyle, type LocationAction } from "@/types/location.types";

/** Tag d'action métier, libellé FR ; une valeur inconnue du front est affichée brute. */
export function LocationActionTag({ action }: { action: LocationAction }) {
  const { label, color } = getLocationActionStyle(action);
  return <Tag color={color}>{label}</Tag>;
}
