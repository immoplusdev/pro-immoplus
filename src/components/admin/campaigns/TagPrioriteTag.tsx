import { Tag } from "antd";
import { TagPriorite, prioriteColor, prioriteLabel } from "@/types/campaigns.types";

export function TagPrioriteTag({ priorite }: { priorite: TagPriorite }) {
  return <Tag color={prioriteColor[priorite]}>{prioriteLabel[priorite]}</Tag>;
}
