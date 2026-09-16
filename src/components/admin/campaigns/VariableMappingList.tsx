import { Select, Space, Tag, Typography, Empty } from "antd";
import { CampaignTagType } from "@/types/campaigns.types";
import type { CampaignTag } from "@/types/campaigns.types";

const { Text } = Typography;

interface Props {
  /** positions déclarées par le template, ex ["1","2"] */
  positions: string[];
  /** tags disponibles pour la cible (avec accolades) */
  tags: CampaignTag[];
  loadingTags?: boolean;
  /** { "1": "{{prenom}}", ... } */
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

/**
 * Mapping des variables du template : pour chaque position déclarée, un select
 * qui propose les tags de la cible. Les tags "fixe" sont signalés en orange
 * (leur valeur devra être saisie au moment de l'envoi).
 */
export function VariableMappingList({ positions, tags, loadingTags, value, onChange }: Props) {
  if (positions.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Ce template ne déclare aucune variable à mapper."
      />
    );
  }

  const options = tags.map((t) => ({
    value: t.tag,
    label: (
      <Space>
        <span>{t.tag}</span>
        {t.type === CampaignTagType.Fixe && (
          <Tag color="orange" style={{ marginInlineEnd: 0 }}>
            à saisir à l'envoi
          </Tag>
        )}
      </Space>
    ),
  }));

  const setPosition = (pos: string, tag: string | undefined) => {
    const next = { ...value };
    if (tag) next[pos] = tag;
    else delete next[pos];
    onChange(next);
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={12}>
      {positions.map((pos) => (
        <div key={pos} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Text style={{ minWidth: 96 }}>
            Variable <Text strong>{`{{${pos}}}`}</Text>
          </Text>
          <Select
            style={{ flex: 1, minWidth: 220 }}
            placeholder="Choisir un tag…"
            loading={loadingTags}
            allowClear
            showSearch
            optionFilterProp="value"
            options={options}
            value={value[pos]}
            onChange={(v) => setPosition(pos, v)}
          />
        </div>
      ))}
    </Space>
  );
}
