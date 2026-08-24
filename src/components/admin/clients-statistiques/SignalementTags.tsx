import { Tag } from "antd";
import {
  SignalementGravite,
  SignalementStatut,
  signalementGraviteColor,
  signalementGraviteLabel,
  signalementStatutColor,
  signalementStatutLabel,
} from "@/types/clients-statistiques.types";

export function SignalementGraviteTag({ gravite }: { gravite: SignalementGravite }) {
  return <Tag color={signalementGraviteColor[gravite]}>{signalementGraviteLabel[gravite]}</Tag>;
}

export function SignalementStatutTag({ statut }: { statut: SignalementStatut }) {
  return <Tag color={signalementStatutColor[statut]}>{signalementStatutLabel[statut]}</Tag>;
}
