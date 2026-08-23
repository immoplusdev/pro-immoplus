import { Tag } from "antd";
import { ClientScoreBadge, scoreBadgeColor, scoreBadgeLabel } from "@/types/clients-statistiques.types";

interface Props {
  badge: ClientScoreBadge | null;
}

export function ScoreBadgeTag({ badge }: Props) {
  if (!badge) return null;
  return <Tag color={scoreBadgeColor[badge]}>{scoreBadgeLabel[badge]}</Tag>;
}
