import { Tag } from "antd";
import { ClientRisqueNiveau, risqueColor, risqueLabel } from "@/types/clients-statistiques.types";

interface Props {
  niveau: ClientRisqueNiveau;
}

export function RisqueTag({ niveau }: Props) {
  return <Tag color={risqueColor[niveau]}>{risqueLabel[niveau]}</Tag>;
}
