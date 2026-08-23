import React from "react";
import { Select, Slider, Space, Typography } from "antd";
import {
  ClientListFilters,
  comportementOptions,
  risqueOptions,
  segmentOptions,
  statutOptions,
} from "@/types/clients-statistiques.types";

const { Text } = Typography;

interface Props {
  filters: ClientListFilters;
  onChange: (filters: ClientListFilters) => void;
}

export function ClientsFiltersBar({ filters, onChange }: Props) {
  const patch = (partial: Partial<ClientListFilters>) => onChange({ ...filters, ...partial });

  const scoreRange: [number, number] = [filters.scoreMin ?? 0, filters.scoreMax ?? 100];

  return (
    <Space size={12} wrap align="start">
      <Select
        allowClear
        placeholder="Statut"
        style={{ width: 150 }}
        options={statutOptions}
        value={filters.statut}
        onChange={(value) => patch({ statut: value })}
      />
      <Select
        allowClear
        placeholder="Niveau de risque"
        style={{ width: 170 }}
        options={risqueOptions}
        value={filters.niveauRisque}
        onChange={(value) => patch({ niveauRisque: value })}
      />
      <Select
        allowClear
        placeholder="Segment"
        style={{ width: 150 }}
        options={segmentOptions}
        value={filters.segment}
        onChange={(value) => patch({ segment: value })}
      />
      <Select
        allowClear
        placeholder="Comportement"
        style={{ width: 170 }}
        options={comportementOptions}
        value={filters.comportement}
        onChange={(value) => patch({ comportement: value })}
      />
      <div style={{ width: 220 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Score : {scoreRange[0]} – {scoreRange[1]}
        </Text>
        <Slider
          range
          min={0}
          max={100}
          value={scoreRange}
          onChange={(value) => {
            const [scoreMin, scoreMax] = value as [number, number];
            patch({ scoreMin, scoreMax });
          }}
        />
      </div>
    </Space>
  );
}
