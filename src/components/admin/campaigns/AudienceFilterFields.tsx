import { useMemo, useState } from "react";
import { Button, Input, Select, Space, Typography } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  AUDIENCE_FILTER_KEYS_BY_CIBLE,
  AUDIENCE_FILTER_VALUE_OPTIONS,
} from "@/types/campaigns.types";
import type { CampaignCible } from "@/types/campaigns.types";

const { Text } = Typography;

interface Row {
  cle?: string;
  valeur?: string;
}

interface Props {
  cible: CampaignCible;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

/**
 * Filtre d'audience : clés à choix fermé (dépend de la cible). Toute autre clé
 * est rejetée par le back (400). La valeur propose des suggestions connues
 * sinon une saisie libre.
 */
export function AudienceFilterFields({ cible, value, onChange }: Props) {
  const [rows, setRows] = useState<Row[]>(() => {
    const entries = Object.entries(value);
    return entries.length ? entries.map(([cle, valeur]) => ({ cle, valeur })) : [{}];
  });

  const keyOptions = AUDIENCE_FILTER_KEYS_BY_CIBLE[cible];

  const emit = (next: Row[]) => {
    setRows(next);
    const record: Record<string, string> = {};
    next.forEach((r) => {
      if (r.cle && r.valeur) record[r.cle] = r.valeur;
    });
    onChange(record);
  };

  const usedKeys = useMemo(() => new Set(rows.map((r) => r.cle).filter(Boolean)), [rows]);

  const patch = (index: number, partial: Row) => {
    emit(rows.map((r, i) => (i === index ? { ...r, ...partial } : r)));
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={8}>
      {rows.map((row, index) => {
        const valueOptions = row.cle ? AUDIENCE_FILTER_VALUE_OPTIONS[row.cle] : undefined;
        return (
          <div key={index} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Select
              style={{ width: 220 }}
              placeholder="Critère"
              options={keyOptions.map((o) => ({
                ...o,
                disabled: usedKeys.has(o.value) && o.value !== row.cle,
              }))}
              value={row.cle}
              onChange={(cle) => patch(index, { cle, valeur: undefined })}
            />
            {valueOptions ? (
              <Select
                style={{ flex: 1, minWidth: 200 }}
                placeholder="Valeur"
                options={valueOptions}
                value={row.valeur}
                onChange={(valeur) => patch(index, { valeur })}
              />
            ) : (
              <Input
                style={{ flex: 1, minWidth: 200 }}
                placeholder="Valeur"
                value={row.valeur}
                onChange={(e) => patch(index, { valeur: e.target.value })}
              />
            )}
            <Button
              type="text"
              icon={<DeleteOutlined />}
              disabled={rows.length === 1}
              onClick={() => emit(rows.filter((_, i) => i !== index))}
            />
          </div>
        );
      })}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        disabled={rows.length >= keyOptions.length}
        onClick={() => emit([...rows, {}])}
      >
        Ajouter un critère
      </Button>
      <Text type="secondary" style={{ fontSize: 12 }}>
        Sans critère, la campagne cible toute l'audience de l'application choisie.
      </Text>
    </Space>
  );
}
