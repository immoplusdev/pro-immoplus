import React from "react";
import { Radio, DatePicker, Select, Space } from "antd";
import dayjs from "dayjs";
import { ClientKpiFilters, ClientKpiPeriod, periodOptions, statutOptions } from "@/types/clients-statistiques.types";

const { RangePicker } = DatePicker;

interface Props {
  filters: ClientKpiFilters;
  onChange: (filters: ClientKpiFilters) => void;
}

export function ClientsKpiFiltersBar({ filters, onChange }: Props) {
  const patch = (partial: Partial<ClientKpiFilters>) => onChange({ ...filters, ...partial });

  return (
    <Space size={12} wrap>
      <Radio.Group
        value={filters.period}
        options={periodOptions}
        optionType="button"
        buttonStyle="solid"
        onChange={(e) => patch({ period: e.target.value as ClientKpiPeriod, dateDebut: undefined, dateFin: undefined })}
      />
      {filters.period === ClientKpiPeriod.Custom && (
        <RangePicker
          format="DD/MM/YYYY"
          value={filters.dateDebut && filters.dateFin ? [dayjs(filters.dateDebut), dayjs(filters.dateFin)] : null}
          onChange={(_, formatted) => {
            const [start, end] = formatted;
            patch({
              dateDebut: start ? dayjs(start, "DD/MM/YYYY").format("YYYY-MM-DD") : undefined,
              dateFin: end ? dayjs(end, "DD/MM/YYYY").format("YYYY-MM-DD") : undefined,
            });
          }}
        />
      )}
      <Select
        allowClear
        placeholder="Statut"
        style={{ width: 160 }}
        options={statutOptions}
        value={filters.statut}
        onChange={(value) => patch({ statut: value })}
      />
    </Space>
  );
}
