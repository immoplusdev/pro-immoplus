import React, { useState } from "react";
import { useApiUrl } from "@refinedev/core";
import { useQuery } from "@tanstack/react-query";
import { Table, Tag, Card } from "antd";
import type { TableProps } from "antd";
import { axiosInstance } from "@/lib/providers/utils/axios";
import {
    ProPerformanceFiltersState,
    ProPerformanceRow,
    ProsTableResponse,
    ProSortBy,
    formatFcfa,
    badgeTagColor,
    badgeLabel,
} from "./types";

interface Props {
    filters: ProPerformanceFiltersState;
    alerteCritique: boolean;
    onRowClick: (row: ProPerformanceRow) => void;
}

export function ProPerformanceTable({ filters, alerteCritique, onRowClick }: Props) {
    const apiUrl = useApiUrl();
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [sortBy, setSortBy] = useState<ProSortBy | undefined>(undefined);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    const { data, isFetching } = useQuery({
        queryKey: ["statistics-pros", filters, alerteCritique, page, perPage, sortBy, sortDir],
        queryFn: async () => {
            const response = await axiosInstance.get<ProsTableResponse>(`${apiUrl}/v1/statistics/pros`, {
                params: {
                    ...filters,
                    sortBy,
                    sortDir,
                    alerteCritique: alerteCritique || undefined,
                    page,
                    perPage,
                },
            });
            return response.data;
        },
    });

    const rows = data?.data ?? [];
    const totalCount = data?.totalCount ?? 0;

    const handleChange: TableProps<ProPerformanceRow>["onChange"] = (pagination, _filters, sorter) => {
        if (pagination.current) setPage(pagination.current);
        if (pagination.pageSize) setPerPage(pagination.pageSize);

        const single = Array.isArray(sorter) ? sorter[0] : sorter;
        if (single?.order) {
            setSortBy(single.field as ProSortBy);
            setSortDir(single.order === "ascend" ? "asc" : "desc");
        } else {
            setSortBy(undefined);
        }
    };

    return (
        <Card style={{ border: "1px solid #E8E8E8" }} styles={{ body: { padding: 0 } }}>
            <Table<ProPerformanceRow>
                rowKey="proId"
                loading={isFetching}
                dataSource={rows}
                onChange={handleChange}
                onRow={(record) => ({ onClick: () => onRowClick(record), style: { cursor: "pointer" } })}
                pagination={{
                    current: page,
                    pageSize: perPage,
                    total: totalCount,
                    showSizeChanger: true,
                }}
                scroll={{ x: 1200 }}
                columns={[
                    {
                        title: "Pro",
                        key: "pro",
                        fixed: "left",
                        width: 220,
                        render: (_, record) => (
                            <div>
                                <div style={{ fontWeight: 600 }}>{record.nom}</div>
                                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>
                                    {record.zone.commune}, {record.zone.ville}
                                </div>
                            </div>
                        ),
                    },
                    {
                        title: "Réponse",
                        children: [
                            { title: "Reçues", dataIndex: ["reponse", "recues"], key: "recues", width: 90 },
                            { title: "Acceptées", dataIndex: ["reponse", "acceptees"], key: "acceptees", width: 100 },
                            { title: "Refusées", dataIndex: ["reponse", "refusees"], key: "refusees", width: 90 },
                            { title: "Sans réponse", dataIndex: ["reponse", "sansReponse"], key: "sansReponse", width: 110 },
                            {
                                title: "Taux acceptation",
                                dataIndex: ["reponse", "tauxAcceptation"],
                                key: "tauxAcceptation",
                                width: 130,
                                sorter: true,
                                render: (value: number) => `${value.toFixed(1)} %`,
                            },
                            {
                                title: "Délai médian",
                                dataIndex: ["reponse", "delaiMedianMinutes"],
                                key: "delaiMedian",
                                width: 110,
                                sorter: true,
                                render: (value: number | null) => (value != null ? `${value} min` : "—"),
                            },
                        ],
                    },
                    {
                        title: "Conversion",
                        children: [
                            { title: "Confirmées", dataIndex: ["conversion", "confirmees"], key: "confirmees", width: 100 },
                            {
                                title: "Effectuées",
                                dataIndex: ["conversion", "effectuees"],
                                key: "reservationsEffectuees",
                                width: 100,
                                sorter: true,
                            },
                            { title: "Annul. client", dataIndex: ["conversion", "annulationsClient"], key: "annulationsClient", width: 100 },
                            { title: "Annul. Pro", dataIndex: ["conversion", "annulationsPro"], key: "annulationsPro", width: 100 },
                        ],
                    },
                    {
                        title: "Valeur",
                        children: [
                            {
                                title: "CA brut",
                                dataIndex: ["valeur", "caBrutFcfa"],
                                key: "caBrutFcfa",
                                width: 130,
                                render: (value: number) => formatFcfa(value),
                            },
                            {
                                title: "CA validé",
                                dataIndex: ["valeur", "caValideFcfa"],
                                key: "caValideFcfa",
                                width: 130,
                                render: (value: number) => formatFcfa(value),
                            },
                        ],
                    },
                    {
                        title: "Qualité",
                        children: [
                            {
                                title: "Badge",
                                dataIndex: ["qualite", "badge"],
                                key: "badge",
                                width: 130,
                                render: (badge: keyof typeof badgeTagColor) => (
                                    <Tag color={badgeTagColor[badge]}>{badgeLabel[badge]}</Tag>
                                ),
                            },
                            { title: "Score", dataIndex: ["qualite", "score"], key: "score", width: 80 },
                            {
                                title: "Alertes",
                                dataIndex: ["qualite", "alertes"],
                                key: "alertes",
                                width: 100,
                                render: (alertes: string[]) =>
                                    alertes.length > 0 ? <Tag color="error">{alertes.length}</Tag> : "—",
                            },
                        ],
                    },
                ]}
            />
        </Card>
    );
}
