import React from "react";
import { Select, DatePicker, Space, Input, Switch, Typography } from "antd";
import { useSelect } from "@refinedev/antd";
import dayjs from "dayjs";
import {
    ProPerformanceFiltersState,
    periodOptions,
    proTypeOptions,
    badgeOptions,
    statusOptions,
} from "./types";

const { RangePicker } = DatePicker;

interface ResidenceOption {
    id: string;
    nom: string;
}

interface Props {
    filters: ProPerformanceFiltersState;
    onChange: (filters: ProPerformanceFiltersState) => void;
    alerteCritique: boolean;
    onAlerteCritiqueChange: (value: boolean) => void;
}

export function ProPerformanceFiltersBar({ filters, onChange, alerteCritique, onAlerteCritiqueChange }: Props) {
    const { selectProps: residenceSelectProps, query: residenceQuery } = useSelect<ResidenceOption>({
        resource: "residences",
        optionLabel: "nom",
        optionValue: "id",
        onSearch: (value) => [{ field: "q", operator: "contains", value }],
        pagination: { mode: "server", pageSize: 20 },
    });

    const patch = (partial: Partial<ProPerformanceFiltersState>) => onChange({ ...filters, ...partial });

    return (
        <Space size={12} wrap style={{ marginBottom: 16 }}>
            <Select
                value={filters.period}
                options={periodOptions}
                style={{ width: 140 }}
                onChange={(value) => patch({ period: value, dateStart: undefined, dateEnd: undefined })}
            />
            {filters.period === "custom" && (
                <RangePicker
                    format="DD/MM/YYYY"
                    value={
                        filters.dateStart && filters.dateEnd
                            ? [dayjs(filters.dateStart), dayjs(filters.dateEnd)]
                            : null
                    }
                    onChange={(_, formatted) => {
                        const [start, end] = formatted;
                        patch({
                            dateStart: start ? dayjs(start, "DD/MM/YYYY").format("YYYY-MM-DD") : undefined,
                            dateEnd: end ? dayjs(end, "DD/MM/YYYY").format("YYYY-MM-DD") : undefined,
                        });
                    }}
                />
            )}
            <Select<string>
                allowClear
                placeholder="Résidence"
                style={{ width: 200 }}
                options={residenceSelectProps.options}
                onSearch={residenceSelectProps.onSearch}
                loading={residenceQuery.isFetching}
                filterOption={false}
                showSearch
                value={filters.residenceId}
                onChange={(value) => patch({ residenceId: value })}
            />
            <Select
                allowClear
                placeholder="Type de Pro"
                style={{ width: 150 }}
                options={proTypeOptions}
                value={filters.proType}
                onChange={(value) => patch({ proType: value })}
            />
            <Select
                allowClear
                placeholder="Badge"
                style={{ width: 160 }}
                options={badgeOptions}
                value={filters.badge}
                onChange={(value) => patch({ badge: value })}
            />
            <Select
                allowClear
                placeholder="Statut demande"
                style={{ width: 160 }}
                options={statusOptions}
                value={filters.status}
                onChange={(value) => patch({ status: value })}
            />
            <Space size={6}>
                <Switch checked={alerteCritique} onChange={onAlerteCritiqueChange} />
                <Typography.Text style={{ fontSize: 13 }}>Alerte critique uniquement</Typography.Text>
            </Space>
        </Space>
    );
}
