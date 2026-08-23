import { Tag } from "antd";
import { ClientStatut, clientStatutColor, clientStatutLabel } from "@/types/clients-statistiques.types";

interface Props {
  statut: ClientStatut;
}

export function ClientStatutTag({ statut }: Props) {
  return <Tag color={clientStatutColor[statut]}>{clientStatutLabel[statut]}</Tag>;
}
