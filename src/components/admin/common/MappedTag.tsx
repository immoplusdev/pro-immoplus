import { Tag } from "antd";
import type { TagStyle } from "@/types/messaging";

interface MappedTagProps<K extends string> {
  value: K | null | undefined;
  map: Record<K, TagStyle>;
}

/** Tag AntD piloté par une map `enum -> { label, color }`. */
export function MappedTag<K extends string>({ value, map }: MappedTagProps<K>) {
  if (!value) return <>—</>;
  const style = map[value];
  return <Tag color={style?.color}>{style?.label ?? value}</Tag>;
}
