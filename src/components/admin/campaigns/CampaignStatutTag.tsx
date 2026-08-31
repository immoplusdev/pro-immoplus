import { Tag } from "antd";
import { CampaignStatut, statutColor, statutLabel } from "@/types/campaigns.types";

export function CampaignStatutTag({ statut }: { statut: CampaignStatut }) {
  return <Tag color={statutColor[statut]}>{statutLabel[statut]}</Tag>;
}
